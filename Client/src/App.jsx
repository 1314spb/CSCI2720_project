import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useState } from 'react'
import './App.css'

import NavBar from './components/NavBar/NavBar';
import Home from './components/Home/Home';
import List_of_Location from './components/List_of_Location/List_of_Location';
import List_of_Events from './components/List_of_Events/List_of_Events';
import Map from './components/Map/Map';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import UsersManager from './components/UsersManager/UsersManager';
import Favourite from './components/Favourite/Favourite';


function App() {
  return (
    <Router>
      <Main />
    </Router>
  )
  }
function Main() {
  const location = useLocation();
  return ( 
      <div className='w-full'>
        {location.pathname !== '/login' && <NavBar />}
        <main className="flex flex-col items-center justify-center h-screen w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list_of_location" element={<List_of_Location />} />
            <Route path="/list_of_events" element={<List_of_Events />} />
            <Route path="/map" element={<Map />} />
            <Route path="/favourite" element={<Favourite />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usersmanager" element={<UsersManager />} />
          </Routes>
        </main>
      </div>
  );
}

export default App;