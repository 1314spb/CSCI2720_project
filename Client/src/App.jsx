import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import NavBar from './components/NavBar';

import Home from './components/Home/Home';
import List_of_Location from './components/List_of_Location/List_of_Location';
import List_of_Events from './components/List_of_Events/List_of_Events';
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
            <Route path="/list_of_location" element={<List_of_Location />} />
            <Route path="/list_of_events" element={<List_of_Events />} />
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

export default App
