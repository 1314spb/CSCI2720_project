import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NoIdea = () => {
    const [venues, setVenues] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedVenue, setSelectedVenue] = useState(null);

    const fetchVenues = async () => {
        try {
          // Fetch all locations
          const locationsResponse = await axios.get('http://localhost:3000/api/user/location', {
            withCredentials: true,
          });
          
          console.log("LocationResponse: ", locationsResponse.data);
          const venueList = locationsResponse.data.map((venue) => ({
            id: venue.locId,
            nameEnglish: venue.name,
            venuelatitude: venue.lat,
            venuelongitude: venue.long,
    
          }));
          setVenues(venueList); 
        } catch (error) {
          console.error('Error fetching locations or user favorites:', error);
        }
      };
    useEffect(() => {
        fetchVenues();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
        try {
        const eventsResponse = await axios.get('http://localhost:3000/api/user/event', {
            withCredentials: true,
          });
        
            console.log(eventsResponse.data);
            const allEvents = eventsResponse.data;
            const eventList = allEvents.map(event => ({
                    id: event.eventId,
                    title: event.title || 'N/A',
                    venueid: event.locId || 'N/A',
                    date: event.datetime || 'N/A',
                    price: event.price|| 'N/A',
                    description: event.description|| 'N/A',
                    duration: event.duration|| 'N/A',
                    agelimit: event.agelimit|| 'N/A',
            }))
            setEvents(eventList);
        }catch(error){
            console.error('Error fetching events:', error);
        }
        }
        
        fetchEvents();
    }, []);


    const getRandomEvent = () => {
        if (events.length > 0 && venues.length > 0) {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            setSelectedEvent(randomEvent);
            const venue = venues.find(v => v.id === randomEvent.venueid);
            setSelectedVenue(venue);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
            <button 
                className="w-full py-2 mb-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
                onClick={getRandomEvent}
            >
                Get Random Event
            </button>
            {selectedEvent && selectedVenue ? (
                <div className="bg-white p-4 rounded-lg shadow text-left">
                    <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
                    <p className="mt-2"><strong>Date:</strong> {selectedEvent.date}</p>
                    <p><strong>Duration:</strong> {selectedEvent.duration}</p>
                    <p><strong>Age Limit:</strong> {selectedEvent.agelimit}</p>
                    <p><strong>Price:</strong> {selectedEvent.price}</p>
                    <p><strong>Description:</strong> {selectedEvent.description}</p>
                    <Link 
                        to={`/map?lat=${selectedVenue.venuelatitude}&lng=${selectedVenue.venuelongitude}&status=true`} 
                        className="text-blue-600 hover:underline"
                    >
                        <h3 className="mt-4 font-medium">Venue: {selectedVenue.nameEnglish}</h3>
                    </Link>
                </div>
            ) : (
                <p className="text-gray-600 text-left"></p>
            )}
        </div>
    );
};

export default NoIdea;