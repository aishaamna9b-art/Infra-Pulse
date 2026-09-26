"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Camera, MapPin, Send, AlertTriangle, CheckCircle2, Loader2, Image as ImageIcon, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

// Add type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function CitizenPortal() {
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<any>(null)
  const [language, setLanguage] = useState<"en" | "ta">("en")
  
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const API_BASE = "http://127.0.0.1:8000/api/v1"

  const t = {
    en: {
      title: "Report an Issue",
      desc: "Help us keep the city safe. Your report will be automatically categorized.",
      describe: "Description / Voice Note",
      describePlaceholder: "Type here or tap the mic to speak...",
      audioBtn: isRecording ? "Listening..." : "Hold to Record",
      photoBtn: file ? "Photo Selected" : "Take Photo",
      locationBtn: isLocating ? "Locating..." : (latitude ? "Location Acquired" : "Use GPS Location"),
      submitBtn: "Submit Report",
      successTitle: "Success!",
      successDesc: "Your issue has been logged.",
      newReportBtn: "Submit Another Report"
    },
    ta: {
      title: "ஒரு சிக்கலைப் புகாரளிக்கவும்",
      desc: "நகரத்தைப் பாதுகாப்பாக வைத்திருக்க எங்களுக்கு உதவுங்கள்.",
      describe: "விளக்கம் / குரல் குறிப்பு",
      describePlaceholder: "இங்கே தட்டச்சு செய்யவும் அல்லது பேச மைக்கை தட்டவும்...",
      audioBtn: isRecording ? "கேட்கிறது..." : "பதிவு செய்யப் பிடிக்கவும்",
      photoBtn: file ? "புகைப்படம் தேர்ந்தெடுக்கப்பட்டது" : "புகைப்படம் எடுங்கள்",
      locationBtn: isLocating ? "கண்டுபிடிக்கிறது..." : (latitude ? "இடம் பெறப்பட்டது" : "GPS இருப்பிடத்தைப் பயன்படுத்துங்கள்"),
      submitBtn: "புகாரைச் சமர்ப்பிக்கவும்",
      successTitle: "வெற்றி!",
      successDesc: "உங்கள் சிக்கல் பதிவு செய்யப்பட்டுள்ளது.",
      newReportBtn: "மற்றொரு புகாரைச் சமர்ப்பிக்கவும்"
    }
  }

  const simulateMic = () => {
    const demoText = "There is a severe water pipe leakage on the main road.";
    let i = 0;
    setDescription("");
    setIsRecording(true);
    
    const typeInterval = setInterval(() => {
      setDescription(prev => prev + demoText.charAt(i));
      i++;
      if (i >= demoText.length) {
        clearInterval(typeInterval);
        setIsRecording(false);
      }
    }, 50);
  }

  const handleAudioRecord = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (window.location.protocol === 'file:') {
        simulateMic();
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev ? prev + " " + transcript : transcript);
        setIsRecording(false);
      };
      recognition.onerror = (event: any) => {
        console.error("Real mic failed:", event.error, "- Falling back to Demo Simulation");
        recognition.stop();
        simulateMic();
      };
      recognition.onend = () => setIsRecording(false);
      
      try {
        recognition.start();
      } catch(e) {
        simulateMic();
      }
    } else {
      simulateMic();
    }
  }

  const handleLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lon = position.coords.longitude.toFixed(6);
          setLatitude(lat);
          setLongitude(lon);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data && data.address) {
                const road = data.address.road || data.address.street;
                const suburb = data.address.suburb || data.address.neighbourhood || data.address.city_district;
                const parts = [];
                if (road) parts.push(road);
                if (suburb) parts.push(suburb);
                if (parts.length > 0) {
                  setAddress(parts.join(", "));
                } else if (data.display_name) {
                  setAddress(data.display_name.split(",").slice(0, 2).join(", "));
                }
            } else if (data && data.display_name) {
                setAddress(data.display_name.split(",").slice(0, 2).join(", "));
            }
          } catch (err) {
             console.error("Could not reverse geocode");
          }
          
          setIsLocating(false);
        },
        (error) => {
          alert("Could not get location. Make sure location permissions are allowed in your browser.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  }

  const handleSearchAddress = async () => {
    if (!address) return;
    setIsLocating(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Coimbatore")}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            setLatitude(data[0].lat);
            setLongitude(data[0].lon);
            alert(`Location set to: ${data[0].display_name.split(',')[0]}`);
        } else {
            alert("Address not found in Coimbatore. Try a different street name.");
        }
    } catch (err) {
        alert("Search failed.");
    }
    setIsLocating(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a photo first!");
      return;
    }
    if (!latitude || !longitude) {
      alert("Please set a location first!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    try {
      const response = await fetch(`${API_BASE}/reports`, {
          method: "POST",
          body: formData
      });
      const data = await response.json();
      setSubmitted(data);
    } catch (err) {
      alert("Error connecting to server. Is FastAPI running?");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    const isValid = submitted.ai_analysis?.is_valid_damage;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className={`w-full max-w-md border ${isValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'} text-center`}>
          <CardHeader>
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isValid ? 'bg-green-100' : 'bg-orange-100'}`}>
              <CheckCircle2 className={`w-6 h-6 ${isValid ? 'text-green-600' : 'text-orange-600'}`} />
            </div>
            <CardTitle className="text-2xl">{t[language].successTitle}</CardTitle>
            <CardDescription className="text-base text-slate-700">
              {isValid 
                ? `AI verified damage as '${submitted.ai_analysis?.damage_type}'. Ticket #${submitted.master_ticket_id} created in Command Center.` 
                : "AI determined this is not valid public damage."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => {
              setSubmitted(null);
              setFile(null);
              setFilePreview(null);
              setDescription("");
            }}>
              {t[language].newReportBtn}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        
        <header className="flex items-center justify-between bg-primary text-primary-foreground p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Infra-Pulse</h1>
          </div>
          
          <div className="flex bg-primary-foreground/20 rounded-lg p-1">
            <button 
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === "en" ? "bg-primary-foreground text-primary shadow-sm" : "text-primary-foreground hover:bg-primary-foreground/10"}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage("ta")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === "ta" ? "bg-primary-foreground text-primary shadow-sm" : "text-primary-foreground hover:bg-primary-foreground/10"}`}
            >
              TA
            </button>
          </div>
        </header>

        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-white pb-4">
            <CardTitle className="text-2xl font-black text-slate-800">{t[language].title}</CardTitle>
            <CardDescription>{t[language].desc}</CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Issue Photo</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${file ? 'border-green-300 bg-green-50' : 'border-primary/30 bg-primary/5 hover:bg-primary/10'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-32 mx-auto rounded-lg object-cover mb-2" />
                  ) : (
                    <Camera className="w-10 h-10 text-primary mx-auto mb-2 opacity-80" />
                  )}
                  <p className={`text-sm font-medium ${file ? 'text-green-700' : 'text-primary'}`}>
                    {file ? file.name : "Tap to take a photo"}
                  </p>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              {/* Description & Mic */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t[language].describe}</label>
                <div className="relative">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary pr-12"
                    placeholder={t[language].describePlaceholder}
                  />
                  <button 
                    type="button" 
                    onClick={handleAudioRecord}
                    className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'text-primary hover:bg-primary/10'}`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                {isRecording && <p className="text-xs text-red-500 font-semibold mt-1">Listening... Speak now.</p>}
              </div>

              {/* Location */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
                <label className="block text-sm font-bold text-slate-700">Issue Location</label>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="e.g. Gandhipuram, Coimbatore"
                  />
                  <Button type="button" variant="secondary" onClick={handleSearchAddress} disabled={isLocating}>
                    Search
                  </Button>
                </div>
                
                <div className="flex items-center my-1">
                  <div className="flex-grow border-t border-slate-300"></div>
                  <span className="mx-3 text-xs text-slate-400 font-bold uppercase">OR</span>
                  <div className="flex-grow border-t border-slate-300"></div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className={`w-full flex gap-2 h-12 rounded-xl ${latitude ? 'border-green-300 bg-green-50 text-green-700' : ''}`}
                  onClick={handleLocation}
                  disabled={isLocating}
                >
                  {isLocating ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin className={`w-4 h-4 ${latitude ? '' : 'text-primary'}`} />}
                  {t[language].locationBtn}
                </Button>
                
                {latitude && (
                  <p className="text-xs text-green-600 font-semibold text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Location Acquired: {latitude}, {longitude}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {t[language].submitBtn}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
