import csv
import uuid
import time
import datetime
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
# Mounted via Docker volume
cred_path = os.getenv("FIREBASE_CREDENTIALS", "/app/serviceAccountKey.json")
if not os.path.exists(cred_path):
    print(f"❌ Error: Firebase credentials not found at {cred_path}")
    exit(1)

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

USER_UID = os.getenv("USER_UID")
if not USER_UID:
    print("❌ Error: USER_UID environment variable is required")
    exit(1)

DEFAULT_TIMEZONE = os.getenv("DEFAULT_TIMEZONE", "America/New_York")
CSV_PATH = os.getenv("CSV_PATH", "/app/events.csv")

def parse_date(date_str):
    """
    Parses messy date strings and returns (formatted_date_string, unknown_year_boolean)
    """
    if not date_str or date_str.strip() == "":
        return None, False
        
    date_str = date_str.strip()
    
    # Handle DD/MM/ (missing year)
    if date_str.count('/') == 2 and date_str.endswith('/'):
        parts = date_str.split('/')
        day = parts[0].zfill(2)
        month = parts[1].zfill(2)
        return f"2000-{month}-{day}", True  # Use 2000 as placeholder year for unknown years
        
    # Handle DD-MMM-YY (e.g., 5-Jan-74)
    try:
        # Some dates use double hyphens or other weird chars, clean them first
        clean_str = date_str.replace('--', '-').replace('/', '-')
        dt = datetime.datetime.strptime(clean_str, "%d-%b-%y")
        # Handle 20th vs 21st century pivot (adjust as needed)
        if dt.year > 2026: 
            dt = dt.replace(year=dt.year - 100)
        return dt.strftime("%Y-%m-%d"), False
    except ValueError:
        # Try YYYY-MM-DD
        try:
            dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            return dt.strftime("%Y-%m-%d"), False
        except ValueError:
            print(f"⚠️ Could not automatically parse date: {date_str}. Needs manual fix.")
            return None, False

def upload_event(name, event_date_str, event_type):
    formatted_date, is_unknown_year = parse_date(event_date_str)
    
    if not formatted_date:
        return # Skip empty or unparseable dates
        
    doc_id = str(uuid.uuid4())
    event_data = {
        "id": doc_id,
        "userId": USER_UID,
        "name": name,
        "type": event_type,
        "birthdate": formatted_date, # Schema uses 'birthdate' for the date field regardless of event type
        "unknownYear": is_unknown_year,
        "timezone": DEFAULT_TIMEZONE,
        "createdAt": int(time.time() * 1000)
    }
    
    db.collection("birthdays").document(doc_id).set(event_data)
    print(f"✅ Uploaded {event_type} for {name}")

# Read CSV and process
if not os.path.exists(CSV_PATH):
    print(f"❌ Error: CSV file not found at {CSV_PATH}")
    exit(1)

with open(CSV_PATH, mode='r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        name = row.get("First Name", "").strip()
        birthday = row.get("Birthday", "").strip()
        anniversary = row.get("Anniversary", "").strip()
        
        if name:
            if birthday:
                upload_event(name, birthday, "birthday")
            if anniversary:
                upload_event(name, anniversary, "anniversary")

print("Migration complete!")
