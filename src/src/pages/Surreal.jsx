import React, { useState } from 'react'
import Lightbox from '../components/Lightbox'

const Surreal = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Flat array of all Surreal images (22.png is skipped as it does not exist)
  const galleryItems = [
    { src: 'Surreal/1.png', title: 'Surreal Scene 1' },     // 0
    { src: 'Surreal/2.png', title: 'Surreal Scene 2' },     // 1
    { src: 'Surreal/3.png', title: 'Surreal Scene 3' },     // 2
    { src: 'Surreal/4.png', title: 'Surreal Scene 4' },     // 3
    
    { src: 'Surreal/5.png', title: 'Surreal Scene 5' },     // 4
    { src: 'Surreal/6.png', title: 'Surreal Scene 6' },     // 5
    { src: 'Surreal/7.png', title: 'Surreal Scene 7' },     // 6
    { src: 'Surreal/8.png', title: 'Surreal Scene 8' },     // 7
    
    { src: 'Surreal/9.png', title: 'Surreal Scene 9' },     // 8
    { src: 'Surreal/10.png', title: 'Surreal Scene 10' },   // 9
    { src: 'Surreal/11.png', title: 'Surreal Scene 11' },   // 10
    { src: 'Surreal/12.png', title: 'Surreal Scene 12' },   // 11
    
    { src: 'Surreal/13.png', title: 'Surreal Scene 13' },   // 12
    { src: 'Surreal/14.png', title: 'Surreal Scene 14' },   // 13
    { src: 'Surreal/15.png', title: 'Surreal Scene 15' },   // 14
    { src: 'Surreal/16.png', title: 'Surreal Scene 16' },   // 15
    
    { src: 'Surreal/17.png', title: 'Surreal Scene 17' },   // 16
    { src: 'Surreal/18.png', title: 'Surreal Scene 18' },   // 17
    { src: 'Surreal/19.png', title: 'Surreal Scene 19' },   // 18
    { src: 'Surreal/20.png', title: 'Surreal Scene 20' },   // 19
    
    { src: 'Surreal/21.png', title: 'Surreal Scene 21' },   // 20
    { src: 'Surreal/23.png', title: 'Surreal Scene 23' },   // 21 (22 skipped)
    { src: 'Surreal/24.png', title: 'Surreal Scene 24' },   // 22
    { src: 'Surreal/25.png', title: 'Surreal Scene 25' },   // 23
    
    { src: 'Surreal/26.png', title: 'Surreal Scene 26' },   // 24
    { src: 'Surreal/27.png', title: 'Surreal Scene 27' },   // 25
    { src: 'Surreal/28.png', title: 'Surreal Scene 28' },   // 26
    { src: 'Surreal/29.png', title: 'Surreal Scene 29' },   // 27
    
    { src: 'Surreal/30.png', title: 'Surreal Scene 30' },   // 28
    { src: 'Surreal/31.png', title: 'Surreal Scene 31' },   // 29
    { src: 'Surreal/32.png', title: 'Surreal Scene 32' }    // 30
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
    [28, 29, 30]        // Column 8 (only has 3 items)
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
        Surreal <span className="text-secondary">Art</span>
      </h1>
      <h2 className="sm-heading">A gallery of surreal concept art and digital experiments</h2>

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

export default Surreal
