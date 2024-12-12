import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import axios from 'axios';
import apiCsrf from '../../../apiCsrf';

const TABLE_HEAD = ["ID", "Location", "Number of Events", "Add to Favourite"];
const Area = ["North District", "East Kowloon", "Sheung Wan", "Sha Tin", "Kwai Tsing", "Tuen Mun", "Yuen Long", "Ngau Chi Wan", "Tsuen Wan", "Others"];

const ListOfLocation = () => {
    const [venues, setVenues] = useState([]);
    const [events, setEvents] = useState([]);
    const [rowsLimit] = useState(10);
    const [rowsToShow, setRowsToShow] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState({ column: 'id', direction: 'asc' });
    const [selectedArea, setSelectedArea] = useState('default');
    const [userLocation, setUserLocation] = useState({ lng: 114.206, lat: 22.42 });
    const [maxDistance, setMaxDistance] = useState(50);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
        (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation({ lng: longitude, lat: latitude });
        },
        (error) => {
            console.error("Error when getting location: ", error);
            setUserLocation({ lng: 114.206, lat: 22.42 }); // Fallback location
        }
        );
    }, []);

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
                venuelatitude: venue.lat,
                venuelongitude: venue.long,

              }));
            setVenues(venueList); // Set the locations state
          } catch (error) {
            console.error('Error fetching locations or user favorites:', error);
          }
        };
    useEffect(() => {
    //     const fetchVenues = async () => {
    //     try {
    //         const response = await fetch('/venues.xml');
    //         if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const text = await response.text();
    //         const parser = new DOMParser();
    //         const xml = parser.parseFromString(text, 'application/xml');
    //         const venuesList = Array.from(xml.getElementsByTagName('venue')).map(venue => {
    //         const nameEnglish = venue.getElementsByTagName('venuee')[0]?.textContent || 'N/A';
    //         // Determine the area based on the venue name
    //         const area = Area.find(a => nameEnglish.includes(a)) || 'Others';
            
    //         return {
    //             id: venue.getAttribute('id'),
    //             nameEnglish,
    //             numberOfEvents: 0,
    //             area, // Assign the determined area
    //             venuelatitude: parseFloat(venue.getElementsByTagName('latitude')[0]?.textContent) || 0,
    //             venuelongitude: parseFloat(venue.getElementsByTagName('longitude')[0]?.textContent) || 0
    //         };
    //         });
    //         setVenues(venuesList);
    //     } catch (error) {
    //         console.error("Loading venues.xml error:", error);
    //     }
    //     };
        fetchVenues();
        console.log("Venues are : ", venues);


    }, []);

    // useEffect(() => {
    //     const fetchEvents = async () => {
    //     try {
    //         const response = await fetch('/events.xml');
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const text = await response.text();
    //         const parser = new DOMParser();
    //         const xml = parser.parseFromString(text, 'application/xml');
    //         const eventList = Array.from(xml.getElementsByTagName('event')).map(event => ({
    //             id: event.getAttribute('id'),
    //             venueid: event.getElementsByTagName('venueid')[0]?.textContent || 'N/A'
    //         }));
    //         setEvents(eventList);
    //         countEvents(eventList);
    //     } catch (error) {
    //         console.error("Loading events.xml error:", error);
    //     }
    //     };
    //     fetchEvents();
    // }, []);

    // const countEvents = (eventList) => {
    //     setVenues(prevVenues => {
    //     return prevVenues.map(venue => {
    //         const numberOfEvents = eventList.filter(event => event.venueid === venue.id).length;
    //         return { ...venue, numberOfEvents };
    //     });
    //     });
    // };

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    useEffect(() => {
        const startIndex = currentPage * rowsLimit;
        const filteredVenues = venues.filter(item => {
        const distance = haversineDistance(userLocation.lat, userLocation.lng, item.venuelatitude, item.venuelongitude);
        return (
            item.nameEnglish.toLowerCase().includes(search.toLowerCase()) &&
            (selectedArea === 'default' || item.area === selectedArea) &&
            distance <= maxDistance
        );
    });

    const sortedVenues = [...filteredVenues].sort((a, b) => {
      const { column, direction } = sortOrder;

      let aValue = column === 'numberOfEvents' ? a.numberOfEvents : a[column];
      let bValue = column === 'numberOfEvents' ? b.numberOfEvents : b[column];

      return direction === 'asc' ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
    });

    setRowsToShow(sortedVenues.slice(startIndex, startIndex + rowsLimit));
    }, [venues, currentPage, rowsLimit, search, sortOrder, selectedArea, maxDistance, userLocation]);

    const totalFilteredPages = useMemo(() => {
        const filteredVenues = venues.filter(item => {
        const distance = haversineDistance(userLocation.lat, userLocation.lng, item.venuelatitude, item.venuelongitude);
        return (
            item.nameEnglish.toLowerCase().includes(search.toLowerCase()) &&
            (selectedArea === 'default' || item.area === selectedArea) &&
            distance <= maxDistance
        );
        });
        return Math.ceil(filteredVenues.length / rowsLimit);
    }, [venues, search, rowsLimit, selectedArea, maxDistance, userLocation]);

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

    const handleSort = (column) => {
        const newDirection = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc';
        setSortOrder({ column, direction: newDirection });
        setCurrentPage(0); // Reset to the first page on sort
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setCurrentPage(0);
    };

    const handleAreaChange = (event) => {
        setSelectedArea(event.target.value);
        setCurrentPage(0);
    };

    const handleDistanceChange = (event) => {
        setMaxDistance(event.target.value);
        setCurrentPage(0);
    };

    const changeFavority = async (locId, isFavorite) => {
        // Logic for changing favorite status
        try {
            if (isFavorite) {
              await apiCsrf.put(
                '/api/user/removeFavLoc',
                { favoriteLocationIds: locId },
                {
                    headers: {
                        'Content-Type':'application/json',
                      },
                    withCredentials: true 
                }
              );
            } else {
              await apiCsrf.put(
                '/api/user/addFavLoc',
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
<div className="min-h-screen h-full flex items-center bg-gray-100">
  <div className="w-full max-w-5xl px-2">
    <div className="flex space-x-5 mb-4">
        <input
            type="text"
            placeholder="Search by location..."
            value={search}
            onChange={handleSearch}
            className="border border-gray-400 rounded-md p-2 w-60 text-gray-800"  // Dark text
        />
        <select 
            value={selectedArea} 
            onChange={handleAreaChange} 
            className="border border-gray-400 rounded-md p-2 w-60 text-gray-800"
        >
        <option value="default">Area</option>
        {Area.map(area => (
          <option key={area} value={area}>{area}</option>
        ))}
        </select>
        <div className="border border-gray-400 rounded-md p-2 w-60 bg-white">
            <label className='flex text-gray-800'>Distance (km)</label>
            <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={maxDistance}
            onChange={handleDistanceChange}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-400"
            />
        </div>
    </div>
    <Card className="h-full w-full bg-white shadow-md">
        <CardBody className="overflow-scroll px-0">
            <table className="mt-4 w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        <th className="border-y border-gray-200 bg-gray-50 p-4">
                            <Button onClick={() => handleSort('id')} className="flex items-center gap-2 text-gray-800">
                            ID 
                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                            </Button>
                        </th>
                        <th className="border-y border-gray-200 bg-gray-50 p-4">
                            <Button onClick={() => handleSort('nameEnglish')} className="flex items-center gap-2 text-gray-800">
                            Location 
                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                            </Button>
                        </th>
                        <th className="border-y border-gray-200 bg-gray-50 p-4">
                            <Button onClick={() => handleSort('numberOfEvents')} className="flex items-center gap-2 text-gray-800">
                            Number of Events
                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                            </Button>
                        </th>
                        <th className="border-y border-gray-200 bg-gray-50 p-4">Add to Favourite</th>
                    </tr>
                </thead>
                <tbody>
                {rowsToShow.length === 0 && (
                  <tr>
                    <td className="p-4 text-center" colSpan={TABLE_HEAD.length}>
                      <Typography color="gray" className="font-normal">
                        No members found.
                      </Typography>
                    </td>
                  </tr>
                )} 
                {rowsToShow.map(({ id, isFavorite, nameEnglish, numberOfEvents, venuelongitude, venuelatitude }, index) => {
                  const isLast = index === rowsToShow.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-gray-200";  // Adjusted border color
                  return (
                    <tr key={id}>
                      <td className={classes}>
                        <Typography variant="small" color="gray" className="font-normal">{id}</Typography>
                      </td>
                      <td className={classes}>
                        <Link to={`/map?lat=${venuelatitude}&lng=${venuelongitude}&status=${'true'}`} className="text-blue-600 hover:underline">
                            <Typography variant="small" color="gray" className="font-normal">{nameEnglish}</Typography>
                        </Link>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="gray" className="font-normal">{numberOfEvents}</Typography>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Add to Favourite">
                          <IconButton  onClick={(e)=>{
                                            e.preventDefault();
                                            changeFavority(id, isFavorite);
                                        }}
                                        variant="text">
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
                className='text-gray-800'
                onClick={previousPage}
                disabled={currentPage === 0}
                variant="outlined"
              >
                Previous
              </Button>
              <Button
                className='text-gray-800'
                onClick={nextPage}
                disabled={currentPage === totalFilteredPages - 1}
                variant="outlined"
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

export default ListOfLocation;