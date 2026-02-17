/***************************************************************
 * MODIS Freeze-Thaw & Snow Area Calculator
 * Target Area: Mongolia (Entire Country)
 * Period: Winter Seasons (Oct 1 - Apr 30)
 ***************************************************************/

// --- 1. USER DEFINED PARAMETERS ---
var startYear = 2014;       
var endYear = 2015;         
var ndsiThreshold = 50;     
var lstThreshold = -2;      


// --- 2. STUDY AREA INITIALIZATION (Entire Country) ---
// Using GAUL level 0 is highly optimized for country-level boundaries
var gaul = ee.FeatureCollection("FAO/GAUL/2015/level0");
var mn = gaul.filter(ee.Filter.eq('ADM0_NAME', 'Mongolia'));
var AOI = mn.geometry();

Map.centerObject(AOI, 5); // Zoom out to level 5 to see the whole country
Map.addLayer(ee.Image().paint(AOI, 0, 2), {palette: 'yellow'}, 'Study Area (Mongolia)');


// --- 3. GRASSLAND MASK (MODIS/061 LC_Type1) ---
var modisLC = ee.ImageCollection('MODIS/061/MCD12Q1')
  .select('LC_Type1')
  .filterBounds(AOI)
  .map(function(img){ return img.eq(10); }) // 10 = grassland
  .median()
  .clip(AOI);

Map.addLayer(modisLC.updateMask(modisLC), {palette:['00FF00']}, 'Grassland Mask (Nationwide)');


// --- 4. FREEZE-THAW & SNOW CLASSIFICATION ---
var dummySnow = ee.Image.constant(0).rename('NDSI_Snow_Cover').updateMask(0);
var dummyLST = ee.Image.constant([0, 0]).rename(['LST_Day_1km', 'LST_Night_1km']).updateMask(0);

function classifyFreezeThaw(date) {
  date = ee.Date(date);
  var nextDay = date.advance(1, 'day');

  var terraSnow = ee.ImageCollection('MODIS/061/MOD10A1')
    .filterDate(date, nextDay).select('NDSI_Snow_Cover')
    .merge(ee.ImageCollection([dummySnow])).mosaic(); 

  var aquaSnow = ee.ImageCollection('MODIS/061/MYD10A1')
    .filterDate(date, nextDay).select('NDSI_Snow_Cover')
    .merge(ee.ImageCollection([dummySnow])).mosaic();

  var snowMask = terraSnow.unmask(0).gt(ndsiThreshold)
    .or(aquaSnow.unmask(0).gt(ndsiThreshold));

  var terraLST = ee.ImageCollection('MODIS/061/MOD11A1')
    .filterDate(date, nextDay).select(['LST_Day_1km', 'LST_Night_1km'])
    .merge(ee.ImageCollection([dummyLST])).mosaic()
    .multiply(0.02).subtract(273.15);

  var aquaLST = ee.ImageCollection('MODIS/061/MYD11A1')
    .filterDate(date, nextDay).select(['LST_Day_1km', 'LST_Night_1km'])
    .merge(ee.ImageCollection([dummyLST])).mosaic()
    .multiply(0.02).subtract(273.15);

  var day = terraLST.select('LST_Day_1km').unmask(aquaLST.select('LST_Day_1km'));
  var night = terraLST.select('LST_Night_1km').unmask(aquaLST.select('LST_Night_1km'));

  var combinedMask = ee.Image(1)
    .updateMask(modisLC)
    .updateMask(snowMask.updateMask(snowMask)) 
    .clip(AOI);

  var condSnow = day.lt(lstThreshold).and(night.lt(lstThreshold));
  var condFreezeThaw = day.gte(lstThreshold).and(night.lt(lstThreshold));
  var condThawed = day.gte(lstThreshold).and(night.gte(lstThreshold));

  return ee.Image(0)
    .where(condSnow, 1)
    .where(condFreezeThaw, 2)
    .where(condThawed, 3)
    .updateMask(combinedMask)
    .rename('FreezeThaw')
    .set('date', date.format('YYYY-MM-dd'));
}


