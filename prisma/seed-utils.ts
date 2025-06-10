export function generateSlug(text: string, prefix?: string): string {
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

  // Add timestamp to ensure uniqueness
  slug = `${slug}-${Date.now().toString(36)}`;

  return slug;
}

export function generateDeveloperSlug(name: string): string {
  return generateSlug(name, "developer");
}

export function generateProjectSlug(name: string): string {
  return generateSlug(name, "project");
}

export function generateCourseSlug(title: string): string {
  return generateSlug(title, "course");
}
