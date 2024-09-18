import yfinance as yf
from supabase import create_client, Client
import datetime

# Hardcoded Supabase credentials
SUPABASE_URL = "https://jfhelnsdfzbwwrmbuoms.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTc0NTMsImV4cCI6MjA0MjIzMzQ1M30.znNkgn8tTnmSFZYmRYV6IbTKrWYtg9Ql-EDvpPyOTgA"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch today's VIX data
def fetch_todays_vix_data():
    vix = yf.Ticker("^VIX")
    today = datetime.datetime.now().date()
    vix_data = vix.history(period="1d")
    
    if not vix_data.empty:
        return today, vix_data['Close'].iloc[-1]
    else:
        return None, None

# Insert or update today's VIX data in Supabase
def upsert_vix_data(date, vix_value):
    timestamp = date.isoformat()
    
    # Check if an entry for today already exists
    response = supabase.table('vix_data').select('*').eq('timestamp', timestamp).execute()
    
    if response.data:
        # Update existing entry
        response = supabase.table('vix_data').update({'VIX': vix_value}).eq('timestamp', timestamp).execute()
        print(f"Updated VIX data for {timestamp}: {vix_value}")
    else:
        # Insert new entry
        response = supabase.table('vix_data').insert({'timestamp': timestamp, 'VIX': vix_value}).execute()
        print(f"Inserted new VIX data for {timestamp}: {vix_value}")

    # Check for errors in the response
    if response.data is None:
        print(f"Failed to upsert data for {timestamp}: {response}")

# Main function
def main():
    print("Fetching today's VIX data...")
    date, vix_value = fetch_todays_vix_data()

    if date and vix_value:
        print("Upserting VIX data into the vix_data table...")
        upsert_vix_data(date, vix_value)
    else:
        print("Failed to fetch today's VIX data.")

if __name__ == "__main__":
    main()
