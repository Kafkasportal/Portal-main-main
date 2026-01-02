## 2024-05-23 - Lazy Loading External Libraries in Hooks
**Learning:** Large libraries like `html2canvas` that are only used in event handlers (like click) should be lazy-loaded using `await import()` instead of top-level imports. This significantly reduces the initial bundle size for components that use these hooks but don't immediately use the library.
**Action:** When optimizing hooks, identify heavy dependencies used only in callbacks and move them to dynamic imports. Ensure to test with `vi.mock` factory pattern to handle hoisting correctly.
