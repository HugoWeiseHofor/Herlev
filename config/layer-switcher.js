// ==========================
// Layer Switcher with Groups + Legend
// ==========================

import { hexToRgb, interpolateColor, rgbToString, resolveColor } from '../config/color-helpers.js';

export const baseLayers = [];

export function buildLegendDiv(legendItems) {
    if (!legendItems || legendItems.length === 0) return null;
    
    const legendDiv = document.createElement('div');
    const isGradient = legendItems.length > 0 && legendItems[0].gradient;
    legendDiv.className = isGradient ? 'ls-legend ls-legend-gradient' : 'ls-legend';
    
    legendItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'ls-legend-row';
        
        const swatch = document.createElement('span');
        swatch.className = 'ls-swatch';
        
        if (item.line) {
            swatch.style.background = 'transparent';
            swatch.style.border = 'none';
            swatch.style.display = 'flex';
            swatch.style.alignItems = 'center';
            swatch.style.justifyContent = 'center';
            
            const line = document.createElement('span');
            line.style.display = 'block';
            line.style.width = '16px';
            line.style.height = `${Math.max(1, item.lineWidth || 2)}px`;
            line.style.background = item.color;
            line.style.borderRadius = '1px';
            swatch.appendChild(line);
        } else if (item.point) {
            swatch.style.background = 'transparent';
            swatch.style.border = 'none';
            swatch.style.display = 'flex';
            swatch.style.alignItems = 'center';
            swatch.style.justifyContent = 'center';
            swatch.style.width = '20px';
            swatch.style.height = '20px';
            
            const circle = document.createElement('span');
            const size = item.pointRadius ? Math.min(18, Math.max(4, item.pointRadius)) : 8;
            circle.style.display = 'inline-block';
            circle.style.width = `${size}px`;
            circle.style.height = `${size}px`;
            circle.style.background = item.color;
            circle.style.borderRadius = '50%';
            circle.style.border = `1px solid ${item.strokeColor || 'transparent'}`;
            swatch.appendChild(circle);
        } else {
            swatch.style.background = item.color;
            if (item.strokeColor) swatch.style.border = `1px solid ${item.strokeColor}`;
        }
        
        const lbl = document.createElement('span');
        lbl.className = 'ls-legend-label';
        lbl.textContent = item.label;
        
        row.appendChild(swatch);
        row.appendChild(lbl);
        legendDiv.appendChild(row);
    });
    
    return legendDiv;
}

// ==========================
// Sync group checkbox with child layer states
// ==========================

export function syncGroupCheckbox(groupContent) {
    if (!groupContent) return;
    
    const groupCheck = groupContent.parentNode.querySelector('.ls-group-check');
    if (!groupCheck) return;
    
    const childChecks = groupContent.querySelectorAll('input[type=checkbox].ls-input:not(.ls-group-check)');
    
    if (childChecks.length === 0) {
        groupCheck.checked = false;
        groupCheck.indeterminate = false;
        return;
    }
    
    const checkedCount = Array.from(childChecks).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        groupCheck.checked = false;
        groupCheck.indeterminate = false;
    } else if (checkedCount === childChecks.length) {
        groupCheck.checked = true;
        groupCheck.indeterminate = false;
    } else {
        groupCheck.checked = false;
        groupCheck.indeterminate = true;
    }
    
    // Bubble up to parent group if nested
    const parentGroupContent = groupContent.parentElement?.closest('.ls-group-content');
    if (parentGroupContent) {
        syncGroupCheckbox(parentGroupContent);
    }
}

