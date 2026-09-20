import os
import json
from google import genai
from google.genai import types

def analyze_damage_image(image_bytes: bytes, mime_type: str = 'image/jpeg'):
    """
    Analyzes an image using Gemini Vision API to determine damage type and severity.
    """
    # Initialize the client. It will automatically use the GEMINI_API_KEY environment variable.
    client = genai.Client()
    
    prompt = """
    You are an AI assistant for a civic issue reporting system.
    Analyze this image of public infrastructure. 
    Determine if there is valid damage (like a water pipe burst, pothole, broken streetlight, etc).
    If there is damage, identify the damage type and severity (LOW, MEDIUM, HIGH).
    
    Return your analysis STRICTLY as a JSON object with the following schema:
    {
        "is_valid_damage": boolean,
        "damage_type": "string (e.g., 'pipe_burst', 'pothole', 'none')",
        "severity": "string ('LOW', 'MEDIUM', 'HIGH', or null)",
        "description": "string (brief description of the issue seen in the photo)"
    }
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        # Parse the JSON response
        result = json.loads(response.text)
        return result
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {
            "is_valid_damage": False,
            "damage_type": "error",
            "severity": None,
            "description": f"AI verification failed: {str(e)}"
        }

def generate_action_plan(category: str, severity: str, latitude: float, longitude: float) -> str:
    """
    Uses Gemini to draft an official email/action plan to the contractor.
    """
    client = genai.Client()
    
    prompt = f"""
    You are an AI assistant for a government municipal corporation.
    Write a short, professional, and official work order email to the repair contractor.
    
    Issue Details:
    - Damage Type: {category}
    - AI Severity Score: {severity}
    - Location Coordinates: {latitude}, {longitude}
    
    Instructions:
    - Keep it very concise (3-4 sentences max).
    - It should sound like an official government dispatch.
    - Ask them to dispatch a team immediately because the AI verified it.
    - Return ONLY the email draft text without any markdown or extra conversational text.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API for action plan: {e}")
        return "Failed to generate action plan due to AI service error."
