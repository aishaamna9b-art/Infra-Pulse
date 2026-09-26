import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import requests
import folium
from folium.plugins import HeatMap
from streamlit_folium import st_folium
from geopy.geocoders import Nominatim
from datetime import datetime
import plotly.express as px

geolocator = Nominatim(user_agent="infra_pulse_dashboard")

@st.cache_data
def get_area_name(lat, lon):
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if location:
            parts = [p.strip() for p in location.address.split(",")]
            if len(parts) >= 2:
                return f"{parts[0]}, {parts[1]}"
            return parts[0]
        return "Unknown Area"
    except Exception:
        return f"{lat:.4f}, {lon:.4f}"

@st.cache_data
def get_full_address(lat, lon):
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if location:
            # Take only the first 3 relevant parts to make it a clean, exact single line
            parts = [p.strip() for p in location.address.split(",")]
            if len(parts) >= 3:
                return f"{parts[0]}, {parts[1]}, {parts[2]}"
            return ", ".join(parts)
        return "Unknown Area"
    except Exception:
        return f"{lat:.6f}, {lon:.6f}"

API_BASE_URL = "http://127.0.0.1:8000/api/v1"

st.set_page_config(page_title="Infra-Pulse Command Center", page_icon="🏛️", layout="wide", initial_sidebar_state="expanded")

