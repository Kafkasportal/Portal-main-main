---
description: Create a git commit with staged changes
---

# Commit

Create a git commit with all staged changes using a conventional commit format.

## Usage

```
/commit [message]
```

## What it does

1. Runs `git status` to show what will be committed
2. Runs `git diff --staged` to show staged changes
3. Creates a commit with the provided message or a generated one
4. Includes co-author attribution for Claude Code

## Notes

- Only commits staged changes (run `git add` first)
- Message should follow conventional commit format: `type: description`
- Types: feat, fix, docs, style, refactor, test, chore
