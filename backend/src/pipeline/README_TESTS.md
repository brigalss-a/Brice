# BRICE Modular Pipeline — Automated Tests

This file documents the automated tests for the modular pipeline engines:

- **optimizer.js**: Tests whitespace normalization and metadata
- **policyEngine.js**: Tests forbidden keyword blocking, allow logic, and output redaction
- **evidence.js**: Tests SHA-256 hashing for determinism and length

## How to Run

From the backend directory:

```sh
npm install --save-dev mocha assert
npx mocha src/pipeline/pipeline.test.js
```

## Test Coverage
- All core logic is covered by unit tests
- Add more tests as you extend pipeline modules
