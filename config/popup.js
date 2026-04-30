// ==========================
// Attribute Popup Module
// ==========================

let currentPopup = null;
let mapRef = null;

export function initPopup(map) {
    mapRef = map;
    
    const popup = document.createElement('div');
    popup.id = 'attribute-popup';
    popup.style.display = 'none';           // ← use inline style, not class
    document.body.appendChild(popup);
    
    document.addEventListener('click', (e) => {
        if (popup.style.display === 'none') return;   // ← guard: skip if already hidden
        if (!popup.contains(e.target) && !e.target.closest('.ol-overlaycontainer-stopevent')) {
            hidePopup();
        }
    });
    
    currentPopup = popup;
    return popup;
}

export function showPopup(pixel, title, attributes) {
    if (!currentPopup) return;
    
    let html = `<button class="popup-close" title="Luk">&times;</button>`;
    if (title) html += `<div class="popup-title">${title}</div>`;
    
    Object.entries(attributes).forEach(([key, value]) => {
        const displayValue = formatAttributeValue(value);
        html += `
            <div class="popup-row">
                <span class="popup-key">${key}</span>
                <span class="popup-value">${displayValue}</span>
            </div>
        `;
    });
    
    currentPopup.innerHTML = html;
    
    const mapSize = mapRef.getSize();
    let left = pixel[0] + 15;
    let top = pixel[1] - 10;
    
    if (left + 280 > mapSize[0]) left = pixel[0] - 295;
    if (top + 200 > mapSize[1]) top = mapSize[1] - 210;
    if (top < 10) top = 10;
    
    currentPopup.style.left = `${left}px`;
    currentPopup.style.top = `${top}px`;
    currentPopup.style.display = 'block';
    
    currentPopup.querySelector('.popup-close').addEventListener('click', hidePopup);
}

export function hidePopup() {
    if (currentPopup) {
        currentPopup.style.display = 'none'; 
    }
}

function formatAttributeValue(value) {
    if (value === null || value === undefined) return '–';
    if (typeof value === 'number') {
        return value.toLocaleString('da-DK', { maximumFractionDigits: 2 });
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return `<a href="${value}" target="_blank" style="color:#2c5f8a">Link</a>`;
    }
    return String(value);
}