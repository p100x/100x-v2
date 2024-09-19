import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signIn as supabaseSignIn } from '../supabaseClient';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const storedUser = Cookies.get('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        Cookies.set('user', JSON.stringify(session.user), { expires: 7 });
      } else {
        Cookies.remove('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email) => {
    console.log('SignIn function called with email:', email);
    const { data, error } = await supabase
      .from('user_data')
      .select('is_active')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user data:', error);
      throw new Error('An error occurred while signing in');
    }
    
    if (!data) {
      throw new Error('User not found');
    }
    
    const user = { email, is_active: data.is_active };
    setUser(user);

    // Store session in cookies
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    return user;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    Cookies.remove('user');
  };

  const refreshSession = async () => {
    const storedUser = Cookies.get('user');
    if (!storedUser) return;

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        throw new Error('An error occurred while refreshing the session');
      }

      setUser(data.user);
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  // Call refreshSession periodically
  useEffect(() => {
    const interval = setInterval(refreshSession, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  const value = {
    user,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};