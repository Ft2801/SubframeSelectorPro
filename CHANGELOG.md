# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-28

### Added
- Initial release
- Integrated donation link (buymeacoffee.com/fabiot2801z) in UI and documentation
- Native SubframeSelector process backend with batch processing
- Analysis cache with smart invalidation (file signature + PSF params)
- Localization in 5 languages (EN, IT, ES, DE, FR)
- Toggle to use native SubframeSelector
- Toggle to use analysis cache
- Lightweight FITS keyword extraction via FileFormatInstance
- Batch processing leverages PI's internal C++ multithreading
- Progress reporting with frame counter and abort support
- Sigma Clipping rejection mode
- Dry Run / Preview mode
- CSV report export (16 columns)
- Undo / Restore functionality with JSON restore log
- Filter-aware grouping (per-filter rejection)
- Plate scale manual override (focal length + pixel size)
- Per-filter summary in console report
- DATE-OBS and EXPTIME extraction from FITS keywords
- Absolute Threshold and Best Percentage rejection modes
- PSF analysis via StarDetector (FWHM, Eccentricity, Star Residual)
- Image statistics (SNR, Noise, Median, Star Count)
- Automatic plate scale detection from FITS keywords
- Persistent settings and New Instance support
- Support for FITS, XISF, TIFF, RAW, PNG

