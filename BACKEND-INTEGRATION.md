# Backend Integration Guide

This document outlines all API endpoints that the frontend expects from the backend.

## Base Configuration

- **API Base URL**: `http://localhost:3000`
- **API URL**: `http://localhost:3000/api`
- **Environment File**: `src/environments/environment.ts`

## Authentication Endpoints

### 1. Email/Password Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "string",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "student" | "admin",
      "totalPoints": number,
      "preferences": {
        "theme": "light" | "dark" | "system",
        "language": "en" | "ar",
        "emailNotifications": boolean,
        "pushNotifications": boolean,
        "primarySubject": "string" | null,
        "preferredLevel": "beginner" | "middle" | "intermediate" | "mixed" | null
      },
      "avatarUrl": "string" | null,
      "bio": "string" | null,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```

### 2. Email/Password Register
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Same as login

### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object (same structure as login response)

### 4. Social Login - Google
- **Endpoint**: `GET /auth/google`
- **Flow**: Full page redirect
- **Callback**: `/auth/social/callback?token=<token>&newUser=true|false`
- **Error Callback**: `/auth/login?error=social_login_failed`

### 5. Social Login - LinkedIn
- **Endpoint**: `GET /auth/linkedin`
- **Flow**: Full page redirect
- **Callback**: `/auth/social/callback?token=<token>&newUser=true|false`
- **Error Callback**: `/auth/login?error=social_login_failed`

## User Endpoints

### 1. Get Current User Profile
- **Endpoint**: `GET /api/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object

### 2. Update User Profile
- **Endpoint**: `PATCH /api/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "bio": "string",
    "avatarUrl": "string",
    "preferences": {
      "theme": "light" | "dark" | "system",
      "language": "en" | "ar",
      "emailNotifications": boolean,
      "pushNotifications": boolean,
      "primarySubject": "string",
      "preferredLevel": "beginner" | "middle" | "intermediate" | "mixed"
    }
  }
  ```
- **Response**: Updated User object

### 3. Change Password
- **Endpoint**: `PATCH /api/users/me/password`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**: `204 No Content` or empty body

### 4. Get User Statistics
- **Endpoint**: `GET /api/users/me/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "totalQuizzesTaken": number,
    "totalCorrectAnswers": number,
    "totalQuestionsAnswered": number,
    "streakDays": number,
    "perSubjectStats": [
      {
        "subject": "string",
        "quizzesTaken": number,
        "averageScore": number,
        "totalPoints": number
      }
    ]
  }
  ```

### 5. Get Leaderboard
- **Endpoint**: `GET /api/leaderboard?limit=10`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `limit` (optional, default: 10)
- **Response**:
  ```json
  [
    {
      "rank": number,
      "userId": "string",
      "name": "string",
      "avatarUrl": "string" | null,
      "totalPoints": number
    }
  ]
  ```

## Quiz Endpoints

### 1. List Quizzes
- **Endpoint**: `GET /api/quizzes?subjectId=<id>&level=<level>`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**:
  - `subjectId` (optional): Filter by subject
  - `level` (optional): Filter by level (beginner, middle, intermediate)
- **Response**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "level": "beginner" | "middle" | "intermediate",
      "subject": {
        "id": "string",
        "name": "string",
        "description": "string"
      },
      "questions": [
        {
          "id": "string",
          "text": "string",
          "type": "string",
          "options": [
            {
              "id": "string",
              "text": "string",
              "isCorrect": boolean
            }
          ]
        }
      ]
    }
  ]
  ```

### 2. Get Quiz by ID
- **Endpoint**: `GET /api/quizzes/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Quiz object (same structure as list)

### 3. Submit Quiz
- **Endpoint**: `POST /api/quizzes/:id/submit`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "questionId": "string",
        "selectedOptionId": "string"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "score": number,
    "totalQuestions": number,
    "correctAnswersCount": number,
    "pointsEarned": number,
    "updatedUserTotalPoints": number,
    "wrongAnswers": [
      {
        "questionId": "string",
        "questionText": "string",
        "selectedOptionId": "string",
        "correctOptionId": "string",
        "explanation": "string" | null,
        "suggestedArticles": [
          {
            "id": "string",
            "title": "string",
            "url": "string",
            "provider": "string",
            "estimatedReadingTimeMinutes": number | null,
            "subject": "string" | null,
            "level": "beginner" | "middle" | "intermediate" | null
          }
        ]
      }
    ]
  }
  ```

## Subject Endpoints

### 1. List Subjects
- **Endpoint**: `GET /api/subjects`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ]
  ```

### 2. Create Subject (Admin Only)
- **Endpoint**: `POST /api/subjects`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response**: Created Subject object

## AI Endpoints

### 1. Generate Quiz
- **Endpoint**: `POST /api/ai/generate-quiz`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "subject": "string",
    "level": "string",
    "count": number
  }
  ```
- **Response**: Generated quiz data

## Error Handling

### Standard Error Response
```json
{
  "message": "string",
  "error": "string",
  "statusCode": number
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion/update)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

All protected endpoints require:
- **Header**: `Authorization: Bearer <token>`
- Token is obtained from login/register/social login
- Token is stored in localStorage
- Token is automatically added by `AuthInterceptor`
- On 401 response, user is logged out and redirected to login

## CORS Configuration

Backend must allow:
- **Origin**: `http://localhost:8888` (development)
- **Methods**: GET, POST, PATCH, DELETE
- **Headers**: Content-Type, Authorization
- **Credentials**: true (if using cookies)

## Testing Checklist

- [ ] Authentication endpoints working
- [ ] Social login redirects working
- [ ] Token is properly stored and sent
- [ ] User profile endpoints working
- [ ] Quiz endpoints working
- [ ] Quiz submission with wrong answers feedback
- [ ] Leaderboard endpoint working
- [ ] Error handling (401, 400, 500)
- [ ] CORS configured correctly
- [ ] All endpoints return expected data structure

