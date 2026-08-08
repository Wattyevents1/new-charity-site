# Supabase SSR Integration Guide

## Overview

This integration adds secure server-side rendering (SSR) support to your Vite + React application with proper authentication middleware and cookie-based session management.

## What's New

### 1. **Enhanced Supabase Client** (`src/lib/supabase.ts`)
- Uses `createBrowserClient` from `@supabase/ssr` for proper SSR support
- Includes helper functions for session management
- Auth state subscription utilities

### 2. **Authentication Middleware** (`src/lib/authMiddleware.ts`)
- `addAuthHeaders()` - Automatically inject auth headers to requests
- `isAuthenticated()` - Check if user is authenticated
- `hasRole()` - Role-based access control
- `handleAuthError()` - Handle 401 errors and refresh sessions
- `protectedFetch()` - Fetch with automatic auth injection
- `setupAuthListener()` - Auto-refresh session every 55 minutes

### 3. **Auth Context** (`src/contexts/AuthContext.tsx`)
- React Context for managing global auth state
- Automatic session initialization on app load
- Session state listeners
- Auth methods: signIn, signUp, signOut, resetPassword

### 4. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
- Route protection for authenticated users only
- Optional role-based access control
- Loading state handling

### 5. **Auth Hooks** (`src/hooks/useAuthHooks.ts`)
- `useAuth()` - Access auth context
- `useUser()` - Get current user with loading state
- `useAuthenticatedQuery()` - Execute auth-protected queries
- `useSessionRefresh()` - Manual session refresh control

## Usage Examples

### Protect a Route

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

<Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
```

### Use Auth in Components

```typescript
import { useAuth } from '@/hooks/useAuthHooks'

function MyComponent() {
  const { user, signOut } = useAuth()
  
  if (!user) return <div>Not authenticated</div>
  
  return (
    <div>
      Hello {user.email}
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protected API Calls

```typescript
import { protectedFetch } from '@/lib/authMiddleware'

const data = await protectedFetch('/api/user-data')
```

### Role-Based Access

```typescript
import { hasRole } from '@/lib/authMiddleware'

if (await hasRole('admin')) {
  // Admin-only code
}
```

## Features

✅ **Automatic Session Management** - Sessions are automatically refreshed every 55 minutes  
✅ **Secure Auth Headers** - All authenticated requests include proper auth tokens  
✅ **Error Handling** - Automatic 401 error recovery and session refresh  
✅ **Role-Based Access** - Support for role-based access control  
✅ **Cookie Support** - Proper cookie handling for SSR  
✅ **TypeScript Support** - Full TypeScript types included  

## Environment Variables

Add to your `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## Session Lifecycle

1. App initializes and loads session from localStorage
2. Auth state listeners setup with automatic refresh
3. Session refreshes every 55 minutes (before 1-hour expiry)
4. On logout or session expiry, state is cleared
5. Authenticated requests automatically include auth token

## Security

- Tokens are handled by Supabase client library
- Sessions are stored securely with automatic refresh
- 401 errors trigger automatic re-authentication flow
- Protected routes require valid session
- Role-based access control available

## Migration Guide

If upgrading from previous auth setup:

1. Replace old auth context imports with new `AuthContext`
2. Use new hooks from `useAuthHooks`
3. Update protected routes to use new `ProtectedRoute` component
4. Update middleware usage to use `authMiddleware` utilities
5. Update `.env.local` to use `VITE_` prefix for Vite environment variables

## Troubleshooting

**Session not persisting?**
- Check browser DevTools → Application → Cookies for `sb-*` cookies
- Verify Supabase project settings allow localStorage

**401 errors on API calls?**
- Ensure `protectedFetch` is used for authenticated endpoints
- Check that session token is valid

**Can't access protected routes?**
- Verify user is authenticated via browser console: `supabase.auth.getSession()`
- Check auth state listener is properly initialized