// --- 5. DATA AGGREGATION (YEARLY CHUNKS) ---
var pixelArea = ee.Image.pixelArea().divide(1e6); 

function processYear(y) {
  var startDate = ee.Date.fromYMD(y, 10, 1);
  var endDate   = ee.Date.fromYMD(y + 1, 4, 30);
  var nDays     = endDate.difference(startDate, 'day').toInt();
  
  var dates = ee.List.sequence(0, nDays.subtract(1)).map(function(d) {
    return startDate.advance(d, 'day');
  });

  return ee.FeatureCollection(dates.map(function(d){
    var img = classifyFreezeThaw(d);

    var areaImg = ee.Image.cat([
      pixelArea.updateMask(img.eq(2)).rename('freezeThaw_km2'),
      pixelArea.updateMask(img.eq(1)).rename('snow_km2'),
      pixelArea.updateMask(img.eq(3)).rename('thawed_km2')
    ]).unmask(0);

    var stats = areaImg.reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: AOI,
      scale: 2000,
      maxPixels: 1e13
    });

    return ee.Feature(null, {
      'date': ee.Date(d).format('YYYY-MM-dd'),
      'freezeThaw_km2': ee.Number(stats.get('freezeThaw_km2')),
      'snow_km2': ee.Number(stats.get('snow_km2')),
      'thawed_km2': ee.Number(stats.get('thawed_km2'))
    });
  }));
}


// --- 6. CONSOLE VISUALIZATION (FIRST YEAR ONLY) ---
var firstYearStats = processYear(startYear);

print(ui.Chart.feature.byFeature({
  features: firstYearStats.sort('date'),
  xProperty: 'date',
  yProperties: ['freezeThaw_km2','snow_km2','thawed_km2']
}).setOptions({
  title: 'Freeze–Thaw–Snow Area (Winter: ' + startYear + '-' + (startYear + 1) + ' Nationwide)',
  hAxis: {title: 'Date'},
  vAxis: {title: 'Area (km²)'},
  lineWidth: 2,
  series: {
    0:{color:'green'},
    1:{color:'blue'},
    2:{color:'orange'}
  }
}));


// --- 7. EXPORT TASKS (DRIVE) ---
for (var y = startYear; y <= endYear; y++) {
  Export.table.toDrive({
    collection: processYear(y),
    description: 'FreezeThaw_Mongolia_Winter_' + y + '_' + (y + 1),
    folder: 'EarthEngine_Exports', 
    fileFormat: 'CSV'
  });
}


// --- 8. INTERACTIVE UI VISUALIZER ---
var visualizerStart = ee.Date.fromYMD(startYear, 10, 1).format('YYYY-MM-dd');

Map.addLayer(classifyFreezeThaw(visualizerStart), 
  {min:1,max:3,palette:['0000FF','00FF00','FF0000']}, 
  'Freeze–Thaw on ' + visualizerStart.getInfo());

var dateLabel = ui.Label('Enter a date (YYYY-MM-DD):', {fontWeight: 'bold'});
var dateBox = ui.Textbox({placeholder: 'e.g. ' + startYear + '-12-15'});
var updateButton = ui.Button({
  label: 'Show Map for Date',
  onClick: function() {
    var d = dateBox.getValue();
    if (!d) return;
    var img = classifyFreezeThaw(d);
    Map.layers().reset();
    Map.addLayer(ee.Image().paint(AOI, 0, 2), {palette:'black'}, 'Mongolia Boundary');
    Map.addLayer(img, {min:1, max:3, palette:['0000FF','00FF00','FF0000']}, 'Freeze–Thaw on ' + d);
  }
});

ui.root.add(
  ui.Panel({
    widgets: [dateLabel, dateBox, updateButton],
    style: {width: '250px', position: 'top-right'}
  })
);
