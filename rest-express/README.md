# Task Management REST API

A RESTful API for managing tasks built with Express.js, TypeScript, and SQLite3.

## Features

- Full CRUD operations for Tasks
- SQLite3 database with better-sqlite3
- OpenAPI/Swagger documentation with JSDoc
- Unit and integration tests with Vitest
- TypeScript for type safety

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

```bash
# Navigate to the project directory
cd rest-express

# Install dependencies
npm install
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Production Mode

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start
```

## API Documentation

Once the server is running, access the interactive Swagger UI at:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/:id | Get a task by ID |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |
| GET | /health | Health check endpoint |

## Task Schema

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Task Status Values

- `pending` - Task is not started (default)
- `in_progress` - Task is in progress
- `completed` - Task is completed

## Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Project Structure

```
rest-express/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── swagger.ts            # OpenAPI configuration
│   ├── config/
│   │   └── database.ts       # SQLite3 database connection
│   ├── models/
│   │   └── Task.ts           # Task model with CRUD operations
│   ├── routes/
│   │   └── taskRoutes.ts     # REST route definitions
│   └── controllers/
│       └── taskController.ts # Request handlers
├── tests/
│   ├── unit/
│   │   └── taskController.test.ts
│   └── integration/
│       └── taskRoutes.test.ts
├── data/                     # SQLite database files (auto-created)
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Example API Usage

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Get Task by ID

```bash
curl http://localhost:3000/api/tasks/1
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |

## License

MIT

