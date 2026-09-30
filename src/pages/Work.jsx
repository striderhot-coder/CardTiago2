import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { projectsData } from '../data/projectsData'
import { FaEye, FaInfoCircle, FaFilter } from 'react-icons/fa'

const Work = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Extract unique categories for filter tabs
  const categories = ['All', ...new Set(projectsData.map(p => p.category).filter(Boolean))]

  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter(p => p.category === selectedCategory)

  // Check URL query parameters for direct link to a project modal e.g. /work?project=project-1
  useEffect(() => {
    const projectId = searchParams.get('project')
    if (projectId) {
      const index = filteredProjects.findIndex(p => p.id === projectId)
      if (index !== -1) {
        setCurrentIndex(index)
        setLightboxOpen(true)
      }
    }
  }, [searchParams, filteredProjects])

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
    const project = filteredProjects[index]
    if (project && project.id) {
      setSearchParams({ project: project.id })
    }
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSearchParams({})
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const nextIdx = prevIndex === 0 ? filteredProjects.length - 1 : prevIndex - 1
      const project = filteredProjects[nextIdx]
      if (project && project.id) setSearchParams({ project: project.id })
      return nextIdx
    })
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIdx = prevIndex === filteredProjects.length - 1 ? 0 : prevIndex + 1
      const project = filteredProjects[nextIdx]
      if (project && project.id) setSearchParams({ project: project.id })
      return nextIdx
    })
  }

  return (
    <div className="work-page">
      <h1 className="lg-heading">
        My <span className="text-secondary">Work</span>
      </h1>
      <h2 className="sm-heading">
        Explore my portfolio gallery. Click any image for full description and project details.
      </h2>

      {/* Category Filter Tabs */}
      <div className="category-filter-bar">
        <span className="filter-label">
          <FaFilter /> Filter:
        </span>
        <div className="filter-buttons">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map((project, index) => (
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
                  <FaInfoCircle /> View Description & Details
                </span>
              </div>
            </div>
            <div className="project-footer-link">
              <FaEye className="link-icon" /> {project.title} — <span className="view-desc">Description</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Lightbox + Description Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        images={filteredProjects}
        currentIndex={currentIndex}
        onClose={closeLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default Work
