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
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

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

    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        return data['observations']
    else:
        print(f"Error fetching data: {response.status_code}")
        print(f"Response message: {response.text}")
        return None

def save_to_supabase(df):
    """
    Save personal saving rate data to Supabase.
    """
    for index, row in df.iterrows():
        try:
            data = {
                'date': index.isoformat(),
                'saving_rate': row['value']
            }

            existing_record = supabase.table('personal_saving_rate_data').select('*').eq('date', data['date']).execute()

            if existing_record.data:
                record_id = existing_record.data[0]['id']
                response = supabase.table('personal_saving_rate_data').update(data).eq('id', record_id).execute()
                print(f"Record updated for date {data['date']}")
            else:
                response = supabase.table('personal_saving_rate_data').insert(data).execute()
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

    # Fetch personal saving rate data from FRED
    data = fetch_fred_data(FRED_SERIES_ID, FRED_API_KEY, two_years_ago)

    if data:
        # Convert the data to a DataFrame
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df['value'] = pd.to_numeric(df['value'], errors='coerce')
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