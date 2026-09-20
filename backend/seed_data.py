import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

mock_data = [
    {"category": "pothole", "severity": "HIGH", "latitude": 11.0084, "longitude": 76.9498, "status": "Open"}, # RS Puram
    {"category": "broken_pipe", "severity": "HIGH", "latitude": 11.0180, "longitude": 76.9654, "status": "Open"}, # Gandhipuram
    {"category": "street_light", "severity": "LOW", "latitude": 11.0267, "longitude": 77.0041, "status": "Open"}, # Peelamedu
    {"category": "garbage_dump", "severity": "MEDIUM", "latitude": 10.9996, "longitude": 76.9634, "status": "Open"}, # Town Hall
    {"category": "water_logging", "severity": "HIGH", "latitude": 10.9912, "longitude": 76.9610, "status": "Open"}, # Ukkadam
    {"category": "pothole", "severity": "MEDIUM", "latitude": 11.0028, "longitude": 77.0270, "status": "Open"}, # Singanallur
    {"category": "broken_pipe", "severity": "MEDIUM", "latitude": 11.0797, "longitude": 76.9982, "status": "Open"}, # Saravanampatti
    {"category": "fallen_tree", "severity": "HIGH", "latitude": 10.9571, "longitude": 76.9535, "status": "Open"}, # Kuniyamuthur
    {"category": "pothole", "severity": "LOW", "latitude": 11.0287, "longitude": 76.9037, "status": "Open"}, # Vadavalli
]

def seed_database():
    db: Session = SessionLocal()
    
    # Check if data already exists to prevent duplicate seeding
    if db.query(models.MasterTicket).count() > 0:
        print("Database already contains tickets. Clearing old data for a fresh demo...")
        db.query(models.Report).delete()
        db.query(models.MasterTicket).delete()
        db.commit()

    print("Seeding mock data for Bangalore...")
    for data in mock_data:
        ticket = models.MasterTicket(
            category=data["category"],
            severity=data["severity"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            status=data["status"]
        )
        db.add(ticket)
        
    db.commit()
    print("Seeding complete! You now have 9 active civic issues on the map.")
    db.close()

if __name__ == "__main__":
    seed_database()
