import React, { useEffect, useState, useMemo } from 'react';
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import {
    Card,
    Typography,
    Button,
    CardBody,
    CardFooter,
} from "@material-tailwind/react";
import axios from 'axios';
import { Link } from 'react-router-dom';

const TABLE_HEAD = ["Venue", "Date", "Title", "Description", "Presenter","Price", "Like"];

const ListOfEvents = () => {
    const [venues, setVenues] = useState([]);
    const [events, setEvents] = useState([]);
    const [rowsLimit] = useState(10);
    const [rowsToShow, setRowsToShow] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState({ column: 'like', direction: 'asc' });
    const [likedEvents, setLikedEvents] = useState(new Set());
    const [selectedDescription, setSelectedDescription] = useState(null); // Track selected description

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsResponse = await axios.get('http://localhost:3000/api/user/event', {
                    withCredentials: true,
                });
                const allEvents = eventsResponse.data;
                const eventList = allEvents.map(event => ({
                    id: event.eventId,
                    title: event.title || 'N/A',
                    venueId: event.locId || 'N/A',
                    date: event.datetime || 'N/A',
                    price: event.price || 'N/A',
                    description: event.description || 'N/A',
                    presenter: event.presenter || 'N/A'
                }));
                setEvents(eventList);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        
        fetchEvents();
    }, []);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const locationsResponse = await axios.get('http://localhost:3000/api/user/location', {
                    withCredentials: true,
                });

                const venueList = locationsResponse.data.map(venue => ({
                    id: venue.locId,
                    venuelatitude: venue.lat,
                    venuelongitude: venue.long,
                }));
                setVenues(venueList);
            } catch (error) {
                console.error('Error fetching locations or user favorites:', error);
            }
        };
        
        fetchVenues();
    }, []);

    useEffect(() => {
        const startIndex = currentPage * rowsLimit;
        const filteredEvents = events.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase())
        );

        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const isALiked = likedEvents.has(a.id) ? 1 : 0;
            const isBLiked = likedEvents.has(b.id) ? 1 : 0;

            if (sortOrder.column === 'like') {
                return sortOrder.direction === 'asc' ? isBLiked - isALiked : isALiked - isBLiked;
            }

            const aValue = sortOrder.column === 'price' ? parseFloat(a.price) || 0 : a[sortOrder.column];
            const bValue = sortOrder.column === 'price' ? parseFloat(b.price) || 0 : b[sortOrder.column];

            return sortOrder.direction === 'asc' ? aValue - bValue : bValue - aValue;
        });

        setRowsToShow(sortedEvents.slice(startIndex, startIndex + rowsLimit));
    }, [events, currentPage, rowsLimit, search, sortOrder, likedEvents]);

    const totalFilteredPages = useMemo(() => {
        const filteredEvents = events.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase())
        );
        return Math.ceil(filteredEvents.length / rowsLimit);
    }, [events, search, rowsLimit]);

    const nextPage = () => {
        if (currentPage < totalFilteredPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setCurrentPage(0);
    };

    const handleSort = () => {
        const newDirection = sortOrder.direction === 'asc' ? 'desc' : 'asc';
        setSortOrder({ column: 'like', direction: newDirection });
        setCurrentPage(0);
    };

    const toggleLike = (id) => {
        setLikedEvents((prev) => {
            const newLikedEvents = new Set(prev);
            if (newLikedEvents.has(id)) {
                newLikedEvents.delete(id);
            } else {
                newLikedEvents.add(id);
            }
            return newLikedEvents;
        });
    };

    const openDescriptionModal = (description) => {
        setSelectedDescription(description);
    };

    const closeDescriptionModal = () => {
        setSelectedDescription(null);
    };

    return (
        <div className="min-h-screen h-full flex flex-col p-4 md:p-6">
            <div className="flex-grow">
                <Card className="h-full w-full bg-white shadow-lg">
                    <CardBody className="overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={search}
                                onChange={handleSearch}
                                className="border border-gray-400 rounded-md p-2 w-full md:w-60 text-gray-900"
                            />
                            <div className="flex items-center space-x-2 ml-4">
                                <Button
                                    className='text-gray-900'
                                    onClick={previousPage}
                                    disabled={currentPage === 0}
                                    variant="outlined"
                                    aria-label="Previous page"
                                >
                                    Previous
                                </Button>
                                <Button
                                    className='text-gray-900'
                                    onClick={nextPage}
                                    disabled={currentPage === totalFilteredPages - 1}
                                    variant="outlined"
                                    aria-label="Next page"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                        <table className="min-w-full table-fixed text-left w-full">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head, index) => (
                                        <th className="border-b border-gray-200 bg-gray-50 p-4" key={index}>
                                            {head === "Like" ? (
                                                <Button
                                                    onClick={handleSort}
                                                    className="flex items-center gap-2 text-gray-900"
                                                    aria-label={`Sort by ${head.toLowerCase()}`}
                                                >
                                                    {head}
                                                    <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Typography variant="small" color="gray" className="font-normal">{head}</Typography>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rowsToShow.length === 0 ? (
                                    <tr>
                                        <td className="p-4 text-center" colSpan={TABLE_HEAD.length}>
                                            <Typography color="gray" className="font-normal">
                                                No events found.
                                            </Typography>
                                        </td>
                                    </tr>
                                ) : (
                                    rowsToShow.map(({ id, date, venueId, title, description, price, presenter }, index) => {
                                        const isLast = index === rowsToShow.length - 1;
                                        const classes = isLast ? "p-4" : "p-4 border-b border-gray-200";
                                        const isLiked = likedEvents.has(id);

                                        const venue = venues.find(v => v.id === venueId);
                                        const venuelatitude = venue ? venue.venuelatitude : null;
                                        const venuelongitude = venue ? venue.venuelongitude : null;

                                        return (
                                            <tr key={id} className="hover:bg-gray-200">
                                                <td className={`${classes} break-words whitespace-normal`}>
                                                    <Link to={`/map?lat=${venuelatitude}&lng=${venuelongitude}&status=true`} className="inline-block bg-slate-200 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-300 transition-colors duration-200">
                                                        <Typography variant="small" color="gray" className="font-normal">{venueId}</Typography>
                                                    </Link>
                                                </td>
                                                <td className={`${classes} break-words whitespace-normal`}>
                                                    <Typography variant="small" color="gray-900" className="font-normal">{date}</Typography>
                                                </td>
                                                <td className={`${classes} break-words whitespace-normal`}>
                                                    <Typography variant="small" color="gray-900" className="font-normal">{title}</Typography>
                                                </td>
                                                <td className={`${classes} break-words whitespace-normal`}>
                                                    {description !== 'N/A' ? (
                                                        <Button
                                                            onClick={() => openDescriptionModal(description)}
                                                            className="mt-1 text-blue-600"
                                                        >
                                                            More
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="small" color="gray-900" className="font-normal">N/A</Typography>
                                                    )}
                                                </td>
                                                <td className={`${classes} break-words whitespace-normal`}>
                                                    <Typography variant="small" color="gray-900" className="font-normal">{presenter}</Typography>
                                                </td>
                                                <td className={`${classes} break-words whitespace-normal`}>
                                                    <Typography variant="small" color="gray-900" className="font-normal">{price}</Typography>
                                                </td>
                                                <td className={classes}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleLike(id)}
                                                        className={`border rounded-lg text-sm p-2.5 inline-flex items-center me-2 ${isLiked ? 'bg-blue-700 text-white' : 'text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white'} focus:ring-4 focus:outline-none focus:ring-blue-300`}
                                                    >
                                                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                                        <path d="M3 7H1a1 1 0 0 0-1 1v8a2 2 0 0 0 4 0V8a1 1 0 0 0-1-1Zm12.954 0H12l1.558-4.5a1.778 1.778 0 0 0-3.331-1.06A24.859 24.859 0 0 1 6 6.8v9.586h.114C8.223 16.969 11.015 18 13.6 18c1.4 0 1.592-.526 1.88-1.317l2.354-7A2 2 0 0 0 15.954 7Z" />
                                                        </svg>
                                                        <span className="sr-only">Like</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardBody>
                    <CardFooter className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 p-4 bg-gray-50">
                        <Typography variant="small" color="gray" className="font-normal select-none">
                            Page {currentPage + 1} of {totalFilteredPages}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal select-none">
                            Last updated time: {}
                        </Typography>
                    </CardFooter>
                </Card>
            </div>
            
            {selectedDescription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <Typography variant="h6" color="gray-900">Event Description</Typography>
                        <Typography variant="small" color="gray-900" className="mt-2">{selectedDescription}</Typography>
                        <Button onClick={closeDescriptionModal} className="mt-4 bg-blue-600 text-white">
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListOfEvents;