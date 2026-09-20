import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    if (apiKey) {
      // Use Google Maps API if key is present
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return NextResponse.json({ address: data.results[0].formatted_address });
      }
    } 
    
    // Fallback to OpenStreetMap (Nominatim) which is free and doesn't require an API key
    console.log("Using Nominatim for geocoding fallback...");
    const osmResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'InfraPulse-CitizenApp/1.0' // Nominatim requires a User-Agent
      }
    });
    
    const osmData = await osmResponse.json();
    if (osmData && osmData.display_name) {
      return NextResponse.json({ address: osmData.display_name });
    }

    return NextResponse.json({ error: 'No results found from any geocoding service' }, { status: 404 });
    
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
  }
}
