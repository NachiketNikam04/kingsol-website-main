export const SERVER_URL = import.meta.env.PROD
  ? ''
  : (
      import.meta.env.VITE_SERVER_URL ||
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:3001'
    ).replace(/\/api(\/v1)?\/?$/, '');

export const API_BASE_URL = import.meta.env.PROD ? '/api' : `${SERVER_URL}/api`;

export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already absolute or embedded
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return SERVER_URL ? `${SERVER_URL}${normalizedPath}` : normalizedPath;
}

export interface DocumentItem {
  title: string;
  url: string;
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
      return [{ title: 'Technical Datasheet PDF', url: getAssetUrl(trimmed) }];
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
    .filter((item: any) => item && (item.url || item.href || item.link || typeof item === 'string'))
    .map((item: any) => {
      if (typeof item === 'string') {
        return { title: 'Technical Datasheet PDF', url: getAssetUrl(item) };
      }
      const rawUrl = item.url || item.href || item.link || '';
      const rawTitle = item.title || item.name || item.label || item.filename || 'Technical Datasheet PDF';
      return {
        title: rawTitle,
        url: getAssetUrl(rawUrl),
      };
    })
    .filter((doc: DocumentItem) => doc.url.trim() !== '');
}

export const getImageUrl = getAssetUrl;
export default getAssetUrl;
