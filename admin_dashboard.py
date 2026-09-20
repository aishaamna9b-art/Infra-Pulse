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
            address = location.raw.get('address', {})
            area = address.get('suburb') or address.get('neighbourhood') or address.get('city_district') or address.get('city')
            return area if area else location.address.split(",")[0]
        return "Unknown Area"
    except Exception:
        return f"{lat:.4f}, {lon:.4f}"

API_BASE_URL = "http://127.0.0.1:8000/api/v1"

st.set_page_config(page_title="Infra-Pulse Govt Dashboard", layout="wide")

st.title("🏛️ Infra-Pulse Government Dashboard")
st.markdown("Live map and master tickets of civic issues reported by citizens.")

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
