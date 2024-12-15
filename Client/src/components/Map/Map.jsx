import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import apiCsrf from '../../../apiCsrf';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from 'react-router-dom';

mapboxgl.accessToken = 'pk.eyJ1IjoibGVvc2luY2h1bmdobyIsImEiOiJjbTQ5aHpsOXUwYXpoMm1xNDNjaHo0dmhuIn0.vLLeV55pFPR44rZedmbLgw';

const Map = () => {
    const location = useLocation();
    const [venues, setVenues] = useState([]);
    const [userLocation, setUserLocation] = useState({ lng: 114.206, lat: 22.42 });
    const [map, setMap] = useState(null);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const [userMarker, setUserMarker] = useState(null);
    const [comments, setComments] = useState({});
    const [selectedVenue, setSelectedVenue] = useState(null);

    const fetchVenues = async () => {
        console.log("fetchVenues called");
        try {
            const locationsResponse = await axios.get('http://localhost:3000/api/user/location', {
                withCredentials: true,
            });

            const userFavoritesResponse = await axios.get('http://localhost:3000/api/user/userFavorites', {
                withCredentials: true,
            });

            const userFavoritesResData = userFavoritesResponse.data.favLoc;
            // console.log("userFavoritesResponse.data are ", userFavoritesResData);
            const userFavorites = userFavoritesResData.map((fav) => fav.locId); // Extract locId array
            console.log("userFavorites are ", userFavorites);
            console.log("locationResponse is: ", locationsResponse.data);
            // Combine locations with favorite status
            const locationsWithFavorites = locationsResponse.data.map((location) => ({
              ...location,
              isFavorite: userFavorites.includes(location.locId), // Determine favorite status
            }));

            const venueList = locationsWithFavorites.map((venue) => ({
                id: venue.locId,
                nameE: venue.name,
                numberOfEvents: venue.numEvents,
                venuelatitude: parseFloat(venue.lat),
                venuelongitude: parseFloat(venue.long),
                isFavorite: venue.isFavorite,
            }));

            const comments = locationsResponse.data.reduce((acc, { locId, comments }) => {
                // Initialize array if locId not already in accumulator
                if (!acc[locId]) {
                    acc[locId] = [];
                }
                
                // Extract comments and push them to the corresponding locId
                comments.forEach(({ comment }) => {
                    acc[locId].push(comment);
                });

                return acc;
            }, {});
            console.log('Updated venues:', venueList);
            setVenues(venueList);
            setComments(comments);
            
        } catch (error) {
            console.error('Error fetching locations or user favorites:', error);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const changeFavority = async (locId, isFavorite) => {
        console.log(`Changing favorite status for locId: ${locId}, isFavorite: ${isFavorite}`);
        try {

          if (isFavorite) {
            await apiCsrf.put(
              '/api/user/removeFavLoc',
              { favoriteLocationIds: locId },
              {
                headers: {
                  'Content-Type': 'application/json',
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
                  'Content-Type': 'application/json',
                },
                withCredentials: true
              }
            );
          }
    
        setVenues((prevVenues) =>
            prevVenues.map((venue) =>
              venue.id === locId
                  ? { ...venue, isFavorite: !isFavorite }
                  : venue
          )
        );
        await fetchVenues();
        console.log('Favorite status toggled successfully and venues reloaded.');
        
        } catch (error) {
          console.error('Error toggling favorite status:', error);
        }
      };

    useEffect(() => {
        if (mapInstanceRef.current) return;

        const queryParams = new URLSearchParams(location.search);
        const lat = parseFloat(queryParams.get('lat'));
        const lng = parseFloat(queryParams.get('lng'));
        const center = lat && lng ? [lng, lat] : [userLocation.lng, userLocation.lat];

        mapInstanceRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/leosinchungho/cm49k8zz801ck01si70os84ez',
            center: center,
            zoom: 13
        });

        const mapInstance = mapInstanceRef.current;

        mapInstance.addControl(new mapboxgl.NavigationControl());

        const newMarker = new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(mapInstance);
        setUserMarker(newMarker);

        mapInstance.on('load', () => {
            const copyrightControl = document.querySelector('.mapboxgl-ctrl-bottom-right');
            if (copyrightControl) {
                copyrightControl.style.display = 'none';
            }
        });

        const updateMarkerPosition = () => {
            if (userMarker) {
                userMarker.setLngLat([userLocation.lng, userLocation.lat]);
            }
        };

        mapInstance.on('move', updateMarkerPosition);
        updateMarkerPosition();

        return () => {
            if (userMarker) userMarker.remove();
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [userLocation.lng, userLocation.lat, location.search]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        console.log('Current venues:', venues);
        venues.forEach((venue) => {
            const marker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat([venue.venuelongitude, venue.venuelatitude])
                .addTo(map);

            marker.getElement().addEventListener('click', () => {
                setSelectedVenue(venue);
                map.flyTo({ center: [venue.venuelongitude, venue.venuelatitude], zoom: 14 });
            });
        });
        const queryParams = new URLSearchParams(location.search);
        const triggercommentarea = queryParams.get('status') === 'true';

        if (triggercommentarea && venues.length > 0) {
            setSelectedVenue(venues[0]);
            map.flyTo({ center: [venues[0].venuelongitude, venues[0].venuelatitude], zoom: 14 });
        }
    // Ensure selectedVenue reflects the latest changes in venues
        if (selectedVenue) {
            const updatedVenue = venues.find((venue) => venue.id === selectedVenue.id);
            if (updatedVenue) {
                setSelectedVenue(updatedVenue);
            }
            }       
        // console.log("selectedVenues is: ", selectedVenue);
    }, [venues, location.search]);

    const handleAddComment = (venueId, comment) => {
        if (!comment.trim()) return;

        console.log(venueId);
        console.log(comment);
        const addComment = async () => {
            console.log('addComment is running');
            try {
                const response = await apiCsrf.put('/api/user/addComment',
                    {
                        locId: venueId,
                        comment: comment
                    },
                    {
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        withCredentials: true
                    }
                );
                console.log(response.data);
                setComments(prevComments => ({
                    ...prevComments,
                    [venueId]: prevComments[venueId] ? [...prevComments[venueId], comment] : [comment]
                }));
            } catch (err) {
                alert('Add comment failed, check connection or try again later');
                console.log(err);
            }
        }
        addComment();
    };

    return (
        <div className='relative w-full h-screen'>
            <div id="map" ref={mapContainerRef} className='w-full h-full' />

            {selectedVenue && (
                <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-20 overflow-y-auto p-6 transition-transform transform duration-300 ease-in-out">
                    <h2 className="text-lg font-bold mb-2">{selectedVenue.nameE}</h2>
                    <div className="comments-section">
                        <h4 className="text-base mb-2">Comment</h4>
                        {comments[selectedVenue.id] && comments[selectedVenue.id].length > 0 ? (
                            <div className="space-y-2">
                                {comments[selectedVenue.id].map((comment, index) => (
                                    <p key={index} className="bg-gray-100 p-2 rounded">
                                        {comment}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No Comment</p>
                        )}
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.target.elements[`comment-input-${selectedVenue.id}`];
                            const newComment = input.value.trim();
                            handleAddComment(selectedVenue.id, newComment);
                            input.value = '';
                        }}
                        className="mt-4 flex flex-col space-y-2"
                    >
                        <input
                            type="text"
                            name={`comment-input-${selectedVenue.id}`}
                            placeholder="What is your comment?"
                            required
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Add Comment
                        </button>
                    </form>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            changeFavority(selectedVenue.id, selectedVenue.isFavorite);}}
                        className={`mt-4 px-4 py-2 rounded transition-colors flex ${selectedVenue.isFavorite
                            ? ('bg-red-500 hover:bg-red-600')
                            : ('bg-yellow-500 hover:bg-yellow-600')
                            } text-white`}
                    >
                        {selectedVenue.isFavorite ? 'Remove from favourite' : 'Add into favourite'}
                    </button>
                </div>
            )}

            {selectedVenue && (
                <div
                    className="absolute top-0 left-0 w-full h-full bg-black opacity-25 z-10"
                    onClick={() => setSelectedVenue(null)}
                ></div>
            )}
        </div>
    );
};

export default Map;