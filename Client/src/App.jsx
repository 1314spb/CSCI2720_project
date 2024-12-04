import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'

import NavBar from './components/NavBar';

import Home from './components/Home/Home';

function App() {

  return (
    <Router>
      <div className='w-full'>
        <NavBar />
        <main className="flex flex-col items-center justify-center h-screen w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
