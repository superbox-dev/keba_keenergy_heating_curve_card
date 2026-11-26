# KEBA KeEnergy Heating Curve Card

A Home Assistant dashboard card for the heating curves of KEBA KeEnergy heat pumps.

[Deutsche Version](README.de.md)

![Preview](https://raw.githubusercontent.com/superbox-dev/keba_keenergy_heating_curve_card/main/assets/preview.png)

## Features

- Shows the heating curve as a chart, with the current outdoor and flow temperatures.
- Edits the points of the curve table (1 to 16 points).
- Edits the day and night heating limits.
- Selects the curve table of a heating circuit.
- Finds controllers and heating circuits on its own.
- Optional password lock for the card.
- English and German.

## Requirements

- Home Assistant 2026.11.0 or newer with the [KEBA KeEnergy](https://github.com/superbox-dev/keba_keenergy) integration.
- To save points: the action `keba_keenergy.set_heating_curve_points` (integration 1.12.2 or newer).

## Installation

### HACS

[![Open the repository in the Marketplace of your Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)][redirect-hacs]

1. Go to **Settings** → **Marketplace**.
2. Search for **KEBA KeEnergy Heating Curve Card** and select **Install**.
3. Reload the browser.

[redirect-hacs]: https://my.home-assistant.io/redirect/hacs_repository/?owner=superbox-dev&repository=keba_keenergy_heating_curve_card&category=plugin

### Manual

1. Download `keba_keenergy_heating_curve_card.js` from the [latest release][latest-release].
2. Copy it to `/config/www/`.
   - Did you create the `www` folder? Then restart Home Assistant once.
3. Go to **Settings** → **Dashboards** → **Resources**.
   - The menu is in the top right corner.
   - It needs the advanced mode in your user profile.
4. Add the URL `/local/keba_keenergy_heating_curve_card.js` as **JavaScript module**.
5. Reload the browser.

After an update, add `?v=<version>` to the URL. Then the browser loads the new file.

With YAML resources, add this to your `lovelace` configuration:

```yaml
lovelace:
  resource_mode: yaml
  resources:
    - url: /local/keba_keenergy_heating_curve_card.js
      type: module
```

[latest-release]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/releases/latest

### Update from `keba-keenergy-heizkurve`

The card and its file have English names now. Adapt existing dashboards once:

1. Install the new version.
   - HACS: download it in HACS.
   - Manual: copy the [new file](https://github.com/superbox-dev/keba_keenergy_heating_curve_card/releases/latest/download/keba_keenergy_heating_curve_card.js) to `/config/www/` and delete
     `/config/www/keba-keenergy-heizkurve.js`.
2. In the dashboard resources, replace `/local/keba-keenergy-heizkurve.js` with
   `/local/keba_keenergy_heating_curve_card.js`.
   - With HACS, check that the resource points to `keba_keenergy_heating_curve_card.js`.
3. In every card, replace `type: custom:keba-keenergy-heizkurve-card` with
   `type: custom:keba-keenergy-heating-curve-card`.
   - All other options stay the same.
4. Reload the browser.

Until then, Home Assistant shows an error in place of the card.

## Usage

Add a card with this content to a dashboard:

```yaml
type: custom:keba-keenergy-heating-curve-card
```

- That's all for one controller with one heating circuit.
- [dashboard.yaml](dashboard.yaml) contains a complete dashboard with a wide view.
- More examples are in [examples/](examples/).

### Controllers and heating circuits

- The card finds all controllers and heating circuits of the integration.
- Renamed entities are found too.
- With several of them, the card shows selection fields.
- **Switching only changes the view. It sends nothing to the heat pump.**
- The first controller and heating circuit is shown first.
- For a fixed view, select them in the visual card editor.

### Curve tables

- A curve table is a table like `HC1` or `HC2`.
- It is not the number of the heating circuit.
- Selecting a curve table assigns it to the shown heating circuit. **This is sent at once.**
- Several heating circuits can share one curve table.
  - Saving its points changes it for all of them.

### Points

- Edit, add and remove 1 to 16 points.
- The chart updates while you type.
- **Only Save points sends the points to the heat pump.**
- Allowed values:
  - Outdoor temperature: −40 to 40 °C
  - Flow temperature: 10 to 90 °C
  - Every outdoor temperature only once
- With unsaved changes, you can't switch the table, controller or heating circuit.
  - Save first, or select **Discard draft**.

### Heating limits

- Edit the heating limits for day and night.
- **Save heating limits** sends the changed values.
- The fields use the limits and steps of the entities.

### Chart

- Shows the points, the heating limits and the outdoor temperature.
- Shows the target and actual flow temperature.
- Shows interpolated values every 5 °C, or every `intermediate_step`.
  - They are calculated from the table.
  - The controller can still use a different target.
- `flow_min` and `flow_max` only limit the chart.
  - They don't change the points or the controller.

### Chart axes

- Open **Chart axes** in the visual card editor.
- Set minimum, maximum and grid interval in °C for the outdoor temperature (X) and the flow temperature (Y).
  - Empty bounds are automatic, the default grid interval is 5 °C.
- **Interpolated values** sets the interval of the interpolated values, independent of the grid.
- The axes only change the chart, not the points or the controller.

```yaml
type: custom:keba-keenergy-heating-curve-card
x_min: -15
x_max: 25
x_step: 5
y_min: 20
y_max: 45
y_step: 2.5
intermediate_step: 2.5
```

### Units

- The card shows all temperatures in °C.
- Entities in °F or K are converted.
- Heating limits are saved in the unit of their entity.

### Disabled entities

The integration disables some entities by default. The card needs the [entities](#entities) in the table below.

How to enable them:

- As administrator: select **Enable required entities** in the card.
- Or enable them in the entity settings of the integration.

Missing readings are shown as `—`.

### Without administrator rights

- The card may not be able to read the entity registry.
- Then set `config_entry` and `entities` by hand.
- See [examples/manual-entities.yaml](examples/manual-entities.yaml).
- All entities must belong to the same controller and heating circuit.
- **Rediscover** reads the registry again.

### Language

- Default: the language of your Home Assistant profile.
- German profiles use German, all others English.
- Set a fixed language in the visual editor or with `language: de` or `language: en`.
- Your own titles, names and table names stay unchanged.

### Password

- No password is set by default.
- To set one:
  1. Open the visual card editor.
  2. Open **Password protection**.
  3. Enter the password twice and select **Set password**.
  4. Save the card.
- The card only stores a check value (PBKDF2-SHA256), never the password.
- The card locks again:
  - after `auto_lock_minutes` without editing (default 5)
  - when you leave the browser tab
  - when you close the card
  - when you switch the controller or heating circuit
- Locking discards unsaved changes.

> [!WARNING]
> The password only locks this card. It doesn't replace Home Assistant permissions.
> Anyone who can edit the dashboard can remove it.

## Configuration

| Option | Default | Description |
| --- | --- | --- |
| `title` | KeEnergy heating curve | Title of the card |
| `language` | `auto` | `auto`, `de` or `en` |
| `config_entry` | automatic | Fixed controller, by its config entry ID |
| `serial` | automatic | Fixed controller, by its serial number |
| `circuit` | automatic | Fixed heating circuit, starting at `1` |
| `flow_min`, `flow_max` | none | Chart limits in °C, 10 to 90 |
| `x_min`, `x_max` | automatic | Visible outdoor temperature range in °C, −100 to 100 |
| `y_min`, `y_max` | automatic | Visible flow temperature range in °C, 0 to 150 |
| `x_step`, `y_step` | 5 | Grid interval in °C, 0.01 to 200 (X) or 150 (Y) |
| `intermediate_step` | 5 | Interval of the interpolated values in °C |
| `edit_password_hash` | none | Set by the visual editor |
| `auto_lock_minutes` | 5 | Minutes until the card locks again, 1 to 60 |
| `entities` | automatic | Manual entities, see [examples/manual-entities.yaml](examples/manual-entities.yaml) |

- Leave out `config_entry`, `serial`, `circuit` and `entities` to select them in the card.
- [examples/fixed-heating-circuit.yaml](examples/fixed-heating-circuit.yaml) shows a fixed heating circuit.

### Entities

The card finds these entities on its own. Set them in `entities` only if that doesn't work.

| Key | Domain | Entity |
| --- | --- | --- |
| `curve_select` | `select` | Curve table of the heating circuit |
| `curve_sensor` | `sensor` | Heating curve with the attribute `points` |
| `outdoor_temperature` | `sensor` | Outdoor temperature |
| `flow_temperature` | `sensor` | Actual flow temperature |
| `flow_setpoint` | `sensor` | Target flow temperature |
| `use_heating_curve` | `switch` | Point table state (optional) |
| `heating_limit_day` | `number` | Heating limit day |
| `heating_limit_night` | `number` | Heating limit night |

- All entities must belong to the same controller and heating circuit.
- See [examples/manual-entities.yaml](examples/manual-entities.yaml).

## Good to know

- The card never changes the curve mode (point table or hybrid).
- The card never changes slope or offset.
- The card loads nothing from the internet.
- No MQTT or Node-RED needed.

## Changelog

The [changelog](CHANGELOG.md) lists the changes of every release (in German).

## Get involved

[![CI](https://github.com/superbox-dev/keba_keenergy_heating_curve_card/actions/workflows/ci.yml/badge.svg?branch=main)][workflow-ci]
[![codecov](https://codecov.io/gh/superbox-dev/keba_keenergy_heating_curve_card/graph/badge.svg)][codecov]

- Found a bug or have an idea? [Open an issue](https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/new/choose).
- Want to help with the code? Read the [contribution guide](CONTRIBUTING.md).

[workflow-ci]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/actions/workflows/ci.yml
[codecov]: https://codecov.io/gh/superbox-dev/keba_keenergy_heating_curve_card

## License

- [MIT](LICENSE)
- The bundled [@noble/hashes](https://github.com/paulmillr/noble-hashes) library: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
