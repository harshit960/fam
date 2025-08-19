# FAM - Backend Intern Assignment
This app continuously monitors YouTube for new videos and stores them in a database for a given query.


## Backend Architecture

**FastAPI server**

- **Auto-monitors YouTube** - Runs background tasks to fetch new videos every 10 seconds.
- **Smart API key management** - Handles multiple YouTube API keys with automatic failover
- **PostgreSQL Database** - Uses SQLModel to save video metadata (title, description, thumbnails, etc.)
- **Serves data** - Provides paginated endpoints to access stored videos

## Bonus Points 

- ✅ **Multiple API key support** - Automatically switches between API keys when quota is exhausted on one, ensuring uninterrupted monitoring
- ✅ **Very minimal dashboard with filters and sorting** - Built a React frontend to view stored videos with search, filter, and sorting capabilities

### Default query used to fetch videos = "Cricket"

## Quick Start

### Backend Setup
```bash
cd server
pip install -r requirements.txt
python init_db.py  
fastapi dev app.py
```

### Frontend Setup  
```bash
cd client
npm install
npm run dev
```

## Environment Setup

Create a `.env` file in the server directory:
```
PORT=8000
YT_QUERY=cricket
WAITING_TIME=10                     # Time in seconds to wait between API calls
YT_API_KEY=api_key_1,api_key_2,...  # Your YouTube Data API keys
DATABASE_URL="postgresql+psycopg://username:password@localhost/dbname" 
```

You can add multiple API keys separated by commas for better rate limiting.

## Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLModel (Database ORM)
- YouTube Data API v3

**Frontend:**
- Vite React
- Tailwind CSS


## API Documentation

### Health Check
**GET** `/`

**Response:**
```json
{
  "Hello": "World"
}
```

### Get Videos (Paginated)
**GET** `/videos?page=1&page_size=10`

**Query Parameters:**
- `page` (integer, min: 1, default: 1) - Page number
- `page_size` (integer, min: 1, max: 100, default: 10) - Number of videos per page

**Sample Request:**
```bash
curl "http://localhost:8000/videos?page=1&page_size=5"
```

**Sample Response:**
```json
{
  "videos": [
    {
      "id": 1,
      "video_id": "dQw4w9WgXcQ",
      "video_kind": "youtube#video",
      "published_at": "2024-01-15T10:30:00Z",
      "channel_id": "UCuAXFkgsw1L7xaCfnd5JJOw",
      "title": "Amazing Cricket Highlights",
      "description": "Best cricket moments from the match...",
      "channel_title": "Cricket World",
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg"
    },
    {
      "id": 2,
      "video_id": "abc123xyz",
      "video_kind": "youtube#video", 
      "published_at": "2024-01-14T15:45:00Z",
      "channel_id": "UCdefghijk123456789",
      "title": "Cricket Tutorial for Beginners",
      "description": "Learn cricket basics in this comprehensive guide...",
      "channel_title": "Sports Academy",
      "thumbnail_url": "https://i.ytimg.com/vi/abc123xyz/default.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 5,
    "total_count": 150,
    "total_pages": 30,
    "has_next": true,
    "has_previous": false
  }
}
```

---

