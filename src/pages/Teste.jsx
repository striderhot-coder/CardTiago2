import React, { useState } from 'react'
import Lightbox from '../components/Lightbox'
import { moreWorkData } from '../data/moreWorkData'
import { FaEye, FaInfoCircle } from 'react-icons/fa'

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
        {moreWorkData.map((project, index) => (
          <div 
            key={project.id || index} 
            className="project-item" 
            onClick={() => openLightbox(index)}
          >
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
            <div className="project-footer-link">
              <FaEye /> {project.title}
            </div>
          </div>
        ))}
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
