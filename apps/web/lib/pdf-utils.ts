/**
 * PDF Parsing & Rendering Utilities (CDN-based for Next.js static builds)
 */

const loadScript = (id: string, src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

export const loadPdfjs = async (): Promise<any> => {
  await loadScript("pdfjs-lib-script", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  const pdfjsLib = (window as any).pdfjsLib;
  if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  return pdfjsLib;
};

export const getPdfDoc = async (file: File): Promise<any> => {
  const pdfjsLib = await loadPdfjs();
  const arrBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrBuffer });
  return await loadingTask.promise;
};

export const renderPdfPageDataUrl = async (
  pdfDoc: any,
  pageNum: number,
  scale: number = 0.4
): Promise<string> => {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas 2d context");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  const dataUrl = canvas.toDataURL("image/png");
  
  // Clean up canvas
  canvas.width = 0;
  canvas.height = 0;
  
  return dataUrl;
};
