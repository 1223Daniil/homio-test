# Unit Import System Documentation

## Overview

The Unit Import System allows for bulk importing of units into projects. The system supports importing units via JSON data, either directly entered or uploaded as a file. Units can be identified by building name rather than ID, making it easier to import data from external systems.

## Data Format

The import system accepts JSON data in the following format:

```json
{
  "project_id": "project-uuid",
  "currency": "THB",
  "price_update_date": "2023-05-15",
  "data": [
    {
      "availability_status": "Available",
      "base_price_excl_vat": "4410000",
      "building": "A",
      "comment": "",
      "final_price_incl_vat": "4582000",
      "floor_number": 1,
      "layout_id": "1BS",
      "selling_price": 4582000,
      "unit_description": "",
      "unit_number": "A101",
      "view_description": "Other",
      "extra_field_1": "data1",
      "extra_field_2": "data2"
    }
  ]
}
```

The system also supports alternative field naming formats, such as title case:

```json
{
  "project_id": "project-uuid",
  "currency": "THB",
  "price_update_date": "2023-05-15",
  "data": [
    {
      "Unit Number": "A402",
      "Building": "A",
      "Floor": 4,
      "Unit Description": "One Bedroom",
      "Layout ID": "1 bed",
      "View": "Mountain View",
      "Base Price (Excluding VAT)": "4,410,000",
      "Final Price (Including VAT)": "4,410,000",
      "Discount Price": "NA",
      "Availability Status": "Available",
      "Ownership": "Leasehold",
      "extra_field_1": "data1",
      "extra_field_2": "data2"
    }
  ]
}
```

### Field Descriptions

#### Root Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project_id` | String | No | UUID of the project. If not provided, the project ID from the URL will be used. |
| `currency` | String | No | Currency code (e.g., "THB", "USD"). If provided, the project's currency will be updated. |
| `price_update_date` | String | No | Date when prices were last updated (YYYY-MM-DD format). |
| `data` | Array | Yes | Array of unit objects. |

#### Unit Fields

| Field | Alternative Names | Type | Required | Description |
|-------|-------------------|------|----------|-------------|
| `unit_number` | `Unit Number` | String | Yes | Unique identifier for the unit within a building. |
| `floor_number` | `Floor` | Number/String | Yes | Floor number of the unit. |
| `building` | `Building` | String | Yes | Building name or identifier. The system will match this with existing buildings. |
| `availability_status` | `Availability Status` | String | No | Status of the unit ("Available", "Reserved", "Sold"). |
| `base_price_excl_vat` | `Base Price (Excluding VAT)` | Number/String | No | Base price excluding VAT. |
| `final_price_incl_vat` | `Final Price (Including VAT)` | Number/String | No | Final price including VAT. |
| `selling_price` | `Selling Price` | Number/String | No | Selling price of the unit. |
| `discount_price` | `Discount Price` | Number/String | No | Discounted price of the unit. |
| `unit_description` | `Unit Description` | String | No | Description of the unit. |
| `comment` | `Comment` | String | No | Additional comments about the unit. |
| `view_description` | `View` | String | No | Description of the view from the unit. |
| `layout_id` | `Layout ID` | String | No | Identifier for the unit layout. |
| `ownership` | `Ownership` | String | No | Type of ownership (e.g., "Leasehold", "Freehold"). |
| `*` | Any | No | Any additional fields will be stored as metadata. |

### Field Mapping

The system automatically maps fields from various formats to the internal database schema. For example:

| Input Field | Mapped To |
|-------------|-----------|
| `Unit Number` | `number` |
| `Floor` | `floor` |
| `Building` | Used for building lookup |
| `Unit Description` | `description` |
| `View` | `windowView` |
| `Base Price (Excluding VAT)` | `price` (if no other price fields) |
| `Final Price (Including VAT)` | `price` (if no selling price) |
| `Availability Status` | `status` (mapped to enum) |

### Price Handling

The system prioritizes prices in the following order:
1. `selling_price` / `Selling Price`
2. `final_price_incl_vat` / `Final Price (Including VAT)`
3. `base_price_excl_vat` / `Base Price (Excluding VAT)`
4. `discount_price` / `Discount Price`

The system automatically handles price formatting, including:
- Removing commas (e.g., "4,410,000" → 4410000)
- Converting strings to numbers
- Handling "NA" or empty values

### Status Mapping

The system maps availability status to the database enum as follows:
- "Available" → "AVAILABLE"
- "Reserved", "Booked" → "RESERVED"
- "Sold", "Sold Out" → "SOLD"

## API Endpoint

### POST `/api/projects/:id/units/import`

Imports units into a project.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `units` | Array | Yes | Array of unit objects. |
| `updateExisting` | Boolean | No | Whether to update existing units (default: true). |
| `defaultBuildingId` | String | No | Default building ID to use if building name is not found. |
| `currency` | String | No | Currency code to update the project with. |
| `priceUpdateDate` | String | No | Date when prices were last updated. |

#### Response

```json
{
  "total": 10,
  "created": 5,
  "updated": 3,
  "skipped": 2,
  "errors": ["Error processing unit A102: ..."]
}
```

## Building Name Matching

The system attempts to match building names in the following order:
1. Exact match (case-insensitive)
2. Partial match (building name starts with the provided name or vice versa)
3. Default building ID (if provided)

If no match is found, the unit is skipped and an error is recorded.

## Additional Fields

Any fields in the unit data that are not explicitly mapped to the database schema are stored as JSON metadata. This allows for storing additional information without modifying the database schema.

Examples of fields typically stored as metadata:
- `Ownership`
- `Discount Price`
- Custom fields like `extra_field_1`, `extra_field_2`

## User Interface

The import system provides a user interface with the following features:
- Option to select a default building
- Toggle for updating existing units
- Choice between direct JSON input or file upload
- Example JSON format for reference
- Feedback on import results (total, created, updated)

## Error Handling

The system provides detailed error messages for common issues:
- Invalid JSON format
- Missing required fields
- Building not found
- Validation errors

## Usage Examples

### Basic Import

```json
{
  "data": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "A",
      "selling_price": 4582000,
      "availability_status": "Available"
    }
  ]
}
```

### Import with Title Case Fields

```json
{
  "data": [
    {
      "Unit Number": "A402",
      "Building": "A",
      "Floor": 4,
      "Unit Description": "One Bedroom",
      "Layout ID": "1 bed",
      "View": "Mountain View",
      "Base Price (Excluding VAT)": "4,410,000",
      "Availability Status": "Available"
    }
  ]
}
```

### Import with Currency Update

```json
{
  "currency": "USD",
  "price_update_date": "2023-05-15",
  "data": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "A",
      "selling_price": 150000,
      "availability_status": "Available"
    }
  ]
}
```

### Import with Additional Fields

```json
{
  "data": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "A",
      "selling_price": 4582000,
      "availability_status": "Available",
      "ownership": "Leasehold",
      "promotion_code": "SUMMER2023",
      "furniture_package": "Premium",
      "agent_commission": 3.5
    }
  ]
}
```

## Limitations and Known Issues

- The system currently has type issues with the `price` field when it's undefined
- There are issues with the `metadata` field on the Project model
- Building name matching is case-insensitive but may not handle special characters well
- Price formatting with commas may need additional handling
- "NA" values need special handling for numeric fields

## Future Improvements

- Add support for importing units from Excel/CSV files
- Improve building name matching algorithm
- Add validation for layout IDs
- Add support for batch processing of large imports
- Implement progress tracking for large imports
- Add better handling for formatted numbers and special values like "NA"
- Support more field naming conventions and formats 