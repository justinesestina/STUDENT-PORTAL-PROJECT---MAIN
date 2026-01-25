import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UploadOptions {
  bucket: 'avatars' | 'assignments';
  path?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, options: UploadOptions): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    const { bucket, path, onSuccess, onError } = options;

    // Validate file size
    const maxSize = bucket === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB or 10MB
    if (file.size > maxSize) {
      const error = new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      toast.error(error.message);
      onError?.(error);
      return null;
    }

    // Validate file type
    const allowedTypes = bucket === 'avatars' 
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      const error = new Error('File type not allowed');
      toast.error(error.message);
      onError?.(error);
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = path 
        ? `${user.id}/${path}/${fileName}`
        : `${user.id}/${fileName}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);

      toast.success('File uploaded successfully');
      onSuccess?.(publicUrl);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      onError?.(error);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (bucket: 'avatars' | 'assignments', filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast.success('File deleted');
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete file');
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress
  };
};