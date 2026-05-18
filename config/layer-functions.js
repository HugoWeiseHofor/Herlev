// ==========================
// Layer Creation Functions
// ==========================
import { hexToRgb, interpolateColor, rgbToString, resolveColor } from './color-helpers.js';
import { registerLayer } from './layer-switcher.js';

// ============================================================
// SECTION 1 — Shared low-level helpers
// ============================================================

// ── Label style ──────────────────────────────────────────────
function buildLabelStyle(config, feature, resolution) {
    const lc = config.map_label;
    if (!lc?.field) return null;

    // 🔍 Check resolution limit for labels
    const maxRes = lc.max_resolution ?? config.maxResolution ?? config.max_resolution;
    if (resolution !== undefined && maxRes !== undefined && resolution > maxRes) {
        return null; // Hide label if zoomed out beyond max resolution
    }

    const value = feature.get(lc.field);
    if (value == null) return null;
    return new ol.style.Text({
        text: String(`${lc.prefix ?? ''}${value}${lc.suffix ?? ''}`),
        font: lc.font || '12px sans-serif',
        placement: lc.placement || 'point',
        textAlign: lc.text_align || 'center',      // NEW
        textBaseline: lc.text_baseline || 'middle', // NEW
        overflow: lc.overflow !== undefined ? lc.overflow : true,
        offsetX: lc.offset_x ?? 0,
        offsetY: lc.offset_y ?? -14,
        fill: new ol.style.Fill({ color: lc.color || '#000000' }),
        stroke: new ol.style.Stroke({ color: lc.outline_color || '#ffffff', width: lc.outline_width ?? 2 })
    });
}

function withLabel(baseStyle, config, feature, resolution) {
    const textStyle = buildLabelStyle(config, feature, resolution);
    if (!textStyle) return baseStyle;
    if (!baseStyle) return new ol.style.Style({ text: textStyle });
    baseStyle.setText(textStyle);
    return baseStyle;
}

// ── URL encoder ──────────────────────────────────────────────
function encodeUrl(raw) {
  if (!raw) return null;
  return raw.split('/').map((seg, i) => i === 0 ? seg : encodeURIComponent(seg)).join('/');
}

// ── Numeric value parser ─────────────────────────────────────
function parseNumeric(v) {
  if (typeof v === 'string') v = parseFloat(v.trim().replace(',', '.'));
  return (v == null || isNaN(v)) ? null : v;
}

// ── GeoJSON source factory ───────────────────────────────────
function makeSafeVectorSource(config, projection, tag) {
  const encodedUrl = encodeUrl(config.folder_destination);
  if (!encodedUrl) {
    console.error(`[${tag}] config.folder_destination is required`);
    return null;
  }
  const baseFormat = new ol.format.GeoJSON({
    dataProjection: config.data_projection || 'EPSG:25832',
    featureProjection: projection
  });

  function sanitizeGeometry(geom) {
    if (!geom?.type) return null;
    switch (geom.type) {
      case 'MultiLineString':
        if (!Array.isArray(geom.coordinates) || geom.coordinates.length === 0) return null;
        geom.coordinates = geom.coordinates.filter(l => Array.isArray(l) && l.length >= 2);
        return geom.coordinates.length > 0 ? geom : null;
      case 'LineString':
        return Array.isArray(geom.coordinates) && geom.coordinates.length >= 2 ? geom : null;
      case 'MultiPolygon':
      case 'Polygon':
        return Array.isArray(geom.coordinates) && geom.coordinates.length > 0 ? geom : null;
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
      try { json = typeof rawSource === 'string' ? JSON.parse(rawSource) : rawSource; }
      catch (e) { console.error(`[${tag}] Failed to parse GeoJSON:`, e); return []; }

      const raw = json.type === 'FeatureCollection' ? json.features
                : json.type === 'Feature'           ? [json]
                : [];

      const good = [];
      for (const f of raw) {
        const sanitized = sanitizeGeometry(f.geometry);
        if (!sanitized) {
          console.warn(`[${tag}] Skipping feature with empty/invalid geometry`, f.properties);
          continue;
        }
        try {
          good.push(...baseFormat.readFeatures(
            { type: 'Feature', geometry: sanitized, properties: f.properties ?? {} },
            options
          ));
        } catch (e) {
          console.warn(`[${tag}] Skipping unparseable feature:`, e, f.properties);
        }
      }
      return good;
    },
    readProjection(src) { return baseFormat.readProjection(src); },
    getType() { return baseFormat.getType(); }
  };

  const source = new ol.source.Vector({ url: encodedUrl, format: safeFormat });
  source.on('error', e => console.error(`[${tag}] Failed to load "${config.folder_destination}":`, e));
  return source;
}

