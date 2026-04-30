// ==========================
// Colour helpers
// ==========================

export function hexToRgb(hex) {
    const b = parseInt(hex.replace("#", ""), 16);
    return { r: (b >> 16) & 255, g: (b >> 8) & 255, b: b & 255 };
}

export function interpolateColor(c1, c2, f) {
    return {
        r: Math.round(c1.r + f * (c2.r - c1.r)),
        g: Math.round(c1.g + f * (c2.g - c1.g)),
        b: Math.round(c1.b + f * (c2.b - c1.b))
    };
}

export function rgbToString(rgb, alpha = 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function resolveColor(colorStr, alpha) {
    if (typeof colorStr !== 'string') return colorStr;
    const hex6 = /^#([0-9a-fA-F]{6})$/;
    const hex3 = /^#([0-9a-fA-F]{3})$/;
    const hex8 = /^#([0-9a-fA-F]{8})$/;
    
    if (hex8.test(colorStr)) {
        const b = parseInt(colorStr.slice(1), 16);
        const r = (b >> 24) & 255, g = (b >> 16) & 255, bl = (b >> 8) & 255, a = (b & 255) / 255;
        return `rgba(${r}, ${g}, ${bl}, ${a.toFixed(3)})`;
    }
    if (hex3.test(colorStr)) {
        colorStr = '#' + colorStr[1]+colorStr[1]+colorStr[2]+colorStr[2]+colorStr[3]+colorStr[3];
    }
    if (hex6.test(colorStr)) {
        const rgb = hexToRgb(colorStr);
        const a = alpha !== undefined ? alpha : 1;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    }
    return colorStr;
}