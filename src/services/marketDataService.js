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

// Fetch latest AAII value
export const fetchLatestAAII = async () => {
  const { data, error } = await supabase
    .from('aaii_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw new Error(error.message);
  return data[0];
};

// Fetch historical AAII data
export const fetchHistoricalAAII = async () => {
  const { data, error } = await supabase
    .from('aaii_data')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(d => ({
    created_at: d.created_at,
    spread: d.spread,
  }));
};

// Fetch fiscal flows
export const fetchFiscalFlows = async () => {
  const FISCAL_FLOWS_ID = 1; // Use the same constant ID

  const { data, error } = await supabase
    .from('fiscal_data')
    .select('flows')
    .eq('id', FISCAL_FLOWS_ID)
    .single();
  
  if (error) throw new Error(error.message);
  return data ? data.flows : 'stable'; // Default to 'stable' if no data
};

// Update fiscal flows
export const updateFiscalFlows = async (newState) => {
  const FISCAL_FLOWS_ID = 1; // Use a constant ID for the fiscal flows row

  const { data, error } = await supabase
    .from('fiscal_data')
    .upsert({ id: FISCAL_FLOWS_ID, flows: newState })
    .select();

  if (error) throw new Error(error.message);
  return data;
};
