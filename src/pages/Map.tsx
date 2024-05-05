import React, { useEffect, useState } from 'react';
import './Map.css'
import api from "../services/api";

declare global {
    interface Window {
        kakao: any;
        overlay: any;
    }
}

function Map() {
    useEffect(() => {
        // 지도 생성
        let container = document.getElementById(`map`);
        let options = {
            center: new window.kakao.maps.LatLng(37.552893250871136, 126.97137943460862), // 지도 중심 좌표
            level: 2, // 지도의 레벨
        };
        
        let map = new window.kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴

        // 현재 위치에 마커 표시
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                let lat = position.coords.latitude,
                    lon = position.coords.longitude; 
                
                let locPosition = new window.kakao.maps.LatLng(lat, lon)
                displayMarker(map, locPosition);                 
            });   
        } 
        
        const fetchDataAndCreateMarkers = async () => {
            const mapBounds = map.getBounds();
            const left = mapBounds.getSouthWest();
            const right = mapBounds.getNorthEast();

            // 카메라 데이터 가져오기
            const cameraData = await fetchCameraData(left, right);

            // 주차장 데이터 가져오기
            const parkingData = await fetchParkingData(left, right);

            // 데이터가 변경될 때마다 마커를 생성합니다.
            createMarkers(map, cameraData, createCameraMarker);
            createMarkers(map, parkingData, createParkingMarker);
        };

        fetchDataAndCreateMarkers();

        // 드래그 종료 시 좌표 불러오기
        window.kakao.maps.event.addListener(map, 'dragend', function () {
            fetchDataAndCreateMarkers();
        });

        // 확대축소 종료 시 좌표 불러오기
        window.kakao.maps.event.addListener(map, 'zoom_changed', function() {
            fetchDataAndCreateMarkers();
        });
    }, []);

    const fetchCameraData = async (left: any, right: any) => {
        // 카메라 데이터 예시
        const result = await api.getCCTVs(left, right);
        let data = [];
        for (let i = 0; i < result.length; i++) {
            data.push([result[i].latitude, result[i].longitude]);
        }
        return data;
    };

    const fetchParkingData = async (left: any, right: any) => {
        // 주차장 데이터 예시
        const result = await api.getPublicParking(left, right);
        return result;
    };

    const displayMarker = (map: any, position: any) => {
        new window.kakao.maps.Marker({
            map: map,
            position: position
        });
        map.setCenter(position);     
    };

    const createMarkers = (map: any, data: any, createMarkerFunction: any) => {
        if (map && data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                const marker = createMarkerFunction(map, data[i]);
                marker.setMap(map);
            }
        }
    };

    const createCameraMarker = (map: any, position: any) => {
        const lat = position[0];
        const lng = position[1];
        const imageSrc = "assets/camera_mark.png";
        const imageSize = new window.kakao.maps.Size(24, 24);
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

        let marker = new window.kakao.maps.Marker({
            map: map,
            position: new window.kakao.maps.LatLng(lat, lng),
            image: markerImage
        });
        return marker;
    };
    
    const createParkingMarker = (map: any, data: any) => {
        const lat = data.latitude;
        const lng = data.longitude;
        const imageSrc = "assets/park_mark.png";
        const imageSize = new window.kakao.maps.Size(24, 24);
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
    
        let marker = new window.kakao.maps.Marker({
            map: map,
            position: new window.kakao.maps.LatLng(lat, lng),
            image: markerImage
        });
    
        // 커스텀 오버레이를 생성하고 마커에 연결
        const content = 
        '<div class="wrap">' +
        '    <div class="info">' +
        `        <div class="title">${data.name}` +
        '            <div class="close" title="닫기"></div>' +
        '        </div>' +
        '        <div class="body">' +
        '          <div class="left-column">' +
        '            <div class="item">' +
        '                <div class="img">' +
        '                    <img src="assets/I_adress_icon.png" width="25" height="22">' +
        '                </div>' +
        '                <div class="desc">' +
        `                    <div class="ellipsis">${data.address}</div>` +
        '                </div>' +
        '            </div>' +
        '            <div class="item">' +
        '                <div class="img">' +
        '                    <img src="assets/I_phone_icon.png" width="25" height="22">' +
        '                </div>' +
        '                <div class="desc">' +
        `<div class="ellipsis">${data.tel ? data.tel : '-'}</div>` +
        '                </div>' +
        '            </div>' +
        '            <div class="item">' +
        '                <div class="img">' +
        '                    <img src="assets/I_money_icon.png" width="25" height="22">' +
        '                </div>' +
        '                <div class="desc">' +
        `                    <div class="ellipsis">${data.payType}</div>` +
        '                </div>' +
        '            </div>' +
        '            <div class="item">' +
        '                <div class="img">' +
        '                    <img src="assets/I_time_icon.png" width="25" height="22">' +
        '                </div>' +
        '                <div class="desc">' +
        `                    <div class="ellipsis">${data.holidayHours}</div>` +
        '                </div>' +
        '            </div>' +
        '          </div>' +
        '          <div class="right-column">' +
        '            <div class="box">' +
        '              <div class="title">전체 주차면</div>' +
        `              <div class="count">${data.totalCapacity}</div>` +        
        '            </div>' +
        '            <div class="box">' +
        '              <div class="title">현재 주차면</div>' +
        `              <div class="count">${data.currentCapacity}</div>` +
        '            </div>' +
        '          </div>' +
        '        </div>' +
        '    </div>' +
        '</div>'

        const customOverlay = new window.kakao.maps.CustomOverlay({
            content: content,
            xAnchor: 0.5,
            yAnchor: 1.1
        });
    
        // 마커를 클릭하면 커스텀 오버레이 표시
        window.kakao.maps.event.addListener(marker, 'click', function() {
            if (window.overlay) {
                window.overlay.setMap(null);
            }
            customOverlay.setPosition(marker.getPosition());
            customOverlay.setMap(map);

            const overlayCloseBtn = document.querySelector('.wrap .info .title .close');
            if (overlayCloseBtn) {
                overlayCloseBtn.addEventListener('click', function() {
                    customOverlay.setMap(null);
                });
            }

            window.overlay = customOverlay;
        });  

            
        window.kakao.maps.event.addListener(map, 'click', function () {      
            customOverlay.setMap(null);
        });
            
        window.kakao.maps.event.addListener(map, 'dragend', function () {      
            customOverlay.setMap(null);
        });
        
        window.kakao.maps.event.addListener(map, 'zoom_changed', function() {
            customOverlay.setMap(null);
        });

        return marker;
    };       

    return (
        <div>
            <div id="map" style={{ width: "100vw", height: "100vh"}} />
        </div>
    );
};

export default Map;