// ── Vector layer factory ─────────────────────────────────────
function makeVectorLayer(source, config, styleFunction) {
  const maxRes = config.maxResolution ?? config.max_resolution;
  const minRes = config.minResolution ?? config.min_resolution;
  return new ol.layer.Vector({
    source,
    style: styleFunction,
    zIndex: config.z_index,
    visible: config.visible ?? true,
    ...(maxRes !== undefined && { maxResolution: maxRes }),
    ...(minRes !== undefined && { minResolution: minRes })
  });
}

function attachPopupMeta(layer, config) {
  if (config.attributes) layer.set('attributes', config.attributes);
  if (config.attributeTitleField) layer.set('attributeTitleField', config.attributeTitleField);
}

function registerAndSetup(layer, config, legendItems, defaultTitle) {
  setupInfoBox(layer, config);
  registerLayer(
    layer,
    config.title || defaultTitle,
    'overlay',
    legendItems,
    config.group_container || null,
    config.hidden || false
  );
}

// ── Geometry-type detector ────────────────────────────────────
function detectDominantGeomType(features) {
  if (!features?.length) return null;
  const counts = {};
  features.slice(0, 20)
    .map(f => f.getGeometry()?.getType())
    .filter(Boolean)
    .forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  const primary = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!primary) return null;
  if (['Point', 'MultiPoint'].includes(primary)) return 'point';
  if (['LineString', 'MultiLineString'].includes(primary)) return 'line';
  if (['Polygon', 'MultiPolygon'].includes(primary)) return 'polygon';
  return 'polygon';
}

// ── Point image builder ───────────────────────────────────────
function makePointImage(config, fillColor, strokeColor) {
  const radius = config.point_radius ?? config.radius ?? 6;
  const fillObj = new ol.style.Fill({ color: fillColor });
  const strokeObj = new ol.style.Stroke({ color: strokeColor, width: config.stroke_width ?? 1 });
  switch ((config.point_style || 'circle').toLowerCase()) {
    case 'square':
      return new ol.style.RegularShape({ fill: fillObj, stroke: strokeObj, points: 4, radius, angle: Math.PI / 4 });
    case 'triangle':
      return new ol.style.RegularShape({ fill: fillObj, stroke: strokeObj, points: 3, radius, angle: 0 });
    case 'star':
      return new ol.style.RegularShape({ fill: fillObj, stroke: strokeObj, points: 5, radius, radius2: radius / 2, angle: 0 });
    case 'cross':
      return new ol.style.RegularShape({ fill: fillObj, stroke: strokeObj, points: 4, radius, radius2: 0, angle: 0 });
    case 'x':
      return new ol.style.RegularShape({ fill: fillObj, stroke: strokeObj, points: 4, radius, radius2: 0, angle: Math.PI / 4 });
    case 'circle':
    default:
      return new ol.style.Circle({ fill: fillObj, stroke: strokeObj, radius });
  }
}

// ── Geometry-aware style builder ─────────────────────────────
function makeGeomStyle(config, geomType, fillColor, strokeColor, lineColor, strokeWidthOverride) {
    const strokeWidth = strokeWidthOverride !== undefined ? strokeWidthOverride : (config.stroke_width ?? 1);
    
    if (geomType === 'Point' || geomType === 'MultiPoint') {
        return new ol.style.Style({ image: makePointImage(config, fillColor, strokeColor) });
    }
    if (geomType === 'LineString' || geomType === 'MultiLineString') {
        const width = typeof strokeWidth === 'number' ? Math.max(1, strokeWidth) : 2;
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: lineColor || strokeColor,
                width,
                lineCap: config.line_cap || 'round',
                lineJoin: config.line_join || 'round'
            })
        });
    }
    return new ol.style.Style({
        fill: new ol.style.Fill({ color: fillColor }),
        stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
    });
}

