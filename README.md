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

