import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './App.css'

import NavBar from './components/NavBar/NavBar';
import Home from './components/Home/Home';
import List_of_Location from './components/List_of_Location/List_of_Location';
import List_of_Events from './components/List_of_Events/List_of_Events';
import Map from './components/Map/Map';
import Login from './components/Login/Login';
import SignUp from './components/Signup/SignUp';
import UsersManager from './components/UsersManager/UsersManager';
import EventsManager from './components/EventsManager/EventsManager';
import Favourite from './components/Favourite/Favourite';
import Profile from './components/Profile/Profile';

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
      {location.pathname !== '/login' && location.pathname !== '/signup' && <NavBar />}
      <main className="flex flex-col items-center justify-center h-screen w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list_of_location" element={<List_of_Location />} />
          <Route path="/list_of_events" element={<List_of_Events />} />
          <Route path="/map" element={<Map />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/usersmanager" element={<UsersManager />} />
          <Route path="/eventsmanager" element={<EventsManager />} />

          <Route path='/profile' element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;