# Mongolia Winter Freeze-Thaw-Snow Analysis Framework

This repository provides a dual-approach Google Earth Engine (GEE) framework for monitoring winter thermodynamic states across Mongolian grasslands. It includes scripts for generating daily area statistics (CSV) and high-resolution spatial stacks (GeoTIFF) for the winter seasons of 2014–2023.

## Project Overview
This project classifies three distinct phase states based on MODIS Land Surface Temperature (LST) and Snow Index (NDSI) data:
1. **Snow (Frozen)**
2. **Freeze-Thaw (Transitional)**
3. **Thawed**

Classification is strictly constrained to **grassland pixels** with **active snow cover** to ensure the data reflects snowpack thermodynamics rather than bare soil behavior.

### Classification Logic & Symbology
| State | Phase | Temperature Logic (Diurnal) | Map Color |
| :--- | :--- | :--- | :--- |
| **1** | **Snow (Frozen)** | Day LST < -2°C & Night LST < -2°C | **Blue** |
| **2** | **Freeze-Thaw** | Day LST ≥ -2°C & Night LST < -2°C | **Green** |
| **3** | **Thawed** | Day LST ≥ -2°C & Night LST ≥ -2°C | **Red** |

*Note: Area calculations are performed only on pixels where NDSI > 50.*

---

## Repository Structure

### 1. `freeze_thaw_stats_csv.js`
**Use Case:** Generating time-series charts and numerical data for statistical analysis.
- **Output:** Yearly CSV files containing daily area (km²) for each state.
- **Optimization:** Processes data in yearly "chunks" to avoid GEE memory timeouts.

### 2. `freeze_thaw_spatial_tiff.js`
**Use Case:** Spatial analysis in GIS software (QGIS/ArcGIS).
- **Output:** Multi-band GeoTIFFs (one per winter season).
- **Structure:** Each band in the TIFF represents one day (Band 1 = Oct 1).
- **Resolution:** 1000m (1km).

---

## Installation & Usage

1. **Access Google Earth Engine:** Open the [GEE Code Editor](https://code.earthengine.google.com/).
2. **Select a Script:** Choose either the CSV or TIFF script from this repository and paste it into the editor.
3. **Configure Parameters:** Adjust `startYear`, `endYear`, and `lstThreshold` at the top of the script if necessary.
4. **Run & Export:**
   - Click **Run** to view the interactive map and preview chart.
   - Open the **Tasks** tab in the top-right panel.
   - Click **Run** on the individual tasks to begin the export to your Google Drive (`EarthEngine_Exports` folder).

## Citation
If you use this code for research or reporting, please cite it as:
> *Máté J. Török (2026). Mongolia Winter Freeze-Thaw-Snow Analysis Framework. GitHub Repository: https://github.com/matetorok1/mongolia-freeze-thaw-gee*

## License
Distributed under the MIT License. See `LICENSE` for more information.
