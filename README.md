# Quiz Frontend

Angular standalone application for the Quiz Web App platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm start
   ```
   - Served at `http://localhost:4200`.
   - Configure backend URL in `src/environments/environment.ts` if needed.

## Routes

- Auth: `/auth/login`, `/auth/register`
- Dashboard: `/dashboard`
- Quiz selection: `/subject/:subjectId/level/:level`
- Quiz taking: `/quiz/:quizId`
- Profile: `/profile`
- Leaderboard: `/leaderboard`
- Admin: `/admin/subjects`, `/admin/quizzes` (admin role)

## Features

- Angular standalone components with signals
- JWT authentication with localStorage
- PWA support
- Theme switching
- Multi-language support
- Responsive design

## GitHub Pages Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions. The deployment workflow:

- Triggers on pushes to the `main` branch
- Builds the Angular app with the correct base href for GitHub Pages
- Deploys to `https://codezettaa.github.io/quizes-frontend/`

To enable GitHub Pages:
1. Go to repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The workflow will automatically deploy on the next push to `main`

The app is configured with base href `/quizes-frontend/` for GitHub Pages deployment.

