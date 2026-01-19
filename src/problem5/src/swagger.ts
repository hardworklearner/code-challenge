import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Crude Server API",
      version: "1.0.0",
      description: "Express + TypeScript CRUD API with SQLite persistence.",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      schemas: {
        Resource: {
          type: "object",
          required: [
            "id",
            "name",
            "type",
            "status",
            "metadata",
            "created_at",
            "updated_at",
          ],
          properties: {
            id: {
              type: "string",
              example: "b2e1d4a1-7e3b-4e4a-9b2d-9b4c0a0d2c3f",
            },
            name: { type: "string", example: "Alpha" },
            type: { type: "string", example: "token" },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "active",
            },
            metadata: {
              type: "object",
              additionalProperties: true,
              example: { note: "hello" },
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        CreateResourceInput: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: { type: "string", example: "Alpha" },
            type: { type: "string", example: "token" },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              example: "active",
            },
            metadata: {
              type: "object",
              additionalProperties: true,
              example: { note: "hello" },
            },
          },
        },
        UpdateResourceInput: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
            metadata: { type: "object", additionalProperties: true },
          },
        },
        ListResponse: {
          type: "object",
          properties: {
            total: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            offset: { type: "integer", example: 0 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/Resource" },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: { error: { type: "string" } },
        },
      },
    },
  },
  // We will define paths via JSDoc comments in route files:
  apis: ["src/routes/*.ts"],
});
