# Crude Server – Express + TypeScript

## Problem Statement

This project implements **Problem 5: A Crude Server**.

### Requirements

- Backend server using **ExpressJS**
- Written in **TypeScript**
- Full **CRUD interface**:
  - Create a resource
  - List resources with basic filters
  - Get resource details
  - Update resource details
  - Delete a resource
- **Persistent storage** using a simple database
- Simple **GUI** for interacting with the API
- Include **tests** and documentation

---

## Tech Stack

- **Node.js + Express**
- **TypeScript**
- **SQLite (better-sqlite3)** for persistence
- **Swagger (OpenAPI)** as API GUI
- **Jest + Supertest** for integration testing

---

## Project Structure

# Crude Server – Express + TypeScript

## Problem Statement

This project implements **Problem 5: A Crude Server**.

### Requirements

- Backend server using **ExpressJS**
- Written in **TypeScript**
- Full **CRUD interface**:
  - Create a resource
  - List resources with basic filters
  - Get resource details
  - Update resource details
  - Delete a resource
- **Persistent storage** using a simple database
- Simple **GUI** for interacting with the API
- Include **tests** and documentation

---

## Tech Stack

- **Node.js + Express**
- **TypeScript**
- **SQLite (better-sqlite3)** for persistence
- **Swagger (OpenAPI)** as API GUI
- **Jest + Supertest** for integration testing

---

## Project Structure

src/
├─ app.ts # Express app (testable)
├─ server.ts # Server entry point
├─ db.ts # SQLite setup
├─ swagger.ts # OpenAPI configuration
├─ routes/
│ └─ resources.ts # CRUD routes + Swagger JSDoc
└─ tests/
└─ resources.test.ts # Jest integration tests

---

## Setup

### 1. Install dependencies

```bash
npm install
```

## 2. Environment variables (optional)

Create **_.env:_**

```env
PORT=3000
DB_PATH=./data/app.db
```

### Running the Server

Development mode

```bash
npm run dev
```

Server will start at: http://localhost:3000

## CRUD API Endpoints

Base path:

```bash
/api/resources
```

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/api/resources`     | Create a resource                  |
| GET    | `/api/resources`     | List resources (filters supported) |
| GET    | `/api/resources/:id` | Get resource details               |
| PATCH  | `/api/resources/:id` | Update a resource                  |
| DELETE | `/api/resources/:id` | Delete a resource                  |

### Supported Filters

- type

- status

- q (search by name)

- limit, offset

## GUI Testing (Swagger)

Swagger UI is used as a simple GUI to interact with the API.

### Open Swagger UI

```bash
http://localhost:3000/docs
```

You can:

- Create resources

- List & filter resources

- Update resources

- Delete resources

- Inspect request/response schemas

### OpenAPI JSON

```bash
http://localhost:3000/openapi.json
```

## Testing (Jest + Supertest)

The project includes integration tests covering:

Health check

Full CRUD lifecycle

Filtering

Swagger endpoints

Correct 204 No Content behavior on DELETE

### Run Test

```bash
npm test
```

Tests use a separate SQLite test database and do not affect production data.

## Notes & Design Decisions

- SQLite chosen for simplicity and persistence

- Swagger UI used as API GUI (no client required)

- App/server split (app.ts vs server.ts) enables clean testing

- REST-compliant responses (204 No Content for DELETE)

- Defensive input validation

- UUIDs used as stable identifiers

##

## Future Improvements

- Authentication (JWT / API keys)

- Schema validation (Zod / Joi)

- Soft deletes

- Database migrations

- Pagination links

- Docker + CI pipeline

- More granular unit tests

## Conclusion

This project satisfies all requirements of Problem 5:

- Fully functional CRUD backend

- Persistent data storage

- GUI via Swagger (Additional)

- Automated tests (Additional)

- Clean TypeScript architecture
