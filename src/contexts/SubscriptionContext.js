import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserSubscription } from '../supabaseClient';

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const subData = await getUserSubscription(user.id);
          setSubscription(subData);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
      setLoading(false);
    };

    fetchSubscription();

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchSubscription();
      } else if (event === 'SIGNED_OUT') {
        setSubscription(null);
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};