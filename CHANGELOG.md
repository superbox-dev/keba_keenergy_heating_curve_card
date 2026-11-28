# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Showed the texts of the card in the sizes of Home Assistant ([Issue #43][issue-43]).
- Kept the chart texts at the same size at every card width ([Issue #43][issue-43]).
- Rebuilt the visual editor with the forms of Home Assistant ([Issue #43][issue-43]).
- Used the theme and chart colors of Home Assistant ([Issue #43][issue-43]).
- Showed the selections, heating limits, curve points and password fields with the forms of Home Assistant ([Issue #43][issue-43]).
- Showed the password lock, hints and errors as notices of Home Assistant ([Issue #43][issue-43]).
- Showed all points without a scroll area ([Issue #43][issue-43]).
- Showed saved heating limits and points right away, without a message ([Issue #43][issue-43]).
- Showed missing entities as a warning at the top of the card, with their names ([Issue #43][issue-43]).
- Made the chart taller ([Issue #43][issue-43]).
- Showed missing readings as `Unavailable` or `Unknown` like Home Assistant ([Issue #43][issue-43]).
- Wrote `KEBA KeEnergy` instead of `KeEnergy` in the texts ([Issue #43][issue-43]).
- Shortened the default title to `Heating curve` ([Issue #43][issue-43]).
- Showed `KEBA KeEnergy` as the header of the card and the chart title smaller ([Issue #43][issue-43]).
- Showed the chart directly in the card, without a frame ([Issue #43][issue-43]).
- Renamed the chart labels `HL Day` and `HL Night` to `Day heating limit` and `Night heating limit` ([Issue #43][issue-43]).

### Fixed

- Fixed the write of a curve table that was already assigned ([Issue #43][issue-43]).

[issue-43]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/43

## [1.1.0] - 2026-11-26

### Added

- Added the chart axis options `x_min`, `x_max`, `x_step`, `y_min`, `y_max` and `y_step` ([PR #10][pr-10]).
- Added the option `intermediate_step` for the interval of the interpolated values ([PR #10][pr-10]).

### Changed

- Renamed the card type to `custom:keba-keenergy-heating-curve-card` ([Issue #1][issue-1]).
- Renamed the card file to `keba_keenergy_heating_curve_card.js` ([Issue #1][issue-1]).
- Renamed the card in HACS to `KEBA KeEnergy Heating Curve Card` ([Issue #1][issue-1]).
- Renamed the example files to English ([Issue #1][issue-1]).
- Wrote the documentation in English, German in `README.de.md` ([Issue #2][issue-2]).
- Moved the card file from the repository to the GitHub release ([Issue #6][issue-6]).
- Required Home Assistant 2026.11.0 or newer ([Issue #3][issue-3]).

### Removed

- Removed `SHA256SUMS.txt` ([Issue #6][issue-6]).

[pr-10]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/pull/10
[issue-1]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/1
[issue-2]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/2
[issue-3]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/3
[issue-6]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/issues/6

## [1.0.2] - 2026-11-24

### Added

- Added the heating curve card with detection of the controllers and heating circuits.
- Added the curve tables and the editing of curve points and heating limits.
- Added an optional password for the card.
- Added German and English texts, selected by the Home Assistant profile language or `language`.
- Added the number format of Home Assistant.

[Unreleased]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/superbox-dev/keba_keenergy_heating_curve_card/releases/tag/v1.0.2
