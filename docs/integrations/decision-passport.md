# Decision Passport Integration

## Why Decision Passport?
- Provides offline-verifiable authorization and execution receipts for material actions
- Used as a proof/evidence layer for sensitive GitHub actions (e.g., posting review comments)
- Not a runtime enforcement engine by itself

## Where is it used?
- All passport-gated GitHub actions (e.g., posting a review comment)
- Each action is hashed, approved, executed, and receipt is persisted

## What is emitted?
- Receipt artifact with action, payload hash, outcome hash, timestamp
- Persisted audit record referencing the receipt

## What is NOT claimed?
- Decision Passport does not provide full hosted runtime enforcement
- Only actions explicitly passport-gated are covered

## Reference
- https://github.com/brigalss-a/decision-passport-core
