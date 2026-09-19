from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class MasterTicket(Base):
    __tablename__ = "master_tickets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True) # e.g., 'pipe_burst', 'pothole'
    severity = Column(String) # e.g., 'HIGH', 'MEDIUM'
    status = Column(String, default="Open")
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reports = relationship("Report", back_populates="master_ticket")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    latitude = Column(Float)
    longitude = Column(Float)
    master_ticket_id = Column(Integer, ForeignKey("master_tickets.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    master_ticket = relationship("MasterTicket", back_populates="reports")
