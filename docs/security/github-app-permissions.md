# GitHub App Permissions Model

## Minimum Permissions
- Checks: write (for check runs)
- Pull requests: read
- Contents: read
- Metadata: read

## Optional (if implemented)
- Issues: read/write (if issue/comment actions are implemented)
- Actions: read (if workflow_run analysis is implemented)
- Actions: write (if rerun/cancel/dispatch actions are implemented and passport-gated)
- Commit statuses: only if intentionally used

## Principle
- Do not request broad permissions without real use.
- Document every requested permission and why it is needed.
