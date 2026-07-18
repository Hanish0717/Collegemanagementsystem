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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const handleFile = (file: File) => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File is too large. Max size is ${maxSize}MB.`);
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    if (onFileSelect) onFileSelect(file);
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : selectedFile
          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
          : "border-muted-foreground/25 bg-muted/20 hover:bg-muted/40 hover:border-primary/40"
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        // — File selected state —
        <div className="flex flex-col items-center gap-2 w-full">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-20 h-20 object-cover rounded-xl border shadow-sm" />
          ) : (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          )}
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 text-center max-w-[160px] truncate">
            {selectedFile.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[10px] text-rose-500 hover:underline mt-1"
          >
            Remove file
          </button>
        </div>
      ) : (
        // — Empty / drag state —
        <>
          <div className={cn(
            "p-4 bg-background rounded-full shadow-sm mb-3 transition-transform",
            isDragging ? "scale-125" : "group-hover:scale-110"
          )}>
            <UploadCloud className={cn("w-6 h-6", isDragging ? "text-primary" : "text-primary/60")} />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1 text-center">{label}</p>
          <p className="text-xs text-muted-foreground text-center">{subLabel}</p>
          {isDragging && (
            <p className="text-xs font-semibold text-primary mt-2 animate-pulse">Drop to upload</p>
          )}
        </>
      )}
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept={accept} 
        onChange={handleChange} 
      />
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
