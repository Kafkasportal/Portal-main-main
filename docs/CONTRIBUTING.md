# 🤝 Contributing to Kafkasder Yönetim Paneli

Thank you for your interest in contributing! This document explains the contribution process.

---

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Git
- VS Code (recommended)
- Familiarity with TypeScript, React, and Next.js

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/your-username/Portal-main.git
cd Portal-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Application will be available at http://localhost:3000

### 4. Code Quality Check

```bash
npm run lint
npm run build
```

---

## 🛠️ Development Workflow

### 🔄 Branch Strategy

| Branch | Purpose |
|---------|----------|
| `main` | Production-ready code |
| `feature/` | New features |
| `bugfix/` | Bug fixes |
| `hotfix/` | Urgent fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring |

### 📝 Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
type(scope): description

# Examples:
feat(auth): add login functionality
fix(ui): resolve sidebar collapse issue
docs(readme): update installation instructions
refactor(api): optimize database queries
test(e2e): add user registration tests
style(css): improve button styling
chore(deps): update dependencies
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### 🎯 Pull Request Process

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following project standards
   - Add tests for new functionality
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create PR
   - Fill out the PR template
   - Request review from maintainers
   - Address feedback

---

## 📏 Code Standards

### 🎨 TypeScript

- **Strict Mode**: Strict typing enabled, no `any`
- **Explicit Types**: Always define return types
- **Interfaces**: Use `interface` for object shapes, `type` for unions/primitives
- **Naming**:
  - Components/Interfaces/Types: `UpperCamelCase`
  - Functions/Variables: `lowerCamelCase`
  - Constants: `SCREAMING_SNAKE_CASE`

### ⚛️ React

- **Functional Components**: Only functional components with hooks
- **Component Names**: PascalCase
- **Props**: Define with TypeScript interfaces
- **No Class Components**: Use hooks instead

### 🎨 Styling

- **Tailwind CSS**: Use utility classes
- **Conditional Classes**: Use `cn()` helper function
- **Theme**: Dark mode by default, respect user preference
- **Responsive**: Mobile-first approach

### 🧪 Testing

- **Unit Tests**: Jest for logic and hooks
- **E2E Tests**: Playwright for user flows
- **Test Coverage**: Aim for 70%+ coverage
- **Test Files**: Place next to source files: `component.test.tsx`

### 📚 Documentation

- **JSDoc Comments**: Document complex functions
- **README Files**: Keep updated with changes
- **API Changes**: Document breaking changes
- **Code Comments**: Explain "why", not "what"

---

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// Unit test example
import { describe, it, expect } from 'vitest'
import { myFunction } from './myModule'

describe('myFunction', () => {
  it('should return expected output', () => {
    expect(myFunction('input')).toBe('expected')
  })
})
```

### Test Requirements

- All new features must have tests
- Bug fixes must include regression tests
- Maintain test coverage above 70%
- Tests must be deterministic (no flaky tests)

---

## 🎯 Feature Development Process

1. **Planning**
   - Create GitHub issue first
   - Discuss design with team
   - Get approval before starting

2. **Implementation**
   - Create feature branch
   - Implement in small increments
   - Test frequently

3. **Review**
   - Self-review your code
   - Ensure all tests pass
   - Update documentation

4. **PR Creation**
   - Link to related issue
   - Describe changes clearly
   - Add screenshots for UI changes

---

## 🐛 Bug Reporting

### Bug Report Template

```markdown
**Description**: Brief description of the bug

**Steps to Reproduce**:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**: What you expected to happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable, add screenshots

**Environment**:
- OS: [e.g., Windows 10, macOS 14]
- Browser: [e.g., Chrome 120, Safari 17]
- Node Version: [e.g., 20.10.0]
- Project Version: [e.g., 1.0.0]

**Additional Context**: Any other relevant information
```

---

## ✨ Feature Requests

### Feature Request Template

```markdown
**Problem**: What problem are you trying to solve?

**Solution**: What is your proposed solution?

**Alternatives**: What alternatives have you considered?

**Additional Context**: Any other context, screenshots, or examples
```

---

## 🎭 Code of Conduct

### 🌟 Our Standards

**Acceptable Behavior**:
- Respectful and polite communication
- Constructive feedback
- Accepting different viewpoints
- Taking responsibility for mistakes
- Professional conduct

**Unacceptable Behavior**:
- Harassment or discriminatory language
- Personal attacks or threats
- Spam or off-topic messages
- Privacy violations
- Illegal activities

### 🚨 Enforcement

Violations will result in:
1. **Warning**: First offense
2. **Temporary Ban**: Repeated violations
3. **Permanent Ban**: Severe violations

---

## 🔧 Development Environment

### Setup Scripts

```bash
# Development
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server

# Quality
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript check
npm run format       # Prettier format all

# Testing
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run test:ui      # Visual regression tests

# Database
npm run db:migrate   # Database migration
```

### Environment Variables

Create `.env.local` for local development:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_USE_MOCK_API="true"

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."
SENTRY_AUTH_TOKEN="..."
```

---

## 📞 Communication

- **Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Pull Requests**: Code review and contributions
- **Email**: info@kafkasder.org (sensitive issues)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Acknowledgments

Thank you to all contributors! Together we're building a better open-source ecosystem! 🚀

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0

