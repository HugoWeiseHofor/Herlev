// ==========================
// Layer Creation Functions
// ==========================

import { hexToRgb, interpolateColor, rgbToString, resolveColor } from '../config/color-helpers.js';
import { registerLayer } from '../config/layer-switcher.js';

// ==========================
// buildLabelStyle — Shared map label helper
// ==========================
//
// config.map_label shape:
//   {
//     field:        string,   // feature attribute to display (required)
//     prefix:       string,   // text prepended to the value  (optional)
//     suffix:       string,   // text appended to the value   (optional)
//     font:         string,   // CSS font string (default '12px sans-serif')
//     color:        string,   // fill color      (default '#000000')
//     outline_color: string,  // halo/stroke color (default '#ffffff')
//     outline_width: number,  // halo width px   (default 2)
//     offset_x:     number,   // pixel offset X  (default 0)
//     offset_y:     number,   // pixel offset Y  (default -14)
//     placement:    string,   // 'point' | 'line' (default 'point')
//     overflow:     boolean,  // allow label outside geometry (default true)
//   }
//
// Returns an ol.style.Text instance, or null when map_label is not configured.
//
function buildLabelStyle(config, feature) {
    const lc = config.map_label;
    if (!lc || !lc.field) return null;

    let value = feature.get(lc.field);
    if (value == null) return null;

    const text = `${lc.prefix ?? ''}${value}${lc.suffix ?? ''}`;

    return new ol.style.Text({
        text: String(text),
        font: lc.font || '12px sans-serif',
        placement: lc.placement || 'point',
        overflow: lc.overflow !== undefined ? lc.overflow : true,
        offsetX: lc.offset_x ?? 0,
        offsetY: lc.offset_y ?? -14,
        fill: new ol.style.Fill({ color: lc.color || '#000000' }),
        stroke: new ol.style.Stroke({
            color: lc.outline_color || '#ffffff',
            width: lc.outline_width ?? 2
        })
    });
}

// Wraps a base ol.style.Style (or null) with an optional label.
// Returns a single Style (label merged in) or an array when needed.
function withLabel(baseStyle, config, feature) {
    const textStyle = buildLabelStyle(config, feature);
    if (!textStyle) return baseStyle;
    if (!baseStyle) {
        return new ol.style.Style({ text: textStyle });
    }
    baseStyle.setText(textStyle);
    return baseStyle;
}

// ==========================
// setupInfoBox — Layer info panel stacked above #damageSummary
// ==========================
//
// All info boxes and #damageSummary share one flex column: #bottom-left-stack.
// The stack is created on first use; #damageSummary is moved into it so
// everything reflows automatically as boxes appear/disappear.
//
// config.info_box shape:
//   {
//     title:        string,   // bold header (optional)
//     text:         string,   // body HTML/text (optional)
//     border_color: string,   // left-border accent colour (default '#2c5f8a')
//     image:        string | { src, alt, width, height, caption }
//                             // path/URL to a PNG/image, or object with extra options (optional)
//   }
//
let _stackReady = false;
function _ensureStack() {
    if (_stackReady) return;
    _stackReady = true;

    const stack = document.createElement('div');
    stack.id = 'bottom-left-stack';
    document.body.appendChild(stack);

    // Move #damageSummary into the stack so it flows with the info boxes.
    // It may not exist yet (per-map code runs after), so we watch for it.
    function adoptDamageSummary() {
        const ds = document.getElementById('damageSummary');
        if (ds && ds.parentElement !== stack) stack.appendChild(ds);
    }
    adoptDamageSummary();
    // Retry once the DOM is fully ready in case layers.js adds it later
    setTimeout(adoptDamageSummary, 0);
}

