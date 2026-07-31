import React from 'react';
import { Outlet } from '@tanstack/react-router';

export const PlacementLayout: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Outlet />
    </div>
  );
};
