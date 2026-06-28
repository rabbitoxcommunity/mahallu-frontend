import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No data found', icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Icon size={26} className="text-gray-400" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

export default EmptyState;
