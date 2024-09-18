// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email) => {
  const { data, error } = await supabase
    .from('user_data')
    .select('is_active')
    .eq('email', email)
    .single();

  if (error) {
    return { user: null, error };
  }

  if (!data || data.is_active !== 'yes') {
    return { user: null, error: new Error('User not found or inactive') };
  }

  // If we reach here, the user exists and is active
  return { user: { email }, error: null };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
