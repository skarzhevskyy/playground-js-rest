# Fastify REST API - Task Management

A RESTful API for task management built with Fastify, TypeScript, TypeORM, and SQLite.

## Features

- **Fastify** - Fast and low overhead web framework
- **TypeScript** - Type safety and better developer experience
- **TypeORM** - ORM for database operations
- **SQLite (better-sqlite3)** - Lightweight, file-based database
- **OpenAPI Documentation** - Auto-generated API docs via @fastify/swagger
- **Vitest** - Fast unit and integration testing

## Prerequisites

- Node.js 18+ 
- npm 9+

## Installation

```bash
# Navigate to the project directory
cd rest-fastify

# Install dependencies
npm install
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

```bash
# Build the project
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:3000` by default.

## API Documentation

Once the server is running, access the OpenAPI documentation at:

- **Swagger UI**: http://localhost:3000/api-docs

## API Endpoints

| Method | Endpoint     | Description         |
|--------|--------------|---------------------|
| GET    | /tasks       | List all tasks      |
| GET    | /tasks/:id   | Get task by ID      |
| POST   | /tasks       | Create a new task   |
| PUT    | /tasks/:id   | Update a task       |
| DELETE | /tasks/:id   | Delete a task       |
| GET    | /health      | Health check        |

### Example Requests

#### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My Task", "description": "Task description", "status": "pending"}'
```

#### Get All Tasks

```bash
curl http://localhost:3000/tasks
```

#### Get a Task by ID

```bash
curl http://localhost:3000/tasks/1
```

#### Update a Task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

#### Delete a Task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

## Task Schema

```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Optional description",
  "status": "pending | in_progress | completed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests once (no watch mode)
npm run test:run

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Project Structure

```
rest-fastify/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Fastify app setup
│   ├── config/
│   │   └── database.ts       # TypeORM DataSource config
│   ├── entities/
│   │   └── Task.ts           # TypeORM Task entity
│   ├── routes/
│   │   └── taskRoutes.ts     # Task CRUD routes
│   └── controllers/
│       └── taskController.ts # Business logic
├── tests/
│   ├── unit/
│   │   └── taskController.test.ts
│   └── integration/
│       └── taskRoutes.test.ts
├── data/                     # SQLite database files
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Environment Variables

| Variable | Default     | Description          |
|----------|-------------|----------------------|
| PORT     | 3000        | Server port          |
| HOST     | 0.0.0.0     | Server host          |
| NODE_ENV | development | Environment mode     |

## License

MIT

