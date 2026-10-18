import React, { useState, useRef, useEffect } from 'react'
import Lightbox from '../components/Lightbox'
import { moreWorkData } from '../data/moreWorkData'
import { FaEye, FaInfoCircle, FaPlay, FaVolumeMute } from 'react-icons/fa'

const isVideo = (src) => typeof src === 'string' && /\.(mp4|webm|ogg|mov)$/i.test(src)

const ReelPreview = ({ project, isLightboxOpen }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Use provided thumbnail or fallback to jellyfish-thumb.jpg for videos
  const thumbSrc = project.thumbnail || (isVideo(project.src) ? 'img2/jellyfish-thumb.jpg' : project.src)

  // Pause and reset if Lightbox opens
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
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch(() => {
            // Autoplay policy or interruption handled safely
          })
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
      {/* Crisp Static Thumbnail Image */}
      <img
        src={thumbSrc}
        alt={project.title}
        className={`reel-thumbnail-img ${isPlaying ? 'fade-out' : ''}`}
        loading="lazy"
      />

      {/* Video Element for Pre-visualization (Reels Hover Preview) */}
{/* Video Element for Reels Preview */}
<video
  ref={videoRef}
  src={`${project.src}#t=0.001`}
  poster={thumbSrc}
  muted
  loop
  playsInline
  preload="metadata"
  className={`reel-video-element ${isPlaying ? 'active' : ''}`}
/>
      {/* Instagram Reels Badge (Top Right) */}
      <div className="instagram-reels-badge" title="Instagram Reel">
        <svg className="reel-icon-svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
        </svg>
        <span className="reel-badge-text">REEL</span>
      </div>

      {/* Pre-visualization Live Status Pill (Top Left, on Hover) */}
      {isHovered && (
        <div className="reel-preview-status">
          <span className="live-dot"></span>
          <span className="preview-label">PREVIEW</span>
          <FaVolumeMute className="preview-mute-icon" title="Silent here — open the reel for sound" />
        </div>
      )}

      {/* Center Play Button on Idle (Instagram Reels Grid Style) */}
      {!isPlaying && (
        <div className="reel-center-play-badge">
          <div className="reel-play-circle">
            <FaPlay className="reel-play-icon" />
          </div>
          <span className="reel-tap-hint">Hover to preview</span>
        </div>
      )}

      {/* Instagram-style Bottom Scrim & Info Overlay */}
      <div className="reel-bottom-scrim">
        <div className="reel-info">
          <span className="project-category-tag reel-cat-tag">{project.category}</span>
          <span className="project-title reel-title">{project.title}</span>
        </div>
        <span className="project-action-hint reel-action-hint">
          <FaInfoCircle /> Click to open full Reel & Details
        </span>
      </div>
    </div>
  )
  
}

const Teste = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? moreWorkData.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === moreWorkData.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="work-page">
      <h1 className="lg-heading">
        More <span className="text-secondary">Work</span>
      </h1>
      <h2 className="sm-heading">A collection of drawings, 3D assets, concept sketches, and paintings. Click any image for description.</h2>

      <div className="projects-grid">
        {moreWorkData.map((project, index) => {
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
                    <span className="reel-footer-badge">REEL</span>
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

      <Lightbox
        isOpen={lightboxOpen}
        images={moreWorkData}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default Teste
