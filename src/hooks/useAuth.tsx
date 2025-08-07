import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  emailConfirmed: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  confirmEmail: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check email confirmation status
        if (session?.user) {
          setTimeout(() => {
            checkEmailConfirmation(session.user.id);
          }, 0);
        } else {
          setEmailConfirmed(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check email confirmation status
      if (session?.user) {
        checkEmailConfirmation(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkEmailConfirmation = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_confirmed')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setEmailConfirmed(data.email_confirmed === 1);
      } else {
        // Si no existe el perfil o hay error, asumimos email no confirmado
        setEmailConfirmed(false);
      }
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      setEmailConfirmed(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const confirmEmail = async () => {
    if (!user) return { error: 'No user found' };
    
    try {
      const { error } = await supabase.rpc('confirm_user_email', {
        user_id_param: user.id
      });
      
      if (!error) {
        setEmailConfirmed(true);
        // Forzar recheck del estado de confirmación
        await checkEmailConfirmation(user.id);
      }
      
      return { error };
    } catch (error) {
      console.error('Error confirming email:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    emailConfirmed,
    signIn,
    signUp,
    signOut,
    confirmEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};