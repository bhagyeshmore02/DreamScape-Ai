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
        if firebase_json_str:
            try:
                cred_dict = json.loads(firebase_json_str)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                return True
            except Exception as e:
                print(f"Error initializing Firebase Admin from JSON env var: {e}")
                raise ValueError(f"Failed to initialize Firebase Admin from FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

        firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not firebase_credentials_path:
            # We skip throwing an error here in development if no path is set to allow testing,
            # but ideally you must have this for production.
            print("WARNING: Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_CREDENTIALS_PATH is set.")
            return False
        
        if not os.path.isabs(firebase_credentials_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            firebase_credentials_path = os.path.join(base_dir, firebase_credentials_path)

        try:
            cred = credentials.Certificate(firebase_credentials_path)
            firebase_admin.initialize_app(cred)
            return True
        except Exception as e:
            print(f"Error initializing Firebase Admin from path: {e}")
            raise ValueError(f"Failed to initialize Firebase Admin with path '{firebase_credentials_path}': {e}")
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
