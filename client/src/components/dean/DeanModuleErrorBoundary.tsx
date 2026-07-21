import React from 'react';
import { ShieldAlert, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Card, Badge } from '@/components/dashboard/ui';

interface Props {
  error?: Error;
  reset?: () => void;
}

export function DeanModuleErrorBoundary({ error, reset }: Props) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-6 text-center space-y-4 border-2 border-primary/20 shadow-xl rounded-2xl bg-background">
        <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="size-7" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge tone="info" className="text-xs">Dean Executive Suite</Badge>
            <Badge tone="warning" className="text-xs">System Recovery</Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Administrative Module Notice
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            The requested Dean administrative module is currently initializing or updating. No data was lost.
          </p>
          {error?.message && (
            <div className="mt-3 p-2.5 rounded-xl bg-muted/50 text-[11px] font-mono text-muted-foreground text-left overflow-x-auto border">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (reset) reset();
              else window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition flex items-center gap-2 cursor-pointer shadow-soft"
          >
            <RefreshCw className="size-3.5" /> Retry Module
          </button>
          <a
            href="/dashboard/dean"
            className="px-4 py-2 rounded-xl border border-input text-foreground text-xs font-bold hover:bg-accent transition flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="size-3.5" /> Return to Dean Dashboard
          </a>
        </div>
      </Card>
    </div>
  );
}
