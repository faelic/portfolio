---
id: "project-monierave"
title: "Monierave — Full-stack banking simulation"
topic: "projects"
topics:
  - "Backend engineering"
  - "Frontend engineering"
  - "Banking simulation"
  - "Database transactions"
  - "Double-entry ledger"
  - "Idempotency"
  - "Concurrency control"
  - "Background processing"
  - "Authentication and sessions"
  - "Software testing"
entities: ["Favour Chukwuemerie Ututu", "Monierave"]
source: "rag/sources/original-portfolio-knowledge.md"
source_sections: ["Independent projects > Monierave — Full-stack banking simulation", "What Favour works on > Backend engineering", "About Favour"]
---

# Monierave — Full-stack banking simulation

**Type:** Independent full-stack project  
**Repository:** https://github.com/faelic/monierave  
**Application:** https://monierave.favourututu.com/  
**Stack:** Go, Gin, PostgreSQL, SQLC, pgx, Redis, Asynq, Next.js, React, TypeScript, TanStack Query, React Hook Form, Zod, Docker.

## Overview and contribution

Monierave is a banking simulation through which Favour explored the backend and frontend engineering of financial transactions. He built account registration and verification, authentication, account management, beneficiaries, transfers, transaction history, statements, and profile and security features.

Monierave is a portfolio banking simulation, not a licensed bank or a service for handling customers' real money.

## Transfer integrity and concurrency

A transfer in Monierave is recorded through an append-only double-entry ledger. PostgreSQL transactions keep related database changes together, row-level locking deals with concurrent account operations, and idempotency keys help prevent the same request from creating duplicate transfers. Business rules are enforced by the backend.

Monierave's transactional outbox connects durable database changes to asynchronous processing. Workers can retry tasks without treating the database and the job queue as a single transaction.

## Background processing and security

Background work uses a transactional outbox. PostgreSQL holds the durable record of work to be performed, while Redis and Asynq support processing and retries. The system also includes rotating refresh tokens, revocable sessions, audit records, and reconciliation-related checks.

These Monierave features were built into a banking simulation and demonstrate the backend design problems Favour has chosen to study and implement.

## Frontend and testing

On the frontend, Favour used TanStack Query to manage server data and React Hook Form with Zod for form handling. He added backend, integration, and end-to-end tests, including tests for transfer behavior under concurrency.

## Limitations

Monierave is a portfolio banking simulation. It is not a licensed bank or a service for handling customers' real money.
