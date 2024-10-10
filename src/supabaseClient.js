import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfhelnsdfzbwwrmbuoms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTc0NTMsImV4cCI6MjA0MjIzMzQ1M30.znNkgn8tTnmSFZYmRYV6IbTKrWYtg9Ql-EDvpPyOTgA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const sendMessage = async ({ name, message, reply_to }) => {
  const { data, error } = await supabase
    .from('public_chat')
    .insert([{ name, message, reply_to }]);

  if (error) throw error;
  return data;
};

export const deleteMessage = async (messageId) => {
  const { error } = await supabase
    .from('public_chat')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
};

export const updateMessage = async (messageId, newContent) => {
  const { error } = await supabase
    .from('public_chat')
    .update({ message: newContent })
    .eq('id', messageId);

  if (error) throw error;
};

export const getUserSubscription = async () => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const updateUserSubscription = async (userId, subscriptionData) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({ user_id: userId, ...subscriptionData })
    .select();

  if (error) throw error;
  return data;
};