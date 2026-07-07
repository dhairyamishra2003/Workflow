import React from 'react';

const MetricCard = ({ icon: Icon, label, value, color, suffix = '' }) => {
  return (
    <div className="glass-card flex items-center justify-between group">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        <h3 className="text-3xl font-bold text-gray-100 mt-1 select-none">
          {value}
          {suffix}
        </h3>
      </div>
      <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] group-hover:scale-110 transition-all duration-300">
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
  );
};

const MetricGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {metrics.map((metric, i) => (
        <MetricCard
          key={i}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          color={metric.color}
          suffix={metric.suffix}
        />
      ))}
    </div>
  );
};

export default MetricGrid;
