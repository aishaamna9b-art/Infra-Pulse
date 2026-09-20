import streamlit as st
import pandas as pd
import requests
import folium
from streamlit_folium import st_folium
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="infra_pulse_dashboard")

@st.cache_data
def get_area_name(lat, lon):
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if location:
            # The full official address usually looks like:
            # "Cross Cut Road, Ram Nagar, Coimbatore, Tamil Nadu..."
            # We take the first two pieces of information to guarantee a highly descriptive name every time!
            parts = [p.strip() for p in location.address.split(",")]
            
            if len(parts) >= 2:
                return f"{parts[0]}, {parts[1]}"
            return parts[0]
        return "Unknown Area"
    except Exception:
        return f"{lat:.4f}, {lon:.4f}"

API_BASE_URL = "http://127.0.0.1:8000/api/v1"

st.set_page_config(page_title="Infra-Pulse Govt Dashboard", layout="wide", initial_sidebar_state="collapsed")

# --- LOGIN PAGE LOGIC ---
def check_password():
    """Returns `True` if the user had the correct password."""
    def password_entered():
        # Hardcoded credentials for Hackathon Demo
        if st.session_state["username"] == "admin" and st.session_state["password"] == "admin123":
            st.session_state["password_correct"] = True
            del st.session_state["password"]  # don't store password
        else:
            st.session_state["password_correct"] = False

    if "password_correct" not in st.session_state:
        st.markdown("<h1 style='text-align: center; margin-top: 50px; color: #1E3A8A;'>🏛️ Infra-Pulse Command Center</h1>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; font-size: 18px; color: gray;'>Authorized Government Personnel Only</p>", unsafe_allow_html=True)
        st.write("")
        col1, col2, col3 = st.columns([1, 1.5, 1])
        with col2:
            with st.container(border=True):
                st.text_input("Username", key="username", placeholder="Enter admin")
                st.text_input("Password", type="password", key="password", placeholder="Enter admin123")
                st.button("Secure Login", on_click=password_entered, use_container_width=True, type="primary")
        return False
        
    elif not st.session_state["password_correct"]:
        st.markdown("<h1 style='text-align: center; margin-top: 50px; color: #1E3A8A;'>🏛️ Infra-Pulse Command Center</h1>", unsafe_allow_html=True)
        col1, col2, col3 = st.columns([1, 1.5, 1])
        with col2:
            with st.container(border=True):
                st.text_input("Username", key="username")
                st.text_input("Password", type="password", key="password")
                st.button("Secure Login", on_click=password_entered, use_container_width=True, type="primary")
                st.error("😕 Invalid username or password. Try admin / admin123")
        return False
        
    return True

if not check_password():
    st.stop()  # Stop execution here if not logged in

# --- MAIN DASHBOARD (Only shows if logged in) ---
col_head1, col_head2 = st.columns([4, 1])
with col_head1:
    st.title("🏛️ Infra-Pulse Government Dashboard")
    st.markdown("Live map and master tickets of civic issues reported by citizens.")
with col_head2:
    if st.button("Logout", use_container_width=True):
        del st.session_state["password_correct"]
        st.rerun()

# Fetch master tickets from FastAPI
try:
    response = requests.get(f"{API_BASE_URL}/admin/reports/master")
    response.raise_for_status()
    tickets = response.json()
except Exception as e:
    st.error(f"Error connecting to backend API: {e}")
    tickets = []

if not tickets:
    st.info("No tickets reported yet.")
else:
    df = pd.DataFrame(tickets)
    
    # Sort tickets by severity: HIGH first, then MEDIUM, then LOW
    severity_mapping = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    df['severity_score'] = df['severity'].map(severity_mapping).fillna(0)
    df = df.sort_values(by=['severity_score', 'id'], ascending=[False, False]).reset_index(drop=True)
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📍 Live Issue Map")
        avg_lat = df['latitude'].mean()
        avg_lon = df['longitude'].mean()
        
        # Reverted back to the default detailed map (OpenStreetMap)
        m = folium.Map(location=[avg_lat, avg_lon], zoom_start=14)
        
        for idx, row in df.iterrows():
            # Using 'darkred' instead of 'red' so it doesn't mix up with the standard hospital pink/red
            color = "darkred" if row["severity"] == "HIGH" else "orange" if row["severity"] == "MEDIUM" else "blue"
            area_name = get_area_name(row['latitude'], row['longitude'])
            
            folium.Marker(
                [row['latitude'], row['longitude']],
                popup=f"Ticket #{row['id']}<br>Area: {area_name}<br>Severity: {row['severity']}",
                icon=folium.Icon(color=color, icon="warning-sign")
            ).add_to(m)
            
        st_folium(m, width=700, height=500)

    with col2:
        st.subheader("📋 Master Tickets")
        
        for idx, row in df.iterrows():
            area_name = get_area_name(row['latitude'], row['longitude'])
            with st.expander(f"Ticket #{row['id']} - {row['category'].upper()}"):
                st.write(f"**Severity:** {row['severity']}")
                st.write(f"**Status:** {row['status']}")
                st.write(f"**Location:** {area_name}")
                
                if st.button("Generate Action Plan", key=f"plan_{row['id']}"):
                    with st.spinner("Gemini AI is drafting email..."):
                        plan_resp = requests.post(f"{API_BASE_URL}/admin/reports/{row['id']}/action-plan")
                        if plan_resp.status_code == 200:
                            draft = plan_resp.json().get("email_draft")
                            st.success("Draft Generated!")
                            st.text_area("Email Draft", value=draft, height=200)
                        else:
                            st.error("Failed to generate plan.")
