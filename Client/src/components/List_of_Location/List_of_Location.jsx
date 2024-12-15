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

const TABLE_HEAD = ["ID", "Location", "Distance (km)", "Number of Events", "Add to Favourite"];
const Area = ["North District", "East Kowloon", "Sheung Wan", "Sha Tin", "Kwai Tsing", "Tuen Mun", "Yuen Long", "Ngau Chi Wan", "Tsuen Wan", "Others"];

const ListOfLocation = () => {
  const [venues, setVenues] = useState([]);
  const [rowsLimit] = useState(10);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState({ column: 'numberOfEvents', direction: 'asc' });
  const [selectedArea, setSelectedArea] = useState('default');
  const [userLocation, setUserLocation] = useState({ lng: 114.206, lat: 22.42 });
  const [maxDistance, setMaxDistance] = useState(50);
  const [isSliding, setIsSliding] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation({ lng: longitude, lat: latitude });
      },
      (error) => {
        console.error("Error when getting location: ", error);
        setUserLocation({ lng: 114.206, lat: 22.42 });
      }
    );
  }, []);

  const fetchVenues = async () => {
    try {
      const locationsResponse = await axios.get('http://localhost:3000/api/user/location', {
        withCredentials: true,
      });

      const userFavoritesResponse = await axios.get('http://localhost:3000/api/user/userFavorites', {
        withCredentials: true,
      });

      const userFavoritesResData = userFavoritesResponse.data.favLoc;
      const userFavorites = userFavoritesResData.map(fav => fav.locId);
      const locationsWithFavorites = locationsResponse.data.map(location => ({
        ...location,
        isFavorite: userFavorites.includes(location.locId),
      }));

      const venueList = locationsWithFavorites.map(venue => ({
        id: venue.locId,
        nameEnglish: venue.name,
        numberOfEvents: venue.numEvents,
        isFavorite: venue.isFavorite,
        venuelatitude: venue.lat,
        venuelongitude: venue.long,
        distance: null,
        area: null
      }));
      setVenues(venueList);

      if (locationsResponse.data.length > 0) {
        const updatedTime = new Date().toLocaleString();
        setLastUpdated(updatedTime);
      }
    } catch (error) {
      console.error('Error fetching locations or user favorites:', error);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

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

    const filteredVenues = venues.map(item => {
      const distance = haversineDistance(userLocation.lat, userLocation.lng, item.venuelatitude, item.venuelongitude);
      const area = Area.find(a => item.nameEnglish.includes(a)) || 'Others';
      return { ...item, distance, area };
    }).filter(item => {
      return (
        item.nameEnglish.toLowerCase().includes(search.toLowerCase()) &&
        (selectedArea === 'default' || item.area === selectedArea) &&
        item.distance <= maxDistance
      );
    });

    console.log('Filtered Venues Count:', filteredVenues.length);

    const sortedVenues = [...filteredVenues].sort((a, b) => {
      const { direction } = sortOrder;
      const aValue = a.numberOfEvents;
      const bValue = b.numberOfEvents;

      return direction === 'asc' ? (aValue - bValue) : (bValue - aValue);
    });

    setRowsToShow(sortedVenues.slice(startIndex, startIndex + rowsLimit));
  }, [venues, currentPage, rowsLimit, search, sortOrder, selectedArea, maxDistance, userLocation]);

  const totalFilteredPages = useMemo(() => {
    const filteredVenues = venues.map(item => {
      const distance = haversineDistance(userLocation.lat, userLocation.lng, item.venuelatitude, item.venuelongitude);
      return { ...item, distance };
    }).filter(item => {
      return (
        item.nameEnglish.toLowerCase().includes(search.toLowerCase()) &&
        (selectedArea === 'default' || item.area === selectedArea) &&
        item.distance <= maxDistance
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

  const handleSort = () => {
    const newDirection = (sortOrder.direction === 'asc' ? 'desc' : 'asc');
    setSortOrder({ column: 'numberOfEvents', direction: newDirection });
    setCurrentPage(0);
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
    try {
      if (isFavorite) {
        await apiCsrf.put('/api/user/removeFavLoc', { favoriteLocationIds: locId }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
      } else {
        await apiCsrf.put('/api/user/addFavLoc', { favoriteLocationIds: locId }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
      }

      setVenues(prevVenues => prevVenues.map(location =>
        location.id === locId ? { ...location, isFavorite: !isFavorite } : location
      ));
      fetchVenues();
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };

  return (
    <div className="min-h-screen h-full flex flex-col p-4 md:p-6">
      <div className="flex-grow">
        <Card className="h-full w-full bg-white shadow-lg">
          <CardBody className="overflow-auto">
            <div className='flex flex-col md:flex-row w-full mb-4 space-y-4 md:space-y-0 md:space-x-4'>
              <input
                type="text"
                placeholder="Search by location..."
                value={search}
                onChange={handleSearch}
                className="border border-gray-400 rounded-md p-2 w-full md:w-60 text-gray-900"
              />
              <select
                value={selectedArea}
                onChange={handleAreaChange}
                className="border border-gray-400 rounded-md p-2 w-full md:w-60 text-gray-900"
              >
                <option value="default">Area</option>
                {Area.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <div className="relative border border-gray-400 rounded-md p-2 w-full md:w-60 bg-white">
                <label className='flex text-gray-800'>Distance (km)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={maxDistance}
                  onChange={handleDistanceChange}
                  onMouseDown={() => setIsSliding(true)}
                  onMouseUp={() => setIsSliding(false)}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-400"
                />
                {isSliding && (
                  <div 
                    className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded px-2 py-1"
                    style={{ left: `calc(${(maxDistance / 50) * 100}% - 20px)` }}
                  >
                    {maxDistance}
                  </div>
                )}
              </div>
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
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head, index) => (
                      <th className="border-b border-gray-200 bg-gray-50 p-4" key={head}>
                        {head === "Number of Events" ? (
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
                          No members found.
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    rowsToShow.map(({ id, isFavorite, nameEnglish, numberOfEvents, venuelongitude, venuelatitude, distance }, index) => {
                      const isLast = index === rowsToShow.length - 1;
                      const classes = isLast ? "p-4" : "p-4 border-b border-gray-200";
                      return (
                        <tr key={id} className="hover:bg-gray-100 transition-colors duration-200">
                          <td className={classes}>
                            <Typography variant="small" color="gray" className="font-normal">{id}</Typography>
                          </td>
                          <td className={`${classes} break-words whitespace-normal`}>
                            <Link to={`/map?lat=${venuelatitude}&lng=${venuelongitude}&status=${'true'}`} className="inline-block bg-slate-200 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-300 transition-colors duration-200">
                              <Typography variant="small" color="gray" className="font-normal">{nameEnglish}</Typography>
                            </Link>
                          </td>
                          <td className={classes}>
                            <Typography variant="small" color="gray" className="font-normal">{distance.toFixed(2)} km</Typography>
                          </td>
                          <td className={classes}>
                            <Typography variant="small" color="gray" className="font-normal">{numberOfEvents}</Typography>
                          </td>
                          <td className={classes}>
                            <Tooltip content={isFavorite ? "Remove from Favourite" : "Add to Favourite"}>
                              <IconButton 
                                onClick={(e) => {
                                  e.preventDefault();
                                  changeFavority(id, isFavorite);
                                }} 
                                variant="text"
                                className={`rounded-lg p-2 transition-colors duration-200 ${isFavorite ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white'}`}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
          <CardFooter className="flex items-center justify-between border-t border-gray-200 p-4 bg-gray-50">
            <Typography variant="small" color="gray" className="font-normal select-none">
              Page {currentPage + 1} of {totalFilteredPages}
            </Typography>
            <Typography variant="small" color="gray" className="font-normal select-none">
              Last updated time: {lastUpdated}
            </Typography>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ListOfLocation;