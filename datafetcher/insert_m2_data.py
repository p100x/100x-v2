import os
import requests
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjY1NzQ1MywiZXhwIjoyMDQyMjMzNDUzfQ.8J5aPGA_6EbLjN2d5bfxNdSi6m23MVQCF0xO6RHy1JA")

# FRED API key from .env file
FRED_API_KEY = os.getenv('FRED_API_KEY')

# FRED series ID for M2 Money Supply Year-over-Year Growth
FRED_SERIES_ID = 'WM2NS'  # or 'M2SL' (M2 Money Stock) if available

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_fred_yoy_data(series_id, api_key, start_date):
    """
    Fetches Year-over-Year growth data for M2 Money Stock directly from FRED API.
    """
    url = f"https://api.stlouisfed.org/fred/series/observations"
    params = {
        'series_id': series_id,
        'api_key': api_key,
        'file_type': 'json',
        'observation_start': start_date,
        'units': 'pc1'  # 'pc1' stands for Year-over-Year Percent Change
    }

    response = requests.get(url, params=params)
    
    # Handle potential API response errors
    if response.status_code == 200:
        data = response.json()
        return data['observations']
    else:
        print(f"Error fetching data: {response.status_code}")
        print(f"Response message: {response.text}")  # This will show what went wrong
        return None


def save_to_supabase(df):
    """
    Save YoY growth data to Supabase.
    """
    for index, row in df.iterrows():
        try:
            # Prepare the data for insertion
            data = {
                'date': index.isoformat(),
                'yoy': row['value']  # YoY growth from the API response
            }

            # Check if a record with the same date already exists
            existing_record = supabase.table('m2_data').select('*').eq('date', data['date']).execute()

            if existing_record.data:
                # If record exists, update it
                record_id = existing_record.data[0]['id']  # Assuming 'id' is the primary key
                response = supabase.table('m2_data').update(data).eq('id', record_id).execute()
                print(f"Record updated for date {data['date']}")
            else:
                # If record doesn't exist, insert it
                response = supabase.table('m2_data').insert(data).execute()
                print(f"New record inserted for date {data['date']}")

            if response.data:
                print(f"Operation successful for {data['date']}")
            else:
                print("No changes made.")
                
        except Exception as e:
            print(f"Error: {e}")

def main():
    # Define the start date for fetching the last two years of data
    two_years_ago = (datetime.now() - pd.DateOffset(years=2)).strftime('%Y-%m-%d')

    # Fetch YoY growth data from FRED
    data = fetch_fred_yoy_data(FRED_SERIES_ID, FRED_API_KEY, two_years_ago)

    if data:
        # Convert the data to a DataFrame
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df['value'] = pd.to_numeric(df['value'], errors='coerce')  # YoY growth value
        df.set_index('date', inplace=True)
        
        # Save the data to Supabase
        if not df.empty:
            save_to_supabase(df)
        else:
            print("No data available to save.")
    else:
        print("No data fetched from FRED.")

if __name__ == '__main__':
    main()
