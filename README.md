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
  
## GIS Visualization Guide (ArcGIS Pro)

The spatial export is a **Multi-band Integer GeoTIFF**. Because ArcGIS Pro often interprets multi-band files as Red-Green-Blue (RGB) imagery, you must isolate an individual band to apply categorical "Unique Values" symbology.

### 1. Isolate a Single Day (Band)
ArcGIS cannot apply "Unique Values" to a stack of 200+ days at once. Use the **Catalog Pane** to pull a single band and break the RGB lock:
1. Open the **Catalog Pane** (View Tab > Catalog Pane).
2. Navigate to your `.tif` file and click the **arrow icon (`>`)** to expand it.
3. You will see individual days listed by date, e.g:`0_2014_10_01`, `1_2014_10_02`, etc.
4. Drag and drop **exactly one band** onto your Map.

### 2. Configure Symbology
Now that you have a single-band layer in your **Contents** pane:
1. **Right-click** the new layer > **Symbology**.
2. Change the **Primary Symbology** dropdown from "Stretch" to **Unique Values**.
3. If a popup asks to calculate statistics or build pyramids, click **OK**.
4. Map the values using this key:

| Value | State | Thermodynamic Logic | Color |
| :--- | :--- | :--- | :--- |
| **0** | **Masked** | Non-grassland or NDSI ≤ 50 | **No Color (Transparent)** |
| **1** | **Snow (Frozen)** | Day & Night LST < -2°C | **Blue** |
| **2** | **Freeze-Thaw** | Day LST ≥ -2°C & Night LST < -2°C | **Green** |
| **3** | **Thawed** | Day LST ≥ -2°C & Night LST ≥ -2°C | **Red** |


### 3. Troubleshooting & Common Errors
* **Error 003401 (Invalid Input):** This is often caused by file names containing spaces or parentheses (e.g., `... (1).tif`). **Rename the file** in Windows Explorer to something simple (e.g., `FT_2014.tif`) before adding it to ArcGIS.
* **Missing "Unique Values" Option:** This occurs when ArcGIS is stuck in RGB mode. Ensure you are looking at a layer with only **one band** listed under it in the Contents pane.

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
> *Török, M. J. (2026). Mongolia Winter Freeze-Thaw-Snow Calculator (Version 1.0.0) [Computer software]. https://github.com/matetorok1/mongolia-freeze-thaw-gee*

## License
Distributed under the MIT License. See `LICENSE` for more information.
