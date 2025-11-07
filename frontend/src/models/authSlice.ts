/**
 * Auth Redux Slice
 *
 * Manages authentication state including user session, login, signup, and logout operations.
 * Integrates with Supabase Authentication for user management.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { User, Session, AuthState, LoginCredentials, SignupCredentials } from '../types';

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false, // Track if auth has been checked on app load
};

// Async Thunks

interface AuthResponse {
  user: User | null;
  session: Session | null;
}

/**
 * Check for existing session on app load
 */
export const checkSession = createAsyncThunk<AuthResponse, void, { rejectValue: string }>(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        user: session?.user || null,
        session: session,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Sign up a new user with email and password
 */
export const signup = createAsyncThunk<AuthResponse, SignupCredentials, { rejectValue: string }>(
  'auth/signup',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return rejectWithValue(error.message);
      }

      // Note: Supabase may require email confirmation depending on settings
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Sign in with email and password
 */
export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Sign out the current user
 */
export const logout = createAsyncThunk<null, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();

      // Ignore 403 errors from local Supabase (known issue with local dev)
      // The session is still cleared locally even if the API returns 403
      if (error && error.status !== 403) {
        return rejectWithValue(error.message);
      }

      return null;
    } catch (error: any) {
      // Ignore network errors on logout - we still want to clear local state
      console.warn('Logout API call failed, but clearing local session anyway:', error);
      return null;
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Direct setters for auth state changes from listeners
    setUser: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.session = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check Session
    builder
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.initialized = true;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
        state.initialized = true;
      });

    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.session = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });
  },
});

// Export actions and reducer
export const { setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectSession = (state: { auth: AuthState }) => state.auth.session;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user;
export const selectAuthInitialized = (state: { auth: AuthState }) => state.auth.initialized;
