import React from 'react';

interface ImageLightboxProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-3xl font-bold hover:text-gray-300 transition-colors cursor-pointer"
        aria-label="Close"
      >
        &times;
      </button>
      <img
        src={imageUrl}
        alt="Fullscreen View"
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
