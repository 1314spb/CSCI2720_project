import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibGVvc2luY2h1bmdobyIsImEiOiJjbTQ5aHpsOXUwYXpoMm1xNDNjaHo0dmhuIn0.vLLeV55pFPR44rZedmbLgw';

const Map = () => {
    const [lng, setLng] = useState(114.206);
    const [lat, setLat] = useState(22.42);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    // 獲取用戶位置
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                setLng(longitude);
                setLat(latitude);
            },
            (error) => {
                console.error("Error fetching location: ", error);
                setLng(114.206);
                setLat(22.42);
            }
        );
    }, []);

    useEffect(() => {
        // 初始化地圖
        const mapInstance = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/leosinchungho/cm49k8zz801ck01si70os84ez',
            center: [lng, lat],
            zoom: 13
        });

        // 設置地圖實例
        setMap(mapInstance);

        // 添加標記
        const newMarker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(mapInstance);
        setMarker(newMarker);

        // 隱藏 Mapbox 的版權信息
        mapInstance.on('load', () => {
            const copyrightControl = document.querySelector('.mapboxgl-ctrl-bottom-right');
            if (copyrightControl) {
                copyrightControl.style.display = 'none';
            }
        });

        // 更新標記位置
        const updateMarkerPosition = () => {
            if (marker) {
                marker.setLngLat([lng, lat]);
            }
        };

        // 監聽地圖縮放事件
        mapInstance.on('move', updateMarkerPosition);

        // 在地圖初始化後更新標記位置
        updateMarkerPosition();

        // 清理地圖
        return () => {
            if (marker) marker.remove();
            mapInstance.remove();
        };
    }, [lng, lat]);

    return <div id="map" className='w-full h-full' />;
};

export default Map;