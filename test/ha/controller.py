"""Fake Web HMI of a KEBA KeEnergy control unit for the tests of the card in Home Assistant in Docker.

It answers the requests of `keba_keenergy_api` with the test data of the integration (`tests/fixtures/` of the
release in `test/ha-docker.mjs`) and keeps the written values in memory. It only listens in the container, the real
integration never reaches a real control unit.
"""

from __future__ import annotations

import argparse
import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from typing import Any
from urllib.parse import parse_qs
from urllib.parse import urlsplit

MESSAGE_ID_SUFFIX = ".state.msgId"

# Variables of the curve tables, the test data of the integration has one point seven times in every table.
LINE_TABLE = "APPL.CtrlAppl.sParam.linTabPool[{index}]"

# Points of curve table n (from 0) of the tests of the card: outdoor and flow temperature, the flow n °C higher.
CURVE_POINTS: list[tuple[int, int]] = [(-20, 45), (0, 35), (20, 25)]

# Points of a curve table of the control unit.
MAX_CURVE_POINTS = 16

# Message id of a sensor that the control unit reports as deactivated.
DEACTIVATED_MESSAGE_ID = 10

# Remote access of the Web HMI by the action that reads it, with the key of its response.
REMOTE_ACCESS: dict[str, tuple[str, bool]] = {
    "isModbusActive": ("active", True),
    "isRemoteMActive": ("active", False),
    "isRemoteMConnectionAlive": ("connected", False),
    "isRemoteMServerReachable": ("reachable", True),
}


def load(path: Path) -> Any:
    """Load a JSON file of the test data."""
    return json.loads(path.read_text(encoding="utf-8"))


class Controller:
    """Values of one control unit, from the test data of a device of the integration."""

    def __init__(self, fixtures: Path, device: str, serial: str, *, heating: bool) -> None:
        common = fixtures / "common"
        self.device_info: dict[str, Any] = {**load(common / "device_info.json"), "serNo": int(serial)}
        self.system: dict[str, Any] = load(common / "system.json")
        self.hmi: dict[str, Any] = load(common / "hmi.json")
        self.timezone: dict[str, Any] = load(common / "timezone.json")
        self.values: dict[str, dict[str, Any]] = {}
        for path in (
            fixtures / device / "device_numbers.json",
            fixtures / device / "fixed_data.json",
            fixtures / device / "data.json",
            common / "curve_names.json",
            common / "curve_points.json",
        ):
            for item in load(path):
                self.values[item["name"]] = item
        self.set_curve_points()
        if heating:
            self.set_heating_circuits()
        self.lock = Lock()

    def set_heating_circuits(self) -> None:
        """Make every circuit a heating circuit, the test data has a cooling circuit as second circuit."""
        for name in [name for name in self.values if name.startswith("APPL.CtrlAppl.sParam.options.heatCircuit[")]:
            if name.endswith("].type"):
                self.set_value(name, 0)

    def set_curve_points(self) -> None:
        """Give every curve table the points of the tests, with the attributes of the test data."""
        index = 0
        while f"{LINE_TABLE.format(index=index)}.name" in self.values:
            table = LINE_TABLE.format(index=index)
            self.set_value(f"{table}.noOfPoints", len(CURVE_POINTS))
            for point in range(MAX_CURVE_POINTS):
                outdoor, flow = CURVE_POINTS[point] if point < len(CURVE_POINTS) else (0, 0)
                self.set_value(f"{table}.points[{point}].x", outdoor)
                self.set_value(f"{table}.points[{point}].y", flow + index if point < len(CURVE_POINTS) else 0)
            index += 1

    def set_value(self, name: str, value: int) -> None:
        """Set a value, the attributes of a known variable stay."""
        self.values[name] = {**self.values.get(name, {}), "name": name, "value": str(value)}

    def message_id(self, name: str) -> str:
        """Return the message id of a sensor, deactivated without test data of the sensor."""
        sensor = name.removesuffix(MESSAGE_ID_SUFFIX)
        known = any(value == sensor or value.startswith(f"{sensor}.") for value in self.values)
        return str(0 if known else DEACTIVATED_MESSAGE_ID)

    def read(self, payload: list[dict[str, str]]) -> tuple[HTTPStatus, Any]:
        """Return the requested values, only a read with `attr` "1" returns the attributes, like the Web HMI."""
        names = [item["name"] for item in payload]
        if names and all(".weekTimer" in name for name in names):
            return HTTPStatus.OK, [{"name": name, "value": "0"} for name in names]
        with self.lock:
            unknown = [name for name in names if name not in self.values and not name.endswith(MESSAGE_ID_SUFFIX)]
            if unknown:
                # The Web HMI rejects the whole request and names the first unknown variable.
                return HTTPStatus.INTERNAL_SERVER_ERROR, f"Reading variable: {unknown[0]} failed"
            return HTTPStatus.OK, [
                {"name": item["name"], "value": self.message_id(item["name"])}
                if item["name"].endswith(MESSAGE_ID_SUFFIX)
                else self.values[item["name"]]
                if item.get("attr") == "1"
                else {"name": item["name"], "value": self.values[item["name"]]["value"]}
                for item in payload
            ]

    def write(self, payload: list[dict[str, str]]) -> tuple[HTTPStatus, Any]:
        """Keep the written values, the attributes of a known variable stay."""
        with self.lock:
            for item in payload:
                self.values[item["name"]] = {**self.values.get(item["name"], {}), **item}
        return HTTPStatus.OK, [{}]


