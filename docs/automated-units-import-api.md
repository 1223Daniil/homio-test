# Automated Units Import API

This API endpoint allows for automated import of unit data into a project without requiring user interaction. It's designed to be used by automated systems like n8n workflows.

## Authentication

Authentication is done via an API token that must be provided in the `x-api-token` header. This token must match the `UNITS_IMPORT_API_TOKEN` environment variable.

```
x-api-token: your-secure-api-token
```

## Endpoint

```
POST /api/projects/:projectId/units/import/automated
```

Where `:projectId` is the ID of the project to import units into.

## Request Body

The request body should be a JSON object with the following structure:

```json
{
  "data": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "Tower A",
      "availability_status": "AVAILABLE",
      "base_price_excl_vat": 5000000,
      "final_price_incl_vat": 5350000,
      "selling_price": 5350000,
      "discount_price": 5000000,
      "unit_description": "Spacious 1-bedroom unit with sea view",
      "view_description": "Sea view",
      "comment": "Corner unit",
      "area": 65.5,
      "bedrooms": 1,
      "bathrooms": 1,
      "ownership": "Freehold"
    }
    // ... more units
  ],
  "updateExisting": true,
  "defaultBuildingId": "building-id-123",
  "currency": "THB",
  "priceUpdateDate": "2023-06-15"
}
```

### Fields

- `data` (required): An array of unit objects. Each unit object can have any fields, which will be mapped to the system's fields.
- `updateExisting` (optional): Whether to update existing units. Defaults to `true`.
- `defaultBuildingId` (optional): The ID of the building to use if a unit doesn't specify a building.
- `currency` (optional): The currency of the prices.
- `priceUpdateDate` (optional): The date when the prices were updated.

### Unit Fields

The system will try to map the fields in each unit object to the system's fields. The following fields are recognized:

- `unit_number`: The unit number (required)
- `floor_number`: The floor number
- `building`: The building name (will be mapped to a building ID)
- `availability_status`: The availability status (AVAILABLE, RESERVED, SOLD)
- `base_price_excl_vat`: The base price excluding VAT
- `final_price_incl_vat`: The final price including VAT
- `selling_price`: The selling price
- `discount_price`: The discount price
- `unit_description`: The unit description
- `view_description`: The view description
- `comment`: Additional comments
- `area`: The unit area in square meters
- `bedrooms`: The number of bedrooms
- `bathrooms`: The number of bathrooms
- `ownership`: The ownership type

## Field Mapping

The system will try to map the fields in the request to the system's fields using the following strategies:

1. If a default field mapping exists for the project, it will be used.
2. If no default mapping exists, the system will try to automatically map fields based on their names.

## Response

### Success Response

```json
{
  "message": "Import completed",
  "results": {
    "total": 10,
    "created": 5,
    "updated": 3,
    "skipped": 2,
    "errors": []
  }
}
```

### Error Response

```json
{
  "error": "errorType",
  "message": "Error message",
  "details": "Detailed error information"
}
```

Possible error types:
- `unauthorized`: Invalid API token
- `projectNotFound`: Project not found
- `invalidJson`: Invalid JSON in request body
- `validationError`: Invalid data in request
- `importError`: Error during import
- `processingError`: Error processing import
- `unexpectedError`: An unexpected error occurred

## Example Usage with n8n

Here's an example of how to use this API with n8n:

1. Use an HTTP Request node with the following configuration:
   - Method: POST
   - URL: `https://your-domain.com/api/projects/your-project-id/units/import/automated`
   - Headers:
     - `Content-Type`: `application/json`
     - `x-api-token`: `your-secure-api-token`
   - Body: JSON object as described above

2. Connect this node to your data source (e.g., a Google Sheets node, CSV node, or another HTTP Request node).

3. Use a Function node before the HTTP Request to transform your data into the required format.

## Notes

- The import process is transactional, meaning that if an error occurs during the import, all changes will be rolled back.
- The system will create an import record in the database to track the import.
- Units without a unit number will be skipped.
- If a unit with the same number already exists in the same building, it will be updated if `updateExisting` is `true`, otherwise it will be skipped. 