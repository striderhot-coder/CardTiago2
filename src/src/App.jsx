import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Work from './pages/Work'
import Teste from './pages/Teste'
import Surreal from './pages/Surreal'
import Contact from './pages/Contact'
import ConvergeReality from './pages/ConvergeReality'
import Videos from './pages/Videos'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/work" element={<Work />} />
            <Route path="/more-work" element={<Teste />} />
            <Route path="/surreal" element={<Surreal />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book" element={<ConvergeReality />} />
            <Route path="/videos" element={<Videos />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
