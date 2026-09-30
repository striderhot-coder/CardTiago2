import React from 'react'
import { FaStore, FaShoppingBag, FaExternalLinkAlt, FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaBehance } from 'react-icons/fa'

// =========================================================================
// DIGITYONE SHOP CONFIGURATION
// To change your shop details, simply update the 'shopUrl' and 'logoUrl' below!
// =========================================================================
const SHOP_CONFIG = {
  title: 'Digityone Shop',
  subtitle: 'Check out my official digital shop & products',
  shopUrl: 'https://digityone.com', // <-- REPLACE WITH YOUR SHOP URL
  logoUrl: 'C:\Users\mn_st\Desktop\TiagoSantos-main\TiagoSantos\TiagoSantos\public\img\digityonelogo.jpg',                       // <-- REPLACE WITH YOUR LOGO IMAGE URL / PATH (e.g. '/img/logo.png' or 'https://...')
  badgeText: 'Visit Shop'
}

const Home = () => {
  return (
    <div className="home-page">
      <h1 className="lg-heading">
        Tiago <span className="text-secondary">Santos</span>
      </h1>
      <h2 className="sm-heading">
        Designer, Programmer, UX/UI Designer & Web Designer
      </h2>

      {/* DIGITYONE SHOP ICON & BADGE CARD */}
      <div className="shop-banner-container">
        <a
          href={SHOP_CONFIG.shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shop-card-link"
          title={SHOP_CONFIG.title}
        >
          <div className="shop-icon-wrapper">
            {SHOP_CONFIG.logoUrl ? (
              <img
                src={SHOP_CONFIG.logoUrl}
                alt={SHOP_CONFIG.title}
                className="shop-logo-img"
                onError={(e) => {
                  // Fallback if logo URL image fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className="shop-fallback-icon"
              style={{ display: SHOP_CONFIG.logoUrl ? 'none' : 'flex' }}
            >
              <FaShoppingBag />
            </div>
          </div>
          <div className="shop-text-content">
            <span className="shop-title-badge">
              <FaStore className="badge-store-icon" /> {SHOP_CONFIG.title}
            </span>
            <span className="shop-subtitle">{SHOP_CONFIG.subtitle}</span>
          </div>
          <div className="shop-action-btn">
            {SHOP_CONFIG.badgeText} <FaExternalLinkAlt className="action-ext-icon" />
          </div>
        </a>
      </div>

      {/* Social Media Icons */}
      <div className="social-icons">
        <a
          href="https://twitter.com/TiagoSoaresdos"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter"
        >
          <FaTwitter />
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61556461990404"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.linkedin.com/in/tiago-santos-445876166/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://github.com/shouzo1"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.instagram.com/shouzo_tiago/"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.youtube.com/@Shouzo-euw"
          target="_blank"
          rel="noopener noreferrer"
          title="YouTube"
        >
          <FaYoutube />
        </a>
        <a
          href="https://www.behance.net/tiagosantos879"
          target="_blank"
          rel="noopener noreferrer"
          title="Behance"
        >
          <FaBehance />
        </a>
      </div>
    </div>
  )
}

export default Home
