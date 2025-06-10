# SEO Guidelines for Next.js 15

## Table of Contents

1. [Metadata API](#metadata-api)
2. [URL Structure and Slugs](#url-structure-and-slugs)
3. [Content Structure](#content-structure)
4. [Performance Optimization](#performance-optimization)
5. [AI Content and Localization SEO](#ai-content-and-localization-seo)

## Metadata API

### Basic Metadata

```typescript
// app/[locale]/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Site Name',
    default: 'Site Name',
  },
  description: 'Site description',
  keywords: ['keyword1', 'keyword2'],
};

// app/[locale]/page.tsx
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/images/og.jpg'],
  },
};
```

### Dynamic Metadata

```typescript
// app/[locale]/projects/[id]/page.tsx
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const project = await getProject(params.id);
  
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.imageUrl],
    },
  };
}
```

### Best Practices

1. Keep titles between 50-60 characters
2. Meta descriptions between 150-160 characters
3. Use relevant keywords naturally
4. Include brand name in titles
5. Make descriptions actionable

## URL Structure and Slugs

### Slug Format Standards

- All slugs should be in lowercase
- Use hyphens (-) to separate words
- Remove special characters and accents
- Keep URLs concise but descriptive
- Include relevant keywords when possible
- Maximum length: 60 characters

### Default Slug Format Rules

1. Convert text to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep only a-z, 0-9, and hyphens)
4. Remove consecutive hyphens
5. Trim hyphens from start and end
6. Add unique identifier at the end (if needed for uniqueness)

### Examples:

```
Original Title: "Introduction to Real Estate Market Analysis (2024)"
Slug: introduction-to-real-estate-market-analysis-2024

Original Title: "Property Investment & ROI Calculation"
Slug: property-investment-roi-calculation

Original Title: "5 Best Practices for Real Estate"
Slug: 5-best-practices-for-real-estate
```

### Slug Generation for Different Content Types:

#### Courses

```
Format: {course-title}-{unique-id}
Example: introduction-to-real-estate-cm4vla5mi
```

#### Lessons

```
Format: {lesson-title}-{unique-id}
Example: understanding-market-analysis-l4vla5mi
```

#### Projects

```
Format: {project-name}-{unique-id}
Example: laguna-park-2-p4vla5mi
```

## Content Structure

### Heading Hierarchy

- Use only one H1 per page
- Structure content with H2-H6 logically
- Include keywords in headings naturally
- Keep headings descriptive and concise

### Content Guidelines

1. Use descriptive anchor text for links
2. Structure content with short paragraphs
3. Use bullet points and lists for better readability
4. Include relevant images with alt text
5. Maintain keyword density without stuffing

## Performance Optimization

### Image Optimization

1. Use next/image for automatic optimization
```typescript
import Image from 'next/image';

export default function OptimizedImage() {
  return (
    <Image
      src="/image.jpg"
      alt="Description"
      width={800}
      height={600}
      priority={true} // For LCP images
    />
  );
}
```

2. Use responsive images with sizes prop
```typescript
<Image
  src="/image.jpg"
  alt="Description"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

3. Implement priority loading for LCP
4. Use blur placeholder for better UX
5. Configure domains in next.config.js

### Technical Optimization

1. Use Server Components by default
2. Implement route segments
3. Use Streaming and Suspense
4. Enable static optimization where possible
5. Implement ISR for dynamic content

```typescript
// app/[locale]/projects/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

## Implementation Notes

### Slug Generation Function

```typescript
function generateSlug(text: string, uniqueId?: string): string {
  return (
    text
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing spaces
      .normalize("NFD") // Normalize unicode characters
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove consecutive hyphens
      .replace(/^-+|-+$/g, "") + // Remove leading/trailing hyphens
    (uniqueId ? `-${uniqueId}` : "")
  ); // Add unique identifier if provided
}
```

### Usage Examples

```typescript
// For courses
const courseSlug = generateSlug(courseTitle, courseId);

// For lessons
const lessonSlug = generateSlug(lessonTitle, lessonId);

// For projects
const projectSlug = generateSlug(projectName, projectId);
```

## Regular Maintenance

### SEO Audit Checklist

1. Check Core Web Vitals in Search Console
2. Monitor Server Components usage
3. Review metadata implementation
4. Analyze content structure
5. Update outdated content
6. Verify mobile responsiveness
7. Check search console for issues

### Monitoring Tools

1. Google Search Console
2. Next.js Analytics
3. Core Web Vitals
4. PageSpeed Insights
5. Chrome DevTools

## Additional Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Web Vitals](https://web.dev/vitals/) for performance metrics

# AI Content and Localization SEO

## AI-Generated Content Guidelines

### Quality Standards
1. Ensure AI content adds value
2. Review and edit AI-generated text
3. Keep content factual and accurate
4. Maintain natural language flow
5. Avoid duplicate content

### Metadata Implementation

```typescript
// app/[locale]/ai/property-description/[id]/page.tsx
export async function generateMetadata(
  { params: { id, locale } }
): Promise<Metadata> {
  const property = await getProperty(id);
  const t = await getTranslations({ locale, namespace: 'PropertyAI' });
  
  return {
    title: t('metadata.title', { property: property.title }),
    description: t('metadata.description', { 
      property: property.title,
      location: property.location?.name 
    }),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  };
}
```

### Structured Data

```typescript
export function PropertyJsonLd({ property, aiDescription }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          description: aiDescription,
          price: property.price,
          currency: 'USD'
        })
      }}
    />
  );
}
```

## Localized Metadata

### Configuration

```typescript
// app/[locale]/layout.tsx
export async function generateMetadata(
  { params: { locale } }
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
    title: {
      template: t('title.template'),
      default: t('title.default')
    },
    description: t('description'),
    openGraph: {
      title: t('og.title'),
      description: t('og.description'),
      locale: locale,
      alternateLocales: ['en', 'ru'].filter(l => l !== locale)
    },
    alternates: {
      languages: {
        'en': '/en',
        'ru': '/ru'
      }
    }
  };
}
```

### Translation Structure

```json
{
  "Metadata": {
    "title": {
      "template": "%s | Homio",
      "default": "Homio - Real Estate Platform"
    },
    "description": "Find your perfect home with AI assistance",
    "og": {
      "title": "Homio - AI-Powered Real Estate",
      "description": "Discover your dream home with advanced AI search"
    }
  },
  "PropertyAI": {
    "metadata": {
      "title": "{property} - AI Analysis",
      "description": "Detailed AI analysis of {property} in {location}"
    }
  }
}
```

### Implementation Checklist

1. URL Structure
   - Use locale in URL path
   - Implement hreflang tags
   - Set canonical URLs

2. Content
   - Translate all meta tags
   - Localize structured data
   - Adapt content for local markets

3. Technical Setup
   - Set lang attribute
   - Configure alternates
   - Handle redirects properly

4. Monitoring
   - Track performance by locale
   - Monitor indexing status
   - Check local search rankings
