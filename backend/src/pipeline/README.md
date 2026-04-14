# BRICE Modular AI Pipeline

This directory contains the modular pipeline engines for the BRICE Sentinel backend:

- **optimizer.js**: Intent extraction, prompt normalization, context enrichment, model routing, safe rewrite.
- **policyEngine.js**: Pre-check and post-check for allow/warn/block/redact, explainability, policy enforcement.
- **evidence.js**: Claims, events, hashes, audit trail for transparency and compliance.

## Usage

Each module exports a simple interface:

- `optimizer.optimizePrompt(input)`
- `policyEngine.preCheck(input)` / `policyEngine.postCheck(output)`
- `evidence.hash(value)`, `evidence.logClaim(claim)`, `evidence.logEvent(event)`

These modules are designed for composability and can be orchestrated in the main service logic or as part of a job pipeline.

## Extensibility
- Add new engines as needed (e.g., scoring, explainability, audit).
- Each engine should be stateless and testable.

---

**World-class OSS best practice:**
- Each engine is documented, modular, and independently testable.
- All code is MIT-licensed and ready for open-source contribution.
