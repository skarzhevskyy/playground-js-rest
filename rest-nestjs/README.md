# NestJS Task Management REST API

A REST API for task management built with NestJS, TypeScript, Prisma, and SQLite.

## Features

- CRUD operations for tasks
- Input validation with class-validator
- OpenAPI/Swagger documentation
- SQLite database with Prisma ORM
- Unit and integration tests with Vitest

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite (better-sqlite3)
- **API Docs**: Swagger/OpenAPI
- **Testing**: Vitest + Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Create the database and run migrations:

```bash
npm run prisma:push
```

### Running the Application

**Development mode (with hot reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

The server will start at `http://localhost:3000`.

### API Documentation

Once the server is running, access the Swagger UI at:

```
http://localhost:3000/api
```

## API Endpoints

| Method | Endpoint     | Description        |
|--------|-------------|-------------------|
| GET    | /tasks      | Get all tasks      |
| GET    | /tasks/:id  | Get task by ID     |
| POST   | /tasks      | Create a new task  |
| PUT    | /tasks/:id  | Update a task      |
| DELETE | /tasks/:id  | Delete a task      |
| GET    | /health     | Health check       |

## Task Model

| Field       | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| id          | number | Auto-increment primary key                     |
| title       | string | Task title (required, max 255 chars)          |
| description | string | Task description (optional)                   |
| status      | enum   | `pending`, `in_progress`, `completed`         |
| createdAt   | date   | Auto-generated creation timestamp             |
| updatedAt   | date   | Auto-updated modification timestamp           |

## Example Requests

### Create a task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn NestJS", "description": "Complete the tutorial"}'
```

### Get all tasks

```bash
curl http://localhost:3000/tasks
```

### Get a task by ID

```bash
curl http://localhost:3000/tasks/1
```

### Update a task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

## Testing

### Run all tests

```bash
npm test
```

### Run tests once (CI mode)

```bash
npm run test:run
```

### Run only unit tests

```bash
npm run test:unit
```

### Run only integration tests

```bash
npm run test:integration
```

## Project Structure

```
rest-nestjs/
├── prisma/
│   └── schema.prisma          # Prisma schema with Task model
├── src/
│   ├── main.ts                # App bootstrap with Swagger
│   ├── app.module.ts          # Root module
│   ├── health.controller.ts   # Health check endpoint
│   ├── prisma/
│   │   ├── prisma.module.ts   # Prisma module
│   │   └── prisma.service.ts  # Prisma client service
│   └── task/
│       ├── task.module.ts     # Task feature module
│       ├── task.controller.ts # REST endpoints
│       ├── task.service.ts    # Business logic
│       ├── entities/
│       │   └── task.entity.ts # Task entity for Swagger
│       └── dto/
│           ├── create-task.dto.ts
│           └── update-task.dto.ts
├── tests/
│   ├── unit/
│   │   └── task.controller.spec.ts
│   └── integration/
│       └── task.e2e.spec.ts
├── data/                      # SQLite database location
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Scripts

| Script              | Description                           |
|---------------------|---------------------------------------|
| `npm run dev`       | Start in development mode             |
| `npm run build`     | Build for production                  |
| `npm run start`     | Start the application                 |
| `npm run start:prod`| Start production build                |
| `npm run prisma:generate` | Generate Prisma client          |
| `npm run prisma:migrate`  | Run database migrations         |
| `npm run prisma:push`     | Push schema to database         |
| `npm test`          | Run tests in watch mode               |
| `npm run test:run`  | Run all tests once                    |
| `npm run test:unit` | Run unit tests only                   |
| `npm run test:integration` | Run integration tests only     |

## License

MIT

