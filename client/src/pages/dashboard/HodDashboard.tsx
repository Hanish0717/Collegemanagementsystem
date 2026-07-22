import React from 'react';
import { HODDepartmentProvider, useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { HODDashboardPage } from '@/modules/hod/pages/HODDashboardPage';

export function HodDashboard() {
  return (
    <HODDepartmentProvider>
      <HODDashboardPage />
    </HODDepartmentProvider>
  );
}
