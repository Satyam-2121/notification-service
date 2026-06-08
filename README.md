# Notification Service

A backend service that processes notifications asynchronously using Redis and BullMQ.

Instead of sending notifications directly from the API, requests are placed into a queue and processed by background workers. This approach improves performance, reliability, and scalability.

## Why I Built This

I wanted to learn how modern backend systems handle time-consuming tasks without blocking API requests.

This project helped me understand:

* Redis
* BullMQ
* Background Workers
* Queue-based Architecture
* Request Validation
* Asynchronous Processing

## Tech Stack

* TypeScript
* Express.js
* Redis
* BullMQ
* Zod

## System Design

```text
Client
   │
POST /notify
   │
   ▼
Express API
   │
   ▼
Zod Validation
   │
   ▼
BullMQ Queue
   │
   ▼
Redis
   │
   ▼
Worker
   │
   ▼
Notification Processing
```

## Features

### Create Notification

Accepts notification requests through a REST API.

### Validation Layer

All incoming requests are validated using Zod schemas.

### Queue Processing

Notifications are pushed into a BullMQ queue backed by Redis.

### Background Workers

Workers consume jobs independently from the API server.

### Asynchronous Architecture

The API responds immediately while the worker processes notifications in the background.

## API Example

Request:

```json
{
  "type": "email",
  "to": "test@example.com",
  "subject": "Hello",
  "message": "First notification"
}
```

Response:

```json
{
  "status": "queued"
}
```

## Running Locally

Install dependencies:

```bash
npm install
```

Start Redis:

```bash
redis-server
```

Start API:

```bash
npx ts-node-dev src/app.ts
```

Start Worker:

```bash
npx ts-node-dev src/worker.ts
```

## What I Learned

* How message queues work
* Why background workers are useful
* How Redis stores queue data
* How BullMQ manages jobs
* How to build asynchronous backend systems
* How to validate requests using Zod

## Future Improvements

* Email delivery using Nodemailer
* Retry mechanism
* Dead Letter Queue (DLQ)
* PostgreSQL integration
* SMS notifications
* Docker support

## Author

Satyam Singh

GitHub: https://github.com/Satyam-2121
