import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def initialize_firebase():
    if not firebase_admin._apps:
        firebase_json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        firebase_path_or_json = os.getenv("FIREBASE_CREDENTIALS_PATH")

        # Handle the case where JSON content was accidentally put in the PATH variable
        if not firebase_json_str and firebase_path_or_json and firebase_path_or_json.strip().startswith("{"):
            firebase_json_str = firebase_path_or_json
            firebase_path_or_json = None

        if firebase_json_str:
            try:
                cred_dict = json.loads(firebase_json_str)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                return True
            except json.JSONDecodeError:
                print("Error: Firebase JSON credential string is not valid JSON.")
                raise ValueError("Invalid JSON in Firebase credentials environment variable.")
            except Exception as e:
                print("Error initializing Firebase Admin from JSON environment variable.")
                raise ValueError("Failed to initialize Firebase Admin from JSON.")

        if not firebase_path_or_json:
            print("WARNING: Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_CREDENTIALS_PATH is set.")
            return False
        
        if not os.path.isabs(firebase_path_or_json):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            firebase_path_or_json = os.path.join(base_dir, firebase_path_or_json)

        try:
            if not os.path.exists(firebase_path_or_json):
                print(f"WARNING: Firebase credentials file not found at {firebase_path_or_json}")
                return False
            cred = credentials.Certificate(firebase_path_or_json)
            firebase_admin.initialize_app(cred)
            return True
        except OSError as e:
            if e.errno == 36:
                print("Error: The provided Firebase credentials path is too long. Did you accidentally paste JSON content instead of a file path?")
                raise ValueError("Firebase credentials path is too long.")
            print("OS Error initializing Firebase from path.")
            raise ValueError("Failed to initialize Firebase Admin with path due to OS error.")
        except Exception as e:
            print("Error initializing Firebase Admin from path.")
            raise ValueError("Failed to initialize Firebase Admin with path.")
    return True

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not initialize_firebase():
        # In a real environment we would reject, but if they haven't set up the console yet
        # we will still throw 401 if we cannot verify the token.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase Admin not configured on backend",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
