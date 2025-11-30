# REST API with Node.js & TypeScript

Examples demonstrating how to create a REST API with Node.js and TypeScript using three different frameworks.

Each implementation provides the same Task CRUD API with identical functionality, allowing you to compare the approaches side by side.

---

## The Three Best Options (2025)

| Directory | Framework | Description |
|-----------|-----------|-------------|
| [`rest-express/`](./rest-express/) | Express.js + TypeScript | Most flexible, minimal |
| [`rest-fastify/`](./rest-fastify/) | Fastify + TypeScript | Fastest + modern |
| [`rest-nestjs/`](./rest-nestjs/) | NestJS | Most complete, batteries included |

---

## Option A — Express.js + TypeScript

**Best when you want a lightweight framework and full control.**

📁 [`rest-express/`](./rest-express/)

| Pros | Cons |
|------|------|
| ✔ Huge ecosystem | ✘ Requires manual middleware setup |
| ✔ Easy to understand | ✘ No built-in validation or DI |
| ✔ Works with any architecture | |
| ✔ Most tutorials and resources available | |

---

## Option B — Fastify + TypeScript

**Best when you want performance + developer experience.**

📁 [`rest-fastify/`](./rest-fastify/)

| Pros | Cons |
|------|------|
| ✔ Extremely fast (2–3× faster than Express) | ✘ Smaller community than Express |
| ✔ Built-in validation (JSON Schema) | |
| ✔ First-class TypeScript support | |
| ✔ Plugins & encapsulation | |
| ✔ Low overhead, async by default | |

---

## Option C — NestJS

**Best for enterprise, microservices, or structured large projects.**

📁 [`rest-nestjs/`](./rest-nestjs/)

| Pros | Cons |
|------|------|
| ✔ Dependency injection | ✘ Heavy for small APIs |
| ✔ Decorators | ✘ Steeper learning curve |
| ✔ Module system | |
| ✔ Built-in testing, validation, OpenAPI, interceptors | |
| ✔ Easy to scale | |
| ✔ Angular-like architecture | |

---

## Comparison Chart

| Feature | Express.js | Fastify | NestJS |
|---------|:----------:|:-------:|:------:|
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **TypeScript Support** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Built-in Validation** | ❌ | ✅ JSON Schema | ✅ class-validator |
| **Dependency Injection** | ❌ | ❌ | ✅ |
| **Learning Curve** | Easy | Easy | Moderate |
| **Community Size** | Largest | Growing | Large |
| **Boilerplate** | Minimal | Minimal | More structured |
| **Best For** | Simple APIs, Prototypes | High-perf APIs | Enterprise, Microservices |

---

## Tech Stack

All implementations share:
- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** SQLite
- **Testing:** Vitest

---

## License

MIT

