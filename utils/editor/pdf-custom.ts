import { jsPDF } from "jspdf";

/**
 * Generates a high-quality PDF from a DOCX buffer using an isolated Iframe.
 * This bypasses jsPDF.html() to avoid its bug of copying main-window styles
 * which causes the "oklch" html2canvas crash.
 */
export async function generateCustomPdf(docxBuffer: ArrayBuffer, title: string): Promise<Blob> {
  console.log("[pdf-custom] Starting isolated HTML to PDF conversion for:", title);

  const docx = await import("docx-preview");
  const html2canvas = (await import("html2canvas")).default;

  // 1. Create an isolated Iframe (The "Clean Room")
  const iframe = document.createElement("iframe");
  // Must be in the document flow but invisible, otherwise html2canvas might capture a blank area
  iframe.style.position = "absolute";
  iframe.style.left = "0";
  iframe.style.top = "0";
  iframe.style.width = "816px"; // A4 width in px at 96dpi
  iframe.style.height = "1122px"; // A4 height roughly
  iframe.style.zIndex = "-1000";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Could not access iframe document");
  }

  // 2. Initialize the clean room with basic resets and NO external styles
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: #ffffff !important; min-height: 100vh; }
          .docx-wrapper { 
            padding: 0 !important; 
            background: #ffffff !important; 
            box-shadow: none !important; 
            margin: 0 !important; 
          }
          .docx-preview-custom { min-height: 1122px; background: #ffffff !important; }
          
          /* Remove borders/shadows from individual pages */
          .docx-wrapper > section.docx {
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
            background: #ffffff !important;
          }

          /* Force images to not overlap text */
          .docx-wrapper img {
            position: relative !important;
            display: inline-block !important;
            max-width: 100% !important;
            height: auto !important;
            margin-top: 10px !important;
            margin-bottom: 10px !important;
            z-index: 10 !important;
          }
          
          /* Ensure paragraphs have proper spacing */
          .docx-wrapper p {
            min-height: 1em;
            clear: both;
          }
        </style>
      </head>
      <body>
        <div id="render-target"></div>
      </body>
    </html>
  `);
  iframeDoc.close();

  const container = iframeDoc.getElementById("render-target")!;

  try {
    // 3. Render DOCX to HTML inside the clean iframe
    await docx.renderAsync(docxBuffer, container, undefined, {
      className: "docx-preview-custom",
      inWrapper: true,
      ignoreLastRenderedPageBreak: false,
      ignoreHeight: false,
      ignoreWidth: false,
      useBase64URL: true, // Crucial for iframe rendering: forces images to be inline Base64 instead of Blob URLs
    });

    // Ensure iframe height matches the rendered content height to avoid clipping
    const wrapper = iframeDoc.querySelector(".docx-wrapper") as HTMLElement;
    if (wrapper) {
       iframe.style.height = `${wrapper.scrollHeight}px`;
    }

    // 4. Wait for images to load inside the iframe
    const images = Array.from(iframeDoc.querySelectorAll("img"));
    console.log(`[pdf-custom] Waiting for ${images.length} images to load in iframe...`);
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(r => { 
        img.onload = r; 
        img.onerror = () => { console.warn("Image failed to load in PDF preview", img.src); r(null); }; 
      });
    }));
    
    // Give docx-preview time to finalize layout after images load
    await new Promise(r => setTimeout(r, 1500));

    // Force ALL elements to have a white background just to be absolutely sure
    const allElements = iframeDoc.querySelectorAll("*");
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        htmlEl.style.backgroundColor = "white";
        htmlEl.style.borderColor = "white";
        htmlEl.style.boxShadow = "none";
      }
    });

    // 5. Capture individual pages
    const pages = Array.from(iframeDoc.querySelectorAll(".docx-wrapper > section")) as HTMLElement[];
    if (pages.length === 0) {
      console.warn("[pdf-custom] No sections found, falling back to wrapper");
      pages.push(iframeDoc.querySelector(".docx-wrapper") as HTMLElement || container);
    }

    console.log(`[pdf-custom] Taking snapshots of ${pages.length} pages...`);
    
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 595.28; // A4 width in pt
    const pdfHeight = 841.89; // A4 height in pt

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      
      // Ensure the page takes exactly the full width
      pageEl.style.margin = "0";
      pageEl.style.padding = "0";
      pageEl.style.width = "100%";
      pageEl.style.border = "none";
      
      const canvas = await html2canvas(pageEl, {
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      if (i > 0) {
        doc.addPage();
      }
      
      // DO NOT preserve aspect ratio if it causes letterboxing (the grey border might be the PDF background showing through)
      // Force the image to cover the entire A4 page to eliminate any gaps
      doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    console.log("[pdf-custom] PDF generation successful");
    return doc.output("blob");

  } catch (error) {
    console.error("[pdf-custom] PDF Error:", error);
    throw error;
  } finally {
    // 6. Cleanup the clean room
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}
