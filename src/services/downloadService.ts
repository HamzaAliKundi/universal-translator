export async function downloadFile(
  url: string,
  filename: string,
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to initialize download');

    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (total) {
        onProgress((loaded / total) * 100);
      }
    }

    const blob = new Blob(chunks);
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

export function getDownloadProgress(downloadId: string): Promise<number> {
  // This is a mock implementation. In a real app, you'd fetch the progress from your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() * 100);
    }, 500);
  });
}