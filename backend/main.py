from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import json
import models
from database import engine, get_db
from services import analyze_damage_image, generate_action_plan

# Load environment variables (like GEMINI_API_KEY)
load_dotenv()

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Infra-Pulse API", description="Backend for Civic Issue Reporting System")

# Enable CORS for the new frontend (Allow all for demo purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Infra-Pulse API"}

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "healthy", "database": "connected"}

from fastapi.concurrency import run_in_threadpool
from utils import calculate_distance

@app.post("/api/v1/reports")
async def create_report(
    description: str = Form(None),
    category: str = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Read the image
    image_bytes = await file.read()
    
    if not image_bytes or len(image_bytes) == 0:
        ai_analysis = {
            "is_valid_damage": True,
            "damage_type": category or "uncategorized",
            "severity": "LOW",
            "description": description or "No image provided."
        }
    else:
        # 2. Call Gemini AI Vision to verify the damage (run in threadpool to avoid async SDK conflicts)
        ai_analysis = await run_in_threadpool(analyze_damage_image, image_bytes, file.content_type, f"Category chosen: {category}. Description: {description or ''}")
        
        # If AI verification failed due to error, still let it through as a ticket
        if ai_analysis.get("damage_type") == "error":
            ai_analysis["is_valid_damage"] = True
            ai_analysis["damage_type"] = category or "uncategorized"
            ai_analysis["severity"] = "LOW"
    
    master_ticket = None
    closest_ticket = None
    if ai_analysis.get("is_valid_damage"):
        # Prefer AI damage_type, but fallback to manual category if AI says 'none' or 'uncategorized'
        damage_category = ai_analysis.get("damage_type")
        if damage_category in ["none", "uncategorized"] and category:
            damage_category = category
        
        # 3. Smart Deduplication: Find nearby open tickets of the same category
        open_tickets = db.query(models.MasterTicket).filter(
            models.MasterTicket.status == "Open",
            models.MasterTicket.category == damage_category
        ).all()
        
        min_distance = float('inf')
        
        for ticket in open_tickets:
            # Calculate distance in meters
            dist = calculate_distance(latitude, longitude, ticket.latitude, ticket.longitude)
            if dist <= 200 and dist < min_distance:
                min_distance = dist
                closest_ticket = ticket
                
        if closest_ticket:
            master_ticket = closest_ticket
            # If a ticket gets multiple reports, we could escalate its severity.
            if master_ticket.severity == "LOW":
                master_ticket.severity = "MEDIUM"
            elif master_ticket.severity == "MEDIUM":
                master_ticket.severity = "HIGH"
        else:
            # Create new MasterTicket if none found within 200m
            master_ticket = models.MasterTicket(
                category=damage_category,
                severity=ai_analysis.get("severity", "LOW"),
                latitude=latitude,
                longitude=longitude
            )
            db.add(master_ticket)
            db.commit()
            db.refresh(master_ticket)
    
    # 4. Create the citizen's individual report
    new_report = models.Report(
        description=ai_analysis.get("description", description),
        latitude=latitude,
        longitude=longitude,
        image_url="placeholder_url",
        master_ticket_id=master_ticket.id if master_ticket else None
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return {
        "status": "success",
        "message": "Report submitted and deduplicated successfully.",
        "ai_analysis": ai_analysis,
        "master_ticket_id": master_ticket.id if master_ticket else None,
        "is_duplicate": closest_ticket is not None,
        "report_id": new_report.id
    }

@app.post("/api/v1/admin/reports/{master_ticket_id}/action-plan")
def create_action_plan(master_ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(models.MasterTicket).filter(models.MasterTicket.id == master_ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Master ticket not found")
        
    email_draft = generate_action_plan(
        category=ticket.category, 
        severity=ticket.severity, 
        latitude=ticket.latitude, 
        longitude=ticket.longitude
    )
    
    return {
        "status": "success",
        "master_ticket_id": ticket.id,
        "email_draft": email_draft
    }

@app.get("/api/v1/admin/reports/master")
def get_master_tickets(db: Session = Depends(get_db)):
    """
    Fetch all master tickets to plot on the admin dashboard map.
    """
    tickets = db.query(models.MasterTicket).all()
    result = []
    for t in tickets:
        result.append({
            "id": t.id,
            "category": t.category,
            "severity": t.severity,
            "status": t.status,
            "latitude": t.latitude,
            "longitude": t.longitude,
            "report_count": len(t.reports)
        })
    return result

