import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Workflow, Eye, Sparkles } from 'lucide-react';

/**
 * Public Landing Page
 * First screen for visitors with product summary and login CTA.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] font-['Outfit'] overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b-4 border-[#121212] bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
              <span className="w-4 h-4 bg-[#1040C0] border-2 border-[#121212]" />
              <span className="w-4 h-4 bg-[#F0C020] border-2 border-[#121212]" />
            </div>
            <p className="text-sm md:text-base font-black uppercase tracking-widest">The Complain Box</p>
          </div>

          <Link
            to="/login"
            className="px-5 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs sm:text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212] transition-all"
          >
            Login
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-block px-3 py-1 border-2 border-[#121212] bg-[#F0C020] text-xs font-black uppercase tracking-widest mb-5">
                Smart Complaint Resolution Platform
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95]">
                Raise Complaints.
                <br />
                Track Every Step.
              </h1>
              <p className="mt-6 text-base sm:text-lg font-medium text-[#121212]/80 max-w-xl leading-relaxed">
                The Complain Box helps institutions handle student grievances with speed,
                privacy, and accountability. Submit concerns securely, route them to the
                right authority automatically, and follow progress until closure.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-[#D02020] text-white border-2 border-[#121212] font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212] transition-all"
                >
                  Login To Continue
                </Link>
                <Link
                  to="/track"
                  className="px-6 py-3 bg-white text-[#121212] border-2 border-[#121212] font-black text-sm uppercase tracking-widest"
                >
                  Track Anonymous Complaint
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-5 -left-5 w-24 h-24 bg-[#F0C020] border-4 border-[#121212]" />
              <div className="absolute -bottom-6 -right-4 w-20 h-20 bg-[#D02020] border-4 border-[#121212] rounded-full" />

              <div className="relative bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60 mb-3">
                  Product Snapshot
                </p>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight mb-5">
                  Built For Students,
                  <br />
                  Trusted By Authorities
                </h2>

                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 mt-1.5 bg-[#1040C0] border border-[#121212]" />
                    <p className="font-medium">End-to-end complaint lifecycle visibility.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 mt-1.5 bg-[#107050] border border-[#121212]" />
                    <p className="font-medium">Automatic committee routing for faster action.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 mt-1.5 bg-[#D02020] border border-[#121212]" />
                    <p className="font-medium">Escalation-ready workflow with audit trails.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 mt-1.5 bg-[#F0C020] border border-[#121212]" />
                    <p className="font-medium">Supports both named and anonymous reporting.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
              <ShieldCheck className="w-7 h-7 text-[#1040C0]" />
              <h3 className="mt-3 text-lg font-black uppercase tracking-wider">Secure Reporting</h3>
              <p className="mt-2 text-sm text-[#121212]/80 font-medium leading-relaxed">
                Students can submit complaints with evidence files and choose anonymity when needed.
              </p>
            </article>

            <article className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
              <Workflow className="w-7 h-7 text-[#D02020]" />
              <h3 className="mt-3 text-lg font-black uppercase tracking-wider">Smart Workflow</h3>
              <p className="mt-2 text-sm text-[#121212]/80 font-medium leading-relaxed">
                Complaints move through clear status stages so every stakeholder knows what happens next.
              </p>
            </article>

            <article className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
              <Eye className="w-7 h-7 text-[#107050]" />
              <h3 className="mt-3 text-lg font-black uppercase tracking-wider">Transparent Tracking</h3>
              <p className="mt-2 text-sm text-[#121212]/80 font-medium leading-relaxed">
                Real-time updates and SLA awareness make resolution timelines visible and accountable.
              </p>
            </article>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
          <div className="bg-[#121212] text-white border-4 border-[#121212] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-5 -right-5 w-16 h-16 border-4 border-[#F0C020]" />
            <Sparkles className="w-6 h-6 text-[#F0C020]" />
            <h2 className="mt-2 text-2xl md:text-4xl font-black uppercase tracking-tight">
              Ready to make complaint resolution measurable?
            </h2>
            <p className="mt-3 text-white/80 max-w-2xl text-sm md:text-base font-medium">
              Log in to access your role-based dashboard and manage complaint workflows with speed and clarity.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 px-6 py-3 bg-[#F0C020] text-[#121212] border-2 border-white font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#ffffff] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#ffffff] transition-all"
            >
              Go To Login
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-[#121212] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-[#121212]">
            Developed by - Rajas Patil
          </p>
        </div>
      </footer>
    </div>
  );
}
