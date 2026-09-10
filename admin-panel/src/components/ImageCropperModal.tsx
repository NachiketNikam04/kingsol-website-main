import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Check,
  Layers,
} from 'lucide-react';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  title?: string;
  targetWidth?: number;
  targetHeight?: number;
  freeCrop?: boolean;
  onCropComplete: (file: File, previewUrl: string) => void;
  onClose: () => void;
}

// Helper to create HTML Image element with cross-origin support
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Crops source image. If freeCrop is true, uses natural crop dimensions without stretching.
 * If freeCrop is false, scales to exact target pixel dimensions.
 * Exported strictly onto a transparent HTML5 canvas as image/png.
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  targetWidth = 800,
  targetHeight = 600,
  rotation = 0,
  freeCrop = false
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not obtain 2D canvas rendering context.');
  }

  // If freeCrop is active, use the exact selected pixel dimensions at full resolution
  const outWidth = freeCrop || !targetWidth || !targetHeight ? Math.round(pixelCrop.width) : targetWidth;
  const outHeight = freeCrop || !targetWidth || !targetHeight ? Math.round(pixelCrop.height) : targetHeight;

  canvas.width = outWidth;
  canvas.height = outHeight;

  // Clear canvas ensuring alpha transparency is preserved for PNGs
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Enable high-quality image smoothing / interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (rotation === 0) {
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outWidth,
      outHeight
    );
  } else {
    const rotRad = (rotation * Math.PI) / 180;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) throw new Error('Could not obtain temp canvas context.');

    const maxDim = Math.max(image.width, image.height) * 2;
    tempCanvas.width = maxDim;
    tempCanvas.height = maxDim;

    tempCtx.clearRect(0, 0, maxDim, maxDim);
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.translate(maxDim / 2, maxDim / 2);
    tempCtx.rotate(rotRad);
    tempCtx.drawImage(image, -image.width / 2, -image.height / 2);

    ctx.drawImage(
      tempCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outWidth,
      outHeight
    );
  }

  // Export strictly as image/png Blob to guarantee alpha transparency
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas export to PNG failed'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
};

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Crop Image',
  targetWidth = 800,
  targetHeight = 600,
  freeCrop = false,
  onCropComplete,
  onClose,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFreeCrop, setIsFreeCrop] = useState<boolean>(freeCrop);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setIsFreeCrop(freeCrop);
      setCroppedAreaPixels(null);
    }
  }, [isOpen, imageSrc, freeCrop]);

  const aspectRatio = targetWidth && targetHeight ? targetWidth / targetHeight : undefined;

  const handleCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setProcessing(true);
    try {
      const blob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        targetWidth,
        targetHeight,
        rotation,
        isFreeCrop
      );

      const croppedFile = new File([blob], `image_${Date.now()}.png`, {
        type: 'image/png',
      });

      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(croppedFile, previewUrl);
      onClose();
    } catch (error) {
      console.error('❌ [Crop Error]:', error);
      alert('Failed to crop and export image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {isFreeCrop
                  ? 'Freeform Crop — Select entire image or drag handles freely (Natural shape preserved)'
                  : `Locked aspect ratio (${targetWidth} × ${targetHeight}px exact export)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Cancel and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Cropper Area with Checkered Transparency Background */}
        <div className="relative w-full h-80 sm:h-96 border-b border-slate-100 overflow-hidden select-none bg-slate-100">
          {/* Light Checkered Pattern for Transparency Visibility */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: '#f8fafc',
              backgroundImage: `
                linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          />

          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={isFreeCrop ? undefined : aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            showGrid={true}
            cropShape="rect"
            style={{
              containerStyle: { backgroundColor: 'transparent' },
              mediaStyle: { backgroundColor: 'transparent' },
            }}
            classes={{
              containerClassName: '!bg-transparent',
              mediaClassName: '!bg-transparent',
              cropAreaClassName: '!border-2 !border-sky-500 !shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]',
            }}
          />
        </div>

        {/* Cropper Controls */}
        <div className="p-6 bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
              <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-mono font-semibold text-slate-600 w-10 text-right shrink-0">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Rotation and Mode Toggles */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4 text-sky-600" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFreeCrop((prev) => !prev)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                  isFreeCrop
                    ? 'bg-brand-green/15 text-emerald-800 border-brand-green/40 hover:bg-brand-green/25'
                    : 'bg-sky-50 text-sky-800 border-sky-200/60 hover:bg-sky-100'
                }`}
                title="Toggle between Freeform Crop and Fixed Ratio"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isFreeCrop ? 'Mode: Freeform' : `Mode: Fixed ${targetWidth}×${targetHeight}`}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400 font-medium">
              {croppedAreaPixels ? `${Math.round(croppedAreaPixels.width)} × ${Math.round(croppedAreaPixels.height)}px selected` : 'Drag handles to select crop area'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={processing}
                className="px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply & Export Crop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
