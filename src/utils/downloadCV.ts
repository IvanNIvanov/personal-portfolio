/**
 * Robust helper to download the CV as a binary Blob directly in the browser,
 * avoiding blank tabs, iframe sandboxing issues, or damaged HTML file downloads.
 */
export async function downloadCV(fileName?: string): Promise<boolean> {
  try {
    let res = await fetch('/api/cv', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      // Fallback for static hosting like GitHub Pages
      res = await fetch('./cv.pdf');
    }

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const blob = await res.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = fileName || 'Ivan_Ivanov_CV.pdf';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(downloadUrl);
    }, 2000);

    return true;
  } catch (err) {
    console.warn('Blob download fallback to window.location:', err);
    window.location.href = '/api/cv';
    return false;
  }
}
