# Coding Guidelines for TODO App

## General Formatting Rules
- Use consistent indentation (2 spaces for JavaScript/TypeScript).
- Limit line length to 100 characters where possible.
- Use semicolons consistently at the end of statements.
- Prefer single quotes for strings, except when escaping would be required.
- Add trailing commas in multi-line objects and arrays.

## Import Organization
- Group imports by external libraries first, then internal modules.
- Use absolute imports for modules when possible.
- Remove unused imports and variables.
- Keep import statements at the top of the file.

## Linter Usage
- Use ESLint to enforce code quality and style rules.
- Fix all linter errors and warnings before committing code.
- Use Prettier for automatic code formatting where configured.

## Best Practices
- Follow the DRY (Don't Repeat Yourself) principle: avoid code duplication by extracting reusable logic.
- Use clear, descriptive names for variables, functions, and components.
- Write small, focused functions and components.
- Prefer pure functions and avoid side effects where possible.
- Add comments to explain complex logic, but avoid obvious or redundant comments.
- Write tests for all new features and bug fixes.
- Review code for readability, maintainability, and performance.

## Code Review
- Submit pull requests for all changes and request reviews from team members.
- Address review feedback promptly and thoroughly.
- Ensure all tests pass before merging code.
