import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export function FormGroup({ 
  label, 
  error, 
  description, 
  required,
  children,
  className
}: { 
  label: string, 
  error?: string, 
  description?: string, 
  required?: boolean,
  children: React.ReactNode,
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn("text-sm font-medium", error ? "text-rose-500" : "text-foreground")}>
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

export function FileUploadZone({ 
  onFileSelect, 
  accept, 
  maxSize, 
  label = "Click or drag file to upload",
  subLabel = "SVG, PNG, JPG or GIF (max. 5MB)"
}: { 
  onFileSelect?: (file: File) => void, 
  accept?: string, 
  maxSize?: number,
  label?: string,
  subLabel?: string
}) {
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onFileSelect) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="p-4 bg-background rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
        <UploadCloud className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{subLabel}</p>
      <input type="file" className="hidden" accept={accept} onChange={(e) => e.target.files && onFileSelect && onFileSelect(e.target.files[0])} />
    </div>
  );
}

export function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input 
      {...props} 
      className={cn(
        "rounded-xl bg-background/50 border-muted focus-visible:ring-primary/20", 
        props.className
      )} 
    />
  );
}
