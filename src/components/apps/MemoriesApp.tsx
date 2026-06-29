import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Images, Download, Loader2 } from 'lucide-react';

interface Photo {
  id: number;
  src: string;
  caption: string;
}

const photos: Photo[] = [
  { id: 1,  src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 2,  src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 3,  src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 4,  src: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 5,  src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 6,  src: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 7,  src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 8,  src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },

  { id: 9,  src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 10, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 11, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 12, src: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 13, src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 14, src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 15, src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 16, src: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 17, src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 18, src: 'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
  { id: 19, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop', caption: '[Caption — replace with the real memory]' },
];

// Draws the photo + a white polaroid border + caption onto an offscreen
// canvas, then triggers a PNG download. The image host must allow CORS
// (Unsplash does) or the canvas will be "tainted" and export will fail —
// if real photos get swapped in later, make sure wherever they're hosted
// (Imgur, Cloudinary, etc.) serves images with CORS enabled.
async function exportPolaroid(photo: Photo) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = photo.src;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not load image for export'));
  });

  const padding = 24;
  const captionHeight = 64;
  const photoW = 480;
  const photoH = Math.round(photoW * (img.height / img.width));
  const canvasW = photoW + padding * 2;
  const canvasH = photoH + padding * 2 + captionHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // White polaroid card with a soft shadow
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.drawImage(img, padding, padding, photoW, photoH);

  ctx.fillStyle = '#3A3A3A';
  ctx.font = '22px "Segoe Script", "Brush Script MT", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    photo.caption.replace(/^\[|\]$/g, ''),
    canvasW / 2,
    padding + photoH + 40,
    canvasW - padding * 2
  );

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `memory-${photo.id}.png`;
  link.click();
}

export default function MemoriesApp() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (photo: Photo) => {
    setExporting(true);
    try {
      await exportPolaroid(photo);
    } catch (err) {
      console.error('Polaroid export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-black/5">
        <Images className="w-4 h-4 text-[#6E6E73]" />
        <span className="text-xs font-medium text-[#1D1D1F]">Memories</span>
        <span className="text-xs text-[#6E6E73]">{photos.length} items</span>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => setSelectedPhoto(photo)}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-[11px] font-medium truncate">{photo.caption}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="relative max-w-2xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleExport(selectedPhoto)}
                disabled={exporting}
                className="absolute -top-10 left-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 cursor-pointer"
                aria-label="Save as a polaroid keepsake"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exporting ? 'Saving…' : 'Save'}
              </button>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                className="w-full rounded-xl shadow-2xl"
              />
              <p className="text-white text-sm text-center mt-4 font-medium">
                {selectedPhoto.caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
