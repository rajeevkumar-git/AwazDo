import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500 font-medium">Loading Map / नक्शा लोड हो रहा है...</div>
});

const CITY_NAMES: Record<string, { en: string; hi: string; emoji: string }> = {
  delhi: { en: 'Delhi MCD', hi: 'दिल्ली नगर निगम', emoji: '🏛️' },
  ghaziabad: { en: 'Ghaziabad Nagar Nigam', hi: 'गाज़ियाबाद नगर निगम', emoji: '🏢' }
};

interface CityPageProps {
  params: {
    city: string;
  };
}

export default function CityPage({ params }: CityPageProps) {
  const cityKey = params.city.toLowerCase();
  const city = CITY_NAMES[cityKey] || { en: 'Unknown City', hi: 'अज्ञात शहर', emoji: '📍' };

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-orange-500">AwazDo</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-300">{city.emoji} {city.hi} / {city.en}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Actions & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-100">{city.hi}</h2>
              <h3 className="text-lg font-bold text-slate-400">{city.en}</h3>
            </div>
            
            <div className="pt-4 space-y-3">
              <Link 
                href={`/${cityKey}/report`}
                className="w-full flex items-center justify-between py-4 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors shadow-lg shadow-orange-600/20 text-center"
              >
                <span>➕ File a Complaint / शिकायत दर्ज करें</span>
              </Link>
              <Link 
                href="/track"
                className="w-full flex items-center justify-between py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold transition-colors text-center"
              >
                <span>🔍 Track Complaint / ट्रैक करें</span>
              </Link>
            </div>
          </div>

          {/* Local Stats */}
          <div className="glass-card p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">SLA Performance / कार्य निष्पादन</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-xs text-slate-500 block">Avg. Resolution</span>
                <span className="text-lg font-bold text-slate-200">48 Hours</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-xs text-slate-500 block">SLA Compliance</span>
                <span className="text-lg font-bold text-emerald-500">94.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Heatmap / Map */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-200">Grievance Heatmap / शिकायत मानचित्र</h4>
            <span className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">LIVE UPDATES</span>
          </div>
          
          <div className="flex-1 min-h-[450px] relative border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <MapView city={cityKey} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 bg-black/20 text-center">
        <p className="text-xs text-slate-600">AwazDo — Ghaziabad and Delhi pilot. Free database tier.</p>
      </footer>
    </div>
  );
}
