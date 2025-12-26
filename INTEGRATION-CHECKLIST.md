# Backend Integration Checklist

Use this checklist to verify your backend integration is working correctly.

## 🔧 Configuration

- [ ] Update `src/environments/environment.ts` with your backend URL
- [ ] Update `src/environments/environment.prod.ts` with production URL
- [ ] Verify CORS is configured on backend for `http://localhost:8888`

## 🔐 Authentication

### Email/Password
- [ ] `POST /api/auth/login` - Returns token and user
- [ ] `POST /api/auth/register` - Returns token and user
- [ ] `GET /api/auth/me` - Returns current user (with token)

### Social Login
- [ ] `GET /auth/google` - Redirects to Google OAuth
- [ ] `GET /auth/linkedin` - Redirects to LinkedIn OAuth
- [ ] Callback redirects to `/auth/social/callback?token=...&newUser=...`
- [ ] Error redirects to `/auth/login?error=social_login_failed`

## 👤 User Management

- [ ] `GET /api/users/me` - Get current user profile
- [ ] `PATCH /api/users/me` - Update profile (name, email, bio, avatar, preferences)
- [ ] `PATCH /api/users/me/password` - Change password
- [ ] `GET /api/users/me/stats` - Get user statistics
- [ ] `GET /api/leaderboard?limit=10` - Get leaderboard

## 📝 Quiz Management

- [ ] `GET /api/quizzes?subjectId=...&level=...` - List quizzes with filters
- [ ] `GET /api/quizzes/:id` - Get quiz by ID
- [ ] `POST /api/quizzes/:id/submit` - Submit quiz answers
  - [ ] Returns score, points, and wrong answers
  - [ ] Wrong answers include suggested articles

## 📚 Subjects

- [ ] `GET /api/subjects` - List all subjects
- [ ] `POST /api/subjects` - Create subject (admin only)

## 🤖 AI Features

- [ ] `POST /api/ai/generate-quiz` - Generate quiz with AI

## 🧪 Testing Steps

1. **Test Authentication**
   ```bash
   # Test login
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   
   # Test register
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. **Test Protected Endpoints**
   ```bash
   # Get user profile (replace TOKEN with actual token)
   curl -X GET http://localhost:3000/api/users/me \
     -H "Authorization: Bearer TOKEN"
   ```

3. **Test Quiz Submission**
   ```bash
   # Submit quiz (replace QUIZ_ID and TOKEN)
   curl -X POST http://localhost:3000/api/quizzes/QUIZ_ID/submit \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"answers":[{"questionId":"q1","selectedOptionId":"opt1"}]}'
   ```

## 🐛 Common Issues

### CORS Errors
- **Issue**: Browser blocks requests due to CORS
- **Fix**: Configure backend to allow `http://localhost:8888` origin

### 401 Unauthorized
- **Issue**: Token not being sent or invalid
- **Fix**: 
  - Check `AuthInterceptor` is working
  - Verify token format: `Bearer <token>`
  - Check token expiration

### 404 Not Found
- **Issue**: Endpoint doesn't exist
- **Fix**: Verify backend routes match frontend expectations

### Data Structure Mismatch
- **Issue**: Frontend expects different data structure
- **Fix**: Check `BACKEND-INTEGRATION.md` for expected response formats

## 📊 Monitoring

Check browser console and network tab for:
- Failed API requests
- CORS errors
- 401/403/404/500 errors
- Response data structure mismatches

## 🔄 Next Steps

1. Start backend server on `http://localhost:3000`
2. Start frontend with `npm start`
3. Test each endpoint systematically
4. Fix any data structure mismatches
5. Test error scenarios (invalid token, network errors, etc.)

