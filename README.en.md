# KEBA KeEnergy Heating Curve Card 1.0.2

A reusable, unofficial Home Assistant custom card for
[superbox-dev/keba_keenergy](https://github.com/superbox-dev/keba_keenergy).
The card and its visual editor support **German and English**. There are no hardcoded personal entities,
serial numbers, addresses or passwords. See `README.md` for full documentation.

1. Copy `keba-keenergy-heizkurve.js` to `/config/www/`. If you create `www` for the
   first time, restart Home Assistant once.
2. Add `/local/keba-keenergy-heizkurve.js?v=1.0.2` as a **JavaScript module** dashboard
   resource and reload the frontend.
3. Add the card from `karte.yaml`, or use `dashboard.yaml` for a dedicated dashboard.

```yaml
type: custom:keba-keenergy-heizkurve-card
language: auto
```

Controllers and heating circuits are discovered using the KeEnergy entity registry
unique IDs, including renamed entity IDs. Switching controller/circuit only changes
the view. The first discovered controller/circuit is the initial view; pin a controller
and circuit in the visual editor for a fixed starting view. Selecting a curve table
assigns it to the heating circuit and writes immediately. Tables named HC1/HC2 are
distinct from circuit numbers. Editing a shared table affects every circuit using
that table on the same controller. Points and heating limits have explicit save buttons.

Language defaults to the current user's HA profile (`language: auto`). German
regional variants use German; other languages fall back to English. Set `language: de`
or `language: en` to override it, or select **Language** in the visual editor.
Numbers respect HA number-format preferences. Custom titles, device/room names,
entity IDs and table names remain unchanged; omit `title` for the localized default.
Backend error details are passed through as received.

The visual editor can configure a controller/circuit, optional **display-only**
`flow_min`/`flow_max` limits and an individual password. Password protection is off
by default. An optional salted PBKDF2-SHA256 verifier is saved in the card configuration;
the frontend edit lock does not replace HA authorization or protect other cards/actions.

An administrator can enable the required disabled entities from the card. Missing
hardware capabilities cannot be added by this card. For manual mappings see
`beispiele/manuelle-entitaeten.yaml`; substitute every placeholder with your own IDs.

Checked against integration source 1.12.2 on 2026-11-23. Requires a heating-curve sensor
with a `points` attribute and, for saving points, the
`keba_keenergy.set_heating_curve_points` action. Older versions without the action
cannot save points. Tested in a local browser with simulated HA, including multiple
controllers/circuits and frequent updates; not tested on physical hardware.

Single self-contained runtime file, no external runtime downloads. Source and build
files included. Node.js 20.19+: `npm install`, `npm test`, `npm run build`.
MIT licensed; see `THIRD_PARTY_NOTICES.md` for the bundled cryptography library license.
