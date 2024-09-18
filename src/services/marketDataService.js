// src/services/marketDataService.js
import { supabase } from '../supabaseClient';

// Fetch latest VIX value
export const fetchLatestVIX = async () => {
  const { data, error } = await supabase
    .from('vix_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1);
  
  if (error) throw new Error(error.message);
  return data[0];
};

// Fetch historical VIX data
export const fetchHistoricalVIX = async () => {
  const { data, error } = await supabase
    .from('vix_data')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(d => ({
    date: new Date(d.timestamp).toLocaleDateString(),
    VIX: d.VIX,
  }));
};

// Fetch market summary
export const fetchMarketSummary = async () => {
  let { data, error } = await supabase
    .from('summary_data')  // New table for summary data
    .select('summary')
    .order('id', { ascending: false })
    .limit(1);  // Assuming you want the latest summary

  if (error) throw new Error(error.message);
  return data.length ? data[0].summary : null;
};