// ── Numeric field scanner ─────────────────────────────────────
function scanFieldRange(features, field) {
  const values = features.map(f => parseNumeric(f.get(field))).filter(v => v !== null);
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

// ── Break-based class index ───────────────────────────────────
function getClassIndex(value, breaks, numClasses, clamp) {
  if (clamp) {
    if (value <= breaks[0]) return 0;
    if (value >= breaks[breaks.length - 1]) return numClasses - 1;
  } else {
    if (value < breaks[0] || value > breaks[breaks.length - 1]) return null;
  }
  for (let i = 0; i < numClasses; i++) {
    const lo = breaks[i], hi = breaks[i + 1];
    if (i === numClasses - 1 ? value >= lo && value <= hi : value >= lo && value < hi) return i;
  }
  return numClasses - 1;
}

// ── Legend number formatter (da-DK locale) ───────────────────
function fmtBreak(val, precision = 0) {
  if (!Number.isFinite(val)) return '';
  const rounded = precision === 0 ? Math.round(val) : Math.round(val * 10 ** precision) / 10 ** precision;
  return Number.isInteger(rounded) ? rounded.toLocaleString('da-DK') : rounded.toFixed(precision).replace('.', ',');
}

// ── Legend item builders ──────────────────────────────────────
function legendItemPolygon(color, strokeColor, label) { return { color, strokeColor, label }; }
function legendItemLine(color, label, lineWidth = 2) { return { color, strokeColor: color, label, line: true, lineWidth }; }
function legendItemPoint(color, strokeColor, label, pointRadius = 5) { return { color, strokeColor, label, point: true, pointRadius }; }

function legendItemForGeom(geomHint, color, strokeColor, label, config) {
  if (geomHint === 'line') {
    const w = typeof config.stroke_width === 'number' ? Math.max(1, config.stroke_width) : 2;
    return legendItemLine(color, label, w);
  }
  if (geomHint === 'point') {
    return legendItemPoint(color, strokeColor, label, config.point_radius || config.radius || 5);
  }
  return legendItemPolygon(color, strokeColor, label);
}

// ============================================================
// SECTION 2 — Info box (supports SVG/PNG icons in legend)
// ============================================================
let _stackReady = false;
function _ensureStack() {
  if (_stackReady) return;
  _stackReady = true;
  const stack = document.createElement('div');
  stack.id = 'bottom-left-stack';
  document.body.appendChild(stack);
  function adoptDamageSummary() {
    const ds = document.getElementById('damageSummary');
    if (ds && ds.parentElement !== stack) stack.appendChild(ds);
  }
  adoptDamageSummary();
  setTimeout(adoptDamageSummary, 0);
}

export function setupInfoBox(layer, config) {
  if (!config.info_box) return;
  _ensureStack();
  const ib = config.info_box;
  const box = document.createElement('div');
  box.className = 'layer-info-box';
  box.style.borderLeftColor = ib.border_color || '#2c5f8a';

  let html = '';
  if (ib.title) html += `<strong class="lib-title">${ib.title}</strong>`;
  if (ib.text) html += `<p class="lib-text">${ib.text}</p>`;
  if (Array.isArray(ib.list) && ib.list.length > 0) {
    html += `<ul class="lib-list">${ib.list.map(item => `<li>${item}</li>`).join('')}</ul>`;
  }

  if (Array.isArray(ib.legend) && ib.legend.length > 0) {
    const isGradient = ib.legend.every(e => e.gradient);
    html += `<div class="lib-legend${isGradient ? ' lib-legend-gradient' : ''}">`;
    ib.legend.forEach(entry => {
      let swatchHtml = '';
      if (entry.iconSrc) {
        // Render actual SVG/PNG for icon-based layers
        const size = entry.iconScale ? Math.round(24 * entry.iconScale) : 24;
        swatchHtml = `<img class="lib-swatch-icon" src="${entry.iconSrc}" style="width:${size}px;height:${size}px;object-fit:contain;">`;
      } else {
        const border = entry.outline ? `border:1px solid ${entry.outline};` : 'border:1px solid rgba(0,0,0,0.15);';
        swatchHtml = `<span class="lib-swatch" style="background:${entry.color};${border}"></span>`;
      }
      html += `
        <div class="lib-legend-row">
            ${swatchHtml}
            <span class="lib-legend-label">${entry.label ?? ''}</span>
        </div>`;
    });
    html += `</div>`;
  }

  if (ib.image) {
    const img = typeof ib.image === 'string' ? { src: ib.image } : ib.image;
    const widthAttr = img.width ? ` width="${img.width}"` : '';
    const heightAttr = img.height ? ` height="${img.height}"` : '';
    html += `<div class="lib-image-wrap">`;
    html += `<img class="lib-image" src="${img.src}" alt="${img.alt || ''}"${widthAttr}${heightAttr} style="max-width:100%;display:block;">`;
    if (img.caption) html += `<p class="lib-image-caption">${img.caption}</p>`;
    html += `</div>`;
  }

  box.innerHTML = html;
  box.style.display = 'none';

  const stack = document.getElementById('bottom-left-stack');
  const ds = document.getElementById('damageSummary');
  if (ds && ds.parentElement === stack) stack.insertBefore(box, ds);
  else stack.appendChild(box);

  function sync() { box.style.display = layer.getVisible() ? 'block' : 'none'; }
  layer.on('change:visible', sync);
  sync();
}

// ============================================================
// SECTION 3 — Layer functions
// ============================================================

// ── addThematicLayer ─────────────────────────────────────────
export function addThematicLayer(map, config, projection) {
  const numClasses = config.num_classes || 7;
  const fillAlpha = config.fill_alpha ?? 0.85;
  const startRGB = config.start_color ? hexToRgb(config.start_color) : null;
  const endRGB = config.end_color ? hexToRgb(config.end_color) : null;
  const source = makeSafeVectorSource(config, projection, 'addThematicLayer');
  if (!source) return null;

  const layer = makeVectorLayer(source, config, null);
  attachPopupMeta(layer, config);

  function buildClassColors(breaks) {
    const n = breaks.length - 1;
    if (Array.isArray(config.class_colors) && config.class_colors.length === n) {
      return config.class_colors.map(c => (typeof c === 'string' && (c.startsWith('rgba(') || c.startsWith('rgb('))) ? c : rgbToString(hexToRgb(c), fillAlpha));
    }
    return Array.from({ length: n }, (_, i) => rgbToString(interpolateColor(startRGB, endRGB, n <= 1 ? 0 : i / (n - 1)), fillAlpha));
  }

  function buildStyle(breaks, classColors) {
    const n = breaks.length - 1;
    return function(feature, resolution) {
        const v = parseNumeric(feature.get(config.field));
        if (v === null) return null;
        const idx = getClassIndex(v, breaks, n, false);
        if (idx === null) return null;
        const base = new ol.style.Style({
            fill: new ol.style.Fill({ color: classColors[idx] }),
            stroke: new ol.style.Stroke({ color: config.stroke_color, width: config.stroke_width ?? 1 })
        });
        return withLabel(base, config, feature, resolution);
    };
}

  function buildLegendItems(breaks, classColors) {
    const precision = config.legend_decimal_places ?? 0;
    return classColors.map((color, i) => legendItemPolygon(color, config.stroke_color, `${fmtBreak(breaks[i], precision)} – ${fmtBreak(breaks[i + 1], precision)}`));
  }

  function applyStyle(breaks) {
    const classColors = buildClassColors(breaks);
    layer.setStyle(buildStyle(breaks, classColors));
    registerAndSetup(layer, config, buildLegendItems(breaks, classColors), 'Thematic Layer');
  }

  function applyGradientStyle(minVal, maxVal) {
    layer.setStyle(function(feature, resolution) {
    const v = parseNumeric(feature.get(config.field));
    if (v === null) return null;
    const factor = maxVal === minVal ? 0 : Math.max(0, Math.min(1, (v - minVal) / (maxVal - minVal)));
    const base = new ol.style.Style({
        fill: new ol.style.Fill({ color: rgbToString(interpolateColor(startRGB, endRGB, factor), fillAlpha) }),
        stroke: new ol.style.Stroke({ color: config.stroke_color, width: config.stroke_width ?? 1 })
    });
    return withLabel(base, config, feature, resolution);
    });
    const legendSteps = config.legend_steps || 5;
    const legendItems = Array.from({ length: legendSteps }, (_, i) => {
      const factor = i / (legendSteps - 1);
      const value = Math.round(minVal + factor * (maxVal - minVal));
      return { ...legendItemPolygon(rgbToString(interpolateColor(startRGB, endRGB, factor), fillAlpha), config.stroke_color, value.toLocaleString('da-DK')), gradient: true };
    });
    registerAndSetup(layer, config, legendItems, 'Thematic Layer');
  }

  function applyFromFeatures(cb) {
    if (source.getState() === 'ready') {
      const range = scanFieldRange(source.getFeatures(), config.field);
      if (range) cb(range.min, range.max);
    } else {
      source.once('change', () => {
        if (source.getState() !== 'ready') return;
        const range = scanFieldRange(source.getFeatures(), config.field);
        if (range) cb(range.min, range.max);
      });
    }
  }

  if (config.gradient) {
    const fixedMin = config.breaks?.[0] ?? null;
    const fixedMax = config.breaks?.[config.breaks.length - 1] ?? null;
    if (fixedMin !== null && fixedMax !== null) applyGradientStyle(fixedMin, fixedMax);
    else applyFromFeatures(applyGradientStyle);
  } else if (config.breaks?.length > 0) {
    applyStyle(config.breaks);
  } else {
    applyFromFeatures((minVal, maxVal) => {
      const step = (maxVal - minVal) / numClasses;
      const breaks = Array.from({ length: numClasses + 1 }, (_, i) => minVal + i * step);
      applyStyle(breaks);
    });
  }

  if (!config.breaks?.length && !(config.visible ?? true)) {
    layer.setVisible(true);
    source.once('change', () => { if (source.getState() === 'ready') layer.setVisible(false); });
  }

  map.addLayer(layer);
  return { layer, source };
}

// ── addSingleColorLayer ──────────────────────────────────────
export function addSingleColorLayer(map, config, projection) {
  const fillColor = resolveColor(config.fill_color, config.fill_alpha);
  const strokeColor = resolveColor(config.stroke_color || '#000000');
  const strokeWidth = config.stroke_width ?? 1;
  const lineColor = config.line_color ? resolveColor(config.line_color, config.line_alpha) : strokeColor;
  const lineWidth = config.line_width ?? strokeWidth;
  const pointImage = makePointImage(config, fillColor, strokeColor);

  function styleFunction(feature, resolution) {
    const geomType = feature.getGeometry()?.getType();
    let base;
    if (geomType === 'Point' || geomType === 'MultiPoint') base = new ol.style.Style({ image: pointImage });
    else if (geomType === 'LineString' || geomType === 'MultiLineString') base = new ol.style.Style({ stroke: new ol.style.Stroke({ color: lineColor, width: lineWidth }) });
    else base = new ol.style.Style({ fill: new ol.style.Fill({ color: fillColor }), stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth }) });
    return withLabel(base, config, feature, resolution);
}

  const source = makeSafeVectorSource(config, projection, 'addSingleColorLayer');
  if (!source) return null;

  const layer = makeVectorLayer(source, config, styleFunction);
  attachPopupMeta(layer, config);
  map.addLayer(layer);

  const geomHint = (config.geometry_type || '').toLowerCase();
  const label = config.legend_label || '';
  const item = geomHint === 'line' || geomHint === 'linestring' ? legendItemLine(lineColor, label, lineWidth)
    : geomHint === 'point' ? legendItemPoint(fillColor, strokeColor, label, config.point_radius ?? 6)
    : legendItemPolygon(fillColor, strokeColor, label);

  registerAndSetup(layer, config, [item], 'Overlay Layer');
  return { layer, source };
}

