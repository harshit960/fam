import requests
import time
import json
import os
from datetime import datetime
from dotenv import load_dotenv

from database import insert_videos_in_db

load_dotenv()

API_KEY = os.getenv('YT_API_KEY')

if not API_KEY:
    raise ValueError("YOUTUBE_API_KEY not found in environment variables. Please check your .env file.")

URL = "https://www.googleapis.com/youtube/v3/search"
HEADERS = {'Accept': 'application/json'}

def fetch_youtube_data():
    params = {
        'part': 'snippet',
        'q': 'cricket',
        'order': 'date',
        'key': API_KEY
    }
    try:
        response = requests.get(URL, headers=HEADERS, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

def monitor_youtube():
    """Monitor YouTube API every 10 seconds"""
    print("Starting YouTube API monitoring...")
    
    try:
        while True:
            try:
                data = fetch_youtube_data()
                if data:
                    insert_videos_in_db(data["items"])
            except Exception as e:
                print(f"Error during monitoring loop: {e}")
            print(f"\nWaiting 10 seconds...")
            time.sleep(10)
    except KeyboardInterrupt:
        print("\nMonitoring stopped.")
