import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibGVvc2luY2h1bmdobyIsImEiOiJjbTQ5aHpsOXUwYXpoMm1xNDNjaHo0dmhuIn0.vLLeV55pFPR44rZedmbLgw';

const Map = () => {
    const [venues, setVenues] = useState([]);
    const [userLocation, setUserLocation] = useState({ lng: 114.206, lat: 22.42 });
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [comments, setComments] = useState({
        '36311771': [
            "這個地方真的很棒，特別適合家庭出遊！",
            "每次來都能發現新的美景，值得一來再來！",
            "環境非常宜人，適合散步和野餐！"
        ],
        '87210195': [
            "這裡的食物非常美味，特別推薦他們的特色菜！",
            "服務態度很好，讓人感覺賓至如歸！",
            "無論是午餐還是晚餐，這裡都是個不錯的選擇！"
        ],
        '36310035': [
            "這個景點的歷史非常有趣，值得一探究竟！",
            "拍照的好地方，特別是夕陽西下時！",
            "裡面的展覽很精彩，讓我學到了很多新知識！"
        ]
    });
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                setUserLocation({ lng: longitude, lat: latitude });
            },
            (error) => {
                console.error("Error fetching location: ", error);
                setUserLocation({ lng: 114.206, lat: 22.42 });
            }
        );
    }, []);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('/venues.xml');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const text = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "application/xml");
                const venueNodes = xmlDoc.getElementsByTagName('venue');
                const venuesArray = [];

                for (let i = 0; i < venueNodes.length; i++) {
                    const venue = venueNodes[i];
                    const id = venue.getAttribute('id');
                    const nameC = venue.getElementsByTagName('venuec')[0]?.textContent || '';
                    const nameE = venue.getElementsByTagName('venuee')[0]?.textContent || '';
                    const latitude = venue.getElementsByTagName('latitude')[0]?.textContent;
                    const longitude = venue.getElementsByTagName('longitude')[0]?.textContent;

                    if (latitude && longitude) {
                        venuesArray.push({
                            id,
                            nameC,
                            nameE,
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude)
                        });
                    }
                }

                setVenues(venuesArray);
            } catch (error) {
                console.error("Error loading venues.xml: ", error);
            }
        };

        fetchVenues();
    }, []);

    useEffect(() => {
        const mapInstance = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/leosinchungho/cm49k8zz801ck01si70os84ez',
            center: [userLocation.lng, userLocation.lat],
            zoom: 13
        });

        setMap(mapInstance);

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
            mapInstance.remove();
        };
    }, [userLocation.lng, userLocation.lat]);

    useEffect(() => {
        if (!map) return;

        venues.forEach((venue) => {
            const marker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat([venue.longitude, venue.latitude])
                .addTo(map);

            marker.getElement().addEventListener('click', () => {
                setSelectedVenue(venue);
                map.flyTo({ center: [venue.longitude, venue.latitude], zoom: 14 });
            });
        });
    }, [map, venues]);

    const handleAddComment = (venueId, comment) => {
        if (!comment.trim()) return;

        setComments(prevComments => ({
            ...prevComments,
            [venueId]: prevComments[venueId] ? [...prevComments[venueId], comment] : [comment]
        }));
    };

    const handleToggleFavorite = (venueId) => {
        setFavorites(prevFavorites => {
            if (prevFavorites.includes(venueId)) {
                return prevFavorites.filter(id => id !== venueId);
            } else {
                return [...prevFavorites, venueId];
            }
        });
    };

    return (
        <div className='relative w-full h-screen'>
            <div id="map" className='w-full h-full' />

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
                        onClick={() => handleToggleFavorite(selectedVenue.id)}
                        className={`mt-4 px-4 py-2 rounded transition-colors flex ${favorites.includes(selectedVenue.id)
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-yellow-500 hover:bg-yellow-600'
                            } text-white`}
                    >
                        {favorites.includes(selectedVenue.id) ? 'Remove from favourite' : 'Add into favourite'}
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