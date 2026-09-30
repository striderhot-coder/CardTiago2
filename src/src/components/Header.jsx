import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  // Close mobile drawer when screen resizing past mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        Tiago Santos
      </Link>

      <button 
        className={`burger-btn ${menuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <li>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About Me
          </NavLink>
        </li>
        <li>
          <NavLink to="/work" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            My Work
          </NavLink>
        </li>
        <li>
          <NavLink to="/more-work" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            More Work
          </NavLink>
        </li>
        <li>
          <NavLink to="/surreal" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Surreal
          </NavLink>
        </li>
        <li>
          <NavLink to="/book" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Book Part 1
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Contact
          </NavLink>
        </li>
        <li>
            <NavLink
            to="/videos"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    Videos
  </NavLink>
</li>
         

      </ul>
    </header>
  )
}

export default Header
