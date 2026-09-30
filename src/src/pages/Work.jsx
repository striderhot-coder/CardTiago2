import React, { useState } from 'react'
import Lightbox from '../components/Lightbox'

const Work = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const projects = [
    { src: 'img/projects/project1.jpg', title: 'Self Portrait' },
    { src: 'img/projects/project2.jpg', title: 'Portrait' },
    { src: 'img/projects/project3.jpg', title: 'Time Up' },
    { src: 'img/projects/project4.jpg', title: 'Electrojad' },
    { src: 'img/projects/project5.jpg', title: 'Compass' },
    { src: 'img/projects/project6.jpg', title: 'Vivelegant' },
    { src: 'img/projects/project7.jpg', title: 'Jellyfish' },
    { src: 'img/projects/project8.jpg', title: 'Leopard' },
    { src: 'img/projects/project9.jpg', title: 'Painting' },
    { src: 'img/projects/project10.jpg', title: 'Portrait 2' },
    { src: 'img/projects/project11.jpg', title: "Gringo's Cook" },
    { src: 'img/projects/project12.jpg', title: '3D house' },
    { src: 'img/projects/project13.jpg', title: 'Adn' },
    { src: 'img/projects/project14.jpg', title: 'Mobile App' },
    { src: 'img/projects/project15.jpg', title: '3D Rendering' },
    { src: 'img/projects/project16.jpg', title: 'Apex Tree House' },
    { src: 'img/projects/project17.jpg', title: 'Portrait 3' },
    { src: 'img/projects/project18.jpg', title: 'Desert' },
    { src: 'img/projects/project19.jpg', title: 'Rabbit' },
    { src: 'img/projects/project20.jpg', title: 'Portrait 4' },
    { src: 'img/projects/project21.jpg', title: 'Portrait 5' },
    { src: 'img/projects/project22.jpg', title: 'Converging Reality' },
    { src: 'img/projects/project23.jpg', title: 'Wonder Woman' },
    { src: 'img/projects/project24.jpg', title: 'Converging realities' },
    { src: 'img/projects/project25.jpg', title: "Assassin's Creed Valhalla" },
    { src: 'img/projects/project26.jpg', title: 'Portrait 6' }
  ]

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? projects.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === projects.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="work-page">
      <h1 className="lg-heading">
        My <span className="text-secondary">Work</span>
      </h1>
      <h2 className="sm-heading">Some of my projects</h2>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <div 
            key={index} 
            className="project-item" 
            onClick={() => openLightbox(index)}
          >
            <div className="project-image-wrapper">
              <img src={project.src} alt={project.title} loading="lazy" />
              <div className="project-overlay">
                <i className="fas fa-eye"></i>
                <span className="project-title">{project.title}</span>
              </div>
            </div>
            <div className="project-footer-link">
              <i className="fas fa-eye"></i> View {project.title}
            </div>
          </div>
        ))}
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        images={projects}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default Work
