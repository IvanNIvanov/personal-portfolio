/**
 * Utility to resolve asset URLs correctly across local dev, custom domains,
 * and GitHub Pages subpaths (e.g. /personal-portfolio/).
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';
  
  // Remote URL or inline data URI
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // Strip leading slash or dot-slash
  const cleanPath = path.replace(/^(\.\/|\/)/, '');

  // Safely encode URI components per segment so spaces are %20 while slashes remain /
  const encodedSegments = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');

  return `./${encodedSegments}`;
}
