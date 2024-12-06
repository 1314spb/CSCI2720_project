import React, { useEffect, useState, useMemo } from 'react';

const ListOfEvents = () => {
    const [events, setEvents] = useState([]);
    const [rowsLimit] = useState(10);
    const [rowsToShow, setRowsToShow] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
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
                    venueid: event.getElementsByTagName('venueid')[0]?.textContent || 'N/A',
                    date: event.getElementsByTagName('predateE')[0]?.textContent || 'N/A',
                    price: event.getElementsByTagName('pricee')[0]?.textContent || 'N/A'
                }));
                setEvents(eventList); // Update the state
            } catch (error) {
                console.error("Loading events.xml error:", error);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        const startIndex = currentPage * rowsLimit;
        const filteredEvent = events.filter(item => 
            item.title.toLowerCase().includes(search.toLowerCase()) &&
            (selectedArea === 'default' || item.venueid === selectedArea)
        );

        const sortedEvent = [...filteredEvent].sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            if (sortOrder === 'asc') {
                return priceA - priceB;
            } else if (sortOrder === 'desc') {
                return priceB - priceA;
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        setRowsToShow(sortedEvent.slice(startIndex, startIndex + rowsLimit));
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

    return (
        <div className="min-h-screen h-full flex items-center">
            <div className="w-full max-w-5xl px-2">
                <div className="flex space-x-5">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={handleSearch}
                        className="border border-gray-300 rounded-md p-2 mb-4 w-60"
                    />
                </div>
                <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none mt-2">
                    <table className="table-fixed w-full text-left font-inter border">
                        <thead className="rounded-lg text-base font-semibold w-full">
                            <tr className="bg-[#222E3A]/[6%]">
                                <th className="py-3 px-3 w-1/5 sm:text-base font-bold whitespace-nowrap">Date</th>
                                <th className="py-3 px-3 w-3/5 sm:text-base font-bold whitespace-nowrap">Title</th>
                                <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap">Venue</th>
                                <th className="py-3 px-3 justify-center gap-1 sm:text-base font-bold whitespace-nowrap">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowsToShow.map((data, index) => (
                                <tr className={index % 2 === 0 ? "bg-blue" : "bg-[#222E3A]/[6%]"} key={data.id}>
                                    <td className="py-2 px-3 font-normal text-base border-t text-clip overflow-hidden table-cell">{data.date}</td>
                                    <td className="py-2 px-3 text-base font-normal border-t text-clip overflow-hidden table-cell">{data.title}</td>
                                    <td className="py-2 px-3 font-normal text-base border-t text-clip overflow-hidden table-cell">{data.venueid}</td>
                                    <td className="py-2 px-3 font-normal text-base border-t text-clip overflow-hidden table-cell">{data.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-full flex flex-wrap justify-center sm:justify-between flex-col sm:flex-row gap-5 mt-1.5 px-1 items-center">
                    <div className="text-lg">
                        Showing {currentPage * rowsLimit + 1} to {Math.min((currentPage + 1) * rowsLimit, rowsToShow.length)} of {events.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) && (selectedArea === 'default' || item.area === selectedArea)).length} entries
                    </div>
                    <div className="flex text-clip overflow-hidden">
                        <ul className="flex flex-wrap justify-center items-center gap-x-[10px] " role="navigation" aria-label="Pagination">
                            <li className={`prev-btn flex items-center justify-center w-[36px] h-[36px] border border-solid border-[#E4E4EB] ${currentPage === 0 ? " pointer-events-none" : "cursor-pointer"}`} onClick={previousPage}>
                                <img src="https://www.tailwindtap.com/assets/travelagency-admin/leftarrow.svg" alt="Previous" />
                            </li>
                            {Array.from({ length: totalFilteredPages }, (_, index) => (
                                <li
                                    className={`flex flex-wrap items-center justify-center w-[36px] h-[34px] border border-solid ${currentPage === index ? "text-blue-600 border-sky-500" : "border-[#E4E4EB] cursor-pointer"}`}
                                    onClick={() => setCurrentPage(index)}
                                    key={index}
                                >
                                    {index + 1}
                                </li>
                            ))}
                            <li className={`flex items-center justify-center w-[36px] h-[36px] border border-solid border-[#E4E4EB] ${currentPage === totalFilteredPages - 1 ? " pointer-events-none" : "cursor-pointer"}`} onClick={nextPage}>
                                <img src="https://www.tailwindtap.com/assets/travelagency-admin/rightarrow.svg" alt="Next" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListOfEvents;