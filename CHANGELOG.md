## v0.3.2

- Relaxed configuration requirements, i.e. by default uses console.warn when assert.soft check fails.

## v0.3.1

- Automated pull request fixing a security vulnerability.

## v0.3.0

- Added `assert.soft` variant to check a condition/value and just log warning when false/null/undefined.

## v0.2.2

- Added `asserts condition` clause on `assert(condition, ...)` for improved support for TypeScript control flow based typing
- Updated to TypeScript depndency for support of `asserts condition`
- Bumped some packages in yarn.lock due to security vulnerability
