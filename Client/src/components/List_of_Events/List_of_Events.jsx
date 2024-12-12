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

            return sortOrder.direction === 'asc' ? aValue > bValue ? 1 : -1 : aValue < bValue ? 1 : -1;
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
        <div className="min-h-screen h-full flex items-center bg-gray-100"> 
            <div className="w-full max-w-5xl px-4">
                <div className="flex space-x-5 mb-4">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={handleSearch}
                        className="border border-gray-400 rounded-md p-2 w-60 text-gray-900"  // Dark text
                    />
                </div>
                <Card className="h-full w-full bg-white shadow-lg">
                    <CardBody className="overflow-scroll px-0">
                        <table className="mt-4 w-full table-fixed text-left">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head) => (
                                        <th className="border-b border-gray-200 bg-gray-50 p-4" key={head}>
                                            <Button 
                                                onClick={() => handleSort(head.toLowerCase())} 
                                                className="flex items-center gap-2 text-gray-900" 
                                                aria-label={`Sort by ${head.toLowerCase()}`}
                                            >
                                                {head}
                                                <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                            </Button>
                                        </th>
                                    ))}
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
                                    const classes = isLast ? "p-4" : "p-4 border-b border-gray-200";
                                    return (
                                        <tr key={id}>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="gray-900" className="font-normal">{date}</Typography>
                                            </td>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="gray-900" className="font-normal">{venueId}</Typography>
                                            </td>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="gray-900" className="font-normal">{title}</Typography>
                                            </td>
                                            <td className={`${classes} break-words whitespace-normal`}>
                                                <Typography variant="small" color="gray-900" className="font-normal">{price}</Typography>
                                            </td>
                                            <td className={classes}>
                                                <Tooltip content="Add to Favourite">
                                                    <IconButton 
                                                        variant="text" 
                                                        aria-label="Add to favourite"
                                                    >
                                                        <PencilIcon className="h-4 w-4 text-gray-800" /> 
                                                    </IconButton>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                    <CardFooter className="flex items-center justify-between border-t border-gray-200 p-4 bg-gray-50"> 
                        <div className="flex items-center space-x-2">
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
                        <Typography variant="small" color="gray" className="font-normal select-none">
                            Page {currentPage + 1} of {totalFilteredPages}
                        </Typography>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ListOfEvents;