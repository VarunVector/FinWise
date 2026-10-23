"""
MongoDB Configuration and Questionnaire Data Management Service
Loads environment variables from backend/.env and manages MongoDB Atlas connections
and questionnaire data persistence.
"""
import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Load environment variables from backend/.env file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://rohantarange05_db_user:hGjqyr7LSixrJJd4@cluster0.dbcegx0.mongodb.net")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "finwise_db")

mongo_client = None

def get_mongo_client():
    global mongo_client
    if mongo_client is None:
        try:
            mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            print(f"[MongoDB] Client initialized for URI: {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else 'localhost'}")
        except Exception as e:
            print(f"[MongoDB] Connection error initializing client: {e}")
            mongo_client = None
    return mongo_client

def get_db():
    client = get_mongo_client()
    if client:
        return client[MONGODB_DB_NAME]
    return None

def test_connection():
    """Verify MongoDB connectivity by executing ping."""
    client = get_mongo_client()
    if not client:
        return False, "Failed to create MongoClient instance."
    try:
        client.admin.command('ping')
        return True, "Successfully connected to MongoDB Atlas."
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        return False, f"MongoDB connection failure: {str(e)}"
    except Exception as e:
        return False, f"Unexpected MongoDB error: {str(e)}"

def save_questionnaire_record(user_info, questionnaire_answers, model_input=None, risk_assessment_output=None):
    """
    Save or update a questionnaire submission record in the 'questionnaires' collection.
    
    Parameters:
        user_info (dict): e.g. {'email': 'user@example.com', 'name': 'John Doe', 'user_id': '123'}
        questionnaire_answers (dict): Raw responses to questionnaire questions.
        model_input (dict, optional): Scaled inputs used for risk assessment ML inference.
        risk_assessment_output (dict, optional): ML model calculation output.
    """
    db = get_db()
    if db is None:
        print("[MongoDB] Warning: Database connection unavailable. Questionnaire not saved to MongoDB.")
        return None

    try:
        collection = db['questionnaires']
        email = user_info.get('email') or user_info.get('user_id') or 'anonymous'
        
        document = {
            'email': email,
            'user_name': user_info.get('name', ''),
            'user_id': user_info.get('user_id', ''),
            'questionnaire_answers': questionnaire_answers,
            'model_input': model_input or {},
            'risk_assessment_output': risk_assessment_output or {},
            'updated_at': datetime.datetime.utcnow().isoformat() + 'Z'
        }

        # Upsert based on email
        filter_query = {'email': email}
        update_data = {
            '$set': document,
            '$setOnInsert': {'created_at': datetime.datetime.utcnow().isoformat() + 'Z'}
        }
        
        result = collection.update_one(filter_query, update_data, upsert=True)
        print(f"[MongoDB] Successfully saved questionnaire record for '{email}'. Matched: {result.matched_count}, Modified: {result.modified_count}, UpsertedId: {result.upserted_id}")
        
        return {
            'success': True,
            'email': email,
            'upserted_id': str(result.upserted_id) if result.upserted_id else None
        }
    except Exception as e:
        print(f"[MongoDB] Error saving questionnaire record: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def get_questionnaire_records(email=None, limit=20):
    """Retrieve questionnaire records from MongoDB."""
    db = get_db()
    if db is None:
        return []
    try:
        collection = db['questionnaires']
        query = {'email': email} if email else {}
        cursor = collection.find(query, {'_id': 0}).sort('updated_at', -1).limit(limit)
        return list(cursor)
    except Exception as e:
        print(f"[MongoDB] Error reading questionnaire records: {e}")
        return []

if __name__ == '__main__':
    ok, msg = test_connection()
    print(f"Test connection result: {ok} -> {msg}")
