
# SubframeSelectorPro

![PixInsight](https://img.shields.io/badge/PixInsight-Script-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)
![Languages](https://img.shields.io/badge/Languages-EN%20|%20IT%20|%20ES%20|%20DE%20|%20FR-lightgrey)

**Automated Subframe Quality Analysis & Rejection for PixInsight**

SubframeSelectorPro is a professional-grade PixInsight script that automatically analyzes the quality of astronomical subframes (light frames), scores them using PSF and image statistics metrics, and separates good frames from bad ones by moving rejected files into a dedicated subfolder.

Built to integrate seamlessly with the PixInsight environment, it leverages the native SubframeSelector process as its PSF analysis backend for maximum accuracy, and includes an intelligent caching system that makes iterative threshold tuning instantaneous.

---

## Feature Highlights

### Three Rejection Modes

| Mode | Description |
|------|-------------|
| **Absolute Threshold** | Reject frames exceeding user-defined limits on any metric. Each metric (FWHM, Eccentricity, SNR, Star Residual, Star Count, Noise, Median) can be individually enabled/disabled. |
| **Best Percentage** | Keep only the top N% of frames ranked by a customizable weighted quality score. Weights are adjustable for each metric. |
| **Sigma Clipping** | Self-adapting statistical rejection. Calculates mean and standard deviation for each metric across all frames, then rejects outliers beyond Nσ. No need to know absolute threshold values for your setup. |

### Core Capabilities

- **Native SubframeSelector Backend** — Uses PixInsight's built-in SubframeSelector process for PSF fitting, producing metrics identical to the native tool. Includes batch processing mode for optimized throughput. Automatic fallback to StarDetector if SubframeSelector is unavailable.
- **Analysis Cache** — Results are cached in a JSON file. Re-running on the same folder with different rejection settings skips the entire analysis phase. Cache is automatically invalidated when files change (size/timestamp) or PSF parameters are modified.
- **Filter-Aware Grouping** — Reads the `FILTER` FITS keyword and applies rejection criteria separately for each filter group. Essential for LRGB and narrowband imaging where different filters have inherently different PSF characteristics.
- **Dry Run Mode** — Analyze and preview what would be rejected without moving any files. Inspect the full report and CSV before committing.
- **Undo / Restore** — Every move operation saves a restore log (JSON) in the rejected folder. One-click restore puts all files back in their original location.
- **CSV Export** — Detailed CSV report with 16 columns for every frame, ready for analysis in Excel, LibreOffice, or any data tool.
- **Plate Scale Detection** — Automatically reads `FOCALLEN`, `XPIXSZ`, `CDELT1` from FITS headers to convert FWHM from pixels to arcseconds. Manual override available if keywords are missing.
- **Non-Destructive** — Rejected frames are moved, never deleted. Nothing is overwritten.
- **Persistent Settings** — All parameters are saved between sessions via PixInsight's Settings API.
- **Localized Interface** — Full UI translation in English, Italian, Spanish, German, and French.

## Requirements

| Component | Minimum Version |
|-----------|----------------|
| PixInsight | 1.8.9-1 or newer (1.8.9-2+ recommended) |
| OS | Windows 10 or later, macOS 11 or later, Linux 64-bit |
| Calibration | Bias, dark, and flat corrected frames |
| Image Formats | FITS, XISF, TIFF, CR2/CR3, RAW, ARW, ORF, RW2, DNG, PNG |

---

## Installation

### Method 1: Manual Installation

1. **Download** or clone this repository:
   ```bash
   git clone https://github.com/Ft2801/SubframeSelectorPro.git
   ```

2. **Copy** the `src/` folder contents to your PixInsight scripts directory:

   | OS | Path |
   |----|------|
   | Windows | `C:\Program Files\PixInsight\src\scripts\SubframeSelectorPro\` |
   | macOS | `/Applications/PixInsight.app/Contents/Resources/src/scripts/SubframeSelectorPro/` |
   | Linux | `/opt/PixInsight/src/scripts/SubframeSelectorPro/` |

   Or use any custom location.

3. In PixInsight, go to **SCRIPT > Feature Scripts > Add**, navigate to the folder containing `SubframeSelectorPro.js`, and click **OK**.

4. The script appears under **SCRIPT > Utilities > SubframeSelectorPro**.

### Method 2: PixInsight Update Repository

Add this URL to PixInsight's update system:

```
https://raw.githubusercontent.com/Ft2801/SubframeSelectorPro/main/updates.xri
```

Go to **RESOURCES > Updates > Manage Repositories > Add** and paste the URL.

---

## Usage Guide

### Quick Start

1. Launch: **SCRIPT > Utilities > SubframeSelectorPro**
2. Select your **Input Directory** containing calibrated light frames
3. Choose a **Rejection Mode**
4. Adjust parameters (hover for tooltips)
5. Optionally enable **Dry Run** to preview results first
6. Click **Run**

### Recommended Workflow

```
First run:  ☑ Dry Run  +  ☑ Export CSV
            → Review the console report and CSV
            → Identify appropriate thresholds for your data

Second run: ☐ Dry Run  (uncheck)
            → Cache makes this instant — only rejection is recomputed
            → Files are moved to the rejected/ subfolder

If unhappy: Click [Restore] to undo everything
```

### Rejection Modes Explained

#### Absolute Threshold

Each metric has an independent threshold. A frame is rejected if **any** enabled metric fails. Checkboxes allow toggling individual checks on/off.

| Metric | Default | Reject When | Meaning |
|--------|---------|-------------|---------|
| FWHM Max | 4.5" | Above | Poor seeing, defocus |
| FWHM Min | 0.5" | Below | Suspicious data, hot pixels |
| Eccentricity | 0.65 | Above | Trailing, guiding errors |
| SNR | 15.0 | Below | Low signal quality |
| Star Residual | 0.08 | Above | Poor PSF fit, distortion |
| Star Count | 50 | Below | Clouds, fog, dew |
| Noise | 0.005 | Above | Excessive background noise |
| Median Min | 0.05 | Below | Failed exposure, shutter issue |
| Median Max | 0.85 | Above | Saturation, light leak, LP |

**Best for:** Experienced users who know their system's characteristics.

#### Best Percentage

All frames are scored using a weighted composite quality metric, then ranked. Only the top N% are kept.

```
Score = Σ(weight_i × normalized_metric_i) / Σ(weight_i)
```

Normalization maps each metric to [0,1] across the dataset, with appropriate inversion (lower FWHM = higher score, higher SNR = higher score, etc.).

| Weight | Default | Direction |
|--------|---------|-----------|
| FWHM | 40 | Lower is better |
| Eccentricity | 20 | Lower is better |
| SNR | 25 | Higher is better |
| Star Count | 5 | Higher is better |
| Noise | 10 | Lower is better |

**Best for:** Quick sessions where you want to keep a fixed proportion.

#### Sigma Clipping

Calculates mean (μ) and standard deviation (σ) for each enabled metric, then rejects frames outside the range:

- **Higher-is-worse metrics** (FWHM, Eccentricity, Noise): reject if value > μ + σ_high × σ
- **Lower-is-worse metrics** (SNR, Star Count): reject if value < μ - σ_low × σ
- **FWHM additionally**: reject if value < μ - σ_low × σ (suspiciously low)

Default σ values: Low = 2.0, High = 2.0

**Best for:** Unknown systems, first-time analysis, or datasets where you don't know what "good" looks like. The algorithm adapts to your data automatically.

---

## Filter Grouping

When **Group by filter** is enabled, the script:

1. Reads the `FILTER` FITS keyword from each frame's header
2. Groups frames by filter name (e.g., L, R, G, B, Ha, OIII, SII)
3. Applies the selected rejection mode **independently within each group**
4. Reports per-filter statistics

This is critical because:
- Narrowband filters (Ha, OIII) typically have worse FWHM and lower SNR than broadband
- Without grouping, all Ha frames might be rejected simply because L frames have better metrics
- Each filter is evaluated against its own population statistics

Frames without a `FILTER` keyword are placed in a "(no filter)" group.

---

## Analysis Cache

When **Use analysis cache** is enabled:

1. After analysis, results are saved to `SubframeSelectorPro_cache.json` in the input directory
2. On subsequent runs, the cache is loaded and each file's signature (size + modification timestamp) is checked
3. Files with matching signatures skip re-analysis entirely
4. Only new or modified files are analyzed

**Cache invalidation occurs when:**
- A file's size or modification time has changed
- The script version has changed
- PSF parameters (function type, structure layers, sensitivity, max stars) have changed
- The "Use native SubframeSelector" setting has changed

This means you can:
- Run with Dry Run, review results
- Adjust thresholds
- Run again — **instant results**, no re-analysis
- Change PSF parameters — cache is invalidated, full re-analysis

---

## PSF Analysis Backend

### Native SubframeSelector (Default)

When **Use native SubframeSelector** is enabled, the script invokes PixInsight's built-in `SubframeSelector` process as a `ProcessInstance`. This guarantees:

- **Identical metrics** to what you'd see in the native SubframeSelector tool
- **Batch processing** — all files are submitted at once, leveraging PI's internal C++ multithreading
- **Accurate PSF fitting** with the selected function (Gaussian, Moffat 4/6/8)

### StarDetector Fallback

If SubframeSelector is not available (older PI versions or configuration issues), the script automatically falls back to:

1. `StarDetector` for star detection and count
2. Bounding-box eccentricity estimation
3. `ImageStatistics` for median and noise
4. `image.noiseMRS()` for robust noise estimation

The fallback is fully functional but may produce slightly different metric values compared to the native tool.

---

## Undo / Restore

Every time files are moved to the rejected folder, the script saves a `SubframeSelectorPro_restore.json` file containing the mapping of every moved file:

```json
{
  "scriptName": "SubframeSelectorPro",
  "scriptVersion": "1.0.0",
  "timestamp": "2026-03-15T22:30:45.123Z",
  "entries": [
    {
      "original": "/data/lights/frame_042.fits",
      "moved": "/data/lights/rejected/frame_042.fits"
    }
  ]
}
```

Clicking **Restore** reads this log and moves every file back to its original path. After a successful restore, the log and (if empty) the rejected directory are removed.

Multiple runs accumulate entries in the same restore log, so you can undo multiple rejection sessions at once.

---

## CSV Export

When enabled, a CSV file (`SubframeSelectorPro_report.csv`) is saved in the input directory with the following columns:

| Column | Description |
|--------|-------------|
| File | Filename |
| Filter | FILTER keyword value |
| DateObs | DATE-OBS keyword value |
| Exposure | Exposure time in seconds |
| FWHM_px | FWHM in pixels |
| FWHM_arcsec | FWHM in arcseconds (if plate scale available) |
| Eccentricity | Star eccentricity (0–1) |
| SNR | Signal-to-noise ratio |
| StarResidual | PSF fitting residual |
| StarCount | Number of detected stars |
| Noise | Normalized noise level |
| Median | Median pixel value (0–1) |
| PlateScale | Plate scale in arcsec/px |
| QualityScore | Composite quality score (0–1) |
| Status | ACCEPTED, REJECTED, or FAILED |
| RejectionReasons | Semicolon-separated list of reasons |

---

## Console Output Example

```
SubframeSelectorPro v1.0.0
Copyright (c) 2026 Fabio Tempera
================================================================

Input directory:  /data/M31_lights/
Rejection mode:   Sigma Clipping (σL=2.0 σH=2.0)
Operation:        Execute
Group by filter:  Yes
PSF backend:      Native SubframeSelector
Analysis cache:   Enabled

Scanning for image files...
Found 120 image files.
Cache loaded from previous run.
Using cached results (120 frames)
Frames to analyze: 0 (cached: 120)
────────────────────────────────────────────────────────────────
Analysis complete.
  Cache saved: /data/M31_lights/SubframeSelectorPro_cache.json

Applying rejection criteria...

  ── Filter: Ha (40 frames) ──
  Sigma Statistics:
    fwhm            mean=3.2145  σ=0.4523
    eccentricity    mean=0.3812  σ=0.0934
    snr             mean=28.4500 σ=5.2310

  ── Filter: L (50 frames) ──
  Sigma Statistics:
    fwhm            mean=2.1234  σ=0.3210
    ...

  ── Filter: OIII (30 frames) ──
  ...

================================================================
                    ANALYSIS REPORT
================================================================

File                                 Filter   FWHM   Ecc     SNR Stars    Noise Median   Score Status
-----------------------------------------------------------------------------------------------------------------------
M31_Ha_001.fits                      Ha       3.21  0.342    32.1   287 0.001234 0.1523  0.7845 OK
M31_Ha_002.fits                      Ha       5.89  0.312    25.3   245 0.001456 0.1456  0.4123 REJECTED
    → fwhm: 5.8900 is 5.9σ above mean 3.2145 (limit: +2.0σ)
M31_L_001.fits                       L        1.98  0.289    52.3   412 0.000987 0.1634  0.9234 OK
...

================================================================
Total:    120
Accepted: 108
Rejected: 12
Rejection rate: 10.0%

  Per-filter summary:
    Ha           total=40  accepted=36  rejected=4
    L            total=50  accepted=47  rejected=3
    OIII         total=30  accepted=25  rejected=5
================================================================
CSV report saved: /data/M31_lights/SubframeSelectorPro_report.csv

Moving rejected frames... 12 frame(s)...
  MOVED: M31_Ha_002.fits
  MOVED: M31_Ha_017.fits
  ...
  Restore log saved: /data/M31_lights/rejected/SubframeSelectorPro_restore.json
Moved 12 file(s).

Total time: 2.3 seconds.

================================================================
SubframeSelectorPro completed.
```

Note: 2.3 seconds for 120 frames because all results were cached from a previous run. Only the rejection logic was recomputed.

---

## PSF Settings Reference

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| PSF Function | Gaussian | Gaussian, Moffat 4/6/8 | Model function for PSF fitting |
| Structure Layers | 5 | 1–8 | Wavelet layers for star detection |
| Sensitivity | 0.50 | 0.01–1.0 | Star detection sensitivity |
| Max Stars | 500 | 10–5000 | Maximum stars sampled for PSF fitting |

**Recommendations:**
- **Gaussian** — Best for undersampled images (FWHM < 2 px)
- **Moffat 4** — Best for well-sampled images (FWHM > 3 px), models diffraction wings
- **Moffat 6/8** — For very well-sampled, high-quality optics
- Increase **Structure Layers** if your stars are large (long focal length)
- Increase **Sensitivity** for sparse star fields or narrowband data
- Increase **Max Stars** for more statistical robustness (at the cost of speed)

---

## Localization

The interface is fully translated in five languages: English, Italian, Spanish, German, and French.

Select the language from the dropdown in the top-right corner of the dialog. The preference is saved between sessions. Console output (analysis report, log messages) uses the selected language.

To add a new language, edit `SubframeSelectorPro-i18n.js` and add a new entry to each string array. See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## Project Structure

```
SubframeSelectorPro/
├── src/
│   ├── SubframeSelectorPro.js          # Main entry point & feature registration
│   ├── SubframeSelectorPro-i18n.js     # Internationalization (5 languages)
│   ├── SubframeSelectorPro-params.js   # Parameters, defaults, persistence
│   ├── SubframeSelectorPro-engine.js   # Analysis engine, cache, batch, CSV, restore
│   ├── SubframeSelectorPro-gui.js      # User interface dialog
│   └── SubframeSelectorPro.svg         # Toolbar icon (128x128)
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── .gitignore                          # Git exclusions
├── build.ps1                           # PowerShell build automation
├── LICENSE                             # MIT License
├── README.md                           # This file
├── INSTALL.md                          # Installation guide
├── CONTRIBUTING.md                     # Contribution guidelines
├── CHANGELOG.md                        # Version history
└── updates.xri                         # PixInsight update repository descriptor
```

### Generated at Runtime (in your data directory)

| File | Purpose |
|------|---------|
| SubframeSelectorPro_cache.json | Analysis cache |
| SubframeSelectorPro_report.csv | CSV report with metrics |
| rejected/ | Subfolder for rejected frames |
| rejected/SubframeSelectorPro_restore.json | Undo/restore log |

---

## Contributing

Contributions are welcome! For detailed guidelines on how to contribute, report bugs, request features, and set up your development environment, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Roadmap

Future improvements under consideration:

- **Interactive results table** — TreeBox in the dialog for sorting and manual override of individual frames
- **Quality plots** — Visual graphs of metrics over time (FWHM trend, seeing evolution)
- **WBPP integration** — Export accepted file list for WeightedBatchPreprocessing
- **Saveable profiles** — Named presets (e.g., "Refractor Ha", "Newton Broadband")
- **Session comparison** — Compare aggregate metrics across multiple nights
- **Satellite/trailing detection** — Advanced anomaly detection beyond PSF metrics
- **Batch multi-folder** — Process multiple directories in sequence
- **XISF properties** — Write metrics as XISF image properties

---

## Support This Project

If you find SubframeSelectorPro useful, consider supporting the developer:

**[Buy me a coffee](https://buymeacoffee.com/fabiot2801z)** — Your contribution helps fund development, maintenance, and new features.

Every bit helps!

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author

**Fabio Tempera**

- GitHub: [@Ft2801](https://github.com/Ft2801)
