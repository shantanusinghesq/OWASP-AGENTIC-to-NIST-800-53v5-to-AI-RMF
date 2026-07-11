// ─── Client-side File Download ──────────────────────────────────────
// Generates a download entirely in the browser (Blob + object URL + a
// synthesized <a download>), then revokes the URL. There is NO server and
// NO network request — this satisfies NFR-1/2 (static SPA on GitHub Pages).
// Lifted from components/DownloadData.tsx so the assessment tray (and
// future exporters) share one implementation.

export function triggerDownload(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Free the object URL regardless of whether the click path threw.
    URL.revokeObjectURL(url);
  }
}
