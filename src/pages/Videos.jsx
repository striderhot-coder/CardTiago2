import React, { useState, useEffect } from 'react'
import { FaPlay, FaTimes, FaYoutube, FaInstagram, FaExternalLinkAlt } from 'react-icons/fa'
import './Videos.css'

// =========================================================================
// YOUTUBE VIDEOS LIST
// To change or add videos, simply update or add items in this array.
// Paste your YouTube video link in the 'url' field!
// Supports:
// - https://www.youtube.com/watch?v=VIDEO_ID
// - https://youtu.be/VIDEO_ID
// - https://www.youtube.com/shorts/VIDEO_ID
// - https://www.youtube.com/embed/VIDEO_ID
// =========================================================================
const YOUTUBE_VIDEOS = [
  {
    id: 1,
    url: 'https://www.youtube.com/watch?v=RYFc7ne7Q0w&t=63s',
    title: 'Portrait | Lessson | Illustrator video of a portrait drawing and paint',
    description: 'Explore my latest video project and creative process.'
  },
  {
    id: 2,
    url: 'https://www.youtube.com/watch?v=HZ3zP-jE0U8&t=1998s',
    title: 'Coffe Game Illustration drawing and creation process.. from scratch',
    description: 'Highlight reel featuring 3D art, editing, and visuals.'
  },
  {
    id: 3,
    url: 'https://www.youtube.com/watch?v=1vofCBNe36A&t=5563s',
    title: 'Behind The Scenes | Photoshop drawing full video',
    description: 'A glimpse into the design workflows and concept development.'
  },
  {
    id: 4,
    url: 'https://www.youtube.com/watch?v=F4ltQ7pNFQU&t=3022s',
    title: 'Visual Effects Showcase | Lecture1',
    description: 'Demonstration of visual storytelling.'
  }
]

// =========================================================================
// INSTAGRAM REELS LIST
// To change or add Reels, simply replace or add items in this array.
// Paste any Instagram Reel link in the 'url' field!
// Supports:
// - https://www.instagram.com/reel/REEL_ID/
// - https://www.instagram.com/reels/REEL_ID/
// - https://www.instagram.com/p/REEL_ID/
// - REEL_ID
// =========================================================================
const INSTAGRAM_REELS = [
  {
    id: 1,
    url: 'https://www.instagram.com/reel/DdIHddEi4tM/',
    title: 'Puppy Fight Reel',
    description: 'A short from me drawing an illustration'
  },
  {
    id: 2,
    url: 'https://www.instagram.com/reel/C95ZHN-vq5L/',
    title: 'Instagram Reel 2',
    description: 'Short creative reel clip.'
  },
  {
    id: 3,
    url: 'https://www.instagram.com/reel/DbzhFdTI3mL/',
    title: 'Instagram Reel 3',
    description: 'Behind the scenes artwork process.'
  },
  {
    id: 4,
    url: 'https://www.instagram.com/reel/DYyVgI8INoD/',
    title: 'Instagram Reel 4',
    description: 'Design and animation showcase.'
  },
  {
    id: 5,
    url: 'https://www.instagram.com/reel/DVZ8CsKk1v0/',
    title: 'Instagram Reel 5',
    description: 'Creative process and workflow.'
  },
  {
    id: 6,
    url: 'https://www.instagram.com/reel/DNroPkSZqmf/',
    title: 'Instagram Reel 6',
    description: 'Artwork highlights and final render.'
  }
]

/**
 * Extracts YouTube Video ID from full URLs, short URLs, shorts, or raw IDs.
 */
