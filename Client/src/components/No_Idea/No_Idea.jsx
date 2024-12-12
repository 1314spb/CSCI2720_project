import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NoIdea = () => {
    const [venues, setVenues] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedVenue, setSelectedVenue] = useState(null);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('/venues.xml');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                const venuesList = Array.from(xml.getElementsByTagName('venue')).map(venue => {
                    const nameEnglish = venue.getElementsByTagName('venuee')[0]?.textContent || 'N/A';
                    return {
                        id: venue.getAttribute('id'),
                        nameEnglish,
                        venuelatitude: parseFloat(venue.getElementsByTagName('latitude')[0]?.textContent) || 0,
                        venuelongitude: parseFloat(venue.getElementsByTagName('longitude')[0]?.textContent) || 0
                    };
                });
                setVenues(venuesList);
            } catch (error) {
                console.error("Loading venues.xml error:", error);
            }
        };
        fetchVenues();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/events.xml');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                const eventList = Array.from(xml.getElementsByTagName('event')).map(event => ({
                    id: event.getAttribute('id'),
                    venueid: event.getElementsByTagName('venueid')[0]?.textContent || 'N/A',
                    title: event.getElementsByTagName('titlee')[0]?.textContent || 'N/A',
                    date: event.getElementsByTagName('predateE')[0]?.textContent || 'N/A',
                    duration: event.getElementsByTagName('progtimee')[0]?.textContent || 'N/A',
                    agelimit: event.getElementsByTagName('agelimite')[0]?.textContent || 'N/A',
                    price: event.getElementsByTagName('pricee')[0]?.textContent || 'N/A',
                    description: event.getElementsByTagName('desce')[0]?.textContent || 'N/A'
                }));
                setEvents(eventList);
            } catch (error) {
                console.error("Loading events.xml error:", error);
            }
        };
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