export function registerLayer(layer, title, type = 'overlay', legendItems = [], container = null, hidden = false) {
    layer.set('title', title);
    layer.set('type', type);
    layer.set('hidden', hidden);
    
    // Skip UI creation if hidden
    if (hidden) return { layer };
    
    if (!container) {
        container = type === 'base'
            ? document.getElementById('ls-base-layers')
            : document.getElementById('ls-overlay-layers');
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'ls-layer-item';
    
    const headerRow = document.createElement('div');
    headerRow.className = 'ls-layer-header';
    
    const input = document.createElement('input');
    input.type = type === 'base' ? 'radio' : 'checkbox';
    input.name = type === 'base' ? 'baseLayer' : title;
    input.checked = layer.getVisible();
    input.className = 'ls-input';
    
    input.addEventListener('change', () => {
        if (type === 'base') {
            baseLayers.forEach(l => l.setVisible(l === layer));
        } else {
            layer.setVisible(input.checked);
        }
        // Sync parent group checkbox if this layer is in a group
        const groupContent = container.closest('.ls-group-content');
        if (groupContent && type !== 'base') {
            syncGroupCheckbox(groupContent);
        }
    });

    // If layer is initially visible, sync the group immediately after appending
    // (deferred so the wrapper is in the DOM first)
    
    layer.on('change:visible', () => { input.checked = layer.getVisible(); });
    
    const labelEl = document.createElement('label');
    labelEl.className = 'ls-label';
    labelEl.textContent = title;
    
    headerRow.appendChild(input);
    headerRow.appendChild(labelEl);
    wrapper.appendChild(headerRow);
    
    const legendDiv = buildLegendDiv(legendItems);
    if (legendDiv) wrapper.appendChild(legendDiv);
    
    container.appendChild(wrapper);

    // Sync parent group if layer starts visible
    if (input.checked && type !== 'base') {
        const groupContent = container.closest('.ls-group-content');
        if (groupContent) syncGroupCheckbox(groupContent);
    }

    if (type === 'base') baseLayers.push(layer);
    
    return { layer };
}

export function createGroup({ title, fold = 'open', depth = 0, container = null, hidden = false }) {
    if (hidden) {
        const dummy = document.createElement('div');
        dummy.setAttribute('data-hidden-group', 'true');
        return dummy;
    }
    
    if (!container) container = document.getElementById('ls-overlay-layers');
    
    const groupDiv = document.createElement('div');
    groupDiv.className = `ls-group ls-group-depth-${depth}`;
    
    const groupHeader = document.createElement('div');
    groupHeader.className = 'ls-group-header';
    
    const arrow = document.createElement('span');
    arrow.className = 'ls-group-arrow';
    arrow.textContent = fold === 'open' ? '▾' : '▸';
    
    const groupCheck = document.createElement('input');
    groupCheck.type = 'checkbox';
    groupCheck.className = 'ls-input ls-group-check';
    groupCheck.checked = false;
    groupCheck.indeterminate = false;
    groupCheck.title = 'Slå gruppe til/fra';
    
    const titleEl = document.createElement('span');
    titleEl.className = 'ls-group-title';
    titleEl.textContent = title;
    
    groupHeader.appendChild(arrow);
    groupHeader.appendChild(groupCheck);
    groupHeader.appendChild(titleEl);
    groupDiv.appendChild(groupHeader);
    
    const groupContent = document.createElement('div');
    groupContent.className = 'ls-group-content';
    groupContent.style.display = fold === 'open' ? 'block' : 'none';
    groupDiv.appendChild(groupContent);
    
    groupHeader.addEventListener('click', (e) => {
        if (e.target === groupCheck) return;
        const isOpen = groupContent.style.display !== 'none';
        groupContent.style.display = isOpen ? 'none' : 'block';
        arrow.textContent = isOpen ? '▸' : '▾';
    });
    
    groupCheck.addEventListener('change', () => {
        const enabled = groupCheck.checked;
        groupContent.querySelectorAll('input[type=checkbox].ls-input:not(.ls-group-check)').forEach(cb => {
            cb.checked = enabled;
            cb.dispatchEvent(new Event('change'));
        });
        groupContent.querySelectorAll('input.ls-group-check').forEach(cb => {
            cb.checked = enabled;
            cb.dispatchEvent(new Event('change'));
        });
    });
    
    container.appendChild(groupDiv);
    return groupContent;
}

export function syncAllGroups() {
    // Sync all group checkboxes bottom-up after all layers have been registered.
    // Deepest groups are synced first so state bubbles up correctly to parents.
    const allGroupContents = document.querySelectorAll('.ls-group-content');
    Array.from(allGroupContents).reverse().forEach(gc => syncGroupCheckbox(gc));
}

export function initLayerSwitcher() {
    const layerSwitcherDiv = document.createElement('div');
    layerSwitcherDiv.id = 'layer-switcher';
    layerSwitcherDiv.innerHTML = `
        <div id="ls-header">
            <span>Kortlag</span>
            <button id="ls-toggle">◀</button>
        </div>
        <div id="ls-body">
            <div id="ls-base-section">
                <div class="ls-section-title">Baggrundskort</div>
                <div id="ls-base-layers"></div>
            </div>
            <div id="ls-overlay-section">
                <div id="ls-overlay-layers"></div>
            </div>
        </div>`;
    
    document.body.appendChild(layerSwitcherDiv);
    
    document.getElementById('ls-toggle').addEventListener('click', () => {
        const body = document.getElementById('ls-body');
        const btn = document.getElementById('ls-toggle');
        const collapsed = body.style.display === 'none';
        body.style.display = collapsed ? 'block' : 'none';
        btn.textContent = collapsed ? '◀' : '▶';
    });
}