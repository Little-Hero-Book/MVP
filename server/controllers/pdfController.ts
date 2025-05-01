import { RequestHandler } from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fetch from 'node-fetch';
import { ServerError } from '../types';

export const generatePDF: RequestHandler = async (_req, res, next) => {
  const rawResponse = res.locals.openAIResponse;
  const illustrations = res.locals.illustrations;

  if (!rawResponse || !illustrations) {
    const error: ServerError = {
      log: 'Missing story or illustration data for PDF generation',
      status: 500,
      message: { err: 'Missing input data for PDF creation' },
    };
    return next(error);
  }

  let storyData;
  try {
    storyData =
      typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
  } catch (err) {
    const error: ServerError = {
      log: 'Failed to parse OpenAI response JSON in pdfController',
      status: 500,
      message: { err: 'Invalid OpenAI response format' },
    };
    return next(error);
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;

    const pageTexts: string[] = storyData.stories?.[0]?.pageTexts || [];

    for (let i = 0; i < pageTexts.length; i++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const text = pageTexts[i];
      const imageUrl = illustrations[i];

      if (imageUrl) {
        try {
          const imgBytes = await fetch(imageUrl).then((res) =>
            res.arrayBuffer()
          );
          const isPng = imageUrl.toLowerCase().endsWith('.png');
          const image = isPng
            ? await pdfDoc.embedPng(imgBytes)
            : await pdfDoc.embedJpg(imgBytes);
          const imgDims = image.scaleToFit(pageWidth - 2 * margin, 250);

          page.drawImage(image, {
            x: (pageWidth - imgDims.width) / 2,
            y: pageHeight - margin - imgDims.height,
            width: imgDims.width,
            height: imgDims.height,
          });
        } catch (imgErr) {
          console.warn(`Failed to embed image for page ${i}:`, imgErr);
        }
      }

      // Draw text below image
      page.drawText(text, {
        x: margin,
        y: margin + 100,
        size: 16,
        font,
        color: rgb(0, 0, 0),
        maxWidth: pageWidth - 2 * margin,
      });
    }

    const pdfBytes = await pdfDoc.save();
    res.locals.pdfBlob = Buffer.from(pdfBytes);
    return next();
  } catch (err) {
    const error: ServerError = {
      log: `PDF generation failed: ${err instanceof Error ? err.message : String(err)}`,
      status: 500,
      message: { err: 'Failed to generate PDF' },
    };
    return next(error);
  }
};
