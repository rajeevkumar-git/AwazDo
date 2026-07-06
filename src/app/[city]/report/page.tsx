'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { categories } from '@/lib/categories';

export default function ReportPage({ params }: { params: { city: string } }) {
  const router = useRouter();
  const cityKey = params.city.toLowerCase();
  
  // Step State
  const [step, setStep] = useState(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [addressText, setAddressText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Step 1 helper
  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setSelectedSubcategory('');
  };

  // GPS geolocation fetcher
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser / आपके ब्राउज़र में स्थान ट्रैकिंग समर्थित नहीं है।');
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLoading(false);
        // Quick mock reverse geocoding
        setAddressText(`Detected near GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        alert('Unable to retrieve location / स्थान प्राप्त करने में असमर्थ।');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // OTP sender
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit phone number / कृपया 10 अंकों का वैध फोन नंबर दर्ज करें।');
      return;
    }
    setLoading(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      // Start countdown
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };

  // Form submitter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate database insertion and ticket ID generation
    setTimeout(() => {
      const year = new Date().getFullYear();
      const rand = Math.floor(10000 + Math.random() * 90000);
      const generatedId = `AWZ-${year}-${rand}`;
      
      setTicketId(generatedId);
      setSuccess(true);
      setLoading(false);
    }, 2000);
  };

  const activeCategory = categories.find(c => c.id === selectedCategory);

  if (success) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto px-4 py-16 text-center">
        <div className="glass-card p-8 space-y-6 w-full border-emerald-500/30 shadow-emerald-500/10">
          <span className="text-6xl block">🎉</span>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-100">Grievance Registered!</h2>
            <h3 className="text-xl font-bold text-emerald-400">शिकायत दर्ज कर ली गई है!</h3>
          </div>
          
          <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-500 block uppercase tracking-widest">Ticket ID / टिकट आईडी</span>
            <span className="text-2xl font-black text-orange-500 tracking-wider">{ticketId}</span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            You will receive live status updates on your registered mobile number via SMS/WhatsApp.
            <br />
            <span className="text-xs text-slate-500 block mt-2">आपको आपके पंजीकृत मोबाइल नंबर पर लाइव अपडेट प्राप्त होंगे।</span>
          </p>

          <div className="space-y-3 pt-4">
            <Link
              href={`/track?id=${ticketId}`}
              className="w-full flex items-center justify-center py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors"
            >
              Track Progress / ट्रैक करें
            </Link>
            <Link
              href={`/${cityKey}`}
              className="w-full flex items-center justify-center py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 font-medium transition-colors"
            >
              Back to Home / होमपेज
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <Link href={`/${cityKey}`} className="text-sm text-slate-400 hover:text-slate-100 flex items-center gap-1">
          &larr; Back / वापस
        </Link>
        <span className="text-sm font-bold text-slate-400">Step {step} of 3</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-100">Select Category</h2>
              <h3 className="text-md text-slate-400">शिकायत की श्रेणी चुनें</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`glass-card p-4 flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                    selectedCategory === cat.id 
                      ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10' 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-bold text-slate-200">{cat.name_hi}</span>
                  <span className="text-xs text-slate-500">{cat.name_en}</span>
                </button>
              ))}
            </div>

            {/* Subcategory list if category is selected */}
            {activeCategory && (
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-white/5 animate-fadeIn">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Details / विवरण चुनें:</p>
                <div className="grid grid-cols-1 gap-2">
                  {activeCategory.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`w-full py-2.5 px-4 rounded-lg text-left text-sm font-medium transition-all ${
                        selectedSubcategory === sub.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {sub.name_hi} / {sub.name_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!selectedCategory || !selectedSubcategory}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white font-bold transition-all mt-4"
            >
              Continue / आगे बढ़ें &rarr;
            </button>
          </div>
        )}

        {/* Step 2: Details, Photo & GPS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-100">Describe the Issue</h2>
              <h3 className="text-md text-slate-400">समस्या का विवरण दर्ज करें</h3>
            </div>

            <form className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Description / विवरण</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter complaint details here (e.g. size of pothole, duration of leak) / शिकायत का विवरण यहाँ दर्ज करें..."
                  rows={4}
                  className="w-full glass-input p-3 text-sm focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Photo Upload Placeholder */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Upload Photo / फोटो अपलोड करें</label>
                <div className="border border-dashed border-white/15 hover:border-white/30 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-3xl">📸</span>
                  <span className="text-sm font-semibold text-slate-300">Drag or Click to upload / अपलोड करें</span>
                  <span className="text-xs text-slate-500">JPG, PNG up to 10MB</span>
                </div>
              </div>

              {/* Location Selector */}
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Location / स्थान</label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fetchLocation}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 font-bold transition-all text-sm"
                  >
                    {loading ? 'Fetching...' : '📍 GPS Auto-Tag'}
                  </button>
                </div>

                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Address or nearest landmark / पता या नजदीकी लैंडमार्क..."
                  className="w-full glass-input p-2.5 text-sm"
                  required
                />
              </div>
            </form>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold transition-all"
              >
                &larr; Back / पीछे
              </button>
              <button
                disabled={!description || !addressText}
                onClick={() => setStep(3)}
                className="py-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white font-bold transition-all"
              >
                Continue / आगे बढ़ें &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & OTP */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-100">Verification</h2>
              <h3 className="text-md text-slate-400">सत्यापन</h3>
            </div>

            <div className="space-y-6">
              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Phone Number / मोबाइल नंबर</label>
                <div className="flex gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-slate-400 font-bold flex items-center text-sm">+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={otpSent}
                    placeholder="Enter 10-digit number"
                    className="flex-1 glass-input p-2.5 text-sm"
                  />
                  {!otpSent && (
                    <button
                      onClick={handleSendOtp}
                      disabled={phone.length < 10 || loading}
                      className="px-4 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white font-bold text-sm transition-all"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Input */}
              {otpSent && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Enter OTP / वन-टाइम पासवर्ड दर्ज करें</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full glass-input p-2.5 text-center text-lg tracking-widest font-black"
                  />
                  <p className="text-xs text-slate-500 text-right">
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={handleSendOtp} className="text-orange-400 hover:underline">Resend OTP / फिर से भेजें</button>}
                  </p>
                </div>
              )}

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-white/10 text-orange-600 focus:ring-orange-500/20 bg-black/40 h-4 w-4"
                />
                <label htmlFor="anonymous" className="text-xs text-slate-300 cursor-pointer">
                  <span className="font-bold block">Submit anonymously / गुप्त रूप से भेजें</span>
                  Your phone number will be verified but hidden from officials.
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold transition-all"
              >
                &larr; Back / पीछे
              </button>
              <button
                onClick={handleSubmit}
                disabled={!otp || loading}
                className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center"
              >
                {loading ? 'Submitting...' : 'Register / दर्ज करें'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
