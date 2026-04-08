import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateYYYYMMDD(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const year = d.getUTCFullYear();
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = d.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateShort(date: string | Date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString();
  return `${day} ${month} ${year}`.split('').join(' ');
}

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// --- PDF Logo Placeholder ---
// In a production environment, replace this with the actual base64 of the MINERD logo
const MINERD_LOGO = "data:image/png;base64,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";


export function numberToWordsSpanish(n: number): string {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    const convertirMenorA1000 = (num: number): string => {
        if (num === 0) return '';
        if (num === 100) return 'CIEN';
        
        let res = '';
        if (num >= 100) {
            res += centenas[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        
        if (num >= 10 && num <= 19) {
            res += especiales[num - 10];
        } else {
            if (num >= 20) {
                if (num === 20) return res + 'VEINTE';
                if (num < 30) {
                    res += 'VEINTI' + unidades[num - 20];
                    num = 0;
                } else {
                    res += decenas[Math.floor(num / 10)];
                    num %= 10;
                    if (num > 0) res += ' Y ';
                }
            }
            if (num > 0) {
                res += unidades[num];
            }
        }
        return res.trim();
    };

    if (n === 0) return 'CERO PESOS CON 00/100';
    
    let integerPart = Math.floor(n);
    let decimalPart = Math.round((n - integerPart) * 100);
    
    let res = '';
    
    if (integerPart >= 1000000) {
        let millones = Math.floor(integerPart / 1000000);
        res += (millones === 1 ? 'UN MILLON' : convertirMenorA1000(millones) + ' MILLONES') + ' ';
        integerPart %= 1000000;
    }
    
    if (integerPart >= 1000) {
        let miles = Math.floor(integerPart / 1000);
        res += (miles === 1 ? 'MIL' : convertirMenorA1000(miles) + ' MIL') + ' ';
        integerPart %= 1000;
    }
    
    res += convertirMenorA1000(integerPart);
    
    const centavos = decimalPart.toString().padStart(2, '0');
    return `${res.trim()} PESOS CON ${centavos}/100`.toUpperCase();
}

export const generateQuotePDF = (quote: any, supplier: any, items: any[] = [], center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Centro Educativo Cristiano Génesis";
  const centerCode = center?.codigo_no || "06907";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(12);
  doc.text(center?.regional ? `DIRECCIÓN REGIONAL ${center.regional.toUpperCase()}` : "DIRECCIÓN REGIONAL 12 HIGÜEY", 105, 20, { align: "center" });
  doc.text(center?.district ? `DIRECCIÓN DISTRITAL ${center.district.toUpperCase()}` : "DIRECCIÓN DISTRITAL 12-01, HIGÜEY", 105, 26, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MANTENIMIENTO ESCOLAR", 105, 35, { align: "center" });
  doc.text(quote.type === 'labor' ? "Cotización de Mano de Obra Especializada" : "Cotización de Materiales", 105, 42, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const centerText = `Nombre del Centro: ${centerName}`;
  const centerLines = doc.splitTextToSize(centerText, 170);
  doc.text(centerLines, 20, 55);

  doc.text("SERVICIOS COTIZADOS", 105, 65 + (centerLines.length > 1 ? (centerLines.length - 1) * 7 : 0), { align: "center" });

  const tableStartY = 70 + (centerLines.length > 1 ? (centerLines.length - 1) * 7 : 0);
  const tableBody = (items && items.length > 0)
    ? items.map((item, index) => [
      (index + 1).toString(),
      item.name || item.description || 'N/A',
      (item.quantity || 1).toString(),
      formatCurrency(item.unit_price || 0),
      formatCurrency((item.quantity || 1) * (item.unit_price || 0))
    ])
    : [['1', quote.description || 'Reparación / Mantenimiento', '1', formatCurrency(quote.total_amount), formatCurrency(quote.total_amount)]];

  autoTable(doc, {
    startY: tableStartY,
    head: [['No.', 'Descripción', 'Cantidad', 'Precio Unidad', 'Total, RD$']],
    body: tableBody,
    foot: [
      ['', '', '', 'Sub - Total', formatCurrency(quote.subtotal)],
      ['', '', '', 'Itebis', formatCurrency(quote.itbis)],
      ['', '', '', 'Total', formatCurrency(quote.total_amount)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const supplierText = `Nombre del Oferente: ${supplier.name}`;
  const supplierLines = doc.splitTextToSize(supplierText, 170);
  doc.text(supplierLines, 20, finalY);
  
  const nextY = finalY + (supplierLines.length * 7);
  doc.text(`Cédula No. ${supplier.rnc}`, 20, nextY);
  doc.text(`Teléfono: ${supplier.phone || 'N/A'}`, 120, nextY);
  doc.text(`N. Cotización: ${quote.external_id || quote.id}`, 20, nextY + 7);
  doc.text(`Fecha: ${formatDate(quote.created_at)}`, 120, nextY + 7);

  doc.text("Firma del oferente__________________________", 60, nextY + 23);

  doc.save(`Cotizacion_${quote.external_id || quote.id}.pdf`);
};

export const generateCheckPDF = (check: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 100]
  });
  const centerCode = center?.codigo_no || "06907";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 5, 20, 20);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(10);
  // Top right calculations
  doc.text(`RD ${formatCurrency(check.amount_gross).replace('RD$', '')}`, 180, 10);
  doc.text(`ITBIS.`, 160, 15);
  doc.text(`5% ISR. ${formatCurrency(check.retention_isr).replace('RD$', '')}`, 160, 20);
  doc.setFont("helvetica", "bold");
  doc.text(`${formatCurrency(check.amount_net).replace('RD$', '')}`, 180, 25);

  doc.setFont("helvetica", "normal");
  doc.text(formatDate(check.date), 20, 20);
  doc.text(`Ck ${check.check_number}`, 150, 20);

  doc.setFontSize(11);
  doc.text(`JUNTA DE CENTRO EDUCATIVO: ${centerCode}`, 80, 25);
  doc.setFontSize(9);
  doc.text(`Concepto: ${check.description || "PAGO SEGÚN ORDEN DE COMPRA"}`, 80, 30, { maxWidth: 80 });

  doc.setFontSize(12);
  doc.text(formatDateShort(check.date), 160, 40);

  doc.setFont("helvetica", "bold");
  doc.text(check.beneficiary.toUpperCase(), 80, 50, { maxWidth: 120 });
  doc.text(formatCurrency(check.amount_net).replace('RD$', ''), 160, 50);

  doc.setFont("helvetica", "normal");
  const amountInWords = numberToWordsSpanish(check.amount_net);
  doc.text(`*** ${amountInWords} ***`, 30, 60);

  doc.save(`Cheque_${check.check_number}.pdf`);
};

export const generateRetentionCertPDF = (check: any, supplier: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Centro Educativo";
  const centerRNC = center?.rnc || "4-30-37254-4";
  const centerCode = center?.codigo_no || "06907";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(center?.regional ? `Regional ${center.regional}` : "Regional 12, Higüey", 105, 20, { align: "center" });
  doc.text(center?.district ? `Distrito ${center.district}` : "Distrito 12-01", 105, 27, { align: "center" });
  doc.text(`Junta de centro Educativo ${centerCode} ${centerName}`, 105, 34, { align: "center" });
  doc.text(`RNC: ${centerRNC}`, 105, 41, { align: "center" });

  doc.setFontSize(14);
  const certTitle = (check.retention_itbis || 0) > 0 ? "CERTIFICACIÓN DE RETENCIÓN DE IMPUESTOS (ISR E ITBIS)" : "CERTIFICACIÓN DE RETENCIÓN DE IMPUESTOS (ISR)";
  doc.text(certTitle, 105, 55, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`DD 12-01 Núm..: ${check.check_number}-2026`, 20, 65);

  const text = `Quien suscribe, ${center?.director_name || 'Nombre del Director(a)'}, directora de la Junta de centro Educativo ${centerCode} ${centerName} del Distrito ${center?.district || '12-01 de Higüey'}, Republica Dominicana, CERTIFICA: Que de acuerdo a lo establecido en el Art. 309 (y sus modificaciones) de la Ley 11-92, que establece el código Tributario Dominicano, en la Norma General 02-05 (y sus modificaciones), Decreto 293-11, la Ley 253-12, la Resolución Núm.. 41-2014, de la Dirección General de Impuestos Internos (DGII), en lo referente, hemos efectuado las retenciones de lugar aplicadas al pago de:`;

  const splitText = doc.splitTextToSize(text, 170);
  doc.text(splitText, 20, 75);

  doc.setFont("helvetica", "bold");
  doc.text(`Beneficiario: ${supplier.name.toUpperCase()}`, 20, 115);
  doc.text(`RNC o Cedula: ${supplier.rnc}`, 20, 122);

  doc.setFont("helvetica", "normal");
  doc.text("Valores en RD$", 150, 135);

  autoTable(doc, {
    startY: 140,
    head: [['Cheque No.', 'FECHA', 'MONTO BRUTO', 'ITBIS', 'Retención del 5%', 'TOTAL RETENIDO', 'MONTO NETO']],
    body: [[
      check.check_number,
      formatDate(check.date),
      formatCurrency(check.subtotal || check.amount_gross - (check.itbis_total || 0)),
      formatCurrency(check.itbis_total || 0),
      formatCurrency(check.retention_isr),
      formatCurrency(check.retention_isr + (check.retention_itbis || 0)),
      formatCurrency(check.amount_net)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, halign: 'center' },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text(`Dada a solicitud de la parte interesada, para los fines correspondiente, en Higüey, Provincia La Altagracia, Republica Dominicana, el día ${new Date().getDate()} mes de ${new Date().toLocaleString('es-DO', { month: 'long' })} del año ${new Date().getFullYear()}.`, 20, finalY, { maxWidth: 170 });

  doc.setFont("helvetica", "bold");
  doc.text(center?.director_name || "Nombre del Director(a)", 20, finalY + 40);
  doc.text(`Directora de la Junta de centro Educativo ${centerCode} ${centerName}`, 20, finalY + 47);

  doc.save(`Certificacion_Retencion_Conjunta_${check.check_number}.pdf`);
};

export const generateITBISRetentionCertPDF = (check: any, supplier: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Centro Educativo";
  const centerRNC = center?.rnc || "4-30-37254-4";
  const centerCode = center?.codigo_no || "06907";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(center?.regional ? `Regional ${center.regional}` : "Regional 12, Higüey", 105, 20, { align: "center" });
  doc.text(center?.district ? `Distrito ${center.district}` : "Distrito 12-01", 105, 27, { align: "center" });
  doc.text(`Junta de centro Educativo ${centerCode} ${centerName}`, 105, 34, { align: "center" });
  doc.text(`RNC: ${centerRNC}`, 105, 41, { align: "center" });

  doc.setFontSize(16);
  doc.text("CERTIFICACIÓN DE RETENCIÓN DE ITBIS", 105, 55, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`DD 12-01 Núm..: ${check.check_number}-2026`, 20, 65);

  const text = `Quien suscribe, ${center?.director_name || 'Nombre del Director(a)'}, directora de la Junta de centro Educativo ${centerCode} ${centerName} del Distrito ${center?.district || '12-01 de Higüey'}, Republica Dominicana, CERTIFICA: Que de acuerdo a lo establecido en la Norma General 02-05 de la Dirección General de Impuestos Internos (DGII) sobre Proveedores Informales, hemos efectuado la retención del 100% del ITBIS facturado aplicado al pago de:`;

  const splitText = doc.splitTextToSize(text, 170);
  doc.text(splitText, 20, 75);

  doc.setFont("helvetica", "bold");
  doc.text(`Beneficiario: ${supplier.name.toUpperCase()}`, 20, 105);
  doc.text(`Cédula: ${supplier.rnc}`, 20, 112);

  doc.setFont("helvetica", "normal");
  doc.text("Valores en RD$", 150, 125);

  autoTable(doc, {
    startY: 130,
    head: [['Cheque No.', 'FECHA', 'MONTO BRUTO', 'ITBIS FACTURADO', 'ITBIS RETENIDO (100%)']],
    body: [[
      check.check_number,
      formatDate(check.date),
      formatCurrency(check.subtotal || check.amount_gross - (check.itbis_total || 0)),
      formatCurrency(check.itbis_total || 0),
      formatCurrency(check.retention_itbis || 0)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 9, halign: 'center' },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text(`Dada a solicitud de la parte interesada, para los fines correspondiente, en Higüey, Provincia La Altagracia, Republica Dominicana, el día ${new Date().getDate()} mes de ${new Date().toLocaleString('es-DO', { month: 'long' })} del año ${new Date().getFullYear()}.`, 20, finalY, { maxWidth: 170 });

  doc.setFont("helvetica", "bold");
  doc.text(center?.director_name || "Nombre del Director(a)", 20, finalY + 40);
  doc.text(`Directora de la Junta de centro Educativo ${centerCode} ${centerName}`, 20, finalY + 47);

  doc.save(`Certificacion_Retencion_ITBIS_${check.check_number}.pdf`);
};

export const generateCheckRequestLetterPDF = (check: any, supplier: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Centro Educativo Cristiano Génesis";
  const centerCode = center?.codigo_no || "06907";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(12);
  doc.text(center?.regional ? `DIRECCIÓN REGIONAL ${center.regional.toUpperCase()}` : "DIRECCIÓN REGIONAL 12 HIGÜEY", 105, 20, { align: "center" });
  doc.text(center?.district ? `DIRECCIÓN DISTRITAL ${center.district.toUpperCase()}` : "DIRECCIÓN DISTRITAL 12-01, HIGÜEY", 105, 26, { align: "center" });

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(centerName, 105, 40, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const addressText = center?.address || "Eliseo Pérez Sánchez # 27, Sector Juan P. Duarte. Higüey, República Dominicana";
  const addressLines = doc.splitTextToSize(addressText, 160);
  doc.text(addressLines, 105, 48, { align: "center" });
  
  const emailY = 48 + (addressLines.length * 5);
  doc.text(`${center?.email || "Colegiocristianogenesis@hotmail.com"}`, 105, emailY, { align: "center" });
  doc.text(`Teléfono ${center?.phone || "809-554-0329"}`, 105, emailY + 5, { align: "center" });

  doc.setFontSize(11);
  doc.text(`Fecha: ${formatDate(new Date()).toUpperCase()}`, 140, 70);

  doc.setFont("helvetica", "bold");
  doc.text(`A : Junta de Centro Educativo ${centerCode} ${centerName}`, 20, 85);
  doc.text(center?.director_name || "Director(a) de la Junta de Centro", 30, 92);

  doc.text(`Atención : ${center?.director_name || 'Presidente(a) y/o Tesorero(a)'}`, 20, 105);
  
  // Dynamic Y positioning starts here
  let currentY = 115;
  const asuntoText = `Asunto : Solicitud de libramiento de cheque por concepto de ${check.description || 'adquisición de equipos tecnológico / materiales / servicios'}`;
  const asuntoLines = doc.splitTextToSize(asuntoText, 170);
  doc.text(asuntoLines, 20, currentY);
  currentY += (asuntoLines.length * 7);

  doc.text("Distinguido(a) Director(a):", 20, currentY + 10);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  const introText = "Cortésmente, nos dirigimos a usted con el propósito de solicitar el libramiento de un cheque con cargo a los fondos de descentralización correspondientes a este centro educativo, amparados en la Ordenanza No. 02-2018.";
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, currentY);
  currentY += (introLines.length * 7);

  const subText = "Dicha solicitud se realiza para cubrir gastos necesarios para el buen funcionamiento del plantel, según el siguiente detalle:";
  const subLines = doc.splitTextToSize(subText, 170);
  doc.text(subLines, 20, currentY + 5);
  currentY += (subLines.length * 7) + 10;

  doc.setFont("helvetica", "bold");
  const detalleText = `Detalles del Pago: ${check.description || 'ADQUISICIÓN SEGÚN FACTURA'}`;
  const detalleLines = doc.splitTextToSize(detalleText, 170);
  doc.text(detalleLines, 20, currentY);
  currentY += (detalleLines.length * 7) + 5;

  doc.text(`• Beneficiario: ${supplier.name.toUpperCase()}`, 20, currentY);
  currentY += 7;
  doc.text(`• RNC / Cédula: ${supplier.rnc}`, 20, currentY);
  currentY += 7;
  
  const amountInWords = numberToWordsSpanish(check.amount_net);
  const montoText = `• Monto Total: ${formatCurrency(check.amount_net)} (${amountInWords})`;
  const montoLines = doc.splitTextToSize(montoText, 170);
  doc.text(montoLines, 20, currentY);
  currentY += (montoLines.length * 7);

  const conceptoDetail = `• Concepto: ${check.description || 'PAGO DE BIENES/SERVICIOS'}`;
  const conceptoLines = doc.splitTextToSize(conceptoDetail, 170);
  doc.text(conceptoLines, 20, currentY);
  currentY += (conceptoLines.length * 7);

  doc.text(`• Partida Presupuestaria: 100,000.00 Pesos Trimestral.`, 20, currentY);
  currentY += 12;

  doc.setFont("helvetica", "normal");
  const anexoText = "Se anexa a la presente la documentación soporte requerida (Factura con comprobante fiscal gubernamental, copia de cédula/RNC, cotizaciones previas y acta de la junta de centro que aprueba el gasto).";
  const anexoLines = doc.splitTextToSize(anexoText, 170);
  doc.text(anexoLines, 20, currentY);
  currentY += (anexoLines.length * 7) + 10;

  const finalParaText = "Agradecemos de antemano su gestión para que estos recursos sean entregados a la brevedad, permitiendo así la continuidad de los procesos pedagógicos y administrativos de nuestra institución.";
  const finalParaLines = doc.splitTextToSize(finalParaText, 170);
  doc.text(finalParaLines, 20, currentY);
  currentY += (finalParaLines.length * 7) + 20;

  doc.text("Atentamente,", 20, currentY);
  currentY += 20;

  doc.text("Miembro del Equipo de Gestión________________", 20, currentY);
  doc.text("Miembro del Equipo de Gestión________________", 110, currentY);

  doc.save(`Carta_Solicitud_${check.check_number}.pdf`);
};

export const generateRequisitionPDF = (requisition: any, quote: any, items: any[] = [], center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Cristiano Génesis";
  const centerCode = center?.codigo_no || "11001619";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(12);
  doc.text(center?.district ? `DIRECCIÓN DISTRITAL ${center.district.toUpperCase()}` : "DIRECCIÓN DISTRITAL 12-01, HIGÜEY", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REQUISICIÓN DE MATERIALES O SERVICIOS", 105, 30, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${formatDate(requisition.created_at)}`, 20, 45);
  doc.text(`Junta de Centro Educativo: ${centerName}`, 20, 52);
  doc.text(`Código: ${centerCode}`, 120, 52);
  doc.text(`POA: ${requisition.poa_year || '2026'}`, 20, 62);

  doc.setFont("helvetica", "bold");
  const conceptText = `CONCEPCO: ${quote.description || 'Materiales didácticos nivel inicial, primaria y secundaria'}`;
  const conceptLines = doc.splitTextToSize(conceptText, 170);
  doc.text(conceptLines, 20, 72);

  const tableStartY = 72 + (conceptLines.length * 6) + 10;
  doc.text("DESCRIPCIÓN", 105, tableStartY - 5, { align: "center" });

  const tableBody = (items && items.length > 0)
    ? items.map((item, index) => [
      (index + 1).toString(),
      item.name || item.description || 'N/A',
      (item.quantity || 1).toString(),
      formatCurrency(item.unit_price || 0),
      formatCurrency((item.quantity || 1) * (item.unit_price || 0))
    ])
    : [['1', quote.description || 'Materiales didácticos nivel inicial, primaria y secundaria', '1', formatCurrency(quote.total_amount), formatCurrency(quote.total_amount)]];

  autoTable(doc, {
    startY: tableStartY,
    head: [['ITEM', 'DESCRIPCIÓN', 'CANTIDAD', 'PRECIO UNIT.', 'TOTAL']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.text("____________________", 40, finalY);
  doc.text(center?.director_name || "Presidente (a) de la Junta de Centro", 40, finalY + 5, { align: "center" });

  doc.text("____________________", 140, finalY);
  doc.text(center?.secretary_name || "Secretario (a) de la Junta de Centro", 140, finalY + 5, { align: "center" });

  doc.text("____________________", 90, finalY + 25);
  doc.text(center?.treasurer_name || "Tesorero (a) de la Junta de Centro", 90, finalY + 30, { align: "center" });

  doc.text(`Visto por la Dirección Distrital Educativa ${center?.district || '12-01, Higüey'}: ________________________________`, 20, finalY + 50);

  doc.save(`Requisicion_${requisition.id}.pdf`);
};

export const generatePurchaseOrderPDF = (po: any, supplier: any, items: any[] = [], center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Cristiano Génesis";
  const centerCode = center?.codigo_no || "11001619";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(12);
  doc.text(center?.regional ? `DIRECCIÓN REGIONAL ${center.regional.toUpperCase()}` : "DIRECCIÓN REGIONAL 12 HIGÜEY", 105, 20, { align: "center" });
  doc.text(center?.district ? `DIRECCIÓN DISTRITAL ${center.district.toUpperCase()}` : "DIRECCIÓN DISTRITAL 12-01, HIGÜEY", 105, 26, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ORDEN DE COMPRA O SERVICIOS", 105, 35, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Salvaleón de Higüey, RD.", 20, 45);

  doc.setFont("helvetica", "bold");
  doc.text(`FECHA: ${formatDate(po.created_at)}`, 20, 55);
  
  doc.text(`PROVEEDOR:`, 20, 62);
  doc.setFont("helvetica", "normal");
  const supplierLines = doc.splitTextToSize(supplier.name.toUpperCase(), 140);
  doc.text(supplierLines, 50, 62);
  
  let currentY = 62 + (supplierLines.length * 6);

  doc.setFont("helvetica", "bold");
  doc.text(`RNC :`, 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${supplier.rnc}`, 50, currentY);

  currentY += 7;
  doc.setFont("helvetica", "bold");
  doc.text(`DIRECCIÓN:`, 20, currentY);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(supplier.address || 'AVE. LIBERTAD NO.100, Higüey, Rep. Dom.', 140);
  doc.text(addressLines, 50, currentY);

  currentY += (addressLines.length * 6);
  doc.setFont("helvetica", "bold");
  doc.text(`TELÉFONO:`, 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${supplier.phone || '809-554-1863'}`, 50, currentY);

  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Junta de Centro Educativo: ${centerName}`, 20, currentY);
  doc.text(`Código: ${centerCode}`, 120, currentY);

  currentY += 10;
  doc.setFont("helvetica", "normal");
  const subText = "Solicitamos despachar por nuestra cuenta, los artículos y/o servicios que se detallan a continuación, según los precios convenidos y pactados entre usted/es y la Junta de este Centro Educativo.";
  const subLines = doc.splitTextToSize(subText, 170);
  doc.text(subLines, 20, currentY);

  currentY += (subLines.length * 6) + 5;
  doc.setFont("helvetica", "bold");
  const conceptoText = `Concepto: ${po.description || 'Materiales didácticos nivel inicial, primaria y secundaria'}`;
  const conceptoLines = doc.splitTextToSize(conceptoText, 170);
  doc.text(conceptoLines, 20, currentY);

  currentY += (conceptoLines.length * 6) + 10;
  doc.text("Valor en RD$", 160, currentY - 5);

  const tableBody = (items && items.length > 0)
    ? items.map(item => [
      (item.quantity || 1).toString(),
      item.name || item.description || 'N/A',
      formatCurrency(item.unit_price || 0),
      formatCurrency((item.quantity || 1) * (item.unit_price || 0))
    ])
    : [['1', po.description || 'Materiales didácticos nivel inicial, primaria y secundaria', formatCurrency(po.total_amount), formatCurrency(po.total_amount)]];

  autoTable(doc, {
    startY: currentY,
    head: [['CANTI.', 'DESCRIPCIÓN', 'PRECIO UNIT.', 'TOTAL']],
    body: tableBody,
    foot: [['', 'TOTAL', formatCurrency(po.total_amount)]],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  const amountInWords = numberToWordsSpanish(po.total_amount);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`VALOR EN LETRAS: ${amountInWords}`, 20, (doc as any).lastAutoTable.finalY + 10, { maxWidth: 170 });

  const finalY = (doc as any).lastAutoTable.finalY + 35;
  doc.text("____________________", 40, finalY);
  doc.text(center?.director_name || "Director (a) Centro Educativo", 40, finalY + 5, { align: "center" });

  doc.text("____________________", 140, finalY);
  doc.text(center?.secretary_name || "Secretario (a) Junta de Centro", 140, finalY + 5, { align: "center" });

  doc.save(`Orden_Compra_${po.id}.pdf`);
};

export const generateCheckCalculationSheetPDF = (check: any, supplier: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(14);
  doc.text(centerName.toUpperCase(), 105, 20, { align: "center" });
  doc.text("PLANILLA DE CÁLCULOS PARA EMISIÓN DE CHEQUE", 105, 30, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(check.date)}`, 20, 45);
  doc.text(`Beneficiario: ${supplier.name}`, 20, 50);
  doc.text(`RNC/Cédula: ${supplier.rnc}`, 20, 55);

  autoTable(doc, {
    startY: 65,
    head: [['Concepto', 'Monto']],
    body: [
      ['Monto Bruto (Sub-Total)', formatCurrency(check.subtotal || check.amount_gross - (check.itbis_total || 0))],
      ['(+) ITBIS Total', formatCurrency(check.itbis_total || 0)],
      ['(=) Total General', formatCurrency(check.amount_gross)],
      ['(-) Retención ISR (5% del Sub-Total)', formatCurrency(check.retention_isr)],
      ['(-) Retención ITBIS (100% Proveedor Informal)', formatCurrency(check.retention_itbis || 0)],
      ['(=) Monto Neto a Pagar', formatCurrency(check.amount_net)]
    ],
    theme: 'grid',
    columnStyles: { 1: { halign: 'right' } },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] }
  });

  const amountInWords = numberToWordsSpanish(check.amount_net);
  doc.setFontSize(9);
  doc.text(`VALOR EN LETRAS: ${amountInWords}`, 20, (doc as any).lastAutoTable.finalY + 10);

  doc.text("Preparado por: ____________________", 20, 150);
  doc.text("Aprobado por: ____________________", 120, 150);

  doc.save(`Planilla_Calculos_${check.check_number}.pdf`);
};

export const generateServiceRequestPDF = (quote: any, supplier: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(14);
  doc.text(centerName.toUpperCase(), 105, 20, { align: "center" });
  doc.text("SOLICITUD DE SERVICIO O MANO DE OBRA", 105, 30, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(quote.created_at)}`, 20, 45);
  doc.text(`Solicitante: Equipo de Gestión`, 20, 50);
  doc.text(`Proveedor sugerido: ${supplier.name}`, 20, 55);

  doc.text("Descripción del Servicio Requerido:", 20, 70);
  const serviceText = quote.description || "Servicios especializados de mantenimiento y/o reparación según especificaciones técnicas adjuntas en cotización.";
  const serviceLines = doc.splitTextToSize(serviceText, 160);
  const serviceBoxHeight = Math.max(30, (serviceLines.length * 6) + 10);
  
  doc.rect(20, 75, 170, serviceBoxHeight);
  doc.text(serviceLines, 25, 85);

  const justificationY = 75 + serviceBoxHeight + 10;
  doc.text("Justificación:", 20, justificationY);
  doc.rect(20, justificationY + 5, 170, 30);
  doc.text("Necesario para el correcto funcionamiento de las instalaciones", 25, justificationY + 15);
  doc.text("del centro educativo.", 25, justificationY + 20);

  const signatureY = justificationY + 50;
  doc.text("Firma Solicitante: ____________________", 20, signatureY);
  doc.text("Visto Bueno: ____________________", 120, signatureY);

  doc.save(`Solicitud_Servicio_${quote.id}.pdf`);
};

export const generateLaborReceiptPDF = (check: any, supplier: any, center?: any, logoBase64?: string) => {
  const doc = new jsPDF();
  const centerName = center?.name || "Cristiano Génesis";
  const centerCode = center?.codigo_no || "06907";

  try {
    doc.addImage(logoBase64 || MINERD_LOGO, 'PNG', 10, 10, 25, 25);
  } catch (e) {
    console.error("Error adding logo:", e);
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Junta de Centro ${centerCode} ${centerName}`, 105, 20, { align: "center" });

  doc.setFontSize(16);
  doc.text("RECIBO DE PAGO", 105, 30, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`FECHA: ${formatDate(check.date)}`, 20, 45);

  const amountInWords = numberToWordsSpanish(check.amount_net);
  const dist = center?.district ? `DEL DISTRITO ${center.district.toUpperCase()}` : "DEL DISTRITO 12-01, HIGÜEY";
  const text = `HE RECIBIDO DE LA JUNTA DE CENTRO ${centerCode} ${centerName.toUpperCase()}, ${dist}, LA SUMA DE RD$ ${formatCurrency(check.amount_net).replace('RD$', '')} ****** (${amountInWords}) *******`;

  const splitText = doc.splitTextToSize(text, 170);
  doc.text(splitText, 20, 55);

  doc.setFont("helvetica", "bold");
  doc.text("POR CONCEPTO DE:", 20, 75);
  doc.setFont("helvetica", "normal");
  const conceptText = check.description || "PAGO MANO DE OBRA DE REPARACIÓN SEGÚN COTIZACIÓN";
  const conceptLines = doc.splitTextToSize(conceptText, 160);
  const conceptHeight = Math.max(30, (conceptLines.length * 6) + 10);
  
  doc.rect(20, 80, 170, conceptHeight);
  doc.text(conceptLines, 25, 90);

  autoTable(doc, {
    startY: 80 + conceptHeight + 10,
    body: [
      ['Monto', formatCurrency(check.amount_gross)],
      ['ITEBIS', formatCurrency(check.retention_itbis)],
      ['ISR', formatCurrency(check.retention_isr)],
      ['CK', formatCurrency(check.amount_net)]
    ],
    theme: 'grid',
    styles: { halign: 'right' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text(supplier.name.toUpperCase(), 140, finalY, { align: "center" });

  doc.text("____________________", 40, finalY + 15);
  doc.text("Entregado Por", 40, finalY + 20, { align: "center" });

  doc.text("____________________", 140, finalY + 15);
  doc.text("Recibido por", 140, finalY + 20, { align: "center" });

  doc.text("Firma________________", 40, finalY + 35);
  doc.text("Firma________________", 140, finalY + 35);

  doc.text("Cédula_______________", 40, finalY + 50);
  doc.text("Cédula_______________", 140, finalY + 50);

  doc.text("Nota: Anexo copia de la Cedula", 20, finalY + 65);

  doc.save(`Recibo_Pago_${check.check_number}.pdf`);
};

export const generateCashBookReportPDF = (data: any[], startDate: string, endDate: string, center?: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  try {
    doc.addImage(MINERD_LOGO, 'PNG', 10, 5, 20, 20);
  } catch (e) {}
  doc.text(centerName.toUpperCase(), 148.5, 15, { align: "center" });
  doc.setFontSize(14);
  doc.text("LIBRO DE INGRESOS, EGRESOS Y DISPONIBILIDAD (CAJA)", 148.5, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (startDate && endDate) {
    doc.text(`Periodo: ${formatDate(startDate)} al ${formatDate(endDate)}`, 148.5, 28, { align: "center" });
  }

  const tableBody = data.map(row => [
    formatDate(row.date),
    row.reference_no || '',
    row.beneficiary || '',
    row.concept || '',
    formatCurrency(row.income),
    formatCurrency(row.expense),
    formatCurrency(row.balance),
    formatCurrency(row.retention_isr),
    formatCurrency(row.retention_itbis)
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['FECHA', 'REF/CHQ', 'BENEFICIARIO', 'CONCEPTO', 'INGRESOS', 'EGRESOS', 'DISPONIBLE', 'RET. ISR', 'RET. ITBIS']],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' }
    }
  });

  doc.save(`Libro_Caja_${startDate}_${endDate}.pdf`);
};

export const generateBankBookReportPDF = (data: any[], startDate: string, endDate: string, center?: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  try {
    doc.addImage(MINERD_LOGO, 'PNG', 10, 5, 20, 20);
  } catch (e) {}
  doc.text(centerName.toUpperCase(), 148.5, 15, { align: "center" });
  doc.setFontSize(14);
  doc.text("ESTADO BANCARIO Y CONCILIACIÓN", 148.5, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (startDate && endDate) {
    doc.text(`Periodo: ${formatDate(startDate)} al ${formatDate(endDate)}`, 148.5, 28, { align: "center" });
  }

  // Filter only bank-related movements if needed, but usually bank book matches cash book in this system
  const tableBody = data.map(row => [
    formatDate(row.date),
    row.reference_no || '',
    row.beneficiary || '',
    row.concept || '',
    formatCurrency(row.income),
    formatCurrency(row.expense),
    formatCurrency(row.balance)
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['FECHA', 'REFERENCIA', 'BENEFICIARIO', 'CONCEPTO', 'DEPÓSITOS', 'RETIROS/CHQ', 'BALANCE']],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });

  doc.save(`Estado_Bancario_${startDate}_${endDate}.pdf`);
};

export const generatePettyCashReportPDF = (data: any[], startDate: string, endDate: string, center?: any) => {
  const doc = new jsPDF();
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  try {
    doc.addImage(MINERD_LOGO, 'PNG', 10, 5, 20, 20);
  } catch (e) {}
  doc.text(centerName.toUpperCase(), 105, 15, { align: "center" });
  doc.setFontSize(14);
  doc.text("REPORTE DE CAJA CHICA", 105, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (startDate && endDate) {
    doc.text(`Periodo: ${formatDate(startDate)} al ${formatDate(endDate)}`, 105, 28, { align: "center" });
  }

  const tableBody = data.map(row => [
    formatDate(row.date),
    row.receipt_no || 'N/A',
    row.beneficiary || 'N/A',
    row.description || '',
    row.type === 'refill' ? 'Reposición' : 'Gasto',
    formatCurrency(row.amount)
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['FECHA', 'RECIBO', 'BENEFICIARIO', 'CONCEPTO', 'TIPO', 'MONTO']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [192, 57, 43] }
  });

  const totalExpenses = data.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
  const totalRefills = data.filter(r => r.type === 'refill').reduce((acc, r) => acc + r.amount, 0);

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Gastos: ${formatCurrency(totalExpenses)}`, 140, finalY);
  doc.text(`Total Reposiciones: ${formatCurrency(totalRefills)}`, 140, finalY + 7);

  doc.save(`Reporte_CajaChica_${startDate}_${endDate}.pdf`);
};

export const generateInventoryReportPDF = (data: any[], startDate: string, endDate: string, center?: any) => {
  const doc = new jsPDF();
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  try {
    doc.addImage(MINERD_LOGO, 'PNG', 10, 5, 20, 20);
  } catch (e) {}
  doc.text(centerName.toUpperCase(), 105, 15, { align: "center" });
  doc.setFontSize(14);
  doc.text("REPORTE DE INVENTARIO Y ACTIVOS", 105, 22, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (startDate && endDate) {
    doc.text(`Periodo: ${formatDate(startDate)} al ${formatDate(endDate)}`, 105, 28, { align: "center" });
  }

  const tableBody = data.map(row => [
    row.minerd_code || 'N/A',
    row.name,
    row.category || 'General',
    row.quantity.toString(),
    formatDate(row.created_at)
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['CÓDIGO', 'NOMBRE/DESCRIPCIÓN', 'CATEGORÍA', 'CANTIDAD', 'FECHA REGISTRO']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [243, 156, 18] }
  });

  doc.save(`Reporte_Inventario_${startDate}_${endDate}.pdf`);
};

export const exportCashBookToExcel = (data: any[]) => {
  const worksheetData = data.map(row => ({
    'FECHA': formatDate(row.date),
    'CHEQUE NO.': row.reference_no || '',
    'BENEFICIARIO': row.beneficiary || '',
    'CONCEPTO': row.concept || '',
    'INGRESOS': row.income,
    'EGRESOS': row.expense,
    'DISPONIBLE': row.balance,
    'RETENCIONES 5% ISR': row.retention_isr,
    'RETENCION 18% ITBIS': row.retention_itbis
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Libro de Caja");

  // Auto-size columns
  const maxWidths = Object.keys(worksheetData[0] || {}).map(key =>
    Math.max(key.length, ...worksheetData.map(row => String((row as any)[key]).length))
  );
  worksheet['!cols'] = maxWidths.map(w => ({ wch: w + 2 }));

  XLSX.writeFile(workbook, `Libro_Ingresos_Egresos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const generateGeneralReportPDF = (data: any, startDate: string, endDate: string, center?: any) => {
  if (!data || !data.quotes) {
    console.error("No data provided for PDF generation");
    return;
  }

  const doc = new jsPDF();
  const centerName = center?.name || "CENTRO EDUCATIVO CRISTIANO GÉNESIS";

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  try {
    doc.addImage(MINERD_LOGO, 'PNG', 10, 5, 20, 20);
  } catch (e) {}
  doc.text(centerName.toUpperCase(), 105, 15, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE GENERAL DE GESTIÓN", 105, 22, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Periodo: ${formatDate(startDate)} al ${formatDate(endDate)}`, 105, 22, { align: "center" });

  // Summary Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen Ejecutivo", 20, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Cotizaciones Procesadas: ${(data.quotes || []).length}`, 20, 42);
  doc.text(`Monto Total Cotizado: ${formatCurrency((data.quotes || []).reduce((acc: any, q: any) => acc + (q.total_amount || 0), 0))}`, 20, 47);

  const income = (data.cashBook || []).reduce((acc: any, c: any) => acc + (c.income || 0), 0);
  const expense = (data.cashBook || []).reduce((acc: any, c: any) => acc + (c.expense || 0), 0);
  doc.text(`Ingresos Totales (Banco): ${formatCurrency(income)}`, 20, 52);
  doc.text(`Egresos Totales (Banco): ${formatCurrency(expense)}`, 20, 57);

  const pettyExpense = (data.pettyCash || []).filter((p: any) => p.type === 'expense').reduce((acc: any, p: any) => acc + (p.amount || 0), 0);
  doc.text(`Gastos Caja Chica: ${formatCurrency(pettyExpense)}`, 20, 62);
  doc.text(`Nuevos Activos en Inventario: ${(data.inventory || []).length}`, 20, 67);

  // Quotes Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Cotizaciones", 20, 80);

  const quoteRows = (data.quotes || []).map((q: any) => [
    formatDate(q.created_at),
    q.supplier_name || 'N/A',
    q.type === 'materials' ? 'Materiales' : 'Mano de Obra',
    formatCurrency(q.total_amount || 0)
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['FECHA', 'SUPLIDOR', 'TIPO', 'TOTAL']],
    body: quoteRows,
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80] }
  });

  // Items Table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Productos y Servicios", 20, finalY + 15);

  const itemRows = (data.quoteItems || []).map((i: any) => [
    formatDate(i.quote_date),
    i.minerd_code || 'N/A',
    i.description || 'N/A',
    i.quantity,
    formatCurrency(i.unit_price || 0),
    formatCurrency(i.total || 0)
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['FECHA', 'CÓDIGO', 'DESCRIPCIÓN', 'CANT.', 'PRECIO', 'TOTAL']],
    body: itemRows,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] }
  });

  // Bank Movements Section
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Movimientos Bancarios", 20, 20);

  const bankRows = (data.cashBook || []).map((c: any) => [
    formatDate(c.date),
    c.reference_no || 'N/A',
    c.beneficiary || 'N/A',
    formatCurrency(c.income),
    formatCurrency(c.expense),
    formatCurrency(c.balance)
  ]);

  autoTable(doc, {
    startY: 25,
    head: [['FECHA', 'REF.', 'BENEFICIARIO', 'INGRESOS', 'EGRESOS', 'BALANCE']],
    body: bankRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // Petty Cash Section
  const finalY3 = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Caja Chica", 20, finalY3 + 15);

  const pettyRows = (data.pettyCash || []).map((p: any) => [
    formatDate(p.date),
    p.receipt_no || 'N/A',
    p.beneficiary || 'N/A',
    p.type === 'refill' ? 'Reposición' : 'Gasto',
    formatCurrency(p.amount)
  ]);

  autoTable(doc, {
    startY: finalY3 + 20,
    head: [['FECHA', 'RECIBO', 'BENEFICIARIO', 'TIPO', 'MONTO']],
    body: pettyRows,
    theme: 'striped',
    headStyles: { fillColor: [192, 57, 43] }
  });

  doc.save(`Reporte_General_${startDate}_${endDate}.pdf`);
};

export const exportOfficialMinerdReport = (data: any, center: any, startDate: string, endDate: string) => {
  if (!data || !data.quoteItems) return;

  const workbook = XLSX.utils.book_new();

  const sections = [
    {
      title: '2. SERVICIOS NO PERSONALES 40%', codes: [
        { code: '215', details: 'Servicio de internet y televisión por cable' },
        { code: '222', details: 'Agua' },
        { code: '232', details: 'Impresión y encuadernación, Fotocopias' },
        { code: '241', details: 'Viáticos dentro del país' },
        { code: '251', details: 'Pasajes' },
        { code: '252', details: 'Fletes' },
        { code: '254', details: 'Peaje' },
        { code: '281', details: 'Obras menores' },
        { code: '282', details: 'maquinarias y equipos' },
        { code: '292', details: 'Comisiones y gastos bancarios' },
        { code: '294', details: 'Servicios funerarios y gastos conexos' },
        { code: '295', details: 'Servicios especiales' },
        { code: '299', details: 'Otros servicios no personales' }
      ]
    },
    {
      title: '3. MATERIALES Y SUMINISTRO 40%', codes: [
        { code: '311', details: 'Alimentos y bebidas para personas' },
        { code: '331', details: 'Papel de escritorio.' },
        { code: '332', details: 'Productos de papel y cartón' },
        { code: '333', details: 'Productos de artes gráficas' },
        { code: '341', details: 'Combustibles y lubricantes' },
        { code: '342', details: 'Productos químico y conexos' },
        { code: '343', details: 'Productos farmacéuticos y conexos' },
        { code: '353', details: 'Llantas y neumáticos' },
        { code: '355', details: 'Artículos de plásticos' },
        { code: '361', details: 'Productos de cemento y asbesto' },
        { code: '362', details: 'Productos de vidrio, loza y porcelana' },
        { code: '363', details: 'Cemento, cal y yeso' },
        { code: '365', details: 'Productos metálicos' },
        { code: '366', details: 'Minerales: Arena y graba' },
        { code: '391', details: 'Material de limpieza.' },
        { code: '392', details: 'Útiles de escritorio, oficina y enseñanza' },
        { code: '394', details: 'Útiles de deporte y recreativos' },
        { code: '395', details: 'Útiles de cocina y comedor' },
        { code: '396', details: 'Productos eléctricos y afines' },
        { code: '397', details: 'Materiales y útiles relacionados con informática' },
        { code: '399', details: 'Útiles diversos' }
      ]
    },
    {
      title: 'ACTIVO NO FINANCIERO 20%', codes: [
        { code: '612', details: 'Equipo educacional y recreativo' },
        { code: '614', details: 'Equipos de informática.' },
        { code: '617', details: 'Equipos y muebles de oficina' },
        { code: '619', details: 'Equipos varios (Laboratorios de ciencias)' }
      ]
    }
  ];

  const header = [
    ['Ministerio de Educación de la República Dominicana'],
    ['Formulario de Rendición de Cuentas'],
    [''],
    [`Nombre de la junta: ${center.junta_name || ''}`, '', '', `Código No. ${center.codigo_no || ''}`],
    [`Código dependencia: ${center.codigo_dependencia || ''}`, '', '', `Cuenta No. ${center.cuenta_no || ''}`],
    [`Fecha de emisión: ${new Date().toLocaleDateString('es-DO')}`, '', '', `Monto Total Ejecutado: ${formatCurrency(data.quoteItems.reduce((acc: any, i: any) => acc + (i.total || 0), 0))}`],
    [''],
    ['Número Cuenta', 'Detalles', 'Presupuesto Anual', 'Presupuesto Trimestral', 'Ejecutado', 'Disponible']
  ];

  const rows: any[] = [];
  let totalEjecutado = 0;

  sections.forEach(section => {
    rows.push(['', section.title, '', '', '', '']);
    let sectionTotal = 0;

    section.codes.forEach(c => {
      const executed = data.quoteItems
        .filter((i: any) => i.minerd_code === c.code)
        .reduce((acc: any, i: any) => acc + (i.total || 0), 0);

      rows.push([c.code, c.details, 0, 0, executed, 0]);
      sectionTotal += executed;
    });

    rows.push(['', 'Sub-Total', 0, 0, sectionTotal, 0]);
    totalEjecutado += sectionTotal;
  });

  rows.push(['', 'TOTALES RD$', 0, 0, totalEjecutado, 0]);

  const worksheet = XLSX.utils.aoa_to_sheet([...header, ...rows]);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rendición de Cuentas");

  XLSX.writeFile(workbook, `Rendicion_Cuentas_MINERD_${center.name}_${startDate}.xlsx`);
};
