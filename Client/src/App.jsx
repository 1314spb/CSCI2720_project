import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'

import NavBar from './components/NavBar';

import Home from './components/Home/Home';
import Map from './components/Map/Map';
import Login from './components/Login/Login';

function App() {

  return (
    <Router>
      <div className='w-full'>
        {location.pathname !== '/login' && <NavBar />}
        <main className="flex flex-col items-center justify-center h-screen w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/services" element={<Services />} /> */}
            {/* <Route path="/contact" element={<Contact />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;