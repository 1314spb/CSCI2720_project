import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibGVvc2luY2h1bmdobyIsImEiOiJjbTQ5aHpsOXUwYXpoMm1xNDNjaHo0dmhuIn0.vLLeV55pFPR44rZedmbLgw';

const Map = () => {
    const [venues, setVenues] = useState([]);
    const [userLocation, setUserLocation] = useState({ lng: 114.206, lat: 22.42 });
    const [map, setMap] = useState(null);
    const [userMarker, setUserMarker] = useState(null);

    // 獲取用戶位置
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

    useEffect(() => {
        // 初始化地圖
        const mapInstance = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/leosinchungho/cm49k8zz801ck01si70os84ez',
            center: [userLocation.lng, userLocation.lat],
            zoom: 13
        });

        // 設置地圖實例
        setMap(mapInstance);

        mapInstance.addControl(new mapboxgl.NavigationControl());

        // 添加標記
        const newMarker = new mapboxgl.Marker({ color: 'red' })
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

        // 監聽地圖縮放事件
        mapInstance.on('move', updateMarkerPosition);

        // 在地圖初始化後更新標記位置
        updateMarkerPosition();

        // 清理地圖
        return () => {
            if (userMarker) userMarker.remove();
            mapInstance.remove();
        };
    }, [userLocation.lng, userLocation.lat]);

    useEffect(() => {
        if (map) {
            venues.forEach((venue) => {
                const popup = new mapboxgl.Popup().setHTML(`
                    <h3>${venue.nameC}</h3>
                    <p>${venue.nameE}</p>
                `);

                const marker = new mapboxgl.Marker()
                    .setLngLat([venue.longitude, venue.latitude])
                    .setPopup(popup)
                    .addTo(map);
            }
            );
        }
    }, [map, venues]);

    return <div id="map" className='w-full h-full' />;
};

export default Map;