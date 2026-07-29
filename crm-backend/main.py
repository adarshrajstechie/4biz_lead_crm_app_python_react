import os
import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import jwt

app = FastAPI()

# Enable CORS so your Next.js site and Vite SPA can send requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, swap with your live frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect with Supabase Environment Variables
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")  
JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-crm-key-9988")

# Fetch CRM credentials from environment variables with fallback defaults
CRM_USERNAME = os.environ.get("CRM_USERNAME")
CRM_PASSWORD = os.environ.get("CRM_PASSWORD")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase configuration variables.")

# Initializing with the Backend Secret Key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- DATA SCHEMAS ---
class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- AUTH MIDDLEWARE ---
def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

# --- API ROUTES ---

@app.post("/api/leads")
def create_lead(lead: LeadCreate):
    """Next.js contact page forwards incoming form submissions here."""
    data = {
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "message": lead.message,
        "status": "New Lead"
    }
    response = supabase.table("leads").insert(data).execute()
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=400, detail="Failed to persist lead record.")
    return {"status": "success", "lead": response.data[0]}

@app.post("/api/auth/login")
def login(credentials: LoginRequest):
    """Initial CRM Login using dynamic environment or default credentials."""
    if credentials.username == CRM_USERNAME and credentials.password == CRM_PASSWORD:
        token = jwt.encode(
            {"user": CRM_USERNAME, "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=8)},
            JWT_SECRET,
            algorithm="HS256"
        )
        return {"token": token}
    raise HTTPException(status_code=401, detail="Incorrect username or password configuration.")

@app.get("/api/crm/leads")
def get_crm_leads(token: str):
    """Protected route: Retrieves all active leads."""
    verify_token(token)
    response = supabase.table("leads").select("*").order("created_at", desc=True).execute()
    return response.data

@app.put("/api/crm/leads/{lead_id}")
def update_lead_status(lead_id: str, payload: StatusUpdate, token: str):
    """Protected route: Updates structural status stages."""
    verify_token(token)
    allowed_statuses = ['New Lead', 'Genuine', 'Spam', 'Successful Conversion']
    if payload.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status type assignment.")
        
    response = supabase.table("leads").update({"status": payload.status}).eq("id", lead_id).execute()
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Target lead record not found.")
    return response.data[0]