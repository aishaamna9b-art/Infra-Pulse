"use client";

import React, { useState, useRef } from 'react';
import { Camera, MapPin, CheckCircle, Upload, Image as ImageIcon, Map, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioRecorder from './AudioRecorder';
import { saveComplaint } from '@/lib/db';
import { useLanguage } from '@/lib/LanguageContext';

export default function ComplaintForm() {
  const { t } = useLanguage();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  
  // Location States
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  
  const [transcription, setTranscription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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
    if (!transcription || (!location && !address) || !category) {
      alert("Please provide at least a voice description, a location, and a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = Date.now().toString();
      let isSynced = false;
      
      // 1. Try to send directly to the backend
      try {
        const formData = new FormData();
        formData.append("description", transcription);
        formData.append("latitude", location?.latitude?.toString() || "0");
        formData.append("longitude", location?.longitude?.toString() || "0");
        formData.append("category", category);
        
        if (photo) {
          formData.append("file", photo);
        } else if (photoDataUrl) {
          const res = await fetch(photoDataUrl);
          const blob = await res.blob();
          formData.append("file", blob, "photo.jpg");
        } else {
          // Backend expects a file, send empty dummy if none
          const dummyBlob = new Blob([""], { type: "image/jpeg" });
          formData.append("file", dummyBlob, "empty.jpg");
        }

        const response = await fetch("/api/v1/reports", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          isSynced = true;
          console.log("Successfully sent to backend:", await response.json());
        } else {
          console.error("Backend error:", await response.text());
        }
      } catch (networkError) {
        console.warn("Network error, falling back to offline mode", networkError);
      }
      
      // 2. Save locally to IndexedDB
      await saveComplaint({
        id,
        description: transcription,
        category: category || "uncategorized",
        photoDataUrl: photoDataUrl || undefined,
        location: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          address: address || undefined,
        },
        timestamp: Date.now(),
      });
      
      // If we successfully sent it, mark it as synced in the local DB so it doesn't get re-uploaded
      if (isSynced) {
        const { markAsSynced } = await import('@/lib/db');
        await markAsSynced(id);
      }
      
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
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75 duration-700"></div>
          <div className="absolute inset-0 bg-green-100 rounded-full"></div>
          <CheckCircle className="w-10 h-10 text-green-600 relative z-10 animate-[bounce_1s_ease-out]" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Complaint Logged!</h3>
        <p className="text-slate-600 mt-2">
          Your complaint has been saved locally. It will automatically sync to our servers when you are online.
        </p>
        <Button 
          className="mt-6 w-full"
          onClick={() => {
            setIsSuccess(false);
            setPhotoDataUrl(null);
            setPhoto(null);
            setLocation(null);
            setAddress('');
            setTranscription('');
            setCategory('');
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
      <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Map className="w-4 h-4" />
          </div>
          Location Details
        </h4>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Enter address manually..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-slate-700"
          />
          <Button 
            variant="outline"
            onClick={fetchLocation}
            disabled={isLocating}
            className="h-12 px-6 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-medium"
          >
            {isLocating ? (
              <Upload className="w-4 h-4 animate-bounce text-blue-600" />
            ) : (
              <MapPin className="w-4 h-4 text-blue-600" />
            )}
            Use GPS
          </Button>
        </div>
        
        {location && (
          <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 py-2 px-3 rounded-lg border border-green-100 inline-flex mt-2">
            <CheckCircle className="w-3 h-3" />
            GPS Coordinates Saved: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </div>
        )}
      </div>

      {/* Photo Section */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <Camera className="w-4 h-4" />
          </div>
          {t.photoEvidence}
        </h4>
        
        {!photoDataUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all group"
          >
            <Camera className="w-8 h-8 mb-2 text-slate-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{t.tapToUpload}</span>
          </div>
        ) : (
          <div className="relative h-48 rounded-xl overflow-hidden shadow-sm group">
            <img src={photoDataUrl} alt="Evidence" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-slate-900 font-semibold"
              >
                {t.retakePhoto}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={removePhoto}
                className="bg-red-500/90 hover:bg-red-600 text-white"
              >
                {t.removePhoto}
              </Button>
            </div>
          </div>
        )}
        
        <input 
          type="file" accept="image/*" 
          ref={fileInputRef} className="hidden" onChange={handlePhotoUpload}
        />
      </div>

      {/* Manual Category Selection */}
      <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
            <CheckCircle className="w-4 h-4" />
          </div>
          {t.issueCategory}
        </h4>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-slate-700 appearance-none"
        >
          <option value="" disabled>{t.selectCategory}</option>
          <option value="pothole">{t.categoryPothole}</option>
          <option value="streetlight">{t.categoryStreetlight}</option>
          <option value="garbage">{t.categoryGarbage}</option>
          <option value="water_leakage">{t.categoryWater}</option>
          <option value="other">{t.categoryOther}</option>
        </select>
      </div>

      {/* Description Section */}
      <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-xl text-green-600">
            <CheckCircle className="w-4 h-4" />
          </div>
          {t.issueDesc}
        </h4>
        
        <textarea
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder={t.issueDescPlaceholder}
          className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-slate-700 resize-none"
        />

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 font-medium mb-3 text-center">{t.preferSpeaking}</p>
          <AudioRecorder onTranscriptionComplete={setTranscription} />
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting || !transcription || (!location && !address) || !category}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none uppercase tracking-wide"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> {t.savingIssue}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> {t.submitReport}
          </span>
        )}
      </Button>
    </div>
  );
}
