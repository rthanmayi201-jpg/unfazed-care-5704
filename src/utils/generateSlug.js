import { RESERVED_SLUGS } from './constants.js';

export function generateSlug(name) {
  if (!name) return '';
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/^dr\.\s*|^dr\s*/i, 'dr-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (RESERVED_SLUGS.includes(slug)) {
    slug = `${slug}-therapist`;
  }
  return slug;
}

export function isValidSlug(slug) {
  if (!slug || slug.length < 3) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) return false;
  return true;
}