// ── addCategorizedLayer ──────────────────────────────────────
export function addCategorizedLayer(map, config, projection) {
    const defaultFill = resolveColor(config.default_fill_color || '#cccccc', config.fill_alpha);
    const defaultStroke = resolveColor(config.stroke_color || '#000000');
    const categoryMap = {};
    
    (config.categories || []).forEach(cat => {
        categoryMap[cat.value] = { 
            fill: resolveColor(cat.fill_color, cat.fill_alpha), 
            stroke: cat.stroke_color ? resolveColor(cat.stroke_color) : null,
            strokeWidth: cat.stroke_width 
        };
    });

    function styleFunction(feature) {
        try {
            const cat = categoryMap[feature.get(config.field)];
            const fillColor = cat?.fill ?? defaultFill;
            const strokeColor = cat?.stroke ?? cat?.fill ?? defaultStroke;
            const geomType = feature.getGeometry()?.getType();
            
            return withLabel(makeGeomStyle(config, geomType, fillColor, strokeColor, strokeColor, cat?.strokeWidth), config, feature);
        } catch (err) {
            console.error('[addCategorizedLayer] Style error:', err, feature);
            return null;
        }
    }

  const source = makeSafeVectorSource(config, projection, 'addCategorizedLayer');
  if (!source) return null;

  const layer = makeVectorLayer(source, config, styleFunction);
  attachPopupMeta(layer, config);
  map.addLayer(layer);

  function buildLegendItems(geomHint) {
    if (config.legend_single) return [];
    return (config.categories || []).map(cat => {
      const fill = resolveColor(cat.fill_color, cat.fill_alpha);
      const stroke = cat.stroke_color ? resolveColor(cat.stroke_color) : fill;
      const label = cat.label || cat.value;
      return legendItemForGeom(geomHint, geomHint === 'line' ? stroke : fill, stroke, label, config);
    });
  }

  const configHint = config.geometry_type?.toLowerCase() || null;
  function registerWithHint(features) {
    const hint = configHint || detectDominantGeomType(features) || 'polygon';
    const items = buildLegendItems(hint);
    registerAndSetup(layer, config, items, 'Categorized Layer');
  }

  const loaded = source.getFeatures();
  if (configHint || loaded.length > 0 || source.getState() === 'ready') {
    registerWithHint(loaded);
  } else {
    registerAndSetup(layer, config, [], 'Categorized Layer');
    source.once('change', () => {
      if (source.getState() === 'ready') registerWithHint(source.getFeatures());
    });
  }

  return { layer, source };
}

