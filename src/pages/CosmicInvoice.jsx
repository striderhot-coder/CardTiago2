import React, { useState, useRef, useEffect } from 'react'
import Lightbox from '../components/Lightbox'
import { cosmicInvoiceData } from '../data/cosmicInvoiceData'
import { FaEye, FaInfoCircle, FaPlay, FaVolumeMute } from 'react-icons/fa'

const isVideo = (src) => typeof src === 'string' && /\.(mp4|webm|ogg|mov)$/i.test(src)

const ReelPreview = ({ project, isLightboxOpen }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const thumbSrc = project.thumbnail || (isVideo(project.src) ? '' : project.src)

  useEffect(() => {
    if (isLightboxOpen && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
      setIsHovered(false)
    }
  }, [isLightboxOpen])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const p = videoRef.current.play()
      if (p && typeof p.then === 'function') {
        p.then(() => setIsPlaying(true)).catch(() => {})
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className={`project-image-wrapper reel-wrapper ${isHovered ? 'reel-hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {thumbSrc ? (
        <img
          src={thumbSrc}
          alt={project.title}
          className={`reel-thumbnail-img ${isPlaying ? 'fade-out' : ''}`}
          loading="lazy"
        />
      ) : (
        <div className={`reel-thumbnail-img reel-no-thumb ${isPlaying ? 'fade-out' : ''}`} />
      )}
      <video
        ref={videoRef}
        src={`${project.src}#t=0.001`}
        poster={thumbSrc || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className={`reel-video-element ${isPlaying ? 'active' : ''}`}
      />
      <div className="instagram-reels-badge" title="Short">
        <svg className="reel-icon-svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
        </svg>
        <span className="reel-badge-text">SHORT</span>
      </div>
      {isHovered && (
        <div className="reel-preview-status">
          <span className="live-dot"></span>
          <span className="preview-label">PREVIEW</span>
          <FaVolumeMute className="preview-mute-icon" title="Silent here — open the short for sound" />
        </div>
      )}
      {!isPlaying && (
        <div className="reel-center-play-badge">
          <div className="reel-play-circle">
            <FaPlay className="reel-play-icon" />
          </div>
          <span className="reel-tap-hint">Hover to preview</span>
        </div>
      )}
      <div className="reel-bottom-scrim">
        <div className="reel-info">
          <span className="project-category-tag reel-cat-tag">{project.category}</span>
          <span className="project-title reel-title">{project.title}</span>
        </div>
        <span className="project-action-hint reel-action-hint">
          <FaInfoCircle /> Click to open full Short & Details
        </span>
      </div>
    </div>
  )
}

const CosmicInvoice = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = () => setCurrentIndex((p) => (p === 0 ? cosmicInvoiceData.length - 1 : p - 1))
  const handleNext = () => setCurrentIndex((p) => (p === cosmicInvoiceData.length - 1 ? 0 : p + 1))

  return (
    <div className="work-page">
      <h1 className="lg-heading">
        Cosmic <span className="text-secondary">Invoice</span>
      </h1>
      <h2 className="sm-heading">
        A compilation of shorts and works from the omni archive. Click any tile for the full piece with sound.
      </h2>

      <div className="cosmic-dev-banner">
        <img src="img2/under-development.png" alt="Cosmic Invoice is under development" loading="lazy" />
        <span className="cosmic-dev-caption">This archive is still under development — new shorts land here as they arrive.</span>
      </div>

      {cosmicInvoiceData.length === 0 ? (
        <p className="cosmic-empty-note">
          The omni archive has not been copied into this project yet.
        </p>
      ) : (
        <div className="projects-grid">
          {cosmicInvoiceData.map((project, index) => {
            const isProjectVideo = isVideo(project.src)
            return (
              <div
                key={project.id || index}
                className={`project-item ${isProjectVideo ? 'project-item-reel' : ''}`}
                onClick={() => openLightbox(index)}
              >
                {isProjectVideo ? (
                  <ReelPreview project={project} isLightboxOpen={lightboxOpen} />
                ) : (
                  <div className="project-image-wrapper">
                    <img src={project.src} alt={project.title} loading="lazy" />
                    <div className="project-overlay">
                      <span className="project-category-tag">{project.category}</span>
                      <span className="project-title">{project.title}</span>
                      <span className="project-action-hint">
                        <FaInfoCircle /> View Description
                      </span>
                    </div>
                  </div>
                )}
                <div className="project-footer-link">
                  {isProjectVideo ? (
                    <>
                      <FaPlay className="reel-footer-icon" /> {project.title}
                      <span className="reel-footer-badge">SHORT</span>
                    </>
                  ) : (
                    <>
                      <FaEye /> {project.title}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Lightbox
        isOpen={lightboxOpen}
        images={cosmicInvoiceData}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default CosmicInvoice
