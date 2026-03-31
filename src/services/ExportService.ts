import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ExportService = {
  async exportConceptToPDF(elementId: string, conceptText: string, projectName: string = 'Arispace Concept') {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      // Generar snapshot del lienzo, forzando fondo blanco para estilo corporativo/minimalista
      const canvas = await html2canvas(element, {
        scale: 2.5, // Alta Resolución
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Inicializar PDF tamaño A4 vertical
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 18;

      // --- 1. HEADER ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(31, 41, 55); // Gris carbón (#1F2937)
      pdf.text(projectName, margin, 25);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = new Date().toLocaleDateString(undefined, options);
      pdf.text(`Fecha de creación: ${dateStr}`, margin, 32);

      // --- 2. BODY (Canvas Image) ---
      // Calcular dimensiones para encajar, manteniendo aspecto
      const calcWidth = pdfWidth - (margin * 2);
      const calcHeight = (canvas.height * calcWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, 42, calcWidth, calcHeight);

      // --- 3. FOOTER (Concept Text) ---
      if (conceptText) {
        const textY = 42 + calcHeight + 20;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        
        // Dividir texto para que haga word-wrap en el PDF
        const splitText = pdf.splitTextToSize(`Prompt de Génesis AI:\n\n${conceptText}`, pdfWidth - (margin * 2));
        
        // Si el texto se sale de la primera página, habría que manejar páginas extra
        // En este prototipo, se asume que el A4 es suficiente.
        pdf.text(splitText, margin, textY);
      }

      // --- 4. EXPORTAR Y DESCARGAR AUTOMÁTICAMENTE ---
      const formattedFileName = `Arispace_Concept_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(formattedFileName);

    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  }
};
