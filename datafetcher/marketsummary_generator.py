import os
import yfinance as yf
from supabase import create_client, Client  # Import Supabase client
from openai import OpenAI
from dotenv import load_dotenv  # To load environment variables
from datetime import datetime
import pandas as pd  # Import pandas for moving average calculations
import requests
from bs4 import BeautifulSoup

# Load environment variables from .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = "https://jfhelnsdfzbwwrmbuoms.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTc0NTMsImV4cCI6MjA0MjIzMzQ1M30.znNkgn8tTnmSFZYmRYV6IbTKrWYtg9Ql-EDvpPyOTgA"

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# OpenAI API key setup
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please set it and try again.")

client = OpenAI(api_key=openai_api_key)

# Function to fetch market data and calculate moving averages
def get_market_data_with_moving_averages(tickers):
    market_data = {}
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        try:
            # Use "3mo" to fetch the last 3 months of historical data for moving average calculations
            hist = stock.history(period="3mo")
            
            if hist.empty:
                raise ValueError(f"Keine Daten für {ticker} verfügbar")

            # Calculate the 5-day, 20-day, and 50-day moving averages
            hist['MA5'] = hist['Close'].rolling(window=5).mean()
            hist['MA20'] = hist['Close'].rolling(window=20).mean()
            hist['MA50'] = hist['Close'].rolling(window=50).mean()

            # Get the latest available data
            latest = hist.iloc[-1]

            # Check trend direction based on moving averages
            if latest['Close'] < latest['MA5'] and latest['Close'] < latest['MA20']:
                trend = 'falling'
            elif latest['Close'] > latest['MA5'] and latest['Close'] > latest['MA20']:
                trend = 'rising'
            else:
                trend = 'neutral'

            market_data[ticker] = {
                'Name': stock.info.get('longName', 'Unknown'),
                'Last Price': latest['Close'],
                'Change': latest['Close'] - latest['Open'],
                'Percent Change': ((latest['Close'] - latest['Open']) / latest['Open']) * 100,
                'MA5': latest['MA5'],
                'MA20': latest['MA20'],
                'MA50': latest['MA50'],
                'Trend': trend
            }

        except Exception as e:
            print(f"Fehler bei {ticker}: {e}")
            market_data[ticker] = {
                'Name': stock.info.get('longName', 'Unknown'),
                'Last Price': 'N/A',
                'Change': 'N/A',
                'Percent Change': 'N/A',
                'MA5': 'N/A',
                'MA20': 'N/A',
                'MA50': 'N/A',
                'Trend': 'N/A'
            }
    return market_data

# Function to scrape CNBC headlines
def scrape_cnbc_headlines():
    url = "https://www.cnbc.com/world/?region=world"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    headlines = soup.find_all('a', class_='LatestNews-headline')
    return [headline.text.strip() for headline in headlines[:10]]  # Get top 10 headlines

# Function to generate a concise interpretation focusing only on notable trends
def format_data_for_llm(market_data):
    trends = []
    for ticker, data in market_data.items():
        name = data['Name']
        trend = data['Trend']

        if trend == 'falling':
            trends.append(f"{name} zeigt eine Abwärtsbewegung.")
        elif trend == 'rising':
            trends.append(f"{name} zeigt eine Aufwärtsbewegung.")
        elif trend == 'neutral':
            trends.append(f"{name} zeigt keine signifikante Bewegung.")

    # If no notable trends, return a default message
    if not trends:
        return "Der Markt zeigt derzeit keine signifikanten Bewegungen."
    else:
        return " ".join(trends)

# Function to generate a concise market interpretation in simple language
def generate_llm_interpretation(market_data_text, headlines):
    prompt = f"""
    Basierend auf den folgenden aktuellen Marktdaten, den erkannten Trends und den aktuellen CNBC-Schlagzeilen:

    Marktdaten und Trends:
    {market_data_text}

    Aktuelle CNBC-Schlagzeilen:
    {'. '.join(headlines)}

    Erstelle eine kurze, prägnante Analyse (maximal 4-5 Sätze) des globalen Marktgeschehens. Berücksichtige dabei sowohl die Marktdaten als auch die Schlagzeilen. Für den Nutzer, der einen Schnellüberblick über den Markt benötigt. Zusatzinfo für die KI zur Einordnung der Lage: US-Arbeitsmarkt schwächelt (Sahm-Regel ausgelöst), Leitzinsen fallen, Zinsstrukturkurve gerade re-inverted.
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Du bist ein erfahrener Börsenanalyst."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0.7,
    )
    
    return response.choices[0].message.content

# Function to store the market overview in the Supabase database
def store_in_database(market_summary):
    try:
        # Insert market summary into the Supabase table "summary_data"
        data = {
            "summary": market_summary
        }
        response = supabase.table('summary_data').insert(data).execute()

        if response.data:
            print("Marktübersicht erfolgreich in die Supabase-Datenbank geschrieben.")
        else:
            print(f"Fehler beim Schreiben in die Datenbank: {response.error}")

    except Exception as error:
        print(f"Fehler beim Schreiben in die Datenbank: {error}")

# List of tickers for a broader market view, including sector ETFs
tickers = [
    '^GSPC', '^DJI', '^IXIC', '^RUT', '^GDAXI', '^FTSE', '^N225', '^HSI',
    'GC=F', 'SI=F', 'CL=F', 'EURUSD=X', 'JPY=X', 'BTC-USD', 'ETH-USD', '^TNX', '^VIX',
    'QQQ', 'XLE', 'XLF', 'XLV', 'XLP', 'XLY', 'XLI', 'XLRE', 'SOXX'
]

# Fetch market data with moving averages
market_data = get_market_data_with_moving_averages(tickers)

# Format the data for LLM
formatted_market_data = format_data_for_llm(market_data)

# Scrape CNBC headlines
cnbc_headlines = scrape_cnbc_headlines()

# Generate longer-term trend analysis using LLM
llm_interpretation = generate_llm_interpretation(formatted_market_data, cnbc_headlines)

# Store the market overview in the Supabase database
store_in_database(llm_interpretation)

print("Market analysis completed and stored in the database.")
