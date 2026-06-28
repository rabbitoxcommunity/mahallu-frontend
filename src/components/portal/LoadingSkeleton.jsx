import React from 'react';

const Bone = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
    <Bone className="w-11 h-11 rounded-xl" />
    <Bone className="h-4 w-3/4" />
    <Bone className="h-3 w-full" />
    <Bone className="h-3 w-2/3" />
  </div>
);

export const AnnouncementSkeleton = () => (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
    <Bone className="h-4 w-4/5" />
    <Bone className="h-3 w-full" />
    <Bone className="h-3 w-3/4" />
    <Bone className="h-3 w-1/3 mt-2" />
  </div>
);

const LoadingSkeleton = ({ count = 4, type = 'card' }) => {
  const Sk = type === 'announcement' ? AnnouncementSkeleton : CardSkeleton;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <Sk key={i} />)}
    </>
  );
};

export default LoadingSkeleton;
