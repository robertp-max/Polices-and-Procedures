# API: Authentication (`/api/auth`)

**Mount Path:** `/api/auth`  
**File:** `server/routes/auth.ts`  
**Auth Required:** Varies by endpoint (see below)

---

## Overview

The Auth API handles all user authentication operations: registration, login, session management, password reset, and current user retrieval. It uses HTTP-only cookies for session tokens.

---

## Endpoints

---

### POST `/api/auth/register-request`

**Purpose:** Initiates a new user registration by sending a setup link to the provided email.  
**Auth Required:** No  

**Request Body:**
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "staff | coordinator | manager | admin"
}
```

**Response (200):**
```json
{
  "message": "Setup link sent to email"
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Missing required fields |
| 409 | Email already registered |
| 422 | Invalid email format |

**Where Used in UI:** Registration page (`/register`)

---

### POST `/api/auth/setup-account`

**Purpose:** Completes account setup using the token from the setup email.  
**Auth Required:** No (uses setup token from email)  

**Request Body:**
```json
{
  "token": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response (200):**
```json
{
  "message": "Account activated",
  "user": { "id": "string", "email": "string", "role": "string" }
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Token invalid or expired |
| 400 | Passwords do not match |
| 422 | Password does not meet complexity requirements |

**Where Used in UI:** Setup account page (`/setup-account`)

---

### POST `/api/auth/login`

**Purpose:** Authenticates a user and establishes a session.  
**Auth Required:** No  

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string",
    "emailVerified": true
  },
  "session": {
    "accessToken": "string",
    "idToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Missing credentials |
| 401 | Invalid email or password |
| 403 | Account deactivated |
| 429 | Too many login attempts (rate limited) |

**Audit:** Successful and failed logins are logged as `LOGIN_SUCCESS` / `LOGIN_FAILURE` (CRITICAL_ACTIONS).  
**Where Used in UI:** Login page (`/login`)

---

### POST `/api/auth/refresh`

**Purpose:** Refreshes an expired access token using the refresh token.  
**Auth Required:** Valid refresh token (HTTP-only cookie)  

**Request Body:** None (uses cookie)

**Response (200):**
```json
{
  "accessToken": "string",
  "expiresIn": 3600
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 401 | Refresh token invalid or expired |
| 403 | Account deactivated |

**Where Used in UI:** Automatic — called by the auth interceptor when a 401 is received.

---

### POST `/api/auth/logout`

**Purpose:** Invalidates the current session and clears auth cookies.  
**Auth Required:** Yes  

**Request Body:** None

**Response (200):**
```json
{
  "message": "Logged out"
}
```

**Where Used in UI:** Logout button in the sidebar navigation.

---

### GET `/api/auth/me`

**Purpose:** Returns the current authenticated user's profile.  
**Auth Required:** Yes  

**Response (200):**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string",
  "firstName": "string",
  "lastName": "string",
  "emailVerified": true
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 401 | Not authenticated |

**Where Used in UI:** Called on app load by `CommandCenterLayout` to populate user session state.

---

### POST `/api/auth/forgot-password`

**Purpose:** Sends a password reset link to the provided email.  
**Auth Required:** No  

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200):**
```json
{
  "message": "Reset link sent if email exists"
}
```

**Note:** Always returns 200 to prevent email enumeration attacks.

**Where Used in UI:** Forgot password page (`/forgot-password`)

---

### POST `/api/auth/reset-password`

**Purpose:** Sets a new password using the reset token.  
**Auth Required:** No (uses reset token from email)  

**Request Body:**
```json
{
  "token": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response (200):**
```json
{
  "message": "Password updated"
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Token invalid or expired |
| 422 | Password does not meet requirements |

**Where Used in UI:** Reset password page (`/reset-password`)

---

## Security Notes

- All tokens are stored in HTTP-only, Secure, SameSite=Strict cookies
- Access tokens expire in 1 hour; refresh tokens expire in 7 days
- Login rate limiting: 5 failed attempts per 15 minutes per IP
- Password requirements: minimum 8 characters, at least one uppercase, one number, one symbol
