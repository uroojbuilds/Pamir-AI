import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TradePayload, TradeParameters } from '../types';

export function generateTradeDossierPdf(payload: TradePayload, parameters: TradeParameters): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const reportId = `CARGO-REP-${payload.product_id}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    const nowFormatted = new Date().toLocaleString();
    const rateUsed = payload.calculations?.exchange_rate_used || 279.30;
    const unitPriceUsd = ((payload.product_cost_pkr / parameters.quantity) / rateUsed).toFixed(2);
    const cifValuationPkr = payload.product_cost_pkr + payload.shipping_cost_pkr;

    // Header Background Accent
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 32, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PAMIR.AI // TRADE COMMAND DOSSIER', 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Pakistan-China Cross-Border Sourcing & Landed Cost Planning Estimate', 14, 22);

    // Header Right Meta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`DOC: ${reportId}`, 196, 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Date: ${nowFormatted}`, 196, 18, { align: 'right' });
    doc.text(`SBP Reference: Rs ${rateUsed.toFixed(2)} / USD`, 196, 24, { align: 'right' });

    // Key Parameters Box
    let y = 38;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('PRODUCT SKU', 20, y + 7);
    doc.text('LOT QUANTITY', 65, y + 7);
    doc.text('FBR TARIFF PCT', 110, y + 7);
    doc.text('VIABILITY SCORE', 155, y + 7);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(payload.product_id, 20, y + 15);
    doc.text(`${parameters.quantity} Units`, 65, y + 15);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text(`${payload.calculations.duty_rate_percent}% Duty`, 110, y + 15);
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text(`${payload.analysis.viability_score} / 100`, 155, y + 15);

    // Commodity Description
    y += 28;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('COMMODITY DESCRIPTION & SOURCING PROFILE', 14, y);

    y += 5;
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(payload.product_name, 14, y);

    // Financial Breakdown Table using autoTable
    y += 6;
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Cost Component', 'Basis / Calculation Model', 'Amount (PKR)']],
      body: [
        [
          'Factory Product Cost (FOB)',
          `${parameters.quantity} pcs @ USD $${unitPriceUsd} FOB (Interbank @ Rs ${rateUsed.toFixed(2)})`,
          `Rs ${payload.product_cost_pkr.toLocaleString()}`
        ],
        [
          'Air Freight Cargo (Karachi Hub)',
          `${payload.calculations.weight_used_kg} kg @ $5.00/kg (Air Freight)`,
          `Rs ${payload.shipping_cost_pkr.toLocaleString()}`
        ],
        [
          'CIF Customs Valuation Base',
          `FOB Product Cost + Air Freight (Karachi Port clearance base)`,
          `Rs ${cifValuationPkr.toLocaleString()}`
        ],
        [
          'FBR Customs Duty Surcharge',
          `${payload.calculations.duty_rate_percent}% statutory duty on CIF valuation base`,
          `Rs ${payload.customs_cost_pkr.toLocaleString()}`
        ],
        [
          'TOTAL ESTIMATED LANDED COST',
          `Per-Unit Landed Cost: Rs ${payload.calculations.unit_landed_cost_pkr.toLocaleString()} PKR`,
          `Rs ${payload.total_landed_cost_pkr.toLocaleString()}`
        ]
      ],
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: 85 },
        2: { halign: 'right', fontStyle: 'bold', cellWidth: 42 }
      },
      theme: 'grid',
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fillColor = [241, 245, 249]; // highlight total
          data.cell.styles.fontStyle = 'bold';
          if (data.column.index === 2) {
            data.cell.styles.textColor = [29, 78, 216]; // blue text for total
            data.cell.styles.fontSize = 9;
          }
        }
      }
    });

    // AI Procurement Feasibility Assessment
    // @ts-ignore
    const finalTableY = (doc as any).lastAutoTable?.finalY || y + 50;
    y = finalTableY + 8;

    // Calculate dynamic heights with text wrapping
    doc.setFontSize(7.5);
    const splitReasoning = doc.splitTextToSize(payload.analysis.ai_explanation.reasoning || '', 174);
    const splitRecommendation = doc.splitTextToSize(
      `Recommendation: ${payload.analysis.ai_explanation.recommendation || ''}`,
      174
    );

    const boxHeight = Math.max(34, 12 + splitReasoning.length * 3.6 + splitRecommendation.length * 3.6 + 4);

    // Feasibility Container Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, boxHeight, 2, 2, 'FD');

    // Title
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('PROCUREMENT FEASIBILITY & RISK ASSESSMENT SUMMARY', 18, y + 6);

    // Reasoning Body Text
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(splitReasoning, 18, y + 11);

    // Blue Recommendation Text (Wrapped and aligned)
    const recommendationY = y + 11 + splitReasoning.length * 3.6 + 2.5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text(splitRecommendation, 18, recommendationY);

    // Disclaimer & Compliance Stamp Footer (Separated columns to prevent double-print overlap)
    const footerY = 268;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(14, footerY, 196, footerY);

    // Left Column (Constrained to 115mm width so it never overlaps the right column)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('COMMERCIAL PLANNING ESTIMATE & TARIFF REFERENCE', 14, footerY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const splitDisclaimer = doc.splitTextToSize(
      'Indicative estimate based on SBP Interbank baseline and published Pakistan Customs FBR PCT schedules. Final assessment subject to WeBOC clearance.',
      115
    );
    doc.text(splitDisclaimer, 14, footerY + 8.5);

    // Right Column (Right-aligned metadata)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Generated via Pamir AI Trade Platform', 196, footerY + 4.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Trade Corridor: China -> Karachi Hub', 196, footerY + 8.5, { align: 'right' });

    // Trigger Save / Download
    const fileName = `PamirAI_Trade_Dossier_${payload.product_id}_${parameters.quantity}units.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    return false;
  }
}
