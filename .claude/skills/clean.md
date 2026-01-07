---
description: Clean build artifacts and cache
---

# Clean

Remove build artifacts, cache, and temporary files.

## Usage

```
/clean
```

## What it does

1. Removes `.next/` build directory
2. Removes `out/` directory if present
3. Removes any cache directories
4. Reports what was cleaned

## Notes

- Useful when encountering weird build issues
- Frees up disk space
- Next build will take longer as it rebuilds from scratch
