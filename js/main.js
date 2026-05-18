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
    addWMSLayer
} from '../config/layer-functions.js';
import { initPopup, showPopup, hidePopup } from '../config/popup.js';

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
    maxZoom: 21,
    padding: [300, 400, 300, 300],
});

const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            properties: { title: 'OSM', type: 'base' }
        })
    ],
    view: view
});

map.once('postrender', function () {
    view.fit(extent, {
        padding: [300, 300, 300, 600],
        minZoom: 13
    });
});

// Initialize Layer Switcher
initLayerSwitcher();

// Register OSM base layer
registerLayer(map.getLayers().item(0), 'OpenStreetMap', 'base');

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
// Initialize Popup
// ==========================
initPopup(map);

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
        addWMSLayer
    });
});

export { map };



// Create Report Button
const reportBtn = document.createElement('button');
reportBtn.id = 'btn-generate-report';
reportBtn.textContent = '📄 Generer PDF over kortudsnit';
reportBtn.style.cssText = `
    position: absolute; 
    top: 80px; 
    left: 14px; 
    z-index: 1001; 
    padding: 8px 12px; 
    background: #2c5f8a; 
    color: #fff; 
    border: none; 
    border-radius: 4px; 
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    font-size: 13px;
    transition: all 0.2s ease;
`;

// Add hover effect
reportBtn.addEventListener('mouseenter', () => {
    reportBtn.style.background = '#1d4263';
    reportBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
});
reportBtn.addEventListener('mouseleave', () => {
    reportBtn.style.background = '#2c5f8a';
    reportBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
});

reportBtn.addEventListener('click', () => {
    generateReport(map); 
});
document.body.appendChild(reportBtn);