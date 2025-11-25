import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse p-1">
      {/* Chart Area Skeleton */}
      <div className="w-full h-[250px] sm:h-[300px] glass rounded-2xl bg-white/5 border border-white/5"></div>
      
      {/* Secondary Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 glass rounded-2xl bg-white/5 border border-white/5"></div>
        <div className="h-24 glass rounded-2xl bg-white/5 border border-white/5"></div>
        <div className="h-24 glass rounded-2xl bg-white/5 border border-white/5"></div>
      </div>

      {/* List Items Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 glass rounded-2xl bg-white/5 border border-white/5"></div>
        ))}
      </div>
    </div>
  );
};