// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfhelnsdfzbwwrmbuoms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTc0NTMsImV4cCI6MjA0MjIzMzQ1M30.znNkgn8tTnmSFZYmRYV6IbTKrWYtg9Ql-EDvpPyOTgA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email) => {
  // First, check if the user exists and is active
  const { data, error: checkError } = await supabase
    .from('user_data')
    .select('is_active')
    .eq('email', email)
    .single();

  if (checkError || !data || data.is_active !== 'yes') {
    return { user: null, error: new Error('User not found or inactive') };
  }

  // If the user exists and is active, sign in with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
    email: email,
  });

  if (authError) {
    return { user: null, error: authError };
  }

  return { user: authData.user, error: null };
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

export const sendMessage = async (name, message) => {
  const { data, error } = await supabase
    .from('public_chat')
    .insert([{ name, message }]);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
};

export const deleteMessage = async (messageId, userEmail) => {
  const { data, error } = await supabase
    .from('public_chat')
    .delete()
    .match({ id: messageId })
    .select();

  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }

  return data;
};

export const updateMessage = async (messageId, newContent, userEmail) => {
  const { data, error } = await supabase
    .from('public_chat')
    .update({ message: newContent })
    .match({ id: messageId })
    .select();

  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }

  return data;
};