export function setupInfoBox(layer, config) {
    if (!config.info_box) return;
    _ensureStack();

    const ib = config.info_box;
    const box = document.createElement('div');
    box.className = 'layer-info-box';
    box.style.borderLeftColor = ib.border_color || '#2c5f8a';

    // ── Build inner HTML ──────────────────────────────────────────
    let html = '';
    if (ib.title) html += `<strong class="lib-title">${ib.title}</strong>`;
    if (ib.text)  html += `<p class="lib-text">${ib.text}</p>`;

    // Optional bullet list
    if (Array.isArray(ib.list) && ib.list.length > 0) {
        html += `<ul class="lib-list">${ib.list.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }

    // Optional legend block
    // Each entry: { color, label, outline? }
    // If the array has entries where gradient:true is set on ALL items,
    // the swatches are rendered flush (no gap) forming a continuous bar.
    if (Array.isArray(ib.legend) && ib.legend.length > 0) {
        const isGradient = ib.legend.every(e => e.gradient);
        html += `<div class="lib-legend${isGradient ? ' lib-legend-gradient' : ''}">`;
        ib.legend.forEach(entry => {
            const border = entry.outline
                ? `border:1px solid ${entry.outline};`
                : 'border:1px solid rgba(0,0,0,0.15);';
            html += `
                <div class="lib-legend-row">
                    <span class="lib-swatch" style="background:${entry.color};${border}"></span>
                    <span class="lib-legend-label">${entry.label ?? ''}</span>
                </div>`;
        });
        html += `</div>`;
    }

    // Optional image block
    // Accepts a plain string (src path) or an object: { src, alt, width, height, caption }
    if (ib.image) {
        const img = typeof ib.image === 'string' ? { src: ib.image } : ib.image;
        const widthAttr  = img.width  ? ` width="${img.width}"`   : '';
        const heightAttr = img.height ? ` height="${img.height}"` : '';
        const altAttr    = ` alt="${img.alt || ''}"`;
        html += `<div class="lib-image-wrap">`;
        html += `<img class="lib-image" src="${img.src}"${altAttr}${widthAttr}${heightAttr} style="max-width:100%;display:block;">`;
        if (img.caption) html += `<p class="lib-image-caption">${img.caption}</p>`;
        html += `</div>`;
    }

    box.innerHTML = html;
    box.style.display = 'none';

    // Insert before #damageSummary so info boxes always sit above it
    const stack = document.getElementById('bottom-left-stack');
    const ds = document.getElementById('damageSummary');
    if (ds && ds.parentElement === stack) {
        stack.insertBefore(box, ds);
    } else {
        stack.appendChild(box);
    }

    function sync() {
        box.style.display = layer.getVisible() ? 'block' : 'none';
    }
    layer.on('change:visible', sync);
    sync();
}

// ==========================
// addThematicLayer - Choropleth polygons
// ==========================
export function addThematicLayer(map, config, projection) {
    const numClasses = config.num_classes || 7;
    const fillAlpha = config.fill_alpha !== undefined ? config.fill_alpha : 0.85;
    // Only needed when class_colors is not provided
    const startRGB = config.start_color ? hexToRgb(config.start_color) : null;
    const endRGB   = config.end_color   ? hexToRgb(config.end_color)   : null;
    
    const source = new ol.source.Vector({
        url: config.folder_destination,
        format: new ol.format.GeoJSON({ dataProjection: 'EPSG:25832', featureProjection: projection })
    });
    
    const layerOptions = {
        source,
        zIndex: config.z_index,
        declutter: false,
        visible: config.visible !== undefined ? config.visible : true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution })
    };
    
    const layer = new ol.layer.Vector(layerOptions);
    
    function buildClassColors(breaks) {
        const n = breaks.length - 1;
        // Explicit per-class colors take priority over start/end interpolation
        if (Array.isArray(config.class_colors) && config.class_colors.length === n) {
            return config.class_colors.map(c => {
                if (typeof c === 'string' && (c.startsWith('rgba(') || c.startsWith('rgb('))) return c;
                return rgbToString(hexToRgb(c), fillAlpha);
            });
        }
        return Array.from({ length: n }, (_, i) =>
            rgbToString(interpolateColor(startRGB, endRGB, n <= 1 ? 0 : i / (n - 1)), fillAlpha)
        );
    }
    
    function buildStyle(breaks, classColors) {
        function getClassIndex(value) {
            for (let i = 0; i < breaks.length - 1; i++) {
                if (value <= breaks[i + 1]) return i;
            }
            return breaks.length - 2;
        }
        return function (feature) {
            let value = feature.get(config.field);
            if (typeof value === 'string') value = parseFloat(value.replace(',', '.'));
            if (value == null || isNaN(value)) return null;
            const base = new ol.style.Style({
                fill: new ol.style.Fill({ color: classColors[getClassIndex(value)] }),
                stroke: new ol.style.Stroke({ color: config.stroke_color, width: config.stroke_width })
            });
            return withLabel(base, config, feature);
        };
    }
    
    function buildLegendItems(breaks, classColors) {
        return classColors.map((color, i) => ({
            color,
            strokeColor: config.stroke_color,
            label: `${Math.round(breaks[i]).toLocaleString('da-DK')} – ${Math.round(breaks[i + 1]).toLocaleString('da-DK')}`
        }));
    }
    
    if (config.gradient) {
        const fixedMin = (config.breaks && config.breaks.length >= 2) ? config.breaks[0] : null;
        const fixedMax = (config.breaks && config.breaks.length >= 2) ? config.breaks[config.breaks.length - 1] : null;
        const legendSteps = config.legend_steps || 5;
        
        function applyGradientStyle(minVal, maxVal) {
            layer.setStyle(function (feature) {
                let value = feature.get(config.field);
                if (typeof value === 'string') value = parseFloat(value.replace(',', '.'));
                if (value == null || isNaN(value)) return null;
                const factor = maxVal === minVal ? 0 : Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)));
                const color = rgbToString(interpolateColor(startRGB, endRGB, factor), fillAlpha);
                const base = new ol.style.Style({
                    fill: new ol.style.Fill({ color }),
                    stroke: new ol.style.Stroke({ color: config.stroke_color, width: config.stroke_width })
                });
                return withLabel(base, config, feature);
            });
            
            const legendItems = Array.from({ length: legendSteps }, (_, i) => {
                const factor = i / (legendSteps - 1);
                const color = rgbToString(interpolateColor(startRGB, endRGB, factor), fillAlpha);
                const value = Math.round(minVal + factor * (maxVal - minVal));
                return { color, strokeColor: config.stroke_color, label: `${value.toLocaleString('da-DK')}`, gradient: true };
            });
            
            registerLayer(layer, config.title || 'Thematic Layer', 'overlay', legendItems, config.group_container || null, config.hidden || false);
        }
        
        if (fixedMin !== null && fixedMax !== null) {
            applyGradientStyle(fixedMin, fixedMax);
        } else {
            source.once('change', function () {
                if (source.getState() !== 'ready') return;
                const rawValues = source.getFeatures().map(f => {
                    let v = f.get(config.field);
                    if (typeof v === 'string') v = parseFloat(v.replace(',', '.'));
                    return v;
                }).filter(v => v != null && !isNaN(v));
                if (rawValues.length === 0) return;
                applyGradientStyle(Math.min(...rawValues), Math.max(...rawValues));
            });
        }
    } else if (config.breaks && config.breaks.length > 0) {
        const classColors = buildClassColors(config.breaks);
        layer.setStyle(buildStyle(config.breaks, classColors));
        registerLayer(layer, config.title || 'Thematic Layer', 'overlay',
            buildLegendItems(config.breaks, classColors), config.group_container || null, config.hidden || false);
    } else {
        source.once('change', function () {
            if (source.getState() !== 'ready') return;
            const rawValues = source.getFeatures().map(f => {
                let v = f.get(config.field);
                if (typeof v === 'string') v = parseFloat(v.replace(',', '.'));
                return v;
            }).filter(v => v != null && !isNaN(v));
            if (rawValues.length === 0) return;
            const minVal = Math.min(...rawValues);
            const maxVal = Math.max(...rawValues);
            const breaks = [];
            const step = (maxVal - minVal) / numClasses;
            for (let i = 0; i <= numClasses; i++) breaks.push(minVal + i * step);
            const classColors = buildClassColors(breaks);
            layer.setStyle(buildStyle(breaks, classColors));
            registerLayer(layer, config.title || 'Thematic Layer', 'overlay',
                buildLegendItems(breaks, classColors), config.group_container || null, config.hidden || false);
        });
    }
    
    map.addLayer(layer);
    
    // Store attribute config for popup
    if (config.attributes) layer.set('attributes', config.attributes);
    if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);
    
    if (!layerOptions.visible && !(config.breaks && config.breaks.length > 0)) {
        layer.setVisible(true);
        source.once('change', function () {
            if (source.getState() === 'ready') layer.setVisible(false);
        });
    }

    setupInfoBox(layer, config);
    return { layer, source };
}

// ==========================
// addSingleColorLayer - Uniform style (polygon, line, point)
// ==========================
//
// Geometry is detected automatically from each feature, so mixed
// GeoJSON files work too. Per-geometry config keys:
//
// Polygon / MultiPolygon:
//   fill_color, fill_alpha, stroke_color, stroke_width
//
// Line / MultiLineString:
//   line_color, line_alpha, line_width          (fallback: stroke_color / stroke_width)
//
// Point / MultiPoint:
//   point_style:  'circle' (default) | 'square' | 'triangle' | 'cross' | 'x' | 'star'
//   point_radius: number (default 6)
//   fill_color, fill_alpha                      (point fill)
//   stroke_color, stroke_width                  (point outline)
//
// Optional for legend hint:
//   geometry_type: 'polygon' | 'line' | 'point'
//   legend_label:  string
//
export function addSingleColorLayer(map, config, projection) {
    // ── Shared colour resolution ──────────────────────────────────
    const fillColor   = resolveColor(config.fill_color,  config.fill_alpha);
    const strokeColor = resolveColor(config.stroke_color || '#000000');
    const strokeWidth = config.stroke_width ?? 1;

    // Line-specific colour (falls back to stroke_color)
    const lineColor = config.line_color
        ? resolveColor(config.line_color, config.line_alpha)
        : strokeColor;
    const lineWidth = config.line_width ?? strokeWidth;

    // Point-specific
    const pointRadius = config.point_radius ?? 6;
    const pointStyle  = (config.point_style || 'circle').toLowerCase();

    // ── ol.style image presets ────────────────────────────────────
    function makePointImage() {
        const fillObj   = new ol.style.Fill({ color: fillColor });
        const strokeObj = new ol.style.Stroke({ color: strokeColor, width: strokeWidth });
        switch (pointStyle) {
            case 'square':
                return new ol.style.RegularShape({
                    fill: fillObj, stroke: strokeObj,
                    points: 4, radius: pointRadius, angle: Math.PI / 4
                });
            case 'triangle':
                return new ol.style.RegularShape({
                    fill: fillObj, stroke: strokeObj,
                    points: 3, radius: pointRadius, angle: 0
                });
            case 'star':
                return new ol.style.RegularShape({
                    fill: fillObj, stroke: strokeObj,
                    points: 5, radius: pointRadius, radius2: pointRadius / 2, angle: 0
                });
            case 'cross':
                return new ol.style.RegularShape({
                    fill: fillObj, stroke: strokeObj,
                    points: 4, radius: pointRadius, radius2: 0, angle: 0
                });
            case 'x':
                return new ol.style.RegularShape({
                    fill: fillObj, stroke: strokeObj,
                    points: 4, radius: pointRadius, radius2: 0, angle: Math.PI / 4
                });
            case 'circle':
            default:
                return new ol.style.Circle({ fill: fillObj, stroke: strokeObj, radius: pointRadius });
        }
    }

    // Cache the point image so it is only built once
    const pointImage = makePointImage();

    // ── Style function (geometry-aware) ──────────────────────────
    function styleFunction(feature) {
        const geomType = feature.getGeometry()?.getType();
        let base;

        if (geomType === 'Point' || geomType === 'MultiPoint') {
            base = new ol.style.Style({ image: pointImage });
        } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
            base = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: lineColor, width: lineWidth })
            });
        } else {
            // Polygon / MultiPolygon (and anything else)
            base = new ol.style.Style({
                fill:   new ol.style.Fill({ color: fillColor }),
                stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
            });
        }

        return withLabel(base, config, feature);
    }

    // ── Source ───────────────────────────────────────────────────
    const encodedUrl = config.folder_destination
        .split('/')
        .map((seg, i) => i === 0 ? seg : encodeURIComponent(seg))
        .join('/');

    // Parse feature-by-feature so a single bad geometry doesn't kill the layer.
    // OL's GeoJSON parser crashes on MultiLineString with empty coordinates arrays,
    // so we sanitise each feature's geometry before handing it to the parser.
    const geojsonFormat = new ol.format.GeoJSON({
        dataProjection: config.data_projection || 'EPSG:25832',
        featureProjection: projection
    });

    function sanitizeGeometry(geom) {
        if (!geom || !geom.type) return null;
        switch (geom.type) {
            case 'MultiLineString':
                if (!Array.isArray(geom.coordinates) || geom.coordinates.length === 0) return null;
                geom.coordinates = geom.coordinates.filter(line => Array.isArray(line) && line.length >= 2);
                return geom.coordinates.length > 0 ? geom : null;
            case 'LineString':
                return Array.isArray(geom.coordinates) && geom.coordinates.length >= 2 ? geom : null;
            case 'MultiPolygon':
                if (!Array.isArray(geom.coordinates) || geom.coordinates.length === 0) return null;
                return geom;
            case 'Polygon':
                if (!Array.isArray(geom.coordinates) || geom.coordinates.length === 0) return null;
                return geom;
            case 'MultiPoint':
            case 'Point':
                return Array.isArray(geom.coordinates) && geom.coordinates.length >= 2 ? geom : null;
            default:
                return geom;
        }
    }

    const safeFormat = {
        readFeatures(rawSource, options) {
            let json;
            try {
                json = typeof rawSource === 'string' ? JSON.parse(rawSource) : rawSource;
            } catch (e) {
                console.error('[addSingleColorLayer] Failed to parse GeoJSON:', e);
                return [];
            }

            const rawFeatures = json.type === 'FeatureCollection' ? json.features
                              : json.type === 'Feature'           ? [json]
                              : [];

            const good = [];
            for (const f of rawFeatures) {
                const sanitized = sanitizeGeometry(f.geometry);
                if (!sanitized) {
                    console.warn('[addSingleColorLayer] Skipping feature with empty/invalid geometry', f.properties);
                    continue;
                }
                try {
                    const parsed = geojsonFormat.readFeatures(
                        { type: 'Feature', geometry: sanitized, properties: f.properties ?? {} },
                        options
                    );
                    good.push(...parsed);
                } catch (e) {
                    console.warn('[addSingleColorLayer] Skipping unparseable feature:', e, f.properties);
                }
            }
            return good;
        },
        readProjection(src) { return geojsonFormat.readProjection(src); },
        getType()           { return geojsonFormat.getType(); }
    };

    const source = new ol.source.Vector({
        url: encodedUrl,
        format: safeFormat
    });

    source.on('error', e =>
        console.error(`[addSingleColorLayer] Failed to load "${config.folder_destination}":`, e)
    );

    // ── Layer ────────────────────────────────────────────────────
    const layer = new ol.layer.Vector({
        source,
        style: styleFunction,
        zIndex: config.z_index,
        visible: config.visible !== undefined ? config.visible : true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution }),
        ...(config.min_resolution !== undefined && { minResolution: config.min_resolution })
    });

    // Store attribute config for popup BEFORE adding to map,
    // so click handlers can always find them on first interaction.
    if (config.attributes) layer.set('attributes', config.attributes);
    if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);

    map.addLayer(layer);

    // ── Legend ───────────────────────────────────────────────────
    const geomHint = (config.geometry_type || '').toLowerCase();
    let legendItem;
    if (geomHint === 'line' || geomHint === 'linestring') {
        legendItem = { color: lineColor, strokeColor: lineColor, label: config.legend_label || '', line: true, lineWidth: lineWidth };
    } else if (geomHint === 'point') {
        legendItem = { color: fillColor, strokeColor: strokeColor, label: config.legend_label || '', point: true, pointRadius: pointRadius };
    } else {
        legendItem = { color: fillColor, strokeColor: strokeColor, label: config.legend_label || '' };
    }

    // setupInfoBox before registerLayer so the info_box visibility listener
    // is attached first — registerLayer may immediately trigger change:visible
    // on hidden layers, and we want both systems in sync from the start.
    setupInfoBox(layer, config);
    registerLayer(layer, config.title || 'Overlay Layer', 'overlay', [legendItem],
        config.group_container || null, config.hidden || false);
    return { layer, source };
}

// ==========================
// addCategorizedLayer - Discrete categories
// ==========================
export function addCategorizedLayer(map, config, projection) {
    const categoryMap = {};
    (config.categories || []).forEach(cat => {
        categoryMap[cat.value] = {
            fill: resolveColor(cat.fill_color, cat.fill_alpha),
            stroke: cat.stroke_color ? resolveColor(cat.stroke_color) : null
        };
    });
    
    const defaultFill = resolveColor(config.default_fill_color || '#cccccc', config.fill_alpha);
    const defaultStroke = resolveColor(config.stroke_color || '#000000');
    
    const encodedUrl = config.folder_destination
        .split('/')
        .map((seg, i) => i === 0 ? seg : encodeURIComponent(seg))
        .join('/');
    
    const source = new ol.source.Vector({
        url: encodedUrl,
        format: new ol.format.GeoJSON({
            dataProjection: config.data_projection || 'EPSG:25832',
            featureProjection: projection
        })
    });
    
    source.on('error', e =>
        console.error(`[addCategorizedLayer] Failed to load "${config.folder_destination}":`, e)
    );
    
    const layer = new ol.layer.Vector({
        source,
        zIndex: config.z_index,
        visible: config.visible !== undefined ? config.visible : true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution }),
        style: function(feature) {
            const val = feature.get(config.field);
            const cat = categoryMap[val];
            const fillColor = cat?.fill ?? defaultFill;
            const strokeColor = cat?.stroke ?? defaultStroke;
            const geomType = feature.getGeometry()?.getType();
            
            let base;
            if (geomType === 'Point' || geomType === 'MultiPoint') {
                base = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: config.point_radius || 5,
                        fill: new ol.style.Fill({ color: fillColor }),
                        stroke: new ol.style.Stroke({ color: strokeColor, width: config.stroke_width || 1 })
                    })
                });
            } else {
                base = new ol.style.Style({
                    fill: new ol.style.Fill({ color: fillColor }),
                    stroke: new ol.style.Stroke({ color: strokeColor, width: config.stroke_width || 1 })
                });
            }
            return withLabel(base, config, feature);
        }
    });
    
    map.addLayer(layer);
    
    // Store attribute config for popup
    if (config.attributes) layer.set('attributes', config.attributes);
    if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);
    
    const legendItems = config.legend_single
    ? []
    : (config.categories || []).map(cat => ({
        color: resolveColor(cat.fill_color, cat.fill_alpha),
        strokeColor: cat.stroke_color ? resolveColor(cat.stroke_color) : defaultStroke,
        label: cat.label || cat.value
    }));
    
    registerLayer(layer, config.title || 'Categorized Layer', 'overlay', legendItems, config.group_container || null, config.hidden || false);
    setupInfoBox(layer, config);
    return { layer, source };
}

// ==========================
// addPieChartLayer - Pie charts on points
// ==========================
export function addPieChartLayer(map, config, projection) {
    const pieRadius = config.pie_radius || 20;
    const pointRadius = config.point_radius || 8;
    const pieOffset = config.pie_offset || [38, 0];
    const fields = config.fields || [];
    const sizePx = pieRadius * 2;
    
    const encodedUrl = config.folder_destination
        .split('/')
        .map((seg, i) => i === 0 ? seg : encodeURIComponent(seg))
        .join('/');
    
    const source = new ol.source.Vector({
        url: encodedUrl,
        format: new ol.format.GeoJSON({
            dataProjection: config.data_projection || 'EPSG:25832',
            featureProjection: projection
        })
    });
    
    source.on('error', e =>
        console.error(`[addPieChartLayer] Failed to load "${config.folder_destination}":`, e)
    );
    
    const canvasCache = new WeakMap();
    
    const layer = new ol.layer.Vector({
        source,
        zIndex: config.z_index,
        visible: config.visible !== undefined ? config.visible : true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution }),
        style: function(feature) {
            const styles = [];
            
            styles.push(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pointRadius,
                    fill: new ol.style.Fill({ color: resolveColor(config.point_color || '#487bb6') }),
                    stroke: new ol.style.Stroke({ color: resolveColor(config.point_stroke || '#325780'), width: 1.5 })
                })
            }));
            
            const values = fields.map(f => Math.max(0, Number(feature.get(f.field)) || 0));
            const total = values.reduce((a, b) => a + b, 0);
            if (total <= 0) return styles;
            
            if (!canvasCache.has(feature)) {
                const canvas = document.createElement('canvas');
                canvas.width = sizePx;
                canvas.height = sizePx;
                const ctx = canvas.getContext('2d');
                let startAngle = 0;
                
                fields.forEach((f, i) => {
                    if (values[i] <= 0) return;
                    const sliceAngle = 2 * Math.PI * (values[i] / total);
                    ctx.beginPath();
                    ctx.moveTo(pieRadius, pieRadius);
                    ctx.arc(pieRadius, pieRadius, pieRadius, startAngle, startAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fillStyle = f.color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    startAngle += sliceAngle;
                });
                
                ctx.beginPath();
                ctx.arc(pieRadius, pieRadius, pieRadius - 0.75, 0, 2 * Math.PI);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                canvasCache.set(feature, canvas);
            }
            
            styles.push(new ol.style.Style({
                zIndex: 9999,
                image: new ol.style.Icon({
                    img: canvasCache.get(feature),
                    imgSize: [sizePx, sizePx],
                    displacement: pieOffset
                })
            }));
            
            return styles;
        }
    });
    
    map.addLayer(layer);
    
    // Store attribute config for popup
    if (config.attributes) layer.set('attributes', config.attributes);
    if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);
    
    const legendItems = fields.map(f => ({
        color: f.color,
        strokeColor: '#ffffff',
        label: f.label || f.field
    }));
    
    registerLayer(layer, config.title || 'Pie Chart Layer', 'overlay', legendItems, config.group_container || null, config.hidden || false);
    setupInfoBox(layer, config);
    return { layer, source };
}

// ==========================
// addGraduatedLineLayer - Variable width lines
// ==========================
export function addGraduatedLineLayer(map, config, projection) {
    const minWidth = config.min_width || 0.5;
    const maxWidth = config.max_width || 8;
    const legendSteps = config.legend_steps || 4;
    const lineColor = resolveColor(config.color || '#000000', config.fill_alpha);
    
    const useGradientColor = config.start_color && config.end_color;
    const startRGB = useGradientColor ? hexToRgb(config.start_color) : null;
    const endRGB = useGradientColor ? hexToRgb(config.end_color) : null;
    const alpha = config.fill_alpha !== undefined ? config.fill_alpha : 1;
    
    const fixedMin = config.breaks?.[0] ?? null;
    const fixedMax = config.breaks?.[config.breaks.length - 1] ?? null;

    const encodedUrl = config.folder_destination
        .split('/')
        .map((seg, i) => i === 0 ? seg : encodeURIComponent(seg))
        .join('/');
    
    const source = new ol.source.Vector({
        url: encodedUrl,
        format: new ol.format.GeoJSON({
            dataProjection: config.data_projection || 'EPSG:25832',
            featureProjection: projection
        })
    });
    
    source.on('error', e =>
        console.error(`[addGraduatedLineLayer] Failed to load "${config.folder_destination}":`, e)
    );
    
    function makeStyle(minVal, maxVal) {
        return function(feature) {
            let value = feature.get(config.field);
            if (typeof value === 'string') value = parseFloat(value.replace(',', '.'));
            if (value == null || isNaN(value)) return null;
            
            const factor = maxVal === minVal ? 0 : Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)));
            const width = minWidth + factor * (maxWidth - minWidth);
            const color = useGradientColor
                ? rgbToString(interpolateColor(startRGB, endRGB, factor), alpha)
                : lineColor;
            
            const base = new ol.style.Style({
                stroke: new ol.style.Stroke({ color, width })
            });
            return withLabel(base, config, feature);
        };
    }
    
    function makeLegendItems(minVal, maxVal) {
        return Array.from({ length: legendSteps }, (_, i) => {
            const factor = i / (legendSteps - 1);
            const value = Math.round(minVal + factor * (maxVal - minVal));
            const width = Math.round(minWidth + factor * (maxWidth - minWidth));
            const color = useGradientColor
                ? rgbToString(interpolateColor(startRGB, endRGB, factor), alpha)
                : lineColor;
            return {
                color,
                strokeColor: color,
                label: `${value.toLocaleString('da-DK')}`,
                lineWidth: width,
                line: true
            };
        });
    }
    
    const layerOptions = {
        source,
        zIndex: config.z_index,
        visible: config.visible !== undefined ? config.visible : true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution })
    };
    
    const layer = new ol.layer.Vector(layerOptions);
    
    if (fixedMin !== null && fixedMax !== null) {
        layer.setStyle(makeStyle(fixedMin, fixedMax));
        registerLayer(layer, config.title || 'Graduated Line Layer', 'overlay',
            makeLegendItems(fixedMin, fixedMax), config.group_container || null, config.hidden || false);
    } else {
        source.once('change', function() {
            if (source.getState() !== 'ready') return;
            const rawValues = source.getFeatures().map(f => {
                let v = f.get(config.field);
                if (typeof v === 'string') v = parseFloat(v.replace(',', '.'));
                return v;
            }).filter(v => v != null && !isNaN(v));
            if (rawValues.length === 0) return;
            const minVal = Math.min(...rawValues);
            const maxVal = Math.max(...rawValues);
            layer.setStyle(makeStyle(minVal, maxVal));
            registerLayer(layer, config.title || 'Graduated Line Layer', 'overlay',
                makeLegendItems(minVal, maxVal), config.group_container || null, config.hidden || false);
        });
    }
    
    map.addLayer(layer);
    
    // Store attribute config for popup
    if (config.attributes) layer.set('attributes', config.attributes);
    if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);
    setupInfoBox(layer, config);
    return { layer, source };
}

// ==========================
// addClassedPointLayer - Classed circles by breaks
// Supports explicit class_colors OR interpolated start/end colors
// ==========================
export function addClassedPointLayer(map, config, projection) {
    // ─── Validation & Setup ──────────────────────────────────────
    const breaks = config.breaks || [];
    if (!Array.isArray(breaks) || breaks.length < 2) {
        console.error('[addClassedPointLayer] breaks array must have at least 2 numeric values');
        return null;
    }
    if (!config.field) {
        console.error('[addClassedPointLayer] config.field is required');
        return null;
    }

    const numClasses = breaks.length - 1;
    const radius = config.radius ?? 6;
    const strokeColor = resolveColor(config.stroke_color || '#000000');
    const strokeWidth = config.stroke_width ?? 1;
    const defaultAlpha = config.fill_alpha ?? 0.85;

    // ─── Color Resolution: explicit class colors OR interpolated gradient ───
    let classColors = [];

    if (Array.isArray(config.class_colors) && config.class_colors.length === numClasses) {
        // ✅ Use explicit colors per class
        classColors = config.class_colors.map(c => {
            // Allow rgba()/rgb() strings to pass through, otherwise apply alpha
            if (typeof c === 'string' && (c.startsWith('rgba(') || c.startsWith('rgb('))) {
                return c;
            }
            const rgb = hexToRgb(c);
            return rgbToString(rgb, defaultAlpha);
        });
    } else {
        // 🎨 Fallback: interpolate between start/end colors
        const startRGB = hexToRgb(config.start_color || '#ffffb2');
        const endRGB = hexToRgb(config.end_color || '#b10026');
        
        classColors = Array.from({ length: numClasses }, (_, i) => {
            // Single class → midpoint; multiple → even distribution
            const factor = numClasses === 1 ? 0.5 : i / (numClasses - 1);
            return rgbToString(interpolateColor(startRGB, endRGB, factor), defaultAlpha);
        });
    }

    // ─── URL Encoding for GeoJSON source ─────────────────────────
    const encodedUrl = config.folder_destination
        ?.split('/')
        .map((seg, i) => i === 0 ? seg : encodeURIComponent(seg))
        .join('/');

    if (!encodedUrl) {
        console.error('[addClassedPointLayer] config.folder_destination is required');
        return null;
    }

    const source = new ol.source.Vector({
        url: encodedUrl,
        format: new ol.format.GeoJSON({
            dataProjection: config.data_projection || 'EPSG:25832',
            featureProjection: projection
        })
    });

    source.on('error', e =>
        console.error(`[addClassedPointLayer] Failed to load "${config.folder_destination}":`, e)
    );

    // ─── Classification Logic ────────────────────────────────────
    function getClassIndex(value) {
        if (typeof value !== 'number' || isNaN(value)) return null;
        
        // Optional: clamp values to breaks range if configured
        if (config.clamp_to_breaks) {
            if (value <= breaks[0]) return 0;
            if (value >= breaks[breaks.length - 1]) return numClasses - 1;
        } else {
            // Out-of-range values return null → feature not rendered
            if (value < breaks[0] || value > breaks[breaks.length - 1]) return null;
        }

        // Standard [lower, upper) intervals, last class inclusive on both ends
        for (let i = 0; i < numClasses; i++) {
            const lower = breaks[i];
            const upper = breaks[i + 1];
            if (i === numClasses - 1) {
                // Last class: inclusive upper bound
                if (value >= lower && value <= upper) return i;
            } else {
                // Other classes: inclusive lower, exclusive upper
                if (value >= lower && value < upper) return i;
            }
        }
        return numClasses - 1; // Fallback
    }

    // ─── Style Function ──────────────────────────────────────────
    const styleFunction = function(feature) {
        let value = feature.get(config.field);
        
        // Parse string numbers (Danish format: comma as decimal separator)
        if (typeof value === 'string') {
            value = parseFloat(value.trim().replace(',', '.'));
        }
        
        if (value == null || isNaN(value)) return null;
        
        const classIdx = getClassIndex(value);
        if (classIdx === null) return null; // Skip unclassifiable features
        
        const color = classColors[classIdx];
        
        const base = new ol.style.Style({
            image: new ol.style.Circle({
                radius: radius,
                fill: new ol.style.Fill({ color: color }),
                stroke: new ol.style.Stroke({ 
                    color: strokeColor, 
                    width: strokeWidth 
                })
            })
        });
        return withLabel(base, config, feature);
    };

    // ─── Legend Generation ───────────────────────────────────────
    function formatBreak(val) {
        if (!Number.isFinite(val)) return '';
        // Round to configured precision (default: 0 decimals)
        const precision = config.legend_decimal_places ?? 0;
        const rounded = precision === 0 
            ? Math.round(val) 
            : Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
        
        return Number.isInteger(rounded)
            ? rounded.toLocaleString('da-DK')
            : rounded.toFixed(precision).replace('.', ',');
    }

    const legendItems = classColors.map((color, i) => ({
        color: color,
        strokeColor: strokeColor,
        label: `${formatBreak(breaks[i])} – ${formatBreak(breaks[i + 1])}`,
        point: true,
        pointRadius: radius
    }));

    // ─── Layer Creation ──────────────────────────────────────────
    const layerOptions = {
        source,
        style: styleFunction,
        zIndex: config.z_index,
        visible: config.visible ?? true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution }),
        ...(config.min_resolution !== undefined && { minResolution: config.min_resolution })
    };

    const layer = new ol.layer.Vector(layerOptions);
    
    // Store attribute config for popup (AFTER layer creation ✅)
    if (config.attributes) layer.set('attributes', config.attributes);
    if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);
    
    map.addLayer(layer);
    
    // Register with legend/layer control system
    registerLayer(
        layer, 
        config.title || 'Classed Point Layer', 
        'overlay', 
        legendItems, 
        config.group_container || null, 
        config.hidden || false
    );
    setupInfoBox(layer, config);
    return { layer, source };
}

export function addWMSLayer(map, config) {
    const source = new ol.source.ImageWMS({
        url: config.url,
        params: {
            'LAYERS': config.layers,
            ...config.params
        },
        serverType: config.server_type || 'mapserver',
        ratio: 1
    });

    const layer = new ol.layer.Image({
        source,
        opacity: config.opacity !== undefined ? config.opacity : 1,
        zIndex: config.z_index,
        visible: config.visible !== undefined ? config.visible : true,
        ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution }),
        ...(config.min_resolution !== undefined && { minResolution: config.min_resolution })
    });

    map.addLayer(layer);
    setupInfoBox(layer, config);

    const legendItems = config.legend_items || [];
    registerLayer(layer, config.title || 'WMS Layer', 'overlay', legendItems,
        config.group_container || null, config.hidden || false);

    return { layer, source };
}
// ==========================
// addLayer — Universal dispatcher
// ==========================
//
// Single entry point for all layer types. The style object in layer-styles.js
// declares a `type` field; layers.js calls addLayer() with folder_destination,
// visible, and group_container spread on top.
//
// Usage in layers.js:
//   addLayer(map, { ...styles.my_style, folder_destination: '...', visible: true, group_container: grp }, projection);
//
// Valid type values:
//   'singleColor'    → addSingleColorLayer
//   'thematic'       → addThematicLayer
//   'categorized'    → addCategorizedLayer
//   'pieChart'       → addPieChartLayer
//   'graduatedLine'  → addGraduatedLineLayer
//   'classedPoint'   → addClassedPointLayer
//   'wms'            → addWMSLayer  (projection argument is ignored — WMS uses map view projection)
//
export function addLayer(map, config, projection) {
    switch (config.type) {
        case 'singleColor':   return addSingleColorLayer(map, config, projection);
        case 'thematic':      return addThematicLayer(map, config, projection);
        case 'categorized':   return addCategorizedLayer(map, config, projection);
        case 'pieChart':      return addPieChartLayer(map, config, projection);
        case 'graduatedLine': return addGraduatedLineLayer(map, config, projection);
        case 'classedPoint':  return addClassedPointLayer(map, config, projection);
        case 'wms':           return addWMSLayer(map, config);
        default:
            console.error(`[addLayer] Unknown layer type: "${config.type}". Expected one of: singleColor, thematic, categorized, pieChart, graduatedLine, classedPoint, wms.`);
            return null;
    }
}