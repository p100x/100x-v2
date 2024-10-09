import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, signIn, signOut, getCurrentUser, onAuthStateChange } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: authListener } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      // Update the supabase client with the current session
      const { data: { session } } = await supabase.auth.getSession();
      supabase.auth.setSession(session);
    }
    setLoading(false);
  };

  const value = {
    user,
    signIn,
    signOut,
    // Remove verifyOtp from here
    translations: {
      emailPlaceholder: 'E-Mail-Adresse',
      sendLoginLink: 'Login-Link senden',
      checkEmail: 'Überprüfen Sie Ihre E-Mail für den Login-Link!',
      loginSuccess: 'Anmeldung erfolgreich!',
      alpha: 'Alpha',
    }
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