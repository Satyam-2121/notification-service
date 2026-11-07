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

### Job Processing Flow

1. Client sends a notification request.
2. API validates the payload with Zod.
3. BullMQ adds the notification to Redis.
4. Worker picks up the job.
5. Worker processes the notification asynchronously.

Failed deliveries are retried up to two times after the initial attempt, with
exponential backoff starting at one second. After three unsuccessful attempts,
the job remains in the failed queue for inspection. Retries provide at-least-once
delivery: an ambiguous SMTP failure can result in a duplicate email.

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

Create a `.env` file in the project root with the Gmail account and app
password used to send notifications:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

The worker loads this file when it starts. Keep the credentials private;
`.env` is excluded from Git.

Start API:

```bash
npx ts-node-dev src/app.ts
```

The API listens on port 3000 by default. Set the `PORT` environment variable
when your hosting platform assigns a different port, for example
`PORT=8080 npx ts-node-dev src/app.ts`.

Start Worker:

```bash
npx ts-node-dev src/worker.ts
```

## Tests

Run validation tests with `npm test` and TypeScript checks with `npx tsc --noEmit`.
Run `npm run test:integration` to verify delivery retries against a temporary,
isolated Redis server. The integration tests require `redis-server` on your PATH,
start and stop it automatically, and do not send real emails.

## What I Learned

* How message queues work
* Why background workers are useful
* How Redis stores queue data
* How BullMQ manages jobs
* How to build asynchronous backend systems
* How to validate requests using Zod

## Future Improvements

* Email delivery using Nodemailer
* Dead Letter Queue (DLQ)
* PostgreSQL integration
* SMS notifications
* Docker support

## Author

Satyam Singh

GitHub: https://github.com/Satyam-2121
