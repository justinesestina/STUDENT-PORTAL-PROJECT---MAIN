import React, { useRef, useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  progress?: number;
  className?: string;
  preview?: string | null;
  onClear?: () => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = "image/*",
  maxSize = 5,
  onFileSelect,
  uploading = false,
  progress = 0,
  className,
  preview,
  onClear,
  label = "Upload File"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const validateAndSelect = (file: File) => {
    setError(null);
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-24 h-24 rounded-lg object-cover border"
          />
          {onClear && !uploading && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={onClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          )}
          <p className="mt-2 text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {maxSize}MB
          </p>
        </div>
      )}

      {uploading && progress > 0 && (
        <Progress value={progress} className="h-2" />
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};