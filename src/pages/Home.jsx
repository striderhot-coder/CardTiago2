import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { projectsData } from '../data/projectsData'
import {
  FaDownload,
  FaShoppingBag,
  FaPaintBrush,
  FaCode,
  FaDesktop,
  FaPaperPlane,
  FaQuoteLeft,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaBehance,
  FaEye,
  FaInfoCircle
} from 'react-icons/fa'

const Home = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Featured projects for the homepage gallery
  const featuredProjects = projectsData.slice(0, 8)

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? featuredProjects.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === featuredProjects.length - 1 ? 0 : prevIndex + 1))
  }

  const capabilities = [
    {
      title: 'Illustration',
      subtitle: 'Get awesome illustration services from etsy.com/shop/DigityOne',
      icon: <FaPaintBrush />
    },
    {
      title: 'Graphics',
      subtitle: 'Get awesome design services from etsy.com/shop/DigityOne',
      icon: <FaDesktop />
    },
    {
      title: 'Drawing',
      subtitle: 'Get awesome drawing services from etsy.com/shop/DigityOne',
      icon: <FaPaintBrush />
    },
    {
      title: 'Front End Developer',
      subtitle: 'Interactive web design and front-end development',
      icon: <FaCode />
    },
    {
      title: 'Graphic Design',
      subtitle: 'Branding, publication, logo identity & print design',
      icon: <FaDesktop />
    },
    {
      title: 'User Interaction (UX/UI)',
      subtitle: 'User interface mockups & mobile app interaction design',
      icon: <FaCode />
    }
  ]

  return (
    <div className="home-page-tiago">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-greeting">Hello, I am</span>
          <h1 className="hero-title">
            Tiago <span className="text-accent">Santos</span>
          </h1>
          <h2 className="hero-subtitle">
            A young <span className="text-highlight">Artist & Designer</span> with a passion for digital art creation.
          </h2>
          <p className="hero-bio-short">
            Multidisciplinary artist from Braga, Portugal, specializing in digital illustration, graphic design, 3D visualization, and front-end development.
          </p>

          <div className="hero-actions">
            <a href="CV_TiagoSantos.pdf" download className="btn-primary">
              <FaDownload /> Download CV
            </a>
            <a
              href="https://www.etsy.com/shop/DigityOne"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <FaShoppingBag /> Visit Etsy Shop
            </a>
            <Link to="/work" className="btn-outline">
              Explore Portfolio
            </Link>
          </div>

          <div className="social-links-bar">
            <span className="social-label">Find Me On:</span>
            <a href="https://www.behance.net/tiagosantos879" target="_blank" rel="noopener noreferrer" title="Behance">
              <FaBehance />
            </a>
            <a href="https://github.com/shouzo1" target="_blank" rel="noopener noreferrer" title="GitHub">
              <FaGithub />
            </a>
            <a href="https://www.linkedin.com/in/tiago-santos-445876166/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://www.instagram.com/shouzo_tiago/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com/TiagoSoaresdos" target="_blank" rel="noopener noreferrer" title="Twitter">
              <FaTwitter />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61556461990404" target="_blank" rel="noopener noreferrer" title="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.youtube.com/@Shouzo-euw" target="_blank" rel="noopener noreferrer" title="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img src="acd.png" alt="Beauty Portrait - Tiago Santos" className="hero-featured-art" />
          <div className="hero-art-badge" onClick={() => openLightbox(0)}>
            <FaInfoCircle className="badge-icon" />
            <div>
              <strong>Beauty Portrait (2016)</strong>
              <small>Click to read artwork story & description</small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED PORTFOLIO GALLERY
          ========================================================================= */}
      <section className="section-container portfolio-section">
        <div className="section-header">
          <h2 className="section-title">
            Featured <span className="text-accent">Portfolio</span>
          </h2>
          <p className="section-subtitle">
            Click any artwork to open the description modal and view details.
          </p>
        </div>

        <div className="projects-grid">
          {featuredProjects.map((project, index) => (
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
                <FaEye /> {project.title} — <span className="view-desc">Description</span>
              </div>
            </div>
          ))}
        </div>

        <div className="view-more-container">
          <Link to="/work" className="btn-secondary">
            View Full Work Gallery ({projectsData.length} Projects)
          </Link>
        </div>
      </section>

      {/* =========================================================================
          ABOUT ME & STORY
          ========================================================================= */}
      <section className="section-container about-section-home">
        <div className="about-grid">
          <div className="about-text">
            <h2 className="section-title">
              About <span className="text-accent">Me</span>
            </h2>
            <p className="about-paragraph">
              My name is <strong>Tiago Santos</strong> and I was born in Braga, Portugal. I developed a passion for graphic design and fine arts, desiring to reflect the beauty of Portugal's people and culture through my artwork.
            </p>
            <p className="about-paragraph">
              From the beginning of my journey as an artistic designer, I have created artwork that gave rise to my passion for digital work. I hold a Master's degree in Technology and Digital Art from the University of Minho in Guimarães/Braga.
            </p>
            <p className="about-paragraph">
              My professional expertise encompasses animation, illustration, and drawing, alongside extensive experience in typography, photo manipulation, photo retouching, and video editing.
            </p>
          </div>

          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <h3>What Clients Say</h3>
            <p className="testimonial-text">
              "I had a photo of my cat which I loved so much. He was picked from the street barely walking. After a short time of caring he was able to turn into this beautiful creature who I so much cared about. Tiago was able to turn his traits into an astonishing illustration."
            </p>
            <span className="testimonial-author">- Sara Maria (Math & Science Teacher)</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MY CAPABILITIES (SERVICES)
          ========================================================================= */}
      <section className="section-container capabilities-section">
        <div className="section-header">
          <h2 className="section-title">
            My <span className="text-accent">Capabilities</span>
          </h2>
          <p className="section-subtitle">Services and creative digital solutions</p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="capability-card">
              <div className="cap-icon-box">{cap.icon}</div>
              <h3 className="cap-title">{cap.title}</h3>
              <p className="cap-subtitle">{cap.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CONTACT & REQUEST FORM SECTION
          ========================================================================= */}
      <section className="section-container contact-section-home">
        <div className="contact-grid">
          <div className="contact-info-card">
            <h2 className="section-title">
              Let's Make Something <span className="text-accent">Great Together</span>
            </h2>
            <p className="contact-lead">
              Turn your idea into Art. Write your request in the form below or reach out directly!
            </p>

            <div className="contact-details">
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <span>Braga, Portugal</span>
              </div>
              <div className="detail-item">
                <FaPhoneAlt className="detail-icon" />
                <span>+351 910342543</span>
              </div>
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <span>tiagomanuelsoaresdossantos@gmail.com</span>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Your Email Address" required />
            </div>
            <div className="form-group">
              <label>Budget</label>
              <input type="text" placeholder="Estimated Budget (e.g. €500)" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows="4" placeholder="Tell me about your project..." required></textarea>
            </div>
            <button type="submit" className="btn-primary submit-btn">
              <FaPaperPlane /> Send Request
            </button>
          </form>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        images={featuredProjects}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}

export default Home
