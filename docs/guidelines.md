# Development Guidelines

## Code Style and Structure

1. **File Organization**
   - Use feature-based organization within `src/components`
   - Keep related files close together
   - Use clear, descriptive file names

2. **Component Structure**
   ```typescript
   // 1. Imports
   import { useTranslations } from "next-intl";
   import { Card } from "@nextui-org/react";
   
   // 2. Types
   interface Props {
     data: DataType;
   }
   
   // 3. Component
   export function Component({ data }: Props) {
     // Hooks
     const t = useTranslations("Namespace");
     
     // Component logic
     
     return (
       <Card>
         {/* JSX */}
       </Card>
     );
   }
   ```

## UI Development

1. **Component Framework Usage**
   - Use NextUI for primary components
   - Use Mantine for specialized components (date pickers, notifications)
   - Avoid mixing UI frameworks in the same component

2. **Responsive Design**
   - Use NextUI's responsive utilities
   - Test on multiple screen sizes
   - Implement mobile-first design

3. **Theme Usage**
   - Use theme tokens for colors
   - Support both light and dark modes
   - Use CSS variables for custom values

## State Management

1. **When to Use Redux**
   - Global application state
   - Shared data between routes
   - Complex state interactions

2. **When to Use SWR**
   - API data fetching
   - Cache management
   - Real-time data

3. **When to Use Local State**
   - Component-specific UI state
   - Form state
   - Temporary data

## Internationalization

1. **Translation Keys**
   - Use nested structure
   - Group by feature
   - Include all UI text
   ```json
   {
     "feature": {
       "section": {
         "action": "Text"
       }
     }
   }
   ```

2. **Usage in Components**
   ```typescript
   const t = useTranslations("feature");
   
   // Use dot notation
   t("section.action")
   ```

## API Development

1. **Route Handler Structure**
   ```typescript
   export async function GET(request: NextRequest) {
     try {
       // 1. Validation
       const { searchParams } = new URL(request.url);
       
       // 2. Processing
       const data = await getData();
       
       // 3. Response
       return NextResponse.json(data);
     } catch (error) {
       // 4. Error handling
       console.error("Operation failed:", {
         error,
         context: "operation_name"
       });
       
       return NextResponse.json(
         { error: "Operation failed" },
         { status: 500 }
       );
     }
   }
   ```

2. **Database Operations**
   - Use Prisma transactions for related operations
   - Include proper error handling
   - Validate data before operations

## Error Handling

1. **Client-Side**
   ```typescript
   try {
     // Operation
   } catch (error) {
     // Log error
     console.error("Operation failed:", {
       error,
       context: "operation_name"
     });
     
     // Show user-friendly message
     toast.error(t("errors.operation_failed"));
   }
   ```

2. **Server-Side**
   - Log detailed error information
   - Return appropriate status codes
   - Provide user-friendly messages

## Testing

1. **Component Tests**
   - Test main functionality
   - Test error states
   - Test loading states
   - Test internationalization

2. **API Tests**
   - Test successful operations
   - Test error handling
   - Test input validation
   - Test authentication

## Performance

1. **Code Splitting**
   - Use dynamic imports
   - Lazy load components
   - Optimize bundle size

2. **Data Fetching**
   - Use SWR for caching
   - Implement pagination
   - Optimize query parameters

## Security

1. **Authentication**
   - Use NextAuth.js
   - Implement proper role checks
   - Secure API routes

2. **Data Validation**
   - Validate all inputs
   - Sanitize user data
   - Use proper content security policies

## Translations and i18n

### Structure
- Use PascalCase for main sections that are used with `useTranslations()` hook
- Use camelCase for nested keys
- Follow the standardized structure:

```json
{
    "Common": {
        "actions": {
            "save": "Save",
            "cancel": "Cancel",
            "delete": "Delete"
        },
        "status": {
            "active": "Active",
            "inactive": "Inactive",
            "draft": "Draft"
        },
        "validation": {
            "required": "This field is required",
            "invalid": "Invalid value"
        }
    },
    "Forms": {
        "fields": {
            "name": {
                "label": "Name",
                "hint": "Enter name",
                "error": "Invalid name"
            }
        }
    },
    "Projects": {
        "actions": {
            "create": "Create Project",
            "edit": "Edit Project"
        },
        "fields": {
            "name": {
                "label": "Project Name",
                "hint": "Enter project name",
                "error": "Invalid project name"
            }
        }
    }
}
```

### Usage in Components
```typescript
// For main sections
const t = useTranslations("Projects");
t("actions.create");  // -> "Create Project"

// For common translations
const t = useTranslations("Common");
t("actions.save");  // -> "Save"

// For form fields
const t = useTranslations("Forms");
<Input
    label={t("fields.name.label")}
    placeholder={t("fields.name.hint")}
    error={t("fields.name.error")}
/>
```

### Best Practices
1. Group related translations under main sections (PascalCase)
2. Use consistent key structure:
   - `actions` for user actions
   - `fields` for form fields
   - `status` for status values
   - `validation` for validation messages
3. Always include full field structure:
   ```json
   "fieldName": {
       "label": "Label text",
       "hint": "Help text",
       "error": "Error message"
   }
   ```
4. Use dynamic content with curly braces:
   ```typescript
   t("messages.deleteConfirm", { name: itemName })
   ```
5. Keep translations flat (max 3-4 levels deep)
6. Use consistent naming:
   - `...Label` for labels
   - `...Hint` for hints/placeholders
   - `...Error` for error messages

### File Organization
- Keep translations in `src/locales/{locale}.json`
- Support English (`en.json`) and Russian (`ru.json`)
- Ensure all keys exist in all language files
- Maintain identical structure across all files

### Adding New Translations
1. Add keys to all language files simultaneously
2. Follow the established structure
3. Include all required field properties
4. Run validation after adding new translations

### Migration Rules
1. Convert all keys to follow the new structure
2. Move common actions to `Common.actions`
3. Normalize field structures
4. Use consistent casing (PascalCase for main sections)
5. Follow the validation rules

