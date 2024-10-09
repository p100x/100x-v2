// src/services/marketDataService.js
import { supabase } from '../supabaseClient';

// Add this at the top of the file
const logError = (functionName, error) => {
  console.error(`Error in ${functionName}:`, error);
  console.error('Error details:', error.details);
  console.error('Error hint:', error.hint);
  console.error('User auth status:', supabase.auth.session());
};

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
  try {
    const { data, error } = await supabase
      .from('aaii_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    logError('fetchLatestAAII', error);
    throw error;
  }
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
  const FISCAL_FLOWS_ID = 1;

  const { data, error } = await supabase
    .from('fiscal_data')
    .select('flows')
    .eq('id', FISCAL_FLOWS_ID);
  
  if (error) throw new Error(error.message);
  return data && data.length > 0 ? data[0].flows : 'stable';
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

// Fetch latest M2 data
export const fetchLatestM2Data = async () => {
  const { data, error } = await supabase
    .from('m2_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1);
  
  if (error) throw new Error(error.message);
  return data[0];
};

// Fetch historical M2 data
export const fetchHistoricalM2Data = async () => {
  const { data, error } = await supabase
    .from('m2_data')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
};

// Add these new functions to your existing marketDataService.js file

export const fetchLatestCreditCardDelinquency = async () => {
  const { data, error } = await supabase
    .from('credit_card_delinquency_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

export const fetchHistoricalCreditCardDelinquency = async () => {
  const { data, error } = await supabase
    .from('credit_card_delinquency_data')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
};

// Fetch latest Personal Saving Rate
export const fetchLatestPersonalSavingRate = async () => {
  const { data, error } = await supabase
    .from('personal_saving_rate_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

// Fetch historical Personal Saving Rate data
export const fetchHistoricalPersonalSavingRate = async () => {
  const { data, error } = await supabase
    .from('personal_saving_rate_data')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Fetch latest earnings calls
export const fetchLatestEarningsCalls = async () => {
  try {
    const { data, error } = await supabase
      .from('earnings_calls')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);
    
    if (error) throw new Error(error.message);
    console.log('Fetched earnings calls:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchLatestEarningsCalls:', error);
    throw error;
  }
};

// Add a new earnings call
export const addEarningsCall = async (earningsCall) => {
  console.log('Adding earnings call:', earningsCall);
  const { data, error } = await supabase
    .from('earnings_calls')
    .insert([earningsCall])
    .select();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }
  
  if (!data || data.length === 0) {
    console.error('No data returned after insert');
    throw new Error('Failed to add earnings call');
  }
  
  console.log('Added earnings call:', data[0]);
  return data[0];
};

// Update an existing earnings call
export const updateEarningsCall = async (id, updates) => {
  const { data, error } = await supabase
    .from('earnings_calls')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No data returned after update');
  return data[0];
};

// Delete an earnings call
export const deleteEarningsCall = async (id) => {
  const { error } = await supabase
    .from('earnings_calls')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// Add this new function to your existing marketDataService.js file

export const fetchLatestLiquidityScore = async () => {
  try {
    const { data, error } = await supabase
      .from('liquidity_vs_qqq')  // Make sure this table name is correct
      .select('liquidity')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data ? data.liquidity : null;
  } catch (error) {
    console.error('Error fetching latest liquidity score:', error);
    throw error;
  }
};

// Add this new function
export const fetchHistoricalLiquidityData = async () => {
  try {
    const startDate = '2021-01-01';
    const { data, error } = await supabase
      .from('liquidity_vs_qqq')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      date: new Date(item.date).getTime(),
      qqq: parseFloat(item.qqq),
      liquidity: parseFloat(item.liquidity)
    }));
  } catch (error) {
    console.error('Error fetching historical liquidity data:', error);
    throw error;
  }
};

