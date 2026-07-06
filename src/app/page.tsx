import Link from 'next/link';
import { categories } from '@/lib/categories';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-orange-500">AwazDo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">BETA</span>
          </div>
          <Link 
            href="/track"
            className="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors font-medium"
          >
            Track Grievance / शिकायत ट्रैक करें
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center flex-1 flex flex-col justify-center items-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            अपनी आवाज़ दो <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              Give Your Voice to the City
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Report local civic issues, track real-time resolutions, and hold municipal bodies accountable. Built for a better Delhi NCR.
          </p>
        </div>

        {/* CTA Pilot Cities */}
        <div className="mt-12 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/delhi" className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-3 group">
            <span className="text-4xl">🏛️</span>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-orange-500 transition-colors">Delhi MCD / दिल्ली</h3>
              <p className="text-xs text-slate-400">Report in Unified MCD (250 Wards)</p>
            </div>
            <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Proceed / आगे बढ़ें &rarr;
            </span>
          </Link>

          <Link href="/ghaziabad" className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-3 group">
            <span className="text-4xl">🏢</span>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-orange-500 transition-colors">Ghaziabad / गाज़ियाबाद</h3>
              <p className="text-xs text-slate-400">Report in Nagar Nigam (100 Wards)</p>
            </div>
            <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Proceed / आगे बढ़ें &rarr;
            </span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-16 w-full grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
          <div className="text-center">
            <p className="text-3xl font-black text-slate-200">2</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Pilot Cities</p>
          </div>
          <div className="text-center border-x border-white/5">
            <p className="text-3xl font-black text-orange-500">350</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Wards</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-500">100%</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Free & Open</p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-24 w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8">
            What can you report? / आप क्या रिपोर्ट कर सकते हैं?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="glass-card p-4 flex flex-col items-center justify-center space-y-2 select-none">
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-slate-200 text-center">{cat.name_hi}</span>
                <span className="text-xs text-slate-500 text-center">{cat.name_en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 w-full text-left space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-100">
            How it works / यह कैसे काम करता है
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">1</div>
              <h4 className="text-lg font-bold text-slate-200">Spot & Report / पहचानें और रिपोर्ट करें</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Take a photo of the issue. Enter details and upload. The system automatically tags your GPS location.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">2</div>
              <h4 className="text-lg font-bold text-slate-200">Auto-Routing / स्वचालित असाइनमेंट</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our PostGIS spatial routing engine automatically determines the municipal ward and assigns it to the local officer.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">3</div>
              <h4 className="text-lg font-bold text-slate-200">Resolution & Audit / समाधान और सत्यापन</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Elected representatives receive alerts. Field workers upload "after" photos to close the ticket.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-24 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-slate-500">AwazDo — Built for Bharat 🇮🇳</p>
          <p className="text-xs text-slate-600">SaaS Civic Grievance OS for Ghaziabad and Delhi pilot. No-cost hosting tier.</p>
        </div>
      </footer>
    </div>
  );
}
