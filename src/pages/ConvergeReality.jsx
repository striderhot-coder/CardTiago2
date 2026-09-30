import React from 'react'

const ConvergeReality = () => {
  return (
    <div className="work-page">
      <h1 className="lg-heading">
        Book <span className="text-secondary">Begin</span>
      </h1>
      <h2 className="sm-heading">Converging Reality</h2>
      
      <div className="book-container">
        <iframe 
          src="convergereality.html" 
          title="Converging Reality Book Part 1" 
          className="book-iframe"
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default ConvergeReality
