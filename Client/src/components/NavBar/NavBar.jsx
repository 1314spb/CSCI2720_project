import React, { useState, useEffect, useRef } from 'react';
import fetchUserData from '../../../fetchUserData';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import apiCsrf from '../../../apiCsrf';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await apiCsrf.post(
        '/api/auth/logout', {},
        { withCredentials: true }
      );
      console.log('User log out successfully');
      Cookies.remove('username');
      setUser(null);
      setError('');
      navigate('/login');
    } catch (error) {
      console.log('Error during logout', error);
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
    if (isMenuOpen && dropdownRef.current && dropdownRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    fetchUserData(setUser, setError);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (error) {
    return <div>{error}</div>
  }
  if (!user) {
    return <div>Loading...</div>
  }
  const userInitial = user.user.username ? user.user.username.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 w-full fixed z-50 top-0 left-0 right-0 opacity-85">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white select-none">Group 7</span>
        </a>

        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center justify-center bg-indigo-700 text-white rounded-full p-0 w-9 h-9 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            {userInitial}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 z-50 mt-72 w-56 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white select-none">{user.user.username}</span>
                <span className="block text-sm text-gray-500 truncate dark:text-gray-400 select-none">{user.user.email}</span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                {user.user?.admin && (
                  <>
                    <li>
                      <a href="/usersmanager" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">User Manager</a>
                    </li>
                    <li>
                      <a href="/eventsmanager" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Event Manager</a>
                    </li>
                  </>
                )}
                <li>
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Profile</a>
                </li>
                <li>
                  <a href="#"
                    onClick={() => { handleLogout() }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          )}

          <button
            data-collapse-toggle="navbar-user"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            onClick={toggleMenu}
            aria-controls="navbar-user"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        <div className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isMenuOpen ? 'block' : 'hidden'}`} id="navbar-user"> {/* 控制显示 */}
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <a href="/" className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Home</a>
            </li>
            <li>
              <a href="/list_of_location" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Location List</a>
            </li>
            <li>
              <a href="/list_of_events" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Event List</a>
            </li>
            <li>
              <a href="/map" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Map</a>
            </li>
            <li>
              <a href="/favourite" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Favourite list</a>
            </li>
            <li>
              <a href="/no_idea" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">No idea?</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;