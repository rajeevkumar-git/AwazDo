'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackPage() {
  const [ticketId, setTicketId] = useState('');
  const [searched, setSearched] = useState(false);
  const [complaint, setComplaint] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || ticketId.length < 8) return;
    
    // Simulate API search query
    setSearched(true);
    setComplaint({
      ticket_id: ticketId.toUpperCase(),
      category: 'Roads & Footpaths / सड़कें और फुटपाथ',
      description: 'Dangerous pothole near the main crossroads, causes heavy traffic bottlenecks during evening peak hours.',
      status: 'in_progress', // submitted, acknowledged, in_progress, resolved
      created_at: '2026-07-05T10:30:00Z',
      ward_name: 'Vasundhara Ward 4',
      officer_name: 'D.K. Singh (Junior Engineer)',
      officer_phone: '+91 98765 XXXXX',
      timeline: [
        { status: 'submitted', title: 'Submitted / दर्ज की गई', desc: 'Complaint registered by citizen via Web', time: 'July 5, 2026 10:30 AM', active: true },
        { status: 'acknowledged', title: 'Acknowledged / स्वीकृत', desc: 'GNN Zonal Office confirmed receipt of report', time: 'July 5, 2026 02:15 PM', active: true },
        { status: 'assigned', title: 'Assigned / अधिकारी आवंटित', desc: 'Assigned to Ward Junior Engineer for ground inspection', time: 'July 6, 2026 09:00 AM', active: true },
        { status: 'in_progress', title: 'Work in Progress / कार्य प्रगति पर', desc: 'Repair equipment dispatched to site location', time: 'July 6, 2026 11:30 AM', active: true },
        { status: 'resolved', title: 'Resolved / समाधान पूर्ण', desc: 'Paving finished. Verification pending.', time: null, active: false }
      ]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'acknowledged': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'in_progress': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted / दर्ज';
      case 'acknowledged': return 'Acknowledged / स्वीकृत';
      case 'in_progress': return 'In Progress / कार्य जारी';
      case 'resolved': return 'Resolved / समाधान पूर्ण';
      default: return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-100 flex items-center gap-1">
          &larr; Back to Home / होमपेज
        </Link>
        <span className="text-sm font-black tracking-tight text-orange-500">AwazDo</span>
      </header>

      {/* Main Track Form */}
      <div className="flex-grow space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-100">Track Grievance</h2>
          <h3 className="text-md text-slate-400">शिकायत की स्थिति ट्रैक करें</h3>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Enter Ticket ID (e.g. AWZ-2026-4821)"
            className="flex-grow glass-input p-3 text-sm focus:outline-none tracking-widest font-bold uppercase text-center"
            required
          />
          <button
            type="submit"
            className="px-6 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-all"
          >
            Track
          </button>
        </form>

        {/* Search Results */}
        {searched && complaint && (
          <div className="space-y-6 animate-fadeIn">
            {/* Info Summary */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-lg font-black text-slate-100">{complaint.ticket_id}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getStatusColor(complaint.status)}`}>
                  {getStatusLabel(complaint.status)}
                </span>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Category / श्रेणी</span>
                  <span className="text-sm font-bold text-slate-300">{complaint.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Ward & Area / वार्ड और क्षेत्र</span>
                  <span className="text-sm font-medium text-slate-300">{complaint.ward_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Details / विवरण</span>
                  <span className="text-sm text-slate-400 leading-relaxed block">{complaint.description}</span>
                </div>
              </div>
            </div>

            {/* Officer Assignment */}
            <div className="glass-card p-4 flex items-center justify-between bg-orange-500/5 border-orange-500/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👷</span>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Assigned Officer / आवंटित अधिकारी</span>
                  <span className="text-sm font-bold text-slate-200">{complaint.officer_name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-orange-400 font-bold block">{complaint.officer_phone}</span>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="glass-card p-6 space-y-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Status Timeline / समय सीमा</h4>
              
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {complaint.timeline.map((step: any, index: number) => (
                  <div key={index} className="relative space-y-1">
                    {/* Circle Indicator */}
                    <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                      step.active 
                        ? 'bg-orange-500 border-orange-500 shadow-md shadow-orange-500/20' 
                        : 'bg-slate-900 border-white/15'
                    }`} />
                    
                    <div className="flex items-center justify-between flex-wrap">
                      <h5 className={`text-sm font-bold ${step.active ? 'text-slate-100' : 'text-slate-500'}`}>
                        {step.title}
                      </h5>
                      {step.time && (
                        <span className="text-[10px] text-slate-500 font-mono">{step.time}</span>
                      )}
                    </div>
                    <p className={`text-xs ${step.active ? 'text-slate-400' : 'text-slate-600'}`}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {searched && !complaint && (
          <div className="text-center py-12 text-slate-500">
            Ticket ID not found. Please verify and try again.
            <br />
            <span className="text-xs">टिकट आईडी नहीं मिली। कृपया जाँच कर पुनः प्रयास करें।</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center mt-12 text-[10px] text-slate-600">
        AwazDo — Delhi-Ghaziabad Open-Source Platform
      </footer>
    </div>
  );
}
