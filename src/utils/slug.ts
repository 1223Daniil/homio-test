/**
 * Generates a URL-friendly slug from a given text
 * @param text The text to convert into a slug
 * @param prefix Optional prefix for the slug (e.g., 'course', 'project', 'developer')
 * @param uniqueId Optional unique identifier to append to the slug
 * @returns A URL-friendly slug
 */
export function generateSlug(
  text: string,
  prefix?: string,
  uniqueId?: string
): string {
  // Convert to lowercase and trim
  let slug = text.toLowerCase().trim();

  // Normalize unicode characters (remove diacritics)
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Replace special characters with spaces
  slug = slug.replace(/[^\w\s-]/g, " ");

  // Replace spaces with hyphens and remove consecutive hyphens
  slug = slug.replace(/\s+/g, "-").replace(/-+/g, "-");

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  // Truncate to reasonable length (50 chars)
  slug = slug.slice(0, 50);

  // Add prefix if provided
  if (prefix) {
    slug = `${prefix}-${slug}`;
  }

  // Add unique identifier if provided
  if (uniqueId) {
    slug = `${slug}-${uniqueId}`;
  }

  return slug;
}

/**
 * Generates a course-specific slug
 * @param title Course title
 * @param uniqueId Optional unique identifier
 * @returns A URL-friendly course slug
 */
export function generateCourseSlug(title: string, uniqueId?: string): string {
  return generateSlug(title, "course", uniqueId);
}

/**
 * Generates a project-specific slug
 * @param name Project name
 * @param uniqueId Optional unique identifier
 * @returns A URL-friendly project slug
 */
export function generateProjectSlug(name: string, uniqueId?: string): string {
  return generateSlug(name, "project", uniqueId);
}

/**
 * Generates a developer-specific slug
 * @param name Developer name
 * @param uniqueId Optional unique identifier
 * @returns A URL-friendly developer slug
 */
export function generateDeveloperSlug(name: string, uniqueId?: string): string {
  return generateSlug(name, "developer", uniqueId);
}
