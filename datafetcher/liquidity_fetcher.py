import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjY1NzQ1MywiZXhwIjoyMDQyMjMzNDUzfQ.8J5aPGA_6EbLjN2d5bfxNdSi6m23MVQCF0xO6RHy1JA"

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set up logging
logging.basicConfig(level=logging.INFO)

def read_csv_data(file_path):
    """
    Read the CSV file, process the data, and return a DataFrame with data from the last 3 years.
    """
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        # Check the column names and adjust if necessary
        logging.info(f"CSV columns: {df.columns}")
        
        # Assuming the columns are named 'time', 'close', and 'Plot'
        # Rename columns if they're different
        df = df.rename(columns={'time': 'date', 'close': 'qqq', 'Plot': 'liquidity'})
        
        # Convert 'date' to datetime
        df['date'] = pd.to_datetime(df['date'], unit='s')
        
        # Calculate the date 3 years ago from today
        three_years_ago = datetime.now() - timedelta(days=3*365)
        
        # Filter data for the last 3 years
        df = df[df['date'] >= three_years_ago]
        
        # Convert date to just the date part (removing time)
        df['date'] = df['date'].dt.date
        
        # Group by date and aggregate
        df = df.groupby('date').agg({
            'qqq': 'last',  # Take the last value for qqq
            'liquidity': 'sum'  # Sum the liquidity values
        }).reset_index()
        
        # Convert date back to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Sort by date
        df = df.sort_values('date')
        
        # Log the number of unique dates and some sample data
        logging.info(f"Number of unique dates: {len(df)}")
        logging.info("Sample data:")
        logging.info(df.head())
        
        return df
    except Exception as e:
        logging.error(f"Error reading CSV file: {e}")
        return None

def clear_supabase_table():
    try:
        response = supabase.table('liquidity_vs_qqq').delete().neq('id', 0).execute()
        logging.info(f"Cleared all records from Supabase table")
    except Exception as e:
        logging.error(f"Error clearing Supabase table: {e}")

def insert_data_to_supabase(df):
    """
    Insert data to the Supabase table.
    """
    try:
        # Convert Timestamp to ISO format string
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
        
        data_to_insert = df.to_dict(orient='records')
        
        # Insert data in smaller batches
        batch_size = 100
        for i in range(0, len(data_to_insert), batch_size):
            batch = data_to_insert[i:i+batch_size]
            response = supabase.table('liquidity_vs_qqq').insert(batch).execute()
            
            logging.info(f"Inserted batch {i//batch_size + 1} with {len(response.data)} records.")
        
        # Verify the data in the database after insertion
        logging.info("Verifying data in the database:")
        response = supabase.table('liquidity_vs_qqq').select('*').order('date').limit(5).execute()
        for record in response.data:
            logging.info(f"Date: {record['date']}, QQQ: {record['qqq']}, Liquidity: {record['liquidity']}")
        
    except Exception as e:
        logging.error(f"Error inserting data to Supabase: {e}")

def main():
    # Set the file path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file_path = os.path.join(script_dir, 'liquidity_data', 'BATS_QQQ, 1D_30b2e.csv')
    
    # Read CSV data
    df = read_csv_data(csv_file_path)
    
    if df is not None and not df.empty:
        logging.info(f"Read {len(df)} rows from the CSV file.")
        
        # Display the first few rows of the DataFrame
        logging.info("\nFirst few rows of the DataFrame:")
        logging.info(df.head())
        
        # Clear the Supabase table
        clear_supabase_table()
        
        # Insert data to Supabase
        insert_data_to_supabase(df)
    else:
        logging.error("Failed to read CSV data or DataFrame is empty. Exiting.")

if __name__ == '__main__':
    main()