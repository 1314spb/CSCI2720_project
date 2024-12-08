import React, { useEffect, useState, useMemo } from 'react';
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import {
  Card,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";

const TABLE_HEAD = ["Date", "Venue", "Title", "Price", "Add to Favourite"];

const ListOfEvents = () => {
    const [events, setEvents] = useState([]);
    const [rowsLimit] = useState(10);
    const [rowsToShow, setRowsToShow] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState({ column: 'date', direction: 'asc' });
    const [selectedArea, setSelectedArea] = useState('default');

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
                    title: event.getElementsByTagName('titlee')[0]?.textContent || 'N/A',
                    venueId: event.getElementsByTagName('venueid')[0]?.textContent || 'N/A',
                    date: event.getElementsByTagName('predateE')[0]?.textContent || 'N/A',
                    price: event.getElementsByTagName('pricee')[0]?.textContent || 'N/A'
                }));
                setEvents(eventList);
            } catch (error) {
                console.error("Loading events.xml error:", error);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        const startIndex = currentPage * rowsLimit;
        const filteredEvents = events.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase()) &&
            (selectedArea === 'default' || item.venueId === selectedArea)
        );

        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const aValue = sortOrder.column === 'price' ? parseFloat(a.price) || 0 : a[sortOrder.column];
            const bValue = sortOrder.column === 'price' ? parseFloat(b.price) || 0 : b[sortOrder.column];

            if (sortOrder.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setRowsToShow(sortedEvents.slice(startIndex, startIndex + rowsLimit));
    }, [events, currentPage, rowsLimit, search, sortOrder, selectedArea]);

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

    const handleSort = (column) => {
        const newDirection = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc';
        setSortOrder({ column, direction: newDirection });
        setCurrentPage(0);
    };

    return (
        <div className="min-h-screen h-full flex items-center">
            <div className="w-full max-w-5xl px-2">
                <div className="flex space-x-5 mb-4">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={handleSearch}
                        className="border border-gray-300 rounded-md p-2 w-60"
                    />
                </div>
                <Card className="h-full w-full">
                    <CardBody className="overflow-scroll px-0">
                        <table className="mt-4 w-full table-fixed text-left">
                            <thead>
                                <tr>
                                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                        <Button 
                                            onClick={() => handleSort('date')} 
                                            className="flex items-center gap-2" 
                                            aria-label="Sort by date"
                                        >
                                            Date
                                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                        </Button>
                                    </th>
                                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                        <Button 
                                            onClick={() => handleSort('venueId')} 
                                            className="flex items-center gap-2" 
                                            aria-label="Sort by venue"
                                        >
                                            Venue
                                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                        </Button>
                                    </th>
                                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                        <Button 
                                            onClick={() => handleSort('title')} 
                                            className="flex items-center gap-2" 
                                            aria-label="Sort by title"
                                        >
                                            Title
                                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                        </Button>
                                    </th>
                                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                        <Button 
                                            onClick={() => handleSort('price')} 
                                            className="flex items-center gap-2" 
                                            aria-label="Sort by price"
                                        >
                                            Price
                                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                        </Button>
                                    </th>
                                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Add to Favourite</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsToShow.length === 0 && (
                                    <tr>
                                        <td className="p-4 text-center" colSpan={TABLE_HEAD.length}>
                                            <Typography color="gray" className="font-normal">
                                                No events found.
                                            </Typography>
                                        </td>
                                    </tr>
                                )}
                                {rowsToShow.map(({ id, date, venueId, title, price }, index) => {
                                    const isLast = index === rowsToShow.length - 1;
                                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                                    return (
                                        <tr key={id}>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">{date}</Typography>
                                            </td>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">{venueId}</Typography>
                                            </td>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">{title}</Typography>
                                            </td>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">{price}</Typography>
                                            </td>
                                            <td className={classes}>
                                                <Tooltip content="Add to Favourite">
                                                    <IconButton 
                                                        variant="text" 
                                                        aria-label="Add to favourite"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </IconButton>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                    <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                className='text-gray-500'
                                onClick={previousPage}
                                disabled={currentPage === 0}
                                variant="outlined"
                                aria-label="Previous page"
                            >
                                Previous
                            </Button>
                            <Button
                                className='text-gray-500'
                                onClick={nextPage}
                                disabled={currentPage === totalFilteredPages - 1}
                                variant="outlined"
                                aria-label="Next page"
                            >
                                Next
                            </Button>
                        </div>
                        <Typography variant="small" color="blue-gray" className="font-normal select-none">
                            Page {currentPage + 1} of {totalFilteredPages}
                        </Typography>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ListOfEvents;