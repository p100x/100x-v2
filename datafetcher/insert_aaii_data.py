import pandas as pd
from datetime import datetime
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Lade die Umgebungsvariablen aus der .env-Datei
load_dotenv()

# Supabase-Konfiguration
# Supabase credentials (matching your .env file)
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGVsbnNkZnpid3dybWJ1b21zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjY1NzQ1MywiZXhwIjoyMDQyMjMzNDUzfQ.8J5aPGA_6EbLjN2d5bfxNdSi6m23MVQCF0xO6RHy1JA")

# Initialisiere Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def find_xls_file(folder_path):
    """Findet die erste .xls-Datei im angegebenen Ordner"""
    try:
        for file_name in os.listdir(folder_path):
            if file_name.endswith('.xls'):
                return os.path.join(folder_path, file_name)
        return None
    except Exception as e:
        print(f"Fehler beim Finden der Datei: {e}")
        return None

def read_sentiment_data(file_path):
    try:
        # Lese die Excel-Datei, überspringe die ersten 10 Zeilen, die keine relevanten Daten enthalten
        df = pd.read_excel(file_path, skiprows=10)

        # Debugging: Zeige die ersten Zeilen der Datei an
        print("Erste 5 Zeilen der Datei nach dem Einlesen:\n", df.head())

        # Wähle die relevanten Spalten (Datum, Bullish, Bearish)
        df = df[[df.columns[0], df.columns[1], df.columns[3]]]  # Datum, Bullish, Bearish
        df.columns = ['Date', 'Bullish', 'Bearish']  # Benenne die Spalten

        # Konvertiere die Prozentsätze nur dann in Strings, wenn sie tatsächlich Strings sind
        if df['Bullish'].dtype == 'object':
            df['Bullish'] = df['Bullish'].str.replace(',', '.').str.rstrip('%').astype(float)
        if df['Bearish'].dtype == 'object':
            df['Bearish'] = df['Bearish'].str.replace(',', '.').str.rstrip('%').astype(float)

        # Berechne den Bull-Bear-Spread
        df['Spread'] = df['Bullish'] - df['Bearish']

        # Konvertiere die Datumsspalte in ein datetime-Objekt
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        df = df.dropna(subset=['Date'])  # Entferne ungültige Datumszeilen

        # Wähle die neueste Zeile basierend auf dem Datum
        latest_row = df.sort_values(by='Date', ascending=False).iloc[0]

        # Extrahiere das Datum und den Spread
        latest_date = latest_row['Date'].isoformat()  # Konvertiere das Datum in das ISO-Format
        latest_spread = latest_row['Spread']

        return latest_date, latest_spread

    except Exception as e:
        print(f"Fehler beim Lesen der Datei: {e}")
        return None, None

def upsert_aaii_data(date, spread):
    table_name = 'aaii_data'
    
    # Überprüfe, ob bereits ein Eintrag für dieses Datum existiert
    response = supabase.table(table_name).select('*').eq('created_at', date).execute()
    
    if response.data:
        # Aktualisiere den bestehenden Eintrag
        response = supabase.table(table_name).update({'spread': spread}).eq('created_at', date).execute()
        print(f"Aktualisierte AAII-Daten für {date}: {spread}")
    else:
        # Füge einen neuen Eintrag hinzu
        response = supabase.table(table_name).insert({'created_at': date, 'spread': spread}).execute()
        print(f"Neuer AAII-Dateneintrag für {date}: {spread}")
    
    # Überprüfe auf Fehler in der Antwort
    if response.data is None:
        print(f"Fehler beim Einfügen/Aktualisieren der Daten für {date}: {response}")

def main():
    # Ordner, in dem die Datei liegt
    folder_path = 'sentiment_file'
    
    # Finde die .xls-Datei in dem Ordner
    sentiment_file_path = find_xls_file(folder_path)
    
    if sentiment_file_path:
        print(f"Gefundene Datei: {sentiment_file_path}")
        # Lese die Daten aus der Datei
        date, spread = read_sentiment_data(sentiment_file_path)
        
        if date is not None and spread is not None:
            print(f"Verarbeite Datum: {date}, Spread: {spread}")
            
            # Füge die Daten in die Datenbank ein
            upsert_aaii_data(date, spread)
        else:
            print("Keine gültigen Daten zum Verarbeiten gefunden.")
    else:
        print(f"Keine .xls-Datei im Ordner '{folder_path}' gefunden.")

if __name__ == "__main__":
    main()
