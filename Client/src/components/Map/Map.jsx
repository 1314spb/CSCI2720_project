import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from 'react-router-dom';

mapboxgl.accessToken = 'pk.eyJ1IjoibGVvc2luY2h1bmdobyIsImEiOiJjbTQ5aHpsOXUwYXpoMm1xNDNjaHo0dmhuIn0.vLLeV55pFPR44rZedmbLgw';

const Map = () => {
    const location = useLocation();
    const [venues, setVenues] = useState([]);
    const [userLocation, setUserLocation] = useState({ lng: 114.206, lat: 22.42 });
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [comments, setComments] = useState({});
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [favorites, setFavorites] = useState([]);

    // 獲取用戶位置
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                setUserLocation({ lng: longitude, lat: latitude });
            },
            (error) => {
                console.error("獲取位置時出錯: ", error);
                setUserLocation({ lng: 114.206, lat: 22.42 });
            }
        );
    }, []);

    // 獲取 venues.xml 數據
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('/venues.xml');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
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
                console.error("加載 venues.xml 時出錯：", error);
            }
        };

        fetchVenues();
    }, []);

    // 初始化地圖
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const lat = parseFloat(queryParams.get('lat'));
        const lng = parseFloat(queryParams.get('lng'));
        const center = lat && lng ? [lng, lat] : [userLocation.lng, userLocation.lat];
        const mapInstance = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/leosinchungho/cm49k8zz801ck01si70os84ez',
            center: center,
            zoom: 13
        });

        // 設置地圖實例
        setMap(mapInstance);

        mapInstance.addControl(new mapboxgl.NavigationControl());

        // 添加用戶標記
        const newMarker = new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(mapInstance);
        setUserMarker(newMarker);

        // 隱藏 Mapbox 的版權信息
        mapInstance.on('load', () => {
            const copyrightControl = document.querySelector('.mapboxgl-ctrl-bottom-right');
            if (copyrightControl) {
                copyrightControl.style.display = 'none';
            }
        });

        // 更新標記位置
        const updateMarkerPosition = () => {
            if (userMarker) {
                userMarker.setLngLat([userLocation.lng, userLocation.lat]);
            }
        };

        // 監聽地圖移動事件
        mapInstance.on('move', updateMarkerPosition);

        // 在地圖初始化後更新標記位置
        updateMarkerPosition();

        // 清理地圖
        return () => {
            if (userMarker) userMarker.remove();
            mapInstance.remove();
        };
    }, [userLocation.lng, userLocation.lat, location.search]);

    // 添加地點標記並設置點擊事件
    useEffect(() => {
        if (!map) return;

        venues.forEach((venue) => {
            const marker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat([venue.longitude, venue.latitude])
                .addTo(map);

            // 點擊標記時設置選中地點
            marker.getElement().addEventListener('click', () => {
                setSelectedVenue(venue);
                // 將地圖中心移動到選中地點並放大
                map.flyTo({ center: [venue.longitude, venue.latitude], zoom: 14 });
            });
        });
        const queryParams = new URLSearchParams(location.search);
        const triggercommentarea = queryParams.get('status') === 'true';
        
        if (triggercommentarea && venues.length > 0) {
            setSelectedVenue(venues[0]); // Automatically select the first venue
            map.flyTo({ center: [venues[0].longitude, venues[0].latitude], zoom: 14 });
        }
    }, [map, venues, location.search]);

    // 處理添加評論
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
                // 如果已收藏，則移除
                return prevFavorites.filter(id => id !== venueId);
            } else {
                // 如果未收藏，則添加
                return [...prevFavorites, venueId];
            }
        });
    };

    return (
        <div className='relative w-full h-screen'>
            <div id="map" className='w-full h-full' />

            {/* 側邊欄 */}
            {selectedVenue && (
                <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-20 overflow-y-auto p-6 transition-transform transform duration-300 ease-in-out">

                    <h2 className="text-lg font-bold mb-2">{selectedVenue.nameC}</h2>
                    {/* <h3 className="text-lg text-gray-700 mb-4">{selectedVenue.nameE}</h3> */}

                    <div className="comments-section">
                        <h4 className="text-base mb-2 flex">評論</h4>
                        {comments[selectedVenue.id] && comments[selectedVenue.id].length > 0 ? (
                            <div className="space-y-2 flex">
                                {comments[selectedVenue.id].map((comment, index) => (
                                    <p key={index} className="bg-gray-100 p-2 rounded">
                                        {comment}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 flex">暫無評論。</p>
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
                            placeholder="輸入你的評論"
                            required
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            添加
                        </button>
                    </form>
                    <button
                        onClick={() => handleToggleFavorite(selectedVenue.id)}
                        className={`mt-4 px-4 py-2 rounded transition-colors flex ${favorites.includes(selectedVenue.id)
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-yellow-500 hover:bg-yellow-600'
                            } text-white`}
                    >
                        {favorites.includes(selectedVenue.id) ? '移除收藏' : '加入收藏'}
                    </button>
                </div>
            )}

            {/* 覮屏外的遮罩層，以便點擊遮罩時關閉側邊欄 */}
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