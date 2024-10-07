import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set up logging
logging.basicConfig(level=logging.INFO)

def read_csv_data(file_path):
    """
    Read the CSV file and return a DataFrame.
    """
    try:
        # Skip the header row (row 0) and use custom column names
        df = pd.read_csv(file_path, skiprows=[0], header=None, names=['time', 'close', 'Plot'])
        df['time'] = pd.to_datetime(df['time'], unit='s')
        df = df.rename(columns={'time': 'date', 'close': 'qqq', 'Plot': 'liquidity'})
        return df
    except Exception as e:
        logging.error(f"Error reading CSV file: {e}")
        return None

def upsert_data_to_supabase(df):
    """
    Upsert data to the Supabase table, overwriting existing entries if the date already exists.
    """
    try:
        # Convert Timestamp to ISO format string
        df['date'] = df['date'].dt.strftime('%Y-%m-%dT%H:%M:%S%z')
        
        data_to_upsert = df.to_dict(orient='records')
        
        response = supabase.table('liquidity_vs_qqq').upsert(
            data_to_upsert,
            on_conflict='date'
        ).execute()
        
        logging.info(f"Upserted {len(response.data)} records into the table.")
        
        # Verify the data in the database after upsertion
        logging.info("Verifying data in the database:")
        response = supabase.table('liquidity_vs_qqq').select('*').order('date').limit(5).execute()
        for record in response.data:
            logging.info(f"Date: {record['date']}, QQQ: {record['qqq']}, Liquidity: {record['liquidity']}")
        
    except Exception as e:
        logging.error(f"Error upserting data to Supabase: {e}")

def main():
    # Set the file path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file_path = os.path.join(script_dir, 'liquidity_data', 'BATS_QQQ, 1D_fca69.csv')
    
    # Read CSV data
    df = read_csv_data(csv_file_path)
    
    if df is not None:
        logging.info(f"Read {len(df)} rows from the CSV file.")
        
        # Display the first few rows of the DataFrame
        logging.info("\nFirst few rows of the DataFrame:")
        logging.info(df.head())
        
        # Upsert data to Supabase
        upsert_data_to_supabase(df)
    else:
        logging.error("Failed to read CSV data. Exiting.")

if __name__ == '__main__':
    main()