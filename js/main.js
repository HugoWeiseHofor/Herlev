// ==========================
// Main Entry Point  –  map1
// ==========================
import { generateReport } from '../config/report-generator.js';
import { initLayerSwitcher, registerLayer, baseLayers, createGroup } from '../config/layer-switcher.js';
import {
    addThematicLayer,
    addSingleColorLayer,
    addCategorizedLayer,
    addPieChartLayer,
    addGraduatedLineLayer,
    addClassedPointLayer,
    addClassedIconLayer,
    addFlowDirectionLayer,
    addWMSLayer
} from '../config/layer-functions.js';
import { initPopup, showPopup, hidePopup } from '../config/popup.js';
import { initDrawing, toggleDrawing, clearDrawings } from '../config/drawing.js';

// ==========================
// Projection setup EPSG:25832
// ==========================
proj4.defs(
    'EPSG:25832',
    '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs'
);
ol.proj.proj4.register(proj4);
const projection = ol.proj.get("EPSG:25832");
const extent = [712943.56, 6178893.77, 717233.88, 6184484.54];
const view = new ol.View({
    projection: projection,
    minZoom: 13,
    maxZoom: 21
});

const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            properties: { title: 'OSM', type: 'base' },
            visible: false
        }),
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                attributions: '© OpenStreetMap contributors, HOT',
                crossOrigin: 'anonymous'
            }),
            properties: { title: 'OSM Humanitarian', type: 'base' },
            visible: false
        }),
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                attributions: '© OpenStreetMap contributors © CARTO',
                crossOrigin: 'anonymous'
            }),
            properties: { title: 'Light (Carto)', type: 'base' },
            visible: true
        })
    ],
    view: view
});

map.once('postrender', function () {
    view.fit(extent, {
        size: map.getSize(),
        minZoom: 13
    });
});

// Initialize Layer Switcher
initLayerSwitcher();

// Register OSM base layer
registerLayer(map.getLayers().item(0), 'OpenStreetMap', 'base');
registerLayer(map.getLayers().item(1), 'Humanitarian', 'base');
registerLayer(map.getLayers().item(2), 'Light (Carto)', 'base');

// Load WMTS
fetch('https://api.dataforsyningen.dk/topo_skaermkort_daempet_DAF?service=WMTS&request=GetCapabilities&token=b13445c09727289ea77913374cac72ce')
    .then(resp => resp.text())
    .then(text => {
        const parser = new ol.format.WMTSCapabilities();
        const result = parser.read(text);
        const options = ol.source.WMTS.optionsFromCapabilities(result, {
            layer: 'topo_skaermkort_daempet',
            matrixSet: 'View1',
            projection: projection
        });
        const wmtsLayer = new ol.layer.Tile({ source: new ol.source.WMTS(options), visible: false });
        map.addLayer(wmtsLayer);
        registerLayer(wmtsLayer, 'Skærmkort (dæmpet)', 'base');
    });

// ==========================
// Initialize Popup & Drawing
// ==========================
initPopup(map);
initDrawing(map); // Initialize the drawing layer

// Add click interaction for feature info
map.on('singleclick', (evt) => {
    hidePopup();
    const features = [];
    map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        if (layer && layer.get('attributes')) {
            features.push({ feature, layer });
        }
    });

    if (features.length === 0) return;

    const { feature, layer } = features[0];
    const attributeConfig = layer.get('attributes');
    const titleField = layer.get('attributeTitleField');

    let title = layer.get('title') || 'Feature';
    if (titleField && feature.get(titleField)) {
        title = feature.get(titleField);
    }

    const attributes = {};
    attributeConfig.forEach(attr => {
        const value = feature.get(attr.field);
        if (value !== null && value !== undefined) {
            attributes[attr.label || attr.field] = value;
        }
    });

    if (Object.keys(attributes).length > 0) {
        showPopup(evt.pixel, title, attributes);
    }
});

// ==========================
// Load map-specific layers
// ==========================
import('./layers.js').then(module => {
    module.addAllLayers(map, projection, {
        addThematicLayer,
        addSingleColorLayer,
        addCategorizedLayer,
        addPieChartLayer,
        addGraduatedLineLayer,
        addClassedPointLayer,
        addClassedIconLayer,
        createGroup,
        registerLayer,
        addWMSLayer,
        addFlowDirectionLayer
    });
});

export { map };

// ==========================
// UI Buttons (Small 32x32 + Hover Expand)
// ==========================

// 1. Inject precise CSS
const btnCSS = document.createElement('style');
btnCSS.innerHTML = `
  /* REPORT BUTTON: Fixed centering and shorter hover width */
  .map-btn {
    position: absolute; left: 14px; top: 80px; z-index: 1001;
    width: 32px; height: 32px;
    padding: 0; margin: 0; border: none; border-radius: 4px;
    background: #0f464b; color: #fff;
    cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; white-space: nowrap;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
  }
  .map-btn::after {
    content: 'Generer PDF';
    font-size: 13px;
    max-width: 0;
    opacity: 0;
    margin-left: 0;
    transition: max-width 0.3s ease, opacity 0.2s ease 0.1s, margin-left 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
  .map-btn:hover {
    width: 130px;
    justify-content: flex-start;
    padding-left: 8px;
    background: #0f464bbb;
  }
  .map-btn:hover::after {
    max-width: 100px;
    opacity: 1;
    margin-left: 8px;
  }

  /* DRAW GROUP: Unchanged since you said it works perfectly */
  .draw-group {
    position: absolute; left: 14px; top: 120px; z-index: 1001;
    height: 32px; width: 32px;
    background: #0f464b; border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    display: flex; overflow: hidden;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
  }
  .draw-group:hover { width: 64px; background: #0f464bbb; }
  .draw-group button {
    width: 32px; height: 32px; background: transparent; border: none;
    color: #fff; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; line-height: 1;
    transition: background 0.2s;
  }
  .draw-group button:hover { background: rgba(255,255,255,0.15); }
  .draw-group .active { background: rgba(0,0,0,0.25); }
`;
document.head.appendChild(btnCSS);

// Get map container
const mapContainer = document.getElementById('map');

// 2. Report Button (FIXED: Uses pure textContent, no spans!)
const reportBtn = document.createElement('button');
reportBtn.id = 'btn-generate-report';
reportBtn.className = 'map-btn'; 
reportBtn.textContent = '📄'; // Just the raw emoji, guaranteed to render
reportBtn.title = 'Generer PDF over kortudsnit';

reportBtn.addEventListener('click', () => {
    generateReport(map);
});

// 3. Draw & Erase Group
const drawGroup = document.createElement('div');
drawGroup.className = 'draw-group';

const drawBtn = document.createElement('button');
drawBtn.innerHTML = '✏️';
drawBtn.title = 'Tegn på kortet';
drawBtn.addEventListener('click', () => {
  if (typeof toggleDrawing === 'function') {
    const on = toggleDrawing('Polygon');
    if (on) { drawBtn.classList.add('active'); drawBtn.title = 'Stop tegning'; }
    else { drawBtn.classList.remove('active'); drawBtn.title = 'Tegn på kortet'; }
  }
});

const eraseBtn = document.createElement('button');
eraseBtn.innerHTML = '🗑️';
eraseBtn.title = 'Ryd alle tegninger';
eraseBtn.addEventListener('click', () => {
  if (typeof clearDrawings === 'function') clearDrawings();
});

drawGroup.appendChild(drawBtn);
drawGroup.appendChild(eraseBtn);

// 4. Append BOTH to the map container
mapContainer.appendChild(reportBtn);
mapContainer.appendChild(drawGroup);