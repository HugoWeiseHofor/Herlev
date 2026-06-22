// drawing.js
let drawInteraction = null;
let drawLayer = null;
let isDrawing = false;
let currentMap = null;

// Initialize the drawing layer
export function initDrawing(map) {
    currentMap = map;
    
    // Create a vector layer to hold the drawings
    drawLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(44, 95, 138, 0.2)' }),
            stroke: new ol.style.Stroke({ color: '#2c5f8a', width: 2 }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2c5f8a' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });
    map.addLayer(drawLayer);
}

// Toggle drawing on/off
export function toggleDrawing(type = 'Polygon') {
    if (!currentMap) {
        console.error('Map not initialized for drawing.');
        return;
    }

    if (isDrawing) {
        if (drawInteraction) {
            currentMap.removeInteraction(drawInteraction);
            drawInteraction = null;
        }
        isDrawing = false;
        currentMap.getTargetElement().style.cursor = 'default';
        return false; 
    } else {
        drawInteraction = new ol.interaction.Draw({
            source: drawLayer.getSource(),
            type: type 
        });
        
        currentMap.addInteraction(drawInteraction);
        isDrawing = true;
        currentMap.getTargetElement().style.cursor = 'crosshair';
        return true; 
    }
}

// Clear all drawings
export function clearDrawings() {
    if (drawLayer) {
        drawLayer.getSource().clear();
    }
}