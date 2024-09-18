import yfinance as yf
from supabase import create_client, Client
import datetime

# Hardcoded Supabase credentials
SUPABASE_URL = "https://jfhelnsdfzbwwrmbuoms.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTc0NTMsImV4cCI6MjA0MjIzMzQ1M30.znNkgn8tTnmSFZYmRYV6IbTKrWYtg9Ql-EDvpPyOTgA"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch VIX data for the last 2 years
def fetch_vix_data():
    vix = yf.Ticker("^VIX")
    end_date = datetime.datetime.now().date()
    start_date = end_date - datetime.timedelta(days=730)  # Two years back
    vix_data = vix.history(start=start_date, end=end_date)

    return vix_data

# Insert VIX data into Supabase
def insert_vix_data(vix_data):
    for index, row in vix_data.iterrows():
        timestamp = index.isoformat()
        vix_value = row['Close']
        
        # Insert the data into the vix_data table
        response = supabase.table('vix_data').insert({
            'timestamp': timestamp,
            'VIX': vix_value
        }).execute()

        # Check for errors in the response
        if response.data is None:
            print(f"Failed to insert data for {timestamp}: {response}")
        else:
            print(f"Inserted VIX data for {timestamp}: {vix_value}")

# Main function
def main():
    print("Fetching VIX data for the last two years...")
    vix_data = fetch_vix_data()

    print("Inserting VIX data into the vix_data table...")
    insert_vix_data(vix_data)

if __name__ == "__main__":
    main()