const extractYouTubeId = (url) => {
  if (!url) return null
  const trimmed = url.trim()
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes(':')) {
    return trimmed
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = trimmed.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Extracts Instagram Reel/Post ID from standard Instagram URLs.
 */
const extractInstagramId = (url) => {
  if (!url) return null
  const trimmed = url.trim().replace(/\/+$/, '')
  const regExp = /(?:instagram\.com\/(?:reel|reels|p)\/|instagr\.am\/p\/)([A-Za-z0-9_-]+)/i
  const match = trimmed.match(regExp)
  if (match && match[1]) {
    return match[1]
  }
  if (!trimmed.includes('/') && !trimmed.includes(':')) {
    return trimmed
  }
  return null
}

const Videos = () => {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'youtube' | 'reels'
  const [selectedMedia, setSelectedMedia] = useState(null) // { type: 'youtube' | 'reel', item }

  // Keyboard navigation / close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMedia(null)
      }
    }

    if (selectedMedia) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedMedia])

  const openMediaModal = (type, item) => {
    setSelectedMedia({ type, item })
  }

  const closeMediaModal = () => {
    setSelectedMedia(null)
  }

  return (
    <div className="videos-page">
      <div className="videos-header">
        <h1 className="lg-heading">
          My <span className="text-secondary">Videos & Reels</span>
        </h1>
        <h2 className="sm-heading">
          Check out my YouTube video collection and Instagram Reels
        </h2>

        {/* Filter Navigation Tabs */}
        <div className="media-filter-tabs">
          <button
            className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Media
          </button>
          <button
            className={`filter-btn ${activeTab === 'youtube' ? 'active' : ''}`}
            onClick={() => setActiveTab('youtube')}
          >
            <FaYoutube className="tab-icon youtube-icon" /> YouTube Videos
          </button>
          <button
            className={`filter-btn ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <FaInstagram className="tab-icon instagram-icon" /> Instagram Reels
          </button>
        </div>
      </div>

      {/* YOUTUBE SECTION */}
      {(activeTab === 'all' || activeTab === 'youtube') && (
        <section className="media-section">
          <div className="section-title-wrapper">
            <FaYoutube className="section-icon youtube-icon" />
            <h2 className="section-title">YouTube Videos</h2>
          </div>
          <div className="video-grid">
            {YOUTUBE_VIDEOS.map((video) => {
              const videoId = extractYouTubeId(video.url)
              const thumbnailUrl = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : null

              return (
                <div
                  key={video.id}
                  className="video-card"
                  onClick={() => openMediaModal('youtube', video)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && openMediaModal('youtube', video)
                  }
                >
                  <div className="video-thumbnail-container">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="video-thumbnail"
                        loading="lazy"
                      />
                    ) : (
                      <div className="video-thumbnail-placeholder">
                        <FaYoutube className="placeholder-icon" />
                      </div>
                    )}
                    <div className="video-overlay">
                      <div className="play-button-wrapper">
                        <FaPlay className="play-icon" />
                      </div>
                    </div>
                  </div>
                  <div className="video-card-info">
                    <h3 className="video-card-title">{video.title}</h3>
                    {video.description && (
                      <p className="video-card-desc">{video.description}</p>
                    )}
                    <div className="watch-link">
                      <FaYoutube className="youtube-badge-icon" /> Watch Video
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* INSTAGRAM REELS SECTION */}
      {(activeTab === 'all' || activeTab === 'reels') && (
        <section className="media-section instagram-section">
          <div className="section-title-wrapper">
            <FaInstagram className="section-icon instagram-icon" />
            <h2 className="section-title">Instagram Reels</h2>
          </div>
          <div className="reels-grid">
            {INSTAGRAM_REELS.map((reel) => {
              const reelId = extractInstagramId(reel.url)

              return (
                <div key={reel.id} className="reel-card">
                  <div className="reel-embed-container">
                    {reelId ? (
                      <iframe
                        src={`https://www.instagram.com/reel/${reelId}/embed`}
                        title={reel.title}
                        className="reel-iframe"
                        frameBorder="0"
                        scrolling="no"
                        allowTransparency={true}
                      />
                    ) : (
                      <div className="reel-placeholder">
                        <FaInstagram className="reel-placeholder-icon" />
                        <span>Invalid Reel URL</span>
                      </div>
                    )}
                  </div>
                  <div className="reel-card-info">
                    <h3 className="reel-card-title">{reel.title}</h3>
                    {reel.description && (
                      <p className="reel-card-desc">{reel.description}</p>
                    )}
                    <a
                      href={reel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reel-external-link"
                    >
                      <FaInstagram /> Open on Instagram <FaExternalLinkAlt className="ext-icon" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* YouTube Lightbox Modal */}
      {selectedMedia && selectedMedia.type === 'youtube' && (
        <div className="video-modal-backdrop" onClick={closeMediaModal}>
          <div
            className="video-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="video-modal-close"
              onClick={closeMediaModal}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
            <div className="video-player-wrapper">
              {extractYouTubeId(selectedMedia.item.url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(
                    selectedMedia.item.url
                  )}?autoplay=1&rel=0`}
                  title={selectedMedia.item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                />
              ) : (
                <div className="video-error">Invalid YouTube URL or ID</div>
              )}
            </div>
            <div className="video-modal-details">
              <h2>{selectedMedia.item.title}</h2>
              {selectedMedia.item.description && (
                <p>{selectedMedia.item.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Videos
