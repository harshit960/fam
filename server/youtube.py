import requests
import time
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

from database import insert_videos_in_db

load_dotenv()

query= os.getenv('YT_QUERY', 'cricket')
waiting_time = int(os.getenv('WAITING_TIME', 10))

# API Key management
# Disable key if 403 or 429 error code is raised
API_KEYS = []
api_key_env = os.getenv('YT_API_KEY')
if api_key_env:
    API_KEYS = [key.strip() for key in api_key_env.split(',')]
else:
    raise ValueError("YOUTUBE_API_KEY not found in environment variables. Please check your .env file.")

api_key_status = {
    key: {
        'is_active': True,
        'updated_time': datetime.now(),
        'error_count': 0
    } 
    for key in API_KEYS
}

URL = "https://www.googleapis.com/youtube/v3/search"
HEADERS = {'Accept': 'application/json'}

def get_active_api_key():
    """Get the next available active API key"""
    current_time = datetime.now()
    for key in api_key_status:
        if not api_key_status[key]['is_active']:
            time_diff = current_time - api_key_status[key]['updated_time']
            if time_diff > timedelta(hours=1):
                api_key_status[key]['is_active'] = True
                api_key_status[key]['error_count'] = 0
                print(f"API key reactivated after cooldown: {key[:10]}...")
    
    for key in API_KEYS:
        if api_key_status[key]['is_active']:
            return key
    
    raise Exception("No active API keys available. All keys are rate limited.")

def deactivate_api_key(api_key, error_code):
    """Deactivate API key due to rate limiting"""
    if api_key in api_key_status:
        api_key_status[api_key]['is_active'] = False
        api_key_status[api_key]['updated_time'] = datetime.now()
        api_key_status[api_key]['error_count'] += 1
        print(f"API key deactivated due to {error_code} error: {api_key[:10]}...")

# YT Data API v3 fetch handler
def fetch_youtube_data():
    """Fetch data with automatic API key rotation on rate limits"""
    api_key = get_active_api_key()
    
    params = {
        'part': 'snippet',
        'q': query,
        'order': 'date',
        'key': api_key
    }
    try:
        response = requests.get(URL, headers=HEADERS, params=params)
        
        if response.status_code in [403, 429]:
            deactivate_api_key(api_key, response.status_code)
            
            try:
                new_api_key = get_active_api_key()
                params['key'] = new_api_key
                response = requests.get(URL, headers=HEADERS, params=params)
                response.raise_for_status()
            except Exception as e:
                print(f"All API keys exhausted. Error: {e}")
                return None
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# YT API monitoring function
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
            print(f"\nWaiting {waiting_time} seconds...")
            time.sleep(waiting_time)
    except KeyboardInterrupt:
        print("\nMonitoring stopped.")
