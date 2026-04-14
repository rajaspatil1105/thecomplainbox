import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Access Denied Page
 */
export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center px-4 font-['Outfit']">
      <div className="max-w-lg w-full bg-white border-4 border-[#121212] p-10 text-center shadow-[8px_8px_0px_0px_#121212]">
        <p className="text-xs font-bold uppercase tracking-widest text-[#D02020]">403</p>
        <h1 className="text-4xl font-black text-[#121212] uppercase tracking-tighter mt-2">Access Denied</h1>
        <p className="text-sm text-[#121212]/70 mt-3">You do not have permission to access this page.</p>
        <Link
          to="/login"
          className="inline-block mt-6 px-5 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
