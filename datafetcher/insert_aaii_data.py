import os
import pandas as pd
import numpy as np
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = "https://jfhelnsdfzbwwrmbuoms.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTc0NTMsImV4cCI6MjA0MjIzMzQ1M30.znNkgn8tTnmSFZYmRYV6IbTKrWYtg9Ql-EDvpPyOTgA"

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def authenticate():
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

    creds = None
    if os.path.exists(SERVICE_ACCOUNT_FILE):
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    else:
        print("Service account file not found.")
    return creds

def fetch_sheet_data(creds):
    SAMPLE_SPREADSHEET_ID = '14Om8hHNuufjWj7dsFKLkpwHH1zuYQ31hIghUJUODn5Q'
    SAMPLE_RANGE_NAME = 'Sheet1!A1:G'  # Fetch up to column G (where bull-bear spread is)

    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()

    result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID,
                                range=SAMPLE_RANGE_NAME).execute()
    values = result.get('values', [])

    if not values:
        print('No data found.')
        return None
    else:
        print(f"Fetched {len(values)} rows of data.")
        return values

def convert_to_float(x):
    if x in ['#N/A', '', None]:
        return None
    x = x.replace('%', '')  # Remove percentage sign
    x = x.replace(',', '.')  # Replace comma with dot for decimal conversion
    try:
        return float(x) / 100  # Convert to float and divide by 100 to get the actual percentage
    except ValueError:
        print(f"Warning: Could not convert '{x}' to float. Returning None.")
        return None

def process_aaii_data(data):
    # Convert the last row of data into a pandas DataFrame
    df = pd.DataFrame([data[-1]], columns=data[0])  # Use the last row and first row as header

    # Standardize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

    print("\nColumns after renaming:", df.columns)

    if 'reported_date' not in df.columns or 'bull_bear_spread' not in df.columns:
        print("Error: 'reported_date' or 'bull_bear_spread' column not found. Please check the column names.")
        return None

    # Rename columns to match our database schema
    df = df.rename(columns={'reported_date': 'created_at', 'bull_bear_spread': 'spread'})

    # Convert the 'spread' column to float
    df['spread'] = df['spread'].apply(convert_to_float)

    # Convert 'created_at' to datetime format
    df['created_at'] = pd.to_datetime(df['created_at'], format='%m-%d-%y')

    # Ensure the date is not in the future
    current_date = pd.Timestamp.now().floor('D')
    if df['created_at'].iloc[0] > current_date:
        df['created_at'] = df['created_at'] - pd.DateOffset(years=100)

    print("\nProcessed dataframe:")
    print(df)
    print("\nColumns after processing:", df.columns)

    return df[['created_at', 'spread']]  # Return only the relevant columns

def save_to_supabase(df):
    try:
        # Convert DataFrame to a single record
        data = df.to_dict(orient='records')[0]
        
        # Convert Timestamp object to ISO format string
        data['created_at'] = data['created_at'].isoformat()

        # Check if a record with the same created_at already exists
        existing_record = supabase.table('aaii_data').select('*').eq('created_at', data['created_at']).execute()

        if existing_record.data:
            # If record exists, update it
            record_id = existing_record.data[0]['id']  # Assuming 'id' is the primary key
            response = supabase.table('aaii_data').update(data).eq('id', record_id).execute()
            print(f"Record updated for date {data['created_at']}")
        else:
            # If record doesn't exist, insert it
            response = supabase.table('aaii_data').insert(data).execute()
            print(f"New record inserted for date {data['created_at']}")

        if response.data:
            print("Operation successful. Data:", response.data)
        else:
            print("No changes made. Response:", response)

    except Exception as e:
        print(f"Error: {e}")

def main():
    creds = authenticate()
    if not creds:
        print("Authentication failed.")
        return
    data = fetch_sheet_data(creds)
    if data:
        df = process_aaii_data(data)
        if df is not None and not df.empty:
            save_to_supabase(df)
        else:
            print("Failed to process data or no data available.")
    else:
        print("No data found or error occurred.")

if __name__ == '__main__':
    main()
