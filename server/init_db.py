"""
Database initialization script.
Run this once to create the database tables.
"""

from database import create_db_and_tables

if __name__ == "__main__":
    try:
        print("Creating database tables...")
        create_db_and_tables()
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating database tables: {e}")
