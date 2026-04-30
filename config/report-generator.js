// config/report-generator.js

// 1. Load libraries directly from CDN for online use
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import html2canvas from 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm';
import { buildLegendDiv } from './layer-switcher.js';

export async function generateReport(map) {
    const btn = document.getElementById('btn-generate-report');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
        btn.textContent = '⏳ Genererer PDF...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        let currentY = margin;

        // 1. Capture Map Canvas
        const mapElement = map.getTargetElement();
        const mapCanvas = mapElement.querySelector('canvas');
        if (!mapCanvas) throw new Error("Map canvas not found");
        
        const mapImgData = mapCanvas.toDataURL('image/jpeg', 0.85);
        const mapWidthMm = pageWidth - (margin * 2);
        const mapHeightMm = mapWidthMm * (mapCanvas.height / mapCanvas.width);

        // Add map to PDF
        pdf.addImage(mapImgData, 'JPEG', margin, currentY, mapWidthMm, mapHeightMm);
        currentY += mapHeightMm + 8; // +8mm gap between map and legend

        // Report Title & Date
        pdf.setFontSize(14);
        pdf.setTextColor('#1a3a5c');
        pdf.setFont(undefined, 'bold');
        pdf.text('Kortrapport', margin, currentY);
        pdf.setFont(undefined, 'normal');
        
        currentY += 5;
        pdf.setFontSize(9);
        pdf.setTextColor('#666666');
        pdf.text(`Genereret: ${new Date().toLocaleDateString('da-DK')} kl. ${new Date().toLocaleTimeString('da-DK')}`, margin, currentY);
        currentY += 6;

        // 2. Prepare Off-screen Container for 2-Column Grid Layout
        const tempDiv = document.createElement('div');
        // Fixed width of 600px forces items to wrap into 2 columns, saving vertical space
        tempDiv.style.cssText = `
            position: absolute; left: -9999px; top: -9999px;
            background: #ffffff; padding: 8px;
            width: 600px;
            display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            box-sizing: border-box;
        `;
        document.body.appendChild(tempDiv);
        
        // Inject compact, aesthetic CSS for the PDF
        const style = document.createElement('style');
        style.textContent = `
            .legend-card {
                width: 48%; box-sizing: border-box;
                background: #f8fafc; border: 1px solid #e2e8f0;
                border-radius: 4px; padding: 5px 6px;
            }
            .legend-card-title {
                font-size: 10px; font-weight: 700; color: #1a3a5c;
                margin-bottom: 3px; border-bottom: 1px solid #cbd5e1;
                padding-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .ls-legend { margin: 0; gap: 1px; display: flex; flex-direction: column; }
            .ls-legend-row { display: flex; align-items: center; gap: 5px; padding: 1px 0; font-size: 9px; color: #444; }
            .ls-swatch { display: inline-block; width: 12px; height: 10px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }
            
            /* Gradient handling */
            .ls-legend-gradient .ls-legend-row { gap: 0; padding: 0; }
            .ls-legend-gradient .ls-swatch { height: 12px; border-radius: 0; border: none !important; }
            .ls-legend-gradient .ls-swatch:first-child { border-radius: 2px 2px 0 0; }
            .ls-legend-gradient .ls-swatch:last-child { border-radius: 0 0 2px 2px; }
            .ls-legend-gradient .ls-legend-label { visibility: hidden; font-size: 8px; }
            .ls-legend-gradient .ls-legend-row:first-child .ls-legend-label,
            .ls-legend-gradient .ls-legend-row:last-child .ls-legend-label { visibility: visible; }
        `;
        tempDiv.appendChild(style);

        // 3. Populate with Legend Cards
        const layers = map.getLayers().getArray();
        const visibleLayers = layers.filter(l => l.getVisible() && !l.get('hidden'));

        for (const layer of visibleLayers) {
            const legendItems = layer.get('legendItems');
            if (legendItems && legendItems.length > 0) {
                const card = document.createElement('div');
                card.className = 'legend-card';
                
                const titleEl = document.createElement('div');
                titleEl.className = 'legend-card-title';
                titleEl.textContent = layer.get('title') || 'Layer';
                card.appendChild(titleEl);
                
                const legendDiv = buildLegendDiv(legendItems);
                card.appendChild(legendDiv);
                
                tempDiv.appendChild(card);
            }
        }

        // 4. Render Grid & Add to PDF
        const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        
        const imgWidthMm = pageWidth - (margin * 2);
        const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

        // Only create a new page if the legend absolutely won't fit
        if (currentY + imgHeightMm > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidthMm, imgHeightMm);

        document.body.removeChild(tempDiv);
        pdf.save(`MapReport_${new Date().toISOString().slice(0,10)}.pdf`);

    } catch (err) {
        console.error("PDF Error:", err);
        alert("Kunne ikke generere rapport. Se konsol for detaljer.");
    } finally {
        if (btn) {
            btn.textContent = originalText || '📄 Generer Rapport';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
}