// ── addPieChartLayer ─────────────────────────────────────────
export function addPieChartLayer(map, config, projection) {
  const pieRadius = config.pie_radius || 20;
  const pointRadius = config.point_radius || 8;
  const pieOffset = config.pie_offset || [38, 0];
  const fields = config.fields || [];
  const sizePx = pieRadius * 2;
  const source = makeSafeVectorSource(config, projection, 'addPieChartLayer');
  if (!source) return null;

  const canvasCache = new WeakMap();

  const layer = makeVectorLayer(source, config, function(feature) {
    const styles = [new ol.style.Style({
      image: new ol.style.Circle({
        radius: pointRadius,
        fill: new ol.style.Fill({ color: resolveColor(config.point_color || '#487bb6') }),
        stroke: new ol.style.Stroke({ color: resolveColor(config.point_stroke || '#325780'), width: 1.5 })
      })
    })];

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
  });

  attachPopupMeta(layer, config);
  map.addLayer(layer);

  const legendItems = fields.map(f => legendItemPolygon(f.color, '#ffffff', f.label || f.field));
  registerAndSetup(layer, config, legendItems, 'Pie Chart Layer');
  return { layer, source };
}

// ── addGraduatedLineLayer ────────────────────────────────────
export function addGraduatedLineLayer(map, config, projection) {
  const minWidth = config.min_width || 0.5;
  const maxWidth = config.max_width || 8;
  const legendSteps = config.legend_steps || 4;
  const alpha = config.fill_alpha ?? 1;
  const useGradient = !!(config.start_color && config.end_color);
  const startRGB = useGradient ? hexToRgb(config.start_color) : null;
  const endRGB = useGradient ? hexToRgb(config.end_color) : null;
  const fixedColor = useGradient ? null : resolveColor(config.color || '#000000', alpha);

  const source = makeSafeVectorSource(config, projection, 'addGraduatedLineLayer');
  if (!source) return null;

  const layer = makeVectorLayer(source, config, null);
  attachPopupMeta(layer, config);

  function resolveLineColor(factor) {
    return useGradient ? rgbToString(interpolateColor(startRGB, endRGB, factor), alpha) : fixedColor;
  }

  function makeStyle(minVal, maxVal) {
    return function(feature, resolution) {
        const v = parseNumeric(feature.get(config.field));
        if (v === null) return null;
        const factor = maxVal === minVal ? 0 : Math.max(0, Math.min(1, (v - minVal) / (maxVal - minVal)));
        const base = new ol.style.Style({
            stroke: new ol.style.Stroke({ color: resolveLineColor(factor), width: minWidth + factor * (maxWidth - minWidth) })
        });
        return withLabel(base, config, feature, resolution);
    };
}

  function makeLegendItems(minVal, maxVal) {
    return Array.from({ length: legendSteps }, (_, i) => {
      const factor = i / (legendSteps - 1);
      const color = resolveLineColor(factor);
      const value = Math.round(minVal + factor * (maxVal - minVal));
      return legendItemLine(color, value.toLocaleString('da-DK'), Math.round(minWidth + factor * (maxWidth - minWidth)));
    });
  }

  function apply(minVal, maxVal) {
    layer.setStyle(makeStyle(minVal, maxVal));
    registerAndSetup(layer, config, makeLegendItems(minVal, maxVal), 'Graduated Line Layer');
  }

  const fixedMin = config.breaks?.[0] ?? null;
  const fixedMax = config.breaks?.[config.breaks.length - 1] ?? null;

  if (fixedMin !== null && fixedMax !== null) apply(fixedMin, fixedMax);
  else if (source.getState() === 'ready') {
    const range = scanFieldRange(source.getFeatures(), config.field);
    if (range) apply(range.min, range.max);
  } else {
    source.once('change', () => {
      if (source.getState() !== 'ready') return;
      const range = scanFieldRange(source.getFeatures(), config.field);
      if (range) apply(range.min, range.max);
    });
  }

  map.addLayer(layer);
  return { layer, source };
}

