import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const ListOfLocation = () => {
    const [venues, setVenues] = useState([]);
    const [events, setEvents] = useState([]);
    const [rowsLimit] = useState(10);
    const [rowsToShow, setRowsToShow] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const [selectedArea, setSelectedArea] = useState('default'); // State for selected area

    const fetchVenues = async () => {
        try {
            // Fetch all locations
            const locationsResponse = await axios.get('http://localhost:3000/api/user/location', {
              withCredentials: true,
            });
      
            // Fetch user favorites
            const userFavoritesResponse = await axios.get('http://localhost:3000/api/user/userFavorites', {
              withCredentials: true,
            });

            const userFavoritesResData = userFavoritesResponse.data.favLoc;
            // console.log("userFavoritesResponse.data are ", userFavoritesResData);
            const userFavorites = userFavoritesResData.map((fav) => fav.locId); // Extract locId array
            // console.log("userFavorites are ", userFavorites);
            // Combine locations with favorite status
            const locationsWithFavorites = locationsResponse.data.map((location) => ({
              ...location,
              isFavorite: userFavorites.includes(location.locId), // Determine favorite status
            }));
      
            console.log("Locations with favorites : ", locationsWithFavorites);
            const venueList = locationsWithFavorites.map((venue) => ({
                id: venue.locId,
                nameEnglish: venue.name,
                numberOfEvents: venue.numEvents,
                isFavorite: venue.isFavorite,
              }));
            setVenues(venueList); // Set the locations state
          } catch (error) {
            console.error('Error fetching locations or user favorites:', error);
          }
        };
    useEffect(() => {
        // const fetchVenues = async () => {
        //     try {
        //         const response = await fetch('/venues.xml');
        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }
        //         const text = await response.text();
        //         const parser = new DOMParser();
        //         const xml = parser.parseFromString(text, 'application/xml');
        //         const venuesList = Array.from(xml.getElementsByTagName('venue')).map(venue => ({
        //             id: venue.getAttribute('id'),
        //             nameEnglish: venue.getElementsByTagName('venuee')[0]?.textContent || 'N/A',
        //             : 0,
        //             isFavorite: false,
        //             area: venue.getElementsByTagName('area')[0]?.textContent || 'N/A', // Assuming 'area' is in the XML
        //         }));
        //         setVenues(venuesList);
        //     } catch (error) {
        //         console.error("Loading venues.xml error:", error);
        //     }
        // };

        
        fetchVenues();
        console.log("Venues are : ", venues);
    }, []);

    // useEffect(() => {
    //     const fetchEvents = async () => {
    //         try {
    //             const response = await fetch('/events.xml');
    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }
    //             const text = await response.text();
    //             const parser = new DOMParser();
    //             const xml = parser.parseFromString(text, 'application/xml');
    //             const eventList = Array.from(xml.getElementsByTagName('event')).map(event => ({
    //                 id: event.getAttribute('id'),
    //                 venueid: event.getElementsByTagName('venueid')[0]?.textContent || 'N/A'
    //             }));
    //             setEvents(eventList);
    //             countEvents(eventList);
    //         } catch (error) {
    //             console.error("Loading events.xml error:", error);
    //         }
    //     };
    //     fetchEvents();
    // }, []);

    // const countEvents = (eventList) => {
    //     setVenues(prevVenues => {
    //         const updatedVenues = prevVenues.map(venue => {
    //             const numberOfEvents = eventList.filter(event => event.venueid === venue.id).length;
    //             return { ...venue, numberOfEvents };
    //         });
    //         return updatedVenues;
    //     });
    // };

    useEffect(() => {
        const startIndex = currentPage * rowsLimit;
        const filteredVenues = venues.filter(item => 
            item.nameEnglish.toLowerCase().includes(search.toLowerCase()) &&
            (selectedArea === 'default' || item.area === selectedArea) // Filter by selected area
        );

        const sortedVenues = [...filteredVenues].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.numberOfEvents - b.numberOfEvents;
            } else if (sortOrder === 'desc') {
                return b.numberOfEvents - a.numberOfEvents;
            } else {
                return a.nameEnglish.localeCompare(b.nameEnglish);
            }
        });

        setRowsToShow(sortedVenues.slice(startIndex, startIndex + rowsLimit));
    }, [venues, currentPage, rowsLimit, search, sortOrder, selectedArea]);

    const totalFilteredPages = useMemo(() => {
        const filteredVenues = venues.filter(item => 
            item.nameEnglish.toLowerCase().includes(search.toLowerCase()) &&
            (selectedArea === 'default' || item.area === selectedArea)
        );
        return Math.ceil(filteredVenues.length / rowsLimit);
    }, [venues, search, rowsLimit, selectedArea]);

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

    const handleAreaChange = (event) => {
        setSelectedArea(event.target.value);
        setCurrentPage(0);
    };

    const sortByValue = () => {
        setSortOrder(prevOrder => {
            if (prevOrder === 'default') return 'asc';
            if (prevOrder === 'asc') return 'desc';
            return 'default';
        });
    };

    const changeFavority = async (locId, isFavorite) => {
        // Logic for changing favorite status
        try {
            if (isFavorite) {
              await axios.put(
                'http://localhost:3000/api/user/removeFavLoc',
                { favoriteLocationIds: locId },
                {
                    headers: {
                        'Content-Type':'application/json',
                      },
                    withCredentials: true 
                }
              );
            } else {
              await axios.put(
                'http://localhost:3000/api/user/addFavLoc',
                { favoriteLocationIds: locId },
                { 
                    headers: {
                    'Content-Type':'application/json',
                    },
                    withCredentials: true 
                }
              );
            }
      
            setVenues((prevVenues) =>
              prevVenues.map((location) =>
                location.locId === locId ? { ...location, isFavorite: !isFavorite } : location
              )
            );
            fetchVenues();
          } catch (error) {
            console.error('Error toggling favorite status:', error);
          }
    };

    return (
        <div className="min-h-screen h-full flex items-center">
            <div className="w-full max-w-5xl px-2">
                <div className="flex space-x-5">
                    <input
                        type="text"
                        placeholder="Search by location..."
                        value={search}
                        onChange={handleSearch}
                        className="border border-gray-300 rounded-md p-2 mb-4 w-60"
                    />
                    <select 
                        value={selectedArea} 
                        onChange={handleAreaChange} 
                        className="border border-gray-300 rounded-md p-2 mb-4 w-60 text-gray-400"
                    >
                        <option value="default">Area</option>
                        <option value="ND">North District</option>
                        <option value="ST">Sha Tin</option>
                        {/* Add more options as needed */}
                    </select>
                    <div className="border border-gray-300 rounded-md p-2 mb-4 w-60 text-gray-400 bg-black">
                        <label className='flex'>Distance</label>
                        <input
                            type="range"
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-400"
                            min="0"
                            max="5"
                            step="0.5"
                            id="customRange3"
                        />
                    </div>
                </div>
                <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none mt-2">
                    <table className="table-fixed w-full text-left font-inter border">
                        <thead className="rounded-lg text-base font-semibold w-full">
                            <tr className="bg-[#222E3A]/[6%]">
                                <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap">ID</th>
                                <th className="py-3 px-3 w-96 sm:text-base font-bold whitespace-nowrap">Location</th>
                                <th className="py-3 px-3 w-60 justify-center gap-1 sm:text-base font-bold whitespace-nowrap">
                                    <button onClick={sortByValue}>
                                        Number of Events {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '-'}
                                    </button>
                                </th>
                                <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap">Add to Favourite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowsToShow.map((data, index) => (
                                <tr className={index % 2 === 0 ? "bg-blue" : "bg-[#222E3A]/[6%]"} key={data.id}>
                                    <td className="py-2 px-3 font-normal text-base border-t whitespace-nowrap">{data.id}</td>
                                    <td className="py-2 px-3 font-normal text-base border-t whitespace-nowrap">{data.nameEnglish}</td>
                                    <td className="py-2 px-3 font-normal text-base border-t whitespace-nowrap">{data.numberOfEvents}</td>
                                    <td className="py-2 px-3 text-base font-normal border-t whitespace-nowrap">
                                        <button onClick={(e)=>{
                                            e.preventDefault();
                                            changeFavority(data.id, data.isFavorite);
                                        }
                                            }>{data.isFavorite ? "Yes" : "No"}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-full flex justify-center sm:justify-between flex-col sm:flex-row gap-5 mt-1.5 px-1 items-center">
                    <div className="text-lg">
                        Showing {currentPage * rowsLimit + 1} to {Math.min((currentPage + 1) * rowsLimit, venues.filter(item => item.nameEnglish.toLowerCase().includes(search.toLowerCase()) && (selectedArea === 'default' || item.area === selectedArea)).length)} of {venues.filter(item => item.nameEnglish.toLowerCase().includes(search.toLowerCase()) && (selectedArea === 'default' || item.area === selectedArea)).length} entries
                    </div>
                    <div className="flex">
                        <ul className="flex justify-center items-center gap-x-[10px]" role="navigation" aria-label="Pagination">
                            <li className={`prev-btn flex items-center justify-center w-[36px] h-[36px] border border-solid border-[#E4E4EB] ${currentPage === 0 ? " pointer-events-none" : "cursor-pointer"}`} onClick={previousPage}>
                                <img src="https://www.tailwindtap.com/assets/travelagency-admin/leftarrow.svg" alt="Previous" />
                            </li>
                            {Array.from({ length: totalFilteredPages }, (_, index) => (
                                <li
                                    className={`flex items-center justify-center w-[36px] h-[34px] border border-solid ${currentPage === index ? "text-blue-600 border-sky-500" : "border-[#E4E4EB] cursor-pointer"}`}
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

export default ListOfLocation;