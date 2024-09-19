import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signIn as supabaseSignIn } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
    return user;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

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