import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const isStillActive = await checkUserActive(parsedUser.email);
      if (isStillActive) {
        setUser(parsedUser);
      } else {
        signOut();
      }
    }
    setLoading(false);
  };

  const checkUserActive = async (email) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('is_active')
      .eq('email', email)
      .single();

    if (error || !data || data.is_active !== 'yes') {
      return false;
    }
    return true;
  };

  const signIn = async (email) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('is_active')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      throw new Error('An error occurred while signing in');
    }

    if (!data || data.is_active !== 'yes') {
      throw new Error('User not found or account is not active');
    }

    const user = { email, is_active: true };
    setUser(user);
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    return user;
  };

  const signOut = () => {
    setUser(null);
    Cookies.remove('user');
  };

  const value = {
    user,
    signIn,
    signOut,
    checkUserActive,
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