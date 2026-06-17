# DeptCast — QA Automation Test Suite

This directory contains the automated integration and end-to-end (E2E) tests for the DeptCast backend. It utilizes Node's native test runner (`node:test`) and assertion library (`node:assert`), eliminating the need for heavy test frameworks.

## Test Scope
The test suite covers the following core features:
1. **Health Check:** Verifies `/api/health` is online.
2. **Authentication Flow:** Registers a new random user/org, tests successful login, and tests failed login handling.
3. **Project Management:** Creates a draft project, lists all projects in the organization, and retrieves details for a single project.
4. **Video & Scene Generation:** Triggers mock-based Google Veo video generation and individual scene regeneration (with actual credits deduction/refunding logic tested).
5. **AutoGen Blueprint Integration:** If the Python AutoGen microservice is online, tests creating a script/blueprint.

---

## Prerequisties
1. Node.js (version 20 or higher, v24 recommended)
2. PostgreSQL database running and configured in `server/.env` (the tests use the active database safely with isolated test records).

---

## How to Run the Tests

### 1. Simple Run via NPM (Recommended)
You can run the tests directly by running the following command from the `server` directory:

```bash
npm run test:qa
```

### 2. Manual Run via Node
If you want to run the test script directly from the root of the project:

```bash
node --test tests/api.test.js
```

### 3. Setting up Live vs Mock Video Generation
By default, the test suite executes with `MOCK_VEO=true` injected into the environment. This ensures that video generation is simulated and does not consume actual Vertex AI/Google Veo credits or fail due to missing keys.