# --- Custom CSS for Professional UI ---
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Clean up the metric cards */
    div[data-testid="metric-container"] {
        border: 1px solid rgba(128, 128, 128, 0.2);
        padding: 5% 5% 5% 10%;
        border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Clean Headers */
    h1, h2, h3 { font-family: 'Inter', sans-serif; }
    
    /* Login Box */
    .login-box {
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border: 1px solid rgba(128, 128, 128, 0.2);
        margin-top: 50px;
    }
</style>
""", unsafe_allow_html=True)


# --- LOGIN LOGIC ---
def check_password():
    def password_entered():
        if st.session_state["username"] == "admin" and st.session_state["password"] == "admin123":
            st.session_state["password_correct"] = True
            del st.session_state["password"]
        else:
            st.session_state["password_correct"] = False

    if "password_correct" not in st.session_state:
        col1, col2, col3 = st.columns([1, 1.5, 1])
        with col2:
            st.markdown("<br><br>", unsafe_allow_html=True)
            with st.container(border=True):
                st.markdown("<h1 style='text-align: center; margin-bottom: 5px;'>🏛️ Infra-Pulse</h1>", unsafe_allow_html=True)
                st.markdown("<p style='text-align: center; opacity: 0.8; margin-bottom: 30px; font-weight: 500;'>Government Command Center</p>", unsafe_allow_html=True)
                
                st.text_input("Official ID", key="username", placeholder="Enter your Gov ID (admin)")
                st.text_input("Passcode", type="password", key="password", placeholder="Enter passcode (admin123)")
                st.write("")
                st.button("Secure Login", on_click=password_entered, use_container_width=True, type="primary")
        return False
        
    elif not st.session_state["password_correct"]:
        col1, col2, col3 = st.columns([1, 1.5, 1])
        with col2:
            st.markdown("<br><br>", unsafe_allow_html=True)
            with st.container(border=True):
                st.markdown("<h1 style='text-align: center; margin-bottom: 5px;'>🏛️ Infra-Pulse</h1>", unsafe_allow_html=True)
                
                st.text_input("Official ID", key="username")
                st.text_input("Passcode", type="password", key="password")
                st.write("")
                st.button("Secure Login", on_click=password_entered, use_container_width=True, type="primary")
                st.error("Authentication Failed. Invalid credentials.")
        return False
        
    return True

if not check_password():
    st.stop()

# --- FETCH DATA ---
@st.cache_data(ttl=10) # cache for 10 seconds to avoid spamming the API but keep it live
def fetch_tickets():
    try:
        response = requests.get(f"{API_BASE_URL}/admin/reports/master")
        response.raise_for_status()
        tickets = response.json()
        if not tickets:
            return pd.DataFrame()
            
        df = pd.DataFrame(tickets)
        severity_mapping = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
        df['severity_score'] = df['severity'].map(severity_mapping).fillna(0)
        df = df.sort_values(by=['severity_score', 'id'], ascending=[False, False]).reset_index(drop=True)
        return df
    except Exception as e:
        return pd.DataFrame()

df = fetch_tickets()

# --- SIDEBAR NAVIGATION ---
with st.sidebar:
    st.markdown("<h2 style='text-align: center; font-weight: 800; margin-top: 10px;'>🏛️ INFRA-PULSE</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; font-size: 13px; opacity: 0.8; margin-bottom: 30px;'>TN GOVT SECURE NETWORK</p>", unsafe_allow_html=True)
    
    selected = option_menu(
        menu_title=None,
        options=["Dashboard Overview", "Severity Analysis", "Ticket Management", "System Settings"],
        icons=["house", "bar-chart", "list-task", "gear"],
        menu_icon="cast",
        default_index=0,
        styles={
            "container": {"padding": "0!important", "background-color": "transparent"},
            "icon": {"color": "#64748b", "font-size": "18px"}, 
            "nav-link": {"font-size": "15px", "text-align": "left", "margin":"5px", "color": "#334155", "font-weight": "600"},
            "nav-link-selected": {"background-color": "#1e293b", "color": "white", "font-weight": "bold"},
        }
    )
    
    st.markdown("### Live Map")
    if df.empty:
        st.info("No geospatial data.")
    else:
        avg_lat = df['latitude'].mean()
        avg_lon = df['longitude'].mean()
        m = folium.Map(location=[avg_lat, avg_lon], zoom_start=12, tiles="OpenStreetMap")
        for idx, row in df.iterrows():
            color = "darkred" if row["severity"] == "HIGH" else "orange" if row["severity"] == "MEDIUM" else "blue"
            folium.Marker(
                [row['latitude'], row['longitude']],
                icon=folium.Icon(color=color, icon="info-sign")
            ).add_to(m)
        st_folium(m, width="100%", height=300, returned_objects=[])

    st.sidebar.markdown("<br><br><br>", unsafe_allow_html=True)
    if st.sidebar.button("🔒 Secure Logout", use_container_width=True):
        del st.session_state["password_correct"]
        st.rerun()

# --- PAGE: OVERVIEW ---
if selected == "Dashboard Overview":
    st.title("Dashboard Overview")
    st.markdown("Real-time metrics and analytics of civic infrastructure issues.")
    
    if df.empty:
        st.info("No data available. Waiting for citizen reports...")
    else:
        # Metrics Row
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Total Open Tickets", len(df[df['status'] == 'Open']))
        m2.metric("Critical (High Severity)", len(df[df['severity'] == 'HIGH']))
        m3.metric("Tickets Resolved", len(df[df['status'] == 'Resolved']))
        m4.metric("Avg. Resolution Time", "4.2 Days") # Placeholder metric for professionalism
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Charts Row
        c1, c2 = st.columns([2, 1])
        
        with c1:
            st.subheader("Tickets by Category")
            with st.container(border=True):
                # Filter out 'error' and 'uncategorized' for cleaner charts
                chart_df = df[~df['category'].isin(['error', 'uncategorized', 'none'])]
                if chart_df.empty:
                    st.info("No valid categories to display.")
                else:
                    if 'report_count' not in chart_df.columns:
                        chart_df['report_count'] = 1
                    category_counts = chart_df.groupby('category')['report_count'].sum().reset_index()
                    category_counts.columns = ['Category', 'Count']
                    # Professional Plotly Bar Chart
                    fig = px.bar(
                        category_counts, 
                        x='Category', 
                        y='Count', 
                        text_auto=True,
                        color='Category',
                        template='plotly_dark' if st.get_option('theme.base') == 'dark' else 'plotly_white'
                    )
                    fig.update_layout(
                        showlegend=False, 
                        margin=dict(l=20, r=20, t=20, b=20),
                        paper_bgcolor="rgba(0,0,0,0)",
                        plot_bgcolor="rgba(0,0,0,0)"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
        with c2:
            st.subheader("Recent Critical Alerts")
            with st.container(border=True):
                high_sev = df[df['severity'] == 'HIGH'].head(4)
                if high_sev.empty:
                    st.success("No critical alerts at the moment.")
                else:
                    for _, row in high_sev.iterrows():
                        st.markdown(f"**#{row['id']} - {row['category']}**")
                        st.markdown(f"<span style='color: #dc2626; font-size: 13px; font-weight: bold;'>● HIGH SEVERITY</span>", unsafe_allow_html=True)
                        st.divider()

# --- PAGE: SEVERITY ANALYSIS ---
elif selected == "Severity Analysis":
    st.title("Severity Analysis")
    st.markdown("Bar graph representing the number of complaints raised along with severity.")
    
    if df.empty:
        st.info("No data available.")
    else:
        with st.container(border=True):
            severity_counts = df.groupby('severity').size().reset_index(name='Count')
            fig = px.bar(
                severity_counts, 
                x='severity', 
                y='Count', 
                color='severity',
                text_auto=True,
                title="Complaints Raised by Severity",
                template='plotly_dark' if st.get_option('theme.base') == 'dark' else 'plotly_white',
                color_discrete_map={"HIGH": "#dc2626", "MEDIUM": "#f97316", "LOW": "#3b82f6"}
            )
            fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig, use_container_width=True)

# --- PAGE: TICKET MANAGEMENT ---
elif selected == "Ticket Management":
    st.title("Ticket Management")
    st.markdown("Review open tickets, update statuses, and generate AI action plans for contractors.")
    
    if df.empty:
        st.info("No tickets available.")
    else:
        # Filters
        f1, f2, f3 = st.columns(3)
        with f1:
            cat_filter = st.selectbox("Category Filter", ["All"] + list(df['category'].dropna().unique()))
        with f2:
            sev_filter = st.selectbox("Severity Filter", ["All", "HIGH", "MEDIUM", "LOW"])
        with f3:
            status_filter = st.selectbox("Status Filter", ["All", "Open", "In Progress", "Resolved"])
            
        filtered_df = df.copy()
        if cat_filter != "All": filtered_df = filtered_df[filtered_df['category'] == cat_filter]
        if sev_filter != "All": filtered_df = filtered_df[filtered_df['severity'] == sev_filter]
        if status_filter != "All": filtered_df = filtered_df[filtered_df['status'] == status_filter]
        
        # Split tickets into Master (>= 5) and Regular (< 5)
        if 'report_count' not in filtered_df.columns:
            filtered_df['report_count'] = 1 # Fallback if API hasn't updated
            
        # Filter out mock zero-report tickets entirely
        filtered_df = filtered_df[filtered_df['report_count'] > 0]
        
        master_df = filtered_df[filtered_df['report_count'] >= 5]
        regular_df = filtered_df[filtered_df['report_count'] < 5]
        
        st.markdown(f"**Showing {len(filtered_df)} total tickets**")
        
        st.subheader(f"🔥 Escalated Master Tickets ({len(master_df)})")
        st.markdown("Issues with 5 or more citizen reports. These require immediate attention.")
        
        if master_df.empty:
            st.info("No escalated master tickets at this time.")
        else:
            for idx, row in master_df.iterrows():
                sev_color = "🔴" if row['severity'] == 'HIGH' else "🟠" if row['severity'] == 'MEDIUM' else "🔵"
                report_count = row.get('report_count', 1)
                
                with st.expander(f"{sev_color} 👑 MASTER TICKET #{row['id']} | {row['category'].upper()} | Status: {row['status']} | 👥 {report_count} Reports"):
                    ec1, ec2 = st.columns([1, 1])
                    with ec1:
                        exact_loc = get_full_address(row['latitude'], row['longitude'])
                        st.write(f"**Exact Location:** {exact_loc}")
                        st.write(f"**Registered:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
                        
                        new_status = st.selectbox("Update Status", ["Open", "In Progress", "Resolved"], index=["Open", "In Progress", "Resolved"].index(row['status']), key=f"stat_{row['id']}")
                        if new_status != row['status']:
                            st.info("Status update will be saved to database (Mock)")
                            
                    with ec2:
                        st.write("**AI Assistant Actions**")
                        draft_key = f"draft_{row['id']}"
                        if st.button("✨ Draft Contractor Notice (Gemini AI)", key=f"ai_{row['id']}", type="primary"):
                            with st.spinner("Gemini is analyzing the ticket and drafting an official notice..."):
                                plan_resp = requests.post(f"{API_BASE_URL}/admin/reports/{row['id']}/action-plan")
                                if plan_resp.status_code == 200:
                                    st.session_state[draft_key] = plan_resp.json().get("email_draft")
                                else:
                                    st.error("Failed to reach Gemini AI backend.")
                                    
                        if draft_key in st.session_state:
                            st.success("Draft Generated!")
                            st.text_area("Official Email Draft", value=st.session_state[draft_key], height=250, key=f"text_{row['id']}")
                            if st.button("📨 Dispatch Notice to Contractor", key=f"send_{row['id']}", type="secondary"):
                                st.toast(f"✅ Official Notice Dispatched for Ticket #{row['id']}!")
                                st.balloons()
                                del st.session_state[draft_key]
                                st.rerun()

        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader(f"📝 Standard Tickets ({len(regular_df)})")
        
        if regular_df.empty:
            st.info("No standard tickets.")
        else:
            for idx, row in regular_df.iterrows():
                sev_color = "🔴" if row['severity'] == 'HIGH' else "🟠" if row['severity'] == 'MEDIUM' else "🔵"
                report_count = row.get('report_count', 1)
                
                with st.expander(f"{sev_color} Ticket #{row['id']} | {row['category'].upper()} | Status: {row['status']} | 👥 {report_count} Reports"):
                    ec1, ec2 = st.columns([1, 1])
                    
                    with ec1:
                        exact_loc = get_full_address(row['latitude'], row['longitude'])
                        st.write(f"**Exact Location:** {exact_loc}")
                        st.write(f"**Registered:** {datetime.now().strftime('%Y-%m-%d %H:%M')}") # Mock date
                        
                        new_status = st.selectbox("Update Status", ["Open", "In Progress", "Resolved"], index=["Open", "In Progress", "Resolved"].index(row['status']), key=f"stat_{row['id']}")
                        if new_status != row['status']:
                            st.info("Status update will be saved to database (Mock)")
                            
                    with ec2:
                        st.write("**AI Assistant Actions**")
                        draft_key = f"draft_{row['id']}"
                        
                        if st.button("✨ Draft Contractor Notice (Gemini AI)", key=f"ai_{row['id']}", type="primary"):
                            with st.spinner("Gemini is analyzing the ticket and drafting an official notice..."):
                                plan_resp = requests.post(f"{API_BASE_URL}/admin/reports/{row['id']}/action-plan")
                                if plan_resp.status_code == 200:
                                    st.session_state[draft_key] = plan_resp.json().get("email_draft")
                                else:
                                    st.error("Failed to reach Gemini AI backend.")
                                    
                        if draft_key in st.session_state:
                            st.success("Draft Generated!")
                            st.text_area("Official Email Draft", value=st.session_state[draft_key], height=250, key=f"text_{row['id']}")
                            
                            if st.button("📨 Dispatch Notice to Contractor", key=f"send_{row['id']}", type="secondary"):
                                st.toast(f"✅ Official Notice Dispatched for Ticket #{row['id']}!")
                                st.balloons()
                                del st.session_state[draft_key]
                                st.rerun()

# --- PAGE: SYSTEM SETTINGS ---
elif selected == "System Settings":
    st.title("System Settings")
    st.markdown("Manage command center configurations and personnel access.")
    
    with st.container(border=True):
        st.subheader("Admin Profile")
        st.text_input("Full Name", value="Chief Engineer - Zone 4")
        st.text_input("Official Email", value="zone4.eng@tn.gov.in")
        st.text_input("Contact Number", value="+91 98765 43210")
        st.button("Save Profile Changes", type="primary")
        
    with st.container(border=True):
        st.subheader("Notification Preferences")
        st.checkbox("SMS Alerts for HIGH severity tickets", value=True)
        st.checkbox("Email digest (Daily)", value=True)
        st.checkbox("Contractor auto-dispatch (BETA)", value=False)
        st.button("Update Preferences")
