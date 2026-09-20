"use client";

import React, { useState, useRef } from 'react';
import { Camera, MapPin, CheckCircle, Upload, Image as ImageIcon, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioRecorder from './AudioRecorder';
import { saveComplaint } from '@/lib/db';

export default function ComplaintForm() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  
  // Location States
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  
  const [transcription, setTranscription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lon });
          
          try {
            // Highly Accurate Reverse Geocoding using our internal Google Maps route
            const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                setAddress(data.address);
              }
            } else {
              console.warn("Geocoding failed. Make sure GOOGLE_MAPS_API_KEY is set in .env.local");
            }
          } catch (err) {
            console.error("Failed to fetch address", err);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not fetch location. Please check your permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!transcription || (!location && !address)) {
      alert("Please provide at least a voice description and a location (GPS or manual address).");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = Date.now().toString();
      
      // Save locally to IndexedDB for offline support
      await saveComplaint({
        id,
        description: transcription,
        photoDataUrl: photoDataUrl || undefined,
        location: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          address: address || undefined,
        },
        timestamp: Date.now(),
      });
      
      setIsSuccess(true);
    } catch (err) {
      console.error("Error saving complaint", err);
      alert("Failed to save the complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Complaint Logged!</h3>
        <p className="text-slate-600 mt-2">
          Your complaint has been saved locally. It will automatically sync to our servers when you are online.
        </p>
        <Button 
          className="mt-6 w-full"
          onClick={() => {
            setIsSuccess(false);
            setPhotoDataUrl(null);
            setLocation(null);
            setAddress('');
            setTranscription('');
          }}
        >
          Report Another Issue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Location Section */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="font-medium text-slate-800 flex items-center gap-2">
          <Map className="w-4 h-4" /> Location Details
        </h4>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter address manually..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            variant="outline"
            onClick={fetchLocation}
            disabled={isLocating}
            className="shrink-0 flex items-center gap-2"
          >
            {isLocating ? (
              <Upload className="w-4 h-4 animate-bounce" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            Use GPS
          </Button>
        </div>
        
        {location && (
          <p className="text-xs text-green-700 font-medium">
            GPS Coordinates Saved: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* Photo Section */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-medium text-slate-800 flex items-center gap-2">
          <Camera className="w-4 h-4" /> Photo Evidence
        </h4>

        {photoDataUrl ? (
          <div className="relative border border-slate-300 rounded-lg overflow-hidden h-32 flex items-center justify-center bg-slate-100">
            <img src={photoDataUrl} alt="Evidence" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="z-10 flex flex-col items-center gap-2 bg-white/80 p-2 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Attached
              </span>
              <Button variant="outline" size="sm" onClick={() => setPhotoDataUrl(null)} className="h-7 text-xs">
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-white"
            >
              <Camera className="w-4 h-4" /> Camera
            </Button>
            <input 
              type="file" accept="image/*" capture="environment" 
              ref={cameraInputRef} className="hidden" onChange={handlePhotoUpload}
            />

            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-white"
            >
              <ImageIcon className="w-4 h-4" /> Gallery
            </Button>
            <input 
              type="file" accept="image/*" 
              ref={fileInputRef} className="hidden" onChange={handlePhotoUpload}
            />
          </div>
        )}
      </div>

      {/* Voice Section */}
      <AudioRecorder onTranscriptionComplete={setTranscription} />
      
      {transcription && (
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm shadow-inner">
          <h4 className="font-semibold text-green-800 mb-1">Transcribed Issue:</h4>
          <p className="text-green-900">{transcription}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting || !transcription || (!location && !address)}
        className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 shadow-md"
      >
        {isSubmitting ? 'Saving...' : 'Submit Complaint'}
      </Button>
    </div>
  );
}
