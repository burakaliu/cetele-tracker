import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    // Check active session
    const { data: { session } } = await supabase.auth.getSession();
    
    set({ session, user: session?.user || null });

    if (session?.user) {
      // Fetch profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      set({ profile: data });
    }

    set({ loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user || null });
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile: data });
      } else {
        set({ profile: null });
      }
    });
  },

  signInWithEmail: async (email) => {
    // For simplicity, we'll use Magic Link (OTP) or just standard simple sign in
    // User requested "simple login", let's do OTP or just fake simple email/pass?
    // Let's rely on Magic Link for easiest "no password" UX, or simple email/password.
    // Let's do OTP (Magic Link) as it's cleaner for "simple".
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  },

  signInWithOtp: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  updateProfile: async (username) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username, updated_at: new Date() });
      
    if (!error) {
      set((state) => ({ 
        profile: state.profile ? { ...state.profile, username } : { id: user.id, username, avatar_url: '' } 
      }));
    }
  }
}));
