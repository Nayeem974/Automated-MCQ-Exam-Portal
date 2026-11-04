# Contributing

Thank you for considering a contribution.

## Before you start

- Check existing issues and pull requests to avoid duplicate work.
- For major changes, open an issue first to discuss the proposed approach.
- Never commit `.env` files, credentials, tokens, or private student data.

## Development workflow

1. Fork the repository.
2. Create a focused branch:
   ```bash
   git checkout -b feat/short-description
   ```
3. Install dependencies in the affected application (`backend` or `frontend`).
4. Make the change and add or update tests when appropriate.
5. Run the relevant checks:
   ```bash
   # Backend
   cd backend
   npm test
   npm run build

   # Frontend (from repository root)
   cd frontend
   npm run build
   ```
6. Commit with a clear message, for example:
   `fix: validate exam question pool size`
7. Open a pull request using the pull request template.

## Pull request expectations

- Explain what changed and why.
- Link related issues.
- Include screenshots for meaningful UI changes.
- List the commands/tests you ran.
- Keep pull requests focused and avoid unrelated formatting changes.

## Reporting security issues

Do not publish secrets, exploit details, or private student information in a public issue. Contact the repository owner privately through an appropriate GitHub channel.
