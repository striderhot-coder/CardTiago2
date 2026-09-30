import React, { useEffect } from 'react'

const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src)

const Lightbox = ({ isOpen, images, currentIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    console.log("mediaSrc:", mediaSrc)
console.log("isVideo:", isVideo(mediaSrc))

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onPrev, onNext])

  if (!isOpen || !images || images.length === 0) return null

  const currentImage = images[currentIndex]
  const mediaSrc = typeof currentImage === 'object' ? currentImage.src : currentImage
  const mediaTitle = typeof currentImage === 'object' ? currentImage.title : ''

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('lightbox-modal')) {
      onClose()
    }
  }

  return (
    <div className="lightbox-modal" onClick={handleBackdropClick}>
      <button className="lightbox-btn close-btn" onClick={onClose} aria-label="Close lightbox">
        <i className="fas fa-times"></i>
      </button>

      {images.length > 1 && (
        <>
          <button className="lightbox-btn prev-btn" onClick={onPrev} aria-label="Previous">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="lightbox-btn next-btn" onClick={onNext} aria-label="Next">
            <i className="fas fa-chevron-right"></i>
          </button>
        </>
      )}

      <div className="lightbox-content">
        {isVideo(mediaSrc) ? (
          <video
  key={mediaSrc}
  src={mediaSrc}
  controls
  playsInline
  className="lightbox-video"
>
  Your browser does not support the video tag.
</video>
            
             
          
        ) : (
          <img
            key={mediaSrc}
            src={mediaSrc}
            alt={mediaTitle || 'Portfolio Work'}
            className="lightbox-image"
          />
        )}
        {mediaTitle && <div className="lightbox-caption">{mediaTitle}</div>}
      </div>
    </div>
  )
}

export default Lightbox
