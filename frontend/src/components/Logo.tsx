import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center mb-6 scale-in">
      <div className="flex items-center gap-3 p-2 rounded-xl glass-card">
        <svg
          width="50"
          height="60"
          viewBox="0 0 100 120"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
        >
          {/* Document Shape */}
          <rect x="10" y="10" width="80" height="100" rx="8" fill="url(#gradient)" stroke="white" strokeWidth="5" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          {/* Skull Icon */}
          <circle cx="50" cy="40" r="12" fill="white" />
          <circle cx="45" cy="38" r="3" fill="#1E293B" />
          <circle cx="55" cy="38" r="3" fill="#1E293B" />
          <path d="M47 45 Q50 50, 53 45" stroke="#1E293B" strokeWidth="2" fill="none" />
          {/* Text Lines */}
          <rect x="20" y="65" width="60" height="5" rx="2" fill="white" />
          <rect x="20" y="75" width="50" height="5" rx="2" fill="white" />
          <rect x="20" y="85" width="40" height="5" rx="2" fill="white" />
        </svg>
        <h1 className="text-white text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-400">
          AI Resume Creator
        </h1>
      </div>
    </div>
  );
};

export default Logo;
