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

# FRED series ID for Delinquency Rate on Credit Card Loans, All Commercial Banks
FRED_SERIES_ID = 'DRCCLACBS'

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_fred_data(series_id, api_key, start_date):
    """
    Fetches Delinquency Rate on Credit Card Loans data directly from FRED API.
    """
    url = f"https://api.stlouisfed.org/fred/series/observations"
    params = {
        'series_id': series_id,
        'api_key': api_key,
        'file_type': 'json',
        'observation_start': start_date
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
    Save delinquency rate data to Supabase.
    """
    for index, row in df.iterrows():
        try:
            # Prepare the data for insertion
            data = {
                'date': index.isoformat(),
                'delinquency_rate': row['value']  # Delinquency rate from the API response
            }

            # Check if a record with the same date already exists
            existing_record = supabase.table('credit_card_delinquency_data').select('*').eq('date', data['date']).execute()

            if existing_record.data:
                # If record exists, update it
                record_id = existing_record.data[0]['id']  # Assuming 'id' is the primary key
                response = supabase.table('credit_card_delinquency_data').update(data).eq('id', record_id).execute()
                print(f"Record updated for date {data['date']}")
            else:
                # If record doesn't exist, insert it
                response = supabase.table('credit_card_delinquency_data').insert(data).execute()
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

    # Fetch delinquency rate data from FRED
    data = fetch_fred_data(FRED_SERIES_ID, FRED_API_KEY, two_years_ago)

    if data:
        # Convert the data to a DataFrame
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df['value'] = pd.to_numeric(df['value'], errors='coerce')  # Delinquency rate value
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