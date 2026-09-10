export async function shareUrl(title: string, text: string, url: string): Promise<boolean> {
  const shareData = {
    title,
    text,
    url: url || window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch {
      // User cancelled share dialog or error
      return false;
    }
  } else {
    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
      return true;
    } catch {
      return false;
    }
  }
}
