import React from 'react';
import { toast } from 'sonner';

export const NotificationToast = {
  success: (title: string, message?: string) => {
    toast.success(title, {
      description: message,
    });
  },
  error: (title: string, message?: string) => {
    toast.error(title, {
      description: message,
    });
  },
  info: (title: string, message?: string) => {
    toast.info(title, {
      description: message,
    });
  },
  warning: (title: string, message?: string) => {
    toast.warning(title, {
      description: message,
    });
  },
};
