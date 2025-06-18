# Contributing to TaskFlow AI

Thank you for considering contributing to TaskFlow AI! We appreciate your time and effort in making this project better. Here are the guidelines to help you get started with contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Style Guide](#style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report any unacceptable behavior to [your-email@example.com].

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check if the issue has already been reported. If you find an open issue that addresses the problem, add a comment to the existing issue instead of creating a new one.

When creating a bug report, please include the following information:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots or screen recordings if applicable
6. Browser/OS version
7. Any additional context that might be helpful

### Suggesting Enhancements

We welcome suggestions for enhancements and new features. Before creating a new feature request, please check if a similar suggestion already exists.

When suggesting an enhancement, please include:

1. A clear and descriptive title
2. A detailed description of the enhancement
3. Why this enhancement would be useful
4. Examples of how it might be used
5. Any additional context or screenshots

### Your First Code Contribution

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your changes
4. Make your changes
5. Run the test suite
6. Commit your changes with a clear commit message
7. Push your changes to your fork
8. Submit a pull request

### Pull Requests

- Fill in the pull request template completely
- Include tests for any new functionality
- Ensure all tests pass
- Update the documentation if necessary
- Keep your pull request focused on a single feature or bug fix
- Write clear commit messages

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/taskflow-ai.git
   cd taskflow-ai
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
4. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Available Scripts

- `dev` - Start the development server
- `build` - Build for production
- `preview` - Preview the production build
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `type-check` - Run TypeScript type checking

## Style Guide

### Code Style

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for all new code
- Use functional components with hooks
- Prefer named exports over default exports
- Use absolute imports when possible

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally
- Consider starting the commit message with an applicable emoji:
  - ✨ `:sparkles:` When adding a new feature
  - 🐛 `:bug:` When fixing a bug
  - ♻️ `:recycle:` When refactoring code
  - 📚 `:books:` When writing docs
  - 🚀 `:rocket:` When improving performance
  - 🎨 `:art:` When improving the format/structure of the code
  - 🔧 `:wrench:` When working on configuration
  - ✅ `:white_check_mark:` When adding tests

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
