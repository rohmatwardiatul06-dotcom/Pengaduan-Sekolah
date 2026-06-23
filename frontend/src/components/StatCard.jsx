import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, borderClass, ringClass }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all-custom hover:-translate-y-1 hover:shadow-md ${borderClass} ${ringClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-800">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform hover:scale-110 ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative background shape */}
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-slate-50/50 opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default StatCard;
