import React, { useEffect } from 'react'
import { FaTimes, FaChevronLeft, FaChevronRight, FaTag, FaCalendarAlt, FaTools, FaExternalLinkAlt } from 'react-icons/fa'

const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src || '')

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

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onPrev, onNext])

  if (!isOpen || !images || images.length === 0) return null

  const item = images[currentIndex] || {}
  const mediaSrc = typeof item === 'object' ? item.src : item
  const title = typeof item === 'object' ? (item.title || 'Portfolio Work') : 'Portfolio Work'
  const category = typeof item === 'object' ? item.category : null
  const description = typeof item === 'object' ? item.description : null
  const year = typeof item === 'object' ? item.year : null
  const tools = typeof item === 'object' ? item.tools : null
  const link = typeof item === 'object' ? item.link : null

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('lightbox-overlay')) {
      onClose()
    }
  }

  return (
    <div className="lightbox-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="lightbox-card">
        {/* Close Button */}
        <button className="lightbox-close-btn" onClick={onClose} aria-label="Close project modal">
          <FaTimes />
        </button>

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            <button className="lightbox-nav-btn prev-btn" onClick={onPrev} aria-label="Previous project">
              <FaChevronLeft />
            </button>
            <button className="lightbox-nav-btn next-btn" onClick={onNext} aria-label="Next project">
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Main Content Layout */}
        <div className="lightbox-grid">
          {/* Media Container */}
          <div className="lightbox-media-wrapper">
            {isVideo(mediaSrc) ? (
              <video
                key={mediaSrc}
                src={mediaSrc}
                controls
                autoPlay
                playsInline
                className="lightbox-media"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                key={mediaSrc}
                src={mediaSrc}
                alt={title}
                className="lightbox-media"
              />
            )}
          </div>

          {/* Description & Details Sidebar */}
          <div className="lightbox-info-sidebar">
            {category && (
              <span className="lightbox-category-badge">
                <FaTag className="icon-small" /> {category}
              </span>
            )}

            <h2 className="lightbox-title">{title}</h2>

            {description && (
              <div className="lightbox-description-box">
                <h4 className="description-label">Description</h4>
                <p className="description-text">{description}</p>
              </div>
            )}

            <div className="lightbox-meta">
              {year && (
                <div className="meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <span><strong>Year:</strong> {year}</span>
                </div>
              )}

              {tools && Array.isArray(tools) && tools.length > 0 && (
                <div className="meta-item">
                  <FaTools className="meta-icon" />
                  <div className="tools-list">
                    <strong>Tools:</strong>
                    {tools.map((tool, idx) => (
                      <span key={idx} className="tool-pill">{tool}</span>
                    ))}
                  </div>
                </div>
              )}

              {link && (
                <div className="meta-item link-item">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="external-project-link">
                    View Live Project <FaExternalLinkAlt />
                  </a>
                </div>
              )}
            </div>

            <div className="lightbox-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lightbox
