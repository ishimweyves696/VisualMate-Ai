import { jsPDF } from 'jspdf';

/**
 * Downloads an image from a URL.
 * @param imageUrl The URL of the image to download
 * @param fileName The name of the file
 * @param format The format of the file (png, jpg, pdf)
 * @param isFree Whether the user is on a free plan (to add watermark)
 */
export const downloadVisual = async (
  imageUrl: string, 
  fileName: string, 
  format: 'png' | 'jpg' | 'pdf',
  isFree: boolean,
  title?: string
) => {
  try {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');
    img.crossOrigin = "anonymous";
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(img, 0, 0);

    if (isFree) {
      ctx.save();
      ctx.font = `bold ${Math.floor(canvas.width / 25)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText("VisualMate AI - FREE PLAN", 0, 0);
      ctx.restore();
      
      ctx.font = `bold ${Math.floor(canvas.width / 60)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText("Made with VisualMate AI", canvas.width - 40, canvas.height - 40);
    }

    if (format === 'pdf') {
      const jsPDFConstructor = (jsPDF as any).jsPDF || jsPDF;
      const pdf = new jsPDFConstructor({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - (margin * 2);
      
      const ratio = canvas.width / canvas.height;
      let finalWidth = maxWidth;
      let finalHeight = maxWidth / ratio;

      if (finalHeight > (pageHeight - margin * 2)) {
        finalHeight = pageHeight - margin * 2;
        finalWidth = finalHeight * ratio;
      }

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      const finalImageData = canvas.toDataURL('image/png');
      pdf.addImage(finalImageData, 'PNG', x, y, finalWidth, finalHeight);
      
      if (title) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(title, pageWidth / 2, 8, { align: 'center' });
      }
      
      pdf.save(`${fileName}.pdf`);
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, mimeType, 0.95);
    }
  } catch (error) {
    console.error('Download service failed:', error);
    throw error;
  }
};
