# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added the chart axis options `x_min`, `x_max`, `x_step`, `y_min`, `y_max` and `y_step`.
- Added the option `intermediate_step` for the interval of the interpolated values.

### Changed

- Renamed the card type to `custom:keba-keenergy-heating-curve-card`.
- Renamed the card file to `keba_keenergy_heating_curve_card.js`.
- Renamed the card in HACS to `KEBA KeEnergy Heating Curve Card`.
- Wrote the documentation in English, German in `README.de.md`.

## [1.0.2] - 2026-11-24

### Added

- Added the heating curve card with detection of the controllers and heating circuits.
- Added the curve tables and the editing of curve points and heating limits.
- Added an optional password for the card.
- Added German and English texts, selected by the Home Assistant profile language or `language`.
- Added the number format of Home Assistant.

[Unreleased]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/releases/tag/v1.0.2
