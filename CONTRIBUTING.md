# Contributing to TaskFlow AI

Thank you for your interest in contributing to TaskFlow AI! We appreciate your time and effort. This guide will help you get started with contributing to our project.

## 📋 Table of Contents

- [Contributing to TaskFlow AI](#contributing-to-taskflow-ai)
  - [📋 Table of Contents](#-table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
  - [Making Changes](#making-changes)
  - [Pull Request Process](#pull-request-process)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Code Style](#code-style)
  - [Commit Message Guidelines](#commit-message-guidelines)
  - [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report any unacceptable behavior to [email protected].

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/yourusername/taskflow_ai.git
   cd taskflow_ai
   ```
3. **Add the upstream repository**
   ```bash
   git remote add upstream https://github.com/Deviskalo/taskflow_ai.git
   ```
4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Run tests**
   ```bash
   npm test
   # or
   yarn test
   ```

## Making Changes

1. **Sync your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Make your changes**
   - Follow the code style guidelines
   - Write tests for new features
   - Update documentation as needed

3. **Run tests** to ensure everything works

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

## Pull Request Process

1. Push your branch to your fork
   ```bash
   git push origin your-branch-name
   ```

2. Open a Pull Request (PR) to the `main` branch

3. Ensure the PR description clearly describes the problem and solution

4. Wait for code review and address any feedback

5. Once approved, your PR will be merged by a maintainer

## Reporting Bugs

1. Check if the issue has already been reported
2. Open a new issue with a clear title and description
3. Include steps to reproduce the issue
4. Add any relevant logs or screenshots
5. Label the issue appropriately (bug, enhancement, etc.)

## Suggesting Enhancements

1. Check if the enhancement has already been suggested
2. Open a new issue with a clear title and description
3. Explain why this enhancement would be useful
4. Include any relevant examples or mockups

## Code Style

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript types where appropriate
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code changes that neither fix bugs nor add features
- `perf:` Performance improvements
- `test:` Adding or modifying tests
- `chore:` Changes to the build process or auxiliary tools

Example:
```
feat: add user authentication

- Add login form component
- Implement auth context
- Add protected routes
```

## License

By contributing to TaskFlow AI, you agree that your contributions will be licensed under the [MIT License](LICENSE).
