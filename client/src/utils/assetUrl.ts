/**
 * Centralized utility to resolve asset URLs (images, PDFs, documents)
 * and API Base URL across the client website.
 */
export const SERVER_URL = import.meta.env.PROD
  ? ''
  : (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_SERVER_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:3001'
    ).replace(/\/api(\/v1)?\/?$/, '');

export const API_BASE_URL = import.meta.env.PROD ? '/api' : `${SERVER_URL}/api`;

export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already absolute or embedded (http, https, blob, data)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Prepend server URL to relative path
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return SERVER_URL ? `${SERVER_URL}${normalizedPath}` : normalizedPath;
}

export interface DocumentItem {
  title: string;
  url: string;
  file_url?: string;
}

export function parseDatasheets(raw: any): DocumentItem[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        parsed = [];
      }
    } else if (trimmed.startsWith('/') || trimmed.startsWith('http')) {
      const resolved = getAssetUrl(trimmed);
      return [{ title: 'Technical Datasheet PDF', url: resolved, file_url: resolved }];
    } else {
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === 'object') {
      parsed = [parsed];
    } else {
      return [];
    }
  }

  return parsed
    .filter((item: any) => item && (item.url || item.href || item.link || item.file_url || typeof item === 'string'))
    .map((item: any) => {
      if (typeof item === 'string') {
        const resolved = getAssetUrl(item);
        return { title: 'Technical Datasheet PDF', url: resolved, file_url: resolved };
      }
      const rawUrl = item.file_url || item.url || item.href || item.link || '';
      const rawTitle = item.title || item.name || item.label || item.filename || 'Technical Datasheet PDF';
      const resolved = getAssetUrl(rawUrl);
      return {
        title: rawTitle,
        url: resolved,
        file_url: resolved,
      };
    })
    .filter((doc: DocumentItem) => doc.url.trim() !== '');
}

export const getImageUrl = getAssetUrl;
export default getAssetUrl;
