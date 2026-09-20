"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta';

const translations = {
  en: {
    // Login Page
    portalName: "Infra-Pulse",
    portalDesc: "National Civic Reporting Portal",
    citizenAuth: "Citizen Authentication",
    fullNameLabel: "Full Name (As per records)",
    fullNamePlaceholder: "e.g. John Doe",
    mobileLabel: "Mobile Number",
    mobilePlaceholder: "9876543210",
    otpHelpText: "An OTP will be sent to this number for verification.",
    requestOtp: "Request OTP",
    authenticating: "Authenticating...",
    doNotRefresh: "Please do not refresh the page.",
    backToDetails: "Back to Details",
    enterOtp: "Enter OTP",
    sentTo: "Sent to",
    verifyProceed: "Verify & Proceed",
    securePortal: "SECURE PORTAL • 256-BIT ENCRYPTION",

    // Dashboard
    civicPortal: "Civic Portal",
    reportStatus: "Report Status",
    citizenCenter: "Citizen Center",
    myHistory: "My History",
    myAccount: "My Account",
    welcome: "Welcome",
    dashboardDesc: "Submit an official report regarding civic infrastructure issues. Your report will be logged with the municipal corporation.",
    recentReports: "Recent Reports",
    noReports: "No Reports Yet",
    noReportsDesc: "Reports you submit will appear here.",
    sentToGovt: "Sent to Govt.",
    pendingSync: "Pending Sync (Offline)",
    verifiedCitizen: "Verified Citizen",
    accountSettings: "Account Settings",
    helpSupport: "Help & Support",
    secureLogout: "Secure Logout",
    backToProfile: "Back to Profile",
    fullLegalName: "Full Legal Name",
    registeredMobile: "Registered Mobile Number",
    updateDetailsHelp: "To update your verified details, please visit your nearest municipal office with valid ID proof.",
    
    // Bottom Nav
    navHome: "HOME",
    navStatus: "STATUS",
    navProfile: "PROFILE",

    // Complaint Form
    issueCategory: "Issue Category",
    selectCategory: "Select a Category",
    categoryPothole: "Pothole / Road Damage",
    categoryStreetlight: "Broken Streetlight",
    categoryGarbage: "Garbage Dump",
    categoryWater: "Water Leakage",
    categoryOther: "Other",
    issueDesc: "Issue Description",
    issueDescPlaceholder: "Describe the issue manually, or use the voice recorder below...",
    preferSpeaking: "Prefer speaking? Use the voice assistant",
    photoEvidence: "Photo Evidence (Optional)",
    tapToUpload: "Tap to upload or take a photo",
    retakePhoto: "Retake Photo",
    removePhoto: "Remove Photo",
    submitReport: "Submit Official Report",
    savingIssue: "Saving Issue...",
  },
  ta: {
    // Login Page
    portalName: "இன்ஃப்ரா-பல்ஸ்",
    portalDesc: "தேசிய குடிமக்கள் குறைதீர்வு தளம்",
    citizenAuth: "குடிமக்கள் அங்கீகாரம்",
    fullNameLabel: "முழு பெயர் (பதிவுகளின்படி)",
    fullNamePlaceholder: "உ-ம். ஜான் டோ",
    mobileLabel: "கைபேசி எண்",
    mobilePlaceholder: "9876543210",
    otpHelpText: "சரிபார்ப்பதற்காக இந்த எண்ணிற்கு OTP அனுப்பப்படும்.",
    requestOtp: "OTP-ஐ கோரு",
    authenticating: "அங்கீகரிக்கிறது...",
    doNotRefresh: "தயவுசெய்து பக்கத்தை புதுப்பிக்க வேண்டாம்.",
    backToDetails: "விவரங்களுக்குத் திரும்பு",
    enterOtp: "OTP-ஐ உள்ளிடவும்",
    sentTo: "அனுப்பப்பட்டது:",
    verifyProceed: "சரிபார்த்து தொடரவும்",
    securePortal: "பாதுகாப்பான தளம் • 256-BIT என்க்ரிப்ஷன்",

    // Dashboard
    civicPortal: "குடிமக்கள் தளம்",
    reportStatus: "புகார் நிலை",
    citizenCenter: "குடிமக்கள் மையம்",
    myHistory: "எனது வரலாறு",
    myAccount: "எனது கணக்கு",
    welcome: "வரவேற்கிறோம்",
    dashboardDesc: "பொது உள்கட்டமைப்பு பிரச்சினைகள் குறித்த அதிகாரப்பூர்வ புகாரை சமர்ப்பிக்கவும். உங்கள் புகார் மாநகராட்சியால் பதிவு செய்யப்படும்.",
    recentReports: "சமீபத்திய புகார்கள்",
    noReports: "இதுவரை புகார்கள் இல்லை",
    noReportsDesc: "நீங்கள் சமர்ப்பிக்கும் புகார்கள் இங்கே தோன்றும்.",
    sentToGovt: "அரசுக்கு அனுப்பப்பட்டது",
    pendingSync: "ஒத்திசைக்க காத்திருக்கிறது (ஆஃப்லைன்)",
    verifiedCitizen: "சரிபார்க்கப்பட்ட குடிமகன்",
    accountSettings: "கணக்கு அமைப்புகள்",
    helpSupport: "உதவி மற்றும் ஆதரவு",
    secureLogout: "பாதுகாப்பான வெளியேற்றம்",
    backToProfile: "சுயவிவரத்திற்குத் திரும்பு",
    fullLegalName: "முழு சட்டப்பூர்வ பெயர்",
    registeredMobile: "பதிவு செய்யப்பட்ட கைபேசி எண்",
    updateDetailsHelp: "உங்கள் சரிபார்க்கப்பட்ட விவரங்களை புதுப்பிக்க, சரியான அடையாளச் சான்றுடன் உங்கள் அருகில் உள்ள மாநகராட்சி அலுவலகத்தை அணுகவும்.",
    
    // Bottom Nav
    navHome: "முகப்பு",
    navStatus: "நிலை",
    navProfile: "சுயவிவரம்",

    // Complaint Form
    issueCategory: "பிரச்சனை வகை",
    selectCategory: "ஒரு வகையைத் தேர்ந்தெடுக்கவும்",
    categoryPothole: "குழிகள் / சாலை சேதம்",
    categoryStreetlight: "உடைந்த தெருவிளக்கு",
    categoryGarbage: "குப்பை குவியல்",
    categoryWater: "நீர் கசிவு",
    categoryOther: "மற்றவை",
    issueDesc: "பிரச்சனையின் விளக்கம்",
    issueDescPlaceholder: "பிரச்சனையை கைமுறையாக விவரிக்கவும், அல்லது குரல் பதிவு கருவியைப் பயன்படுத்தவும்...",
    preferSpeaking: "பேச விரும்புகிறீர்களா? குரல் உதவியாளரைப் பயன்படுத்தவும்",
    photoEvidence: "புகைப்பட ஆதாரம் (விருப்பத்திற்குரியது)",
    tapToUpload: "புகைப்படம் எடுக்க அல்லது பதிவேற்ற தட்டவும்",
    retakePhoto: "மீண்டும் புகைப்படம் எடு",
    removePhoto: "புகைப்படத்தை அகற்று",
    submitReport: "அதிகாரப்பூர்வ புகாரை சமர்ப்பி",
    savingIssue: "பிரச்சனை சேமிக்கப்படுகிறது...",
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  // We could also persist the language choice in localStorage here
  // but for the demo, memory state is fine

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
