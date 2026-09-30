import React, { useState } from 'react'
import Lightbox from '../components/Lightbox'

const Teste = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Flat array of all images in the gallery for sequential Lightbox navigation
  const galleryItems = [
    { src: 'img2/project1.jpg', title: 'Owl' }, // 0
    { src: 'img2/project2.png', title: 'Character' }, // 1
    { src: 'img2/project3.png', title: 'Faith Mirrors Edge' }, // 2
    { src: 'img2/project4.png', title: 'Empyrean' }, // 3
    
    { src: 'img2/project5.png', title: 'Cyberpunk Girl' }, // 4
    { src: 'img2/project6.png', title: 'Sci-fi Character' }, // 5
    { src: 'img2/project7.png', title: 'Futuristic Suit' }, // 6
    { src: 'img2/project8.jpg', title: 'Portrait Sketch' }, // 7
    
    { src: 'img2/project9.jpg', title: 'Digital Painting' }, // 8
    { src: 'img2/project10.png', title: 'Cyber Assassin' }, // 9
    { src: 'img2/project11.jpg', title: 'Warrior' }, // 10
    { src: 'img2/project12.png', title: 'Mech Concept' }, // 11
    
    { src: 'img2/project13.png', title: 'Abstract Art' }, // 12
    { src: 'img2/project14.jpg', title: 'Concept Landscape' }, // 13
    { src: 'img2/project15.jpg', title: '3D Render Interior' }, // 14
    { src: 'img2/project16.jpg', title: 'Urban Sketch' }, // 15
    
    { src: 'img2/project17.jpg', title: 'Fantasy Character' }, // 16
    { src: 'img2/project18.jpg', title: 'Desert Environment' }, // 17
    { src: 'img2/project19.jpg', title: 'Rabbit Character' }, // 18
    { src: 'img2/project20.jpg', title: 'Human Study' }, // 19
    
    { src: 'img2/project21.jpg', title: 'Cyberpunk Portrait' }, // 20
    { src: 'img2/project22.jpg', title: 'Futuristic City' }, // 21
    { src: 'img2/project24.jpg', title: 'Scifi Portal' }, // 22
    { src: 'img2/project25.jpg', title: 'Assassin' }, // 23
    
    { src: 'img2/project26.jpg', title: 'Mechanical Head' }, // 24
    { src: 'img2/project27.jpg', title: 'Abstract Sketch' }, // 25
    { src: 'img2/project28.jpg', title: 'Digital Portrait' }, // 26
    { src: 'img2/project29.jpg', title: 'Large Scale Environment' }, // 27
    
    { src: 'img2/project30.jpg', title: 'Knight Concept' }, // 28
    { src: 'img2/project31.jpg', title: 'Scifi Warrior' }, // 29
    { src: 'img2/project32.jpg', title: 'Soldier' }, // 30
    { src: 'img2/project33.jpg', title: 'Digital Sketch' } // 31
  ]

  // Columns definition mapping indices of galleryItems
  const columns = [
    [0, 1, 2, 3],       // Column 1
    [4, 5, 6, 7],       // Column 2
    [8, 9, 10, 11],     // Column 3
    [12, 13, 14, 15],   // Column 4
    [16, 17, 18, 19],   // Column 5
    [20, 21, 22, 23],   // Column 6
    [24, 25, 26, 27],   // Column 7
    [28, 29, 30, 31]    // Column 8
  ]

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === galleryItems.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="work-page">
      <h1 className="lg-heading">
        More <span className="text-secondary">Work</span>
      </h1>
      <h2 className="sm-heading">A collection of drawings, 3D assets, and paintings</h2>

      <div className="gallery-row">
        {columns.map((colIndices, colIdx) => (
          <div key={colIdx} className="gallery-column">
            {colIndices.map((itemIdx) => {
              const item = galleryItems[itemIdx]
              return (
                <div 
                  key={itemIdx} 
                  className="gallery-item"
                  onClick={() => openLightbox(itemIdx)}
                >
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <div className="gallery-overlay">
                    <i className="fas fa-eye"></i>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        images={galleryItems}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default Teste
