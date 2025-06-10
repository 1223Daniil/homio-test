# Units Import API

This document describes how to use the API token to import units to a project.

## API Token

The API token is a secret token that allows you to authenticate with the API without a user session. This is useful for automated imports or integrations with other systems.

The token is stored in the environment variable `UNITS_IMPORT_API_TOKEN`. You should keep this token secret and not expose it in client-side code.

## API Endpoint

The API endpoint for importing units is:

```
POST /api/projects/:projectId/units/import
```

Where `:projectId` is the ID of the project to import units to.

## Authentication

To authenticate with the API token, include it in the `x-api-token` header:

```
x-api-token: your-api-token-here
```

## Request Format

The request body should be a JSON object with the following structure:

```json
{
  "projectId": "project-id",
  "units": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "Building A",
      "layout_id": "1BS",
      "availability_status": "Available",
      "base_price_excl_vat": "4410000",
      "final_price_incl_vat": "4582000",
      "selling_price": 4582000,
      "unit_description": "One Bedroom Suite",
      "view_description": "Mountain View"
    },
    // More units...
  ],
  "updateExisting": true,
  "defaultBuildingId": "building-id" // Optional
}
```

### Field Descriptions

- `projectId`: The ID of the project to import units to.
- `units`: An array of unit objects. Each unit object should have the following fields:
  - `unit_number`: The unit number (required).
  - `floor_number`: The floor number (required).
  - `building`: The building name. If not provided, the `defaultBuildingId` will be used.
  - `layout_id`: The layout ID.
  - `availability_status`: The availability status of the unit.
  - `base_price_excl_vat`: The base price excluding VAT.
  - `final_price_incl_vat`: The final price including VAT.
  - `selling_price`: The selling price.
  - `unit_description`: The unit description.
  - `view_description`: The view description.
  - Additional fields are also supported.
- `updateExisting`: Whether to update existing units or skip them. Defaults to `true`.
- `defaultBuildingId`: The ID of the building to use if a unit doesn't have a building specified.

## Response Format

The response will be a JSON object with the following structure:

```json
{
  "total": 10,
  "created": 8,
  "updated": 2,
  "skipped": 0,
  "errors": []
}
```

### Field Descriptions

- `total`: The total number of units in the request.
- `created`: The number of units that were created.
- `updated`: The number of units that were updated.
- `skipped`: The number of units that were skipped.
- `errors`: An array of error messages, if any.

## Using the API Client

We provide a command-line API client that you can use to import units using the API token. The client is available in both JavaScript and TypeScript versions.

### JavaScript Version

```bash
# Set the API token
export UNITS_IMPORT_API_TOKEN=your-api-token-here

# Run the client
node src/scripts/import-units-api-client.js --project-id your-project-id --file path/to/units.json --building-id optional-building-id
```

### TypeScript Version

```bash
# Set the API token
export UNITS_IMPORT_API_TOKEN=your-api-token-here

# Run the client
ts-node src/scripts/import-units-api-client.ts --project-id your-project-id --file path/to/units.json --building-id optional-building-id
```

## Example JSON File

Here's an example of a JSON file that you can use with the API client:

```json
{
  "data": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "Building A",
      "layout_id": "1BS",
      "availability_status": "Available",
      "base_price_excl_vat": "4410000",
      "final_price_incl_vat": "4582000",
      "selling_price": 4582000,
      "unit_description": "One Bedroom Suite",
      "view_description": "Mountain View"
    },
    {
      "unit_number": "A102",
      "floor_number": 1,
      "building": "Building A",
      "layout_id": "1BS",
      "availability_status": "Available",
      "base_price_excl_vat": "4410000",
      "final_price_incl_vat": "4582000",
      "selling_price": 4582000,
      "unit_description": "One Bedroom Suite",
      "view_description": "Mountain View"
    }
  ]
}
```

## Security Considerations

- Keep the API token secret and do not expose it in client-side code.
- Use HTTPS to encrypt the API token in transit.
- Consider rotating the API token periodically.
- The API token has full access to import units to any project, so be careful who you share it with. 