// ── addClassedPointLayer ─────────────────────────────────────
export function addClassedPointLayer(map, config, projection) {
  const breaks = config.breaks || [];
  if (!Array.isArray(breaks) || breaks.length < 2) {
    console.error('[addClassedPointLayer] breaks must have at least 2 values');
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

  let classColors;
  if (Array.isArray(config.class_colors) && config.class_colors.length === numClasses) {
    classColors = config.class_colors.map(c => (typeof c === 'string' && (c.startsWith('rgba(') || c.startsWith('rgb('))) ? c : rgbToString(hexToRgb(c), defaultAlpha));
  } else {
    const startRGB = hexToRgb(config.start_color || '#ffffb2');
    const endRGB = hexToRgb(config.end_color || '#b10026');
    classColors = Array.from({ length: numClasses }, (_, i) => rgbToString(interpolateColor(startRGB, endRGB, numClasses === 1 ? 0.5 : i / (numClasses - 1)), defaultAlpha));
  }

  const source = makeSafeVectorSource(config, projection, 'addClassedPointLayer');
  if (!source) return null;

  function styleFunction(feature, resolution) {
    const v = parseNumeric(feature.get(config.field));
    if (v === null) return null;
    const idx = getClassIndex(v, breaks, numClasses, config.clamp_to_breaks);
    if (idx === null) return null;
    const base = new ol.style.Style({
        image: new ol.style.Circle({
            radius,
            fill: new ol.style.Fill({ color: classColors[idx] }),
            stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        })
    });
    return withLabel(base, config, feature, resolution);
}

  const layer = makeVectorLayer(source, config, styleFunction);
  attachPopupMeta(layer, config);
  map.addLayer(layer);

  const precision = config.legend_decimal_places ?? 0;
  const legendItems = classColors.map((color, i) =>
    legendItemPoint(color, strokeColor, `${fmtBreak(breaks[i], precision)} – ${fmtBreak(breaks[i + 1], precision)}`, radius)
  );

  registerAndSetup(layer, config, legendItems, 'Classed Point Layer');
  return { layer, source };
}

// ── addClassedIconLayer — SVG/PNG images mapped to attributes ──
//
// config.classes[]: { value, src (image URL), label, scale, anchor, show_legend }
// config.default_class: { src, label, scale, anchor }
// config.field: attribute to match against
//
export function addClassedIconLayer(map, config, projection) {
  const classes = config.classes || [];
  if (!Array.isArray(classes) || classes.length === 0) {
    console.error('[addClassedIconLayer] config.classes is required');
    return null;
  }
  if (!config.field) {
    console.error('[addClassedIconLayer] config.field is required');
    return null;
  }

  const source = makeSafeVectorSource(config, projection, 'addClassedIconLayer');
  if (!source) return null;

  // Cache Icon instances to avoid recreating them per render frame
  const iconCache = new Map();
  function getIcon(classCfg) {
    if (!iconCache.has(classCfg.src)) {
      iconCache.set(classCfg.src, new ol.style.Icon({
        src: classCfg.src,
        scale: classCfg.scale ?? 1,
        anchor: classCfg.anchor ?? [0.5, 1], // bottom-center by default
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: classCfg.opacity ?? 1
      }));
    }
    return iconCache.get(classCfg.src);
  }

  const lookup = {};
  const defaultCfg = config.default_class || null;
  classes.forEach(c => { lookup[c.value] = c; });

  function styleFunction(feature, resolution) {
    const val = feature.get(config.field);
    const cls = lookup[val] ?? defaultCfg;
    if (!cls) return null;
    const base = new ol.style.Style({ image: getIcon(cls) });
    return withLabel(base, config, feature, resolution);
}

  const layer = makeVectorLayer(source, config, styleFunction);
  attachPopupMeta(layer, config);
  map.addLayer(layer);

  // Legend items tailored for images
const legendItems = classes
    .filter(c => c.show_legend !== false)
    .map(c => ({
        src: c.src,          
        iconSrc: c.src,       
        scale: c.scale ?? 2,
        iconScale: c.scale ?? 2,
        label: c.label ?? c.value,
        type: 'image',       
        point: true,
        color: '#888888',     
        strokeColor: 'transparent'
    }));

  registerAndSetup(layer, config, legendItems, 'Classed Icon Layer');
  return { layer, source };
}

// ── addWMSLayer ──────────────────────────────────────────────
export function addWMSLayer(map, config) {
  const source = new ol.source.ImageWMS({
    url: config.url,
    params: { LAYERS: config.layers, ...config.params },
    serverType: config.server_type || 'mapserver',
    ratio: 1
  });
  const layer = new ol.layer.Image({
    source,
    opacity: config.opacity ?? 1,
    zIndex: config.z_index,
    visible: config.visible ?? true,
    ...(config.max_resolution !== undefined && { maxResolution: config.max_resolution }),
    ...(config.min_resolution !== undefined && { minResolution: config.min_resolution })
  });

  map.addLayer(layer);
  registerAndSetup(layer, config, config.legend_items || [], 'WMS Layer');
  return { layer, source };
}

// ============================================================
// SECTION 4 — Universal dispatcher
// ============================================================
export function addLayer(map, config, projection) {
  switch (config.type) {
    case 'singleColor':   return addSingleColorLayer(map, config, projection);
    case 'thematic':      return addThematicLayer(map, config, projection);
    case 'categorized':   return addCategorizedLayer(map, config, projection);
    case 'pieChart':      return addPieChartLayer(map, config, projection);
    case 'graduatedLine': return addGraduatedLineLayer(map, config, projection);
    case 'classedPoint':  return addClassedPointLayer(map, config, projection);
    case 'classedIcon':   return addClassedIconLayer(map, config, projection); // <-- NEW
    case 'wms':           return addWMSLayer(map, config);
    default:
      console.error(`[addLayer] Unknown type: "${config.type}". Expected: singleColor, thematic, categorized, pieChart, graduatedLine, classedPoint, classedIcon, wms.`);
      return null;
  }
}