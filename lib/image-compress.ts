/**
 * Client-side image compression helper to avoid HTTP 413 (Content Too Large) errors on Vercel.
 * Resizes the image to a maximum width (default 1920px) and converts it to WebP format with high quality.
 */
export function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not an image, return original file (e.g. video files)
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if width is larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Fallback to original file
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original file
            }
            
            // Create a new File from the blob with .webp extension
            const originalName = file.name;
            const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
            
            const compressedFile = new File([blob], `${nameWithoutExtension}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            console.log(
              `Compressed client-side: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) -> ` +
              `${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`
            );

            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function compressAndGetDetails(
  file: File, 
  maxWidth = 1920, 
  quality = 0.85
): Promise<{ file: File; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Not an image"));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas context failed"));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Blob conversion failed"));
            }
            
            const originalName = file.name;
            const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
            
            const compressedFile = new File([blob], `${nameWithoutExtension}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve({ file: compressedFile, width, height });
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Image load failed"));
    };
    reader.onerror = () => reject(new Error("File read failed"));
  });
}

/**
 * Compresses and cover-crops a package background image to a 4:5 aspect ratio (800x1000px) client-side.
 */
export function compressAndCropPackageImage(
  file: File,
  targetWidth = 800,
  targetHeight = 1000,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Fallback to original file
        }

        // Calculate cover crop coordinates
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgRatio > targetRatio) {
          // Image is wider than 4:5, crop sides
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          // Image is taller than 4:5, crop top/bottom
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original file
            }
            
            const originalName = file.name;
            const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
            
            const croppedFile = new File([blob], `${nameWithoutExtension}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            console.log(
              `Cover-cropped client-side: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) -> ` +
              `${croppedFile.name} (${(croppedFile.size / 1024 / 1024).toFixed(2)} MB)`
            );

            resolve(croppedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

