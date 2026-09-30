import React, { useState } from 'react'
import Lightbox from '../components/Lightbox'
import { surrealData } from '../data/surrealData'
import { FaEye, FaInfoCircle } from 'react-icons/fa'

const Surreal = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? surrealData.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === surrealData.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="work-page">
      <h1 className="lg-heading">
        Surreal <span className="text-secondary">Art</span>
      </h1>
      <h2 className="sm-heading">A gallery of surreal concept art and digital experiments. Click any artwork to expand and read details.</h2>

      <div className="projects-grid">
        {surrealData.map((item, index) => (
          <div 
            key={item.id || index} 
            className="project-item"
            onClick={() => openLightbox(index)}
          >
            <div className="project-image-wrapper">
              <img src={item.src} alt={item.title} loading="lazy" />
              <div className="project-overlay">
                <span className="project-category-tag">{item.category}</span>
                <span className="project-title">{item.title}</span>
                <span className="project-action-hint">
                  <FaInfoCircle /> View Description
                </span>
              </div>
            </div>
            <div className="project-footer-link">
              <FaEye /> {item.title}
            </div>
          </div>
        ))}
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        images={surrealData}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default Surreal