def handler(controller: Controller) -> type[BaseHTTPRequestHandler]:
    """Return the request handler of the Web HMI of the control unit."""

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self) -> None:  # noqa: N802
            url = urlsplit(self.path)
            action = parse_qs(url.query).get("action", [""])[0]
            length = int(self.headers.get("Content-Length") or 0)
            body: Any = json.loads(self.rfile.read(length) or "null") if length else None
            status, response = self.respond(url.path, action, body)
            self.send(status, response)

        def respond(self, path: str, action: str, body: Any) -> tuple[HTTPStatus, Any]:
            if path == "/var/readWriteVars":
                return controller.write(body) if action == "set" else controller.read(body)
            if path == "/deviceControl" and action == "getDeviceInfo":
                return HTTPStatus.OK, controller.device_info
            if path == "/deviceControl" and action in REMOTE_ACCESS:
                key, value = REMOTE_ACCESS[action]
                return HTTPStatus.OK, {"ret": "OK", key: value}
            if path == "/deviceControl":
                return HTTPStatus.OK, {"ret": "OK"}
            if path == "/swupdate":
                return HTTPStatus.OK, controller.system if action == "getSystemInstalled" else controller.hmi
            if path == "/dateTime":
                return HTTPStatus.OK, controller.timezone
            if path == "/alarm":
                return HTTPStatus.OK, {"value": 0} if action == "getCount" else {"alarms": []}
            return HTTPStatus.NOT_FOUND, f"Unknown request {path}?action={action}"

        def send(self, status: HTTPStatus, response: Any) -> None:
            text = response if isinstance(response, str) else json.dumps(response)
            data = text.encode()
            self.send_response(status)
            self.send_header(
                "Content-Type",
                "text/plain" if isinstance(response, str) else "application/json;charset=utf-8",
            )
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def log_message(self, *_: Any) -> None:
            """Log nothing, the tests read the values from Home Assistant."""

    return Handler


def main() -> None:
    """Serve one control unit on the port until the container stops."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixtures", type=Path, required=True)
    parser.add_argument("--device", choices=["single_device", "multiple_devices"], required=True)
    parser.add_argument("--serial", required=True)
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--heating", action="store_true", help="make every circuit a heating circuit")
    args = parser.parse_args()
    controller = Controller(args.fixtures, args.device, args.serial, heating=args.heating)
    ThreadingHTTPServer(("127.0.0.1", args.port), handler(controller)).serve_forever()


if __name__ == "__main__":
    main()
