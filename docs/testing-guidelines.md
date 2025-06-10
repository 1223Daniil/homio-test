# Testing Guidelines

## Key Principles

1. **Type Safety First**
   - Use proper types from @prisma/client
   - Match test types with schema
   - Use undefined for optional fields
   - Use proper enums for status fields

2. **Mock Data Management**
   - Create reusable mock data generators
   - Keep mock data consistent with schema
   - Use proper Date objects
   - Handle optional fields correctly

3. **Test Organization**
   - Group related tests with describe blocks
   - Use clear test names
   - Follow AAA pattern
   - Keep tests focused and atomic

## Type Definitions Best Practices

```typescript
// ✅ Correct way
import { Course, CourseStatus } from "@prisma/client";

type CourseCreate = {
  id: string;
  title: string;
  description?: string;
  status: CourseStatus;
  imageUrl?: string;
  developerId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Mock Data Example
const mockDate = new Date("2024-01-01T00:00:00.000Z");

const createMockCourse = (
  override: Partial<CourseCreate> = {}
): CourseCreate => ({
  id: "test-id",
  title: "Test Course",
  description: undefined,
  status: CourseStatus.DRAFT,
  imageUrl: undefined,
  developerId: "dev-id",
  createdAt: mockDate,
  updatedAt: mockDate,
  ...override
});
```

## API Test Example

```typescript
it("creates a course successfully", async () => {
  const mockCourse = createMockCourse({
    status: CourseStatus.DRAFT
  });
  (prisma.course.create as jest.Mock).mockResolvedValue(mockCourse);

  const req = createApiRequest("POST", newCourseData);
  const response = await POST(req);
  const data = await parseResponseJson(response);

  expect(response.status).toBe(200);
  expect(data).toEqual(mockCourse);
  expect(prisma.course.create).toHaveBeenCalledWith({
    data: {
      ...newCourseData,
      status: CourseStatus.DRAFT,
      imageUrl: undefined
    },
    include: { developer: true }
  });
});
```

## Component Test Example

```typescript
it("renders course details correctly", () => {
  const mockCourse = createMockCourse({
    title: "Test Course",
    status: CourseStatus.PUBLISHED,
  });

  render(<CoursesList courses={[mockCourse]} {...mockHandlers} />);

  expect(screen.getByText("Test Course")).toBeInTheDocument();
  expect(screen.getByText("status.published")).toBeInTheDocument();
});
```

## Testing Checklist

1. **Setup**
   - [ ] Import proper types
   - [ ] Setup mock data generators
   - [ ] Configure test environment

2. **Type Safety**
   - [ ] Use proper types
   - [ ] Handle optional fields
   - [ ] Use enums for status
   - [ ] Use Date objects

3. **Test Coverage**
   - [ ] Test happy path
   - [ ] Test error cases
   - [ ] Test edge cases
   - [ ] Test loading states

4. **Cleanup**
   - [ ] Clear mocks between tests
   - [ ] Reset global state
   - [ ] Clean up test data

## Best Practices Summary

1. Start with proper types
2. Create reusable mocks
3. Use enums consistently
4. Handle dates properly
5. Test success and errors
6. Mock external dependencies
7. Use descriptive names
8. Keep tests focused
9. Clean up after tests
10. Document complex setups

## Testing AI Features

### Vector Search Tests

```typescript
describe('Property Vector Search', () => {
  const mockEmbedding = new Float32Array(384).fill(0.1);
  
  beforeEach(() => {
    (generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
  });

  it('creates property with vectors', async () => {
    const mockProperty = createMockProperty({
      title: 'Test Property',
      description: 'Test Description'
    });

    await createProperty(mockProperty);

    expect(generateEmbedding).toHaveBeenCalledWith('Test Property');
    expect(generateEmbedding).toHaveBeenCalledWith('Test Description');
    expect(prisma.property.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        titleVector: mockEmbedding,
        descriptionVector: mockEmbedding
      })
    });
  });

  it('searches properties by vector similarity', async () => {
    const query = 'modern apartment';
    await searchProperties(query);

    expect(generateEmbedding).toHaveBeenCalledWith(query);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
```

### Server Actions Tests

```typescript
describe('Property Server Actions', () => {
  it('creates property and revalidates path', async () => {
    const mockProperty = createMockProperty();
    const response = await createProperty(mockProperty);

    expect(response).toEqual(expect.objectContaining({
      id: expect.any(String),
      title: mockProperty.title
    }));
    expect(revalidatePath).toHaveBeenCalledWith('/properties');
  });

  it('handles validation errors', async () => {
    const invalidData = { ...mockProperty, price: 'invalid' };
    
    await expect(createProperty(invalidData)).rejects.toThrow(
      'Invalid input'
    );
  });
});
```

### Mock Data for AI Tests

```typescript
import { Property, PropertyStatus, PropertyType } from '@prisma/client';

type PropertyCreate = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

const createMockProperty = (
  override: Partial<PropertyCreate> = {}
): PropertyCreate => ({
  title: 'Test Property',
  description: 'Test Description',
  price: 100000,
  status: PropertyStatus.ACTIVE,
  type: PropertyType.APARTMENT,
  locationId: null,
  projectId: null,
  titleVector: null,
  descriptionVector: null,
  ...override
});

// Mock AI functions
jest.mock('@/lib/ai', () => ({
  generateEmbedding: jest.fn()
}));
```

## Testing Best Practices for AI Features

1. **Mock AI Services**
   - Mock embedding generation
   - Use consistent vector dimensions
   - Test error handling

2. **Vector Search Testing**
   - Test similarity calculations
   - Verify index usage
   - Test search relevance

3. **Performance Testing**
   - Measure response times
   - Test with large datasets
   - Monitor memory usage

4. **Error Cases**
   - Invalid input handling
   - Service unavailability
   - Rate limiting
   - Vector dimension mismatch
