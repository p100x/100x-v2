import os
import requests
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
import logging

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjY1NzQ1MywiZXhwIjoyMDQyMjMzNDUzfQ.8J5aPGA_6EbLjN2d5bfxNdSi6m23MVQCF0xO6RHy1JA")

# FRED API key from .env file
FRED_API_KEY = os.getenv('FRED_API_KEY')

# FRED series ID for Personal Saving Rate
FRED_SERIES_ID = 'PSAVERT'

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_fred_data(series_id, api_key, start_date):
    """
    Fetches Personal Saving Rate data directly from FRED API.
    """
    url = f"https://api.stlouisfed.org/fred/series/observations"
    params = {
        'series_id': series_id,
        'api_key': api_key,
        'file_type': 'json',
        'observation_start': start_date
    }

    logging.info(f"Fetching FRED data at {datetime.now().isoformat()}")
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        logging.info(f"Successfully fetched {len(data['observations'])} observations")
        
        print("Data delivered by the API:")
        for observation in data['observations']:
            print(f"Date: {observation['date']}, Value: {observation['value']}")
        
        return data['observations']
    else:
        logging.error(f"Error fetching data: {response.status_code}")
        logging.error(f"Response message: {response.text}")
        return None

def wipe_and_refill_supabase(df):
    """
    Wipe all existing data from the table and refill it with new data, ensuring one entry per month.
    """
    try:
        # Wipe all existing data
        response = supabase.table('personal_saving_rate_data').delete().neq('id', 0).execute()
        print(f"Wiped {len(response.data)} existing records from the table.")

        # Prepare data for insertion, keeping only the latest entry for each month
        df_monthly = df.resample('M').last()
        data_to_insert = [
            {
                'date': index.replace(day=1).isoformat(),
                'saving_rate': float(row['value'])
            }
            for index, row in df_monthly.iterrows()
        ]

        # Insert new data
        response = supabase.table('personal_saving_rate_data').insert(data_to_insert).execute()
        print(f"Inserted {len(response.data)} new records into the table.")

        # Verify the data in the database after insertion
        print("\nVerifying data in the database:")
        response = supabase.table('personal_saving_rate_data').select('*').order('date').execute()
        for record in response.data:
            print(f"Date: {record['date']}, Saving Rate: {record['saving_rate']}")

    except Exception as e:
        print(f"Error processing data: {e}")

def main():
    # Define the start date for fetching the last two years of data
    two_years_ago = (datetime.now() - pd.DateOffset(years=2)).strftime('%Y-%m-%d')

    # Fetch personal saving rate data from FRED
    data = fetch_fred_data(FRED_SERIES_ID, FRED_API_KEY, two_years_ago)

    if data:
        # Convert the data to a DataFrame
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df['value'] = pd.to_numeric(df['value'], errors='coerce')
        df.set_index('date', inplace=True)
        
        print("\nProcessed DataFrame:")
        print(df)
        
        # Wipe existing data and refill with new data
        if not df.empty:
            wipe_and_refill_supabase(df)
        else:
            print("No data available to save.")
    else:
        print("No data fetched from FRED.")

if __name__ == '__main__':
    main()