# Mongolia Winter Freeze-Thaw-Snow Calculator

This Google Earth Engine (GEE) script calculates the daily area (in km²) of three distinct phase states—Snow (Frozen), Freeze-Thaw (Transitional), and Thawed—across the grasslands of Mongolia during the winter seasons (October 1st to April 30th). 

To ensure high data quality and relevance, the classification is strictly limited to **snow-covered grasslands**.

## Data Sources
* **Boundary:** FAO GAUL Level-0 (2015) - Country boundary of Mongolia.
* **Land Cover:** MODIS/061/MCD12Q1 - Used to mask the study area strictly to Grasslands (`LC_Type1 == 10`).
* **Snow Cover:** MODIS/061/MOD10A1 & MYD10A1 (Terra & Aqua) - Used to mask pixels for active snow cover (NDSI > 50).
* **Land Surface Temperature (LST):** MODIS/061/MOD11A1 & MYD11A1 (Terra & Aqua) - Day and Night LST used for thermodynamic classification.

## Methodology & Classification Logic
The script dynamically merges Terra and Aqua sensor data to reduce cloud-cover gaps. It evaluates the diurnal temperature cycle of each valid pixel using a predefined Celsius threshold (default: `-2°C`).



The three states are classified and visualized as follows:
1. **Snow (Frozen)** * **Logic:** Day LST < -2°C **AND** Night LST < -2°C
   * **Map Color:** Blue 
   * **Chart Color:** Blue
2. **Freeze-Thaw (Transitional)** * **Logic:** Day LST ≥ -2°C **AND** Night LST < -2°C
   * **Map Color:** Green
   * **Chart Color:** Green
3. **Thawed** * **Logic:** Day LST ≥ -2°C **AND** Night LST ≥ -2°C
   * **Map Color:** Red 
   * **Chart Color:** Orange

*Note: Any pixel that does not represent a grassland, or does not have an NDSI > 50, is masked out and excluded from the final area calculation.*

## How to Run the Script

### 1. Setup in Google Earth Engine
1. Navigate to the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Create a new script and paste the contents of `freeze_thaw_calculator.js` into the editor.

### 2. Adjust User Parameters
At the very top of the script, you can easily adjust the target parameters for your specific study:
```javascript
var startYear = 2014;       // First year of the study period
var endYear = 2023;         // Last year of the study period 
var ndsiThreshold = 50;     // NDSI threshold for valid snow cover
var lstThreshold = -2;      // Celsius threshold for LST classification
