import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type User = SupabaseUser;
export type Session = SupabaseSession;

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  display_name?: string;
}
