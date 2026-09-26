import os
import json
from google import genai
from google.genai import types

def analyze_damage_image(image_bytes: bytes, mime_type: str = 'image/jpeg', expected_category: str = "", user_description: str = ""):
    """
    Analyzes an image and user description using Gemini to determine damage type and severity.
    """
    client = genai.Client()
    
    prompt = f"""
    You are an AI assistant for a civic issue reporting system.
    Analyze this image of public infrastructure. 
    The citizen who uploaded this image selected the category: "{expected_category}".
    They also provided the following description (typed or via voice):
    "{user_description}"
    
    Determine if the image actually matches the expected category "{expected_category}". 
    The allowed categories are: pothole, water_leakage, streetlight, garbage, other.
    If the image does not match the expected category, or if it is not related to public infrastructure damage at all (e.g., a selfie, a random object), you MUST reject it by setting "is_valid_damage" to false.
    
    Return your analysis STRICTLY as a JSON object with the following schema:
    {{
        "is_valid_damage": boolean, // True if the image matches the expected category, False otherwise
        "damage_type": "string (must be one of: pothole, water_leakage, streetlight, garbage, other, or none)",
        "severity": "string ('LOW', 'MEDIUM', 'HIGH', or null)",
        "description": "string (brief description of the issue seen in the photo)"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        # Parse the JSON response, stripping markdown if present
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        result = json.loads(text.strip())
        return result
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {
            "is_valid_damage": False,
            "damage_type": "error",
            "severity": None,
            "description": f"AI verification failed: {str(e)}"
        }

def generate_action_plan(category: str, severity: str, latitude: float, longitude: float, address: str = None) -> str:
    """
    Uses Gemini to draft an official email/action plan to the contractor.
    """
    client = genai.Client()
    
    location_details = f"{address}" if address else f"Coordinates: {latitude}, {longitude}"
    
    prompt = f"""
    You are an AI assistant for a government municipal corporation.
    Write a short, professional, and official work order email to the repair contractor.
    
    Issue Details:
    - Damage Type: {category}
    - AI Severity Score: {severity}
    - Location: {location_details}
    
    Instructions:
    - Keep it very concise (3-4 sentences max).
    - It should sound like an official government dispatch.
    - Ask them to dispatch a team immediately because the AI verified it.
    - IMPORTANT: DO NOT hallucinate or invent a "Ward No", "Street Name", or "City". ONLY use the provided Location.
    - IMPORTANT: DO NOT mention that this email was drafted by an AI or Gemini.
    - Return ONLY the email draft text without any markdown or extra conversational text.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API for action plan: {e}")
        return "Failed to generate action plan due to AI service error."
