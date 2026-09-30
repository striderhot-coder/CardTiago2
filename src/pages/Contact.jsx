import React from 'react'

const Contact = () => {
  return (
    <div className="contact-page">
      <h1 className="lg-heading">
        Contact <span className="text-secondary">Me</span>
      </h1>
      <h2 className="sm-heading">This is how you can reach me...</h2>
      
      <div className="contact-boxes">
        <div className="contact-box">
          <span className="contact-label">Email</span>
          <a href="mailto:tiagomanuelsoaresdossantos@gmail.com" className="contact-value">
            tiagomanuelsoaresdossantos@gmail.com
          </a>
        </div>
        
        <div className="contact-box">
          <span className="contact-label">Phone</span>
          <a href="tel:+351910342543" className="contact-value">
            +351 910 342 543
          </a>
        </div>
      </div>
    </div>
  )
}

export default Contact
