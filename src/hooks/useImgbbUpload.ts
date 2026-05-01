'use client';

import { useState } from 'react';

const IMGBB_API_KEY = '7f7b2615e37d49f2db2eec28c9007bc4';

export function useImgbbUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error?.message || 'Image upload failed');
      }

      return result.data.url as string;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
}
