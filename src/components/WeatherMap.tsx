import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

const WeatherMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // 地図の初期化
    const map = L.map('map').setView([35.6812, 139.7671], 10);
    mapRef.current = map;

    // 国土地理院の地図レイヤー
    const stdLayer = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
    });

    // デフォルトレイヤーの設定
    stdLayer.addTo(map);

    // 地図のクリーンアップ
    return () => {
      map.remove();
    };
  }, []);

  // レイヤー切り替え
  const handleLayerChange = (layerType: string) => {
    if (mapRef.current) {
      // レイヤー切り替えの処理をここに実装
      console.log(`Switching to ${layerType} layer`);
    }
  };

  return (
    <div className="weather-map-container">
      <div className="map-area">
        <div id="map" className="map-container"></div>
        
        {/* コントロールパネル */}
        <div className="control-panel">
          <button className="control-button" onClick={() => handleLayerChange('temperature')}>🌡️</button>
          <button className="control-button" onClick={() => handleLayerChange('precipitation')}>💧</button>
          <button className="control-button" onClick={() => handleLayerChange('weather')}>🌤️</button>
          <button className="control-button" onClick={() => handleLayerChange('wind')}>➡️</button>
          <button className="control-button" onClick={() => handleLayerChange('cloud')}>☁️</button>
        </div>

        {/* 地名ラベル */}
        <div className="city-label tokyo-label">東京</div>

        {/* ズームコントロール */}
        <div className="zoom-controls">
          <button className="zoom-button" onClick={() => mapRef.current?.zoomIn()}>+</button>
          <button className="zoom-button" onClick={() => mapRef.current?.zoomOut()}>-</button>
        </div>
      </div>

      {/* タイムライン */}
      <div className="timeline-container">
        <div className="timeline-slider">
          <div className="timeline-track"></div>
          <div className="timeline-handle" style={{ left: '50%' }}></div>
        </div>
        <div className="time-labels">
          <span>13:00</span>
          <span>14:00</span>
          <span>15:00</span>
          <span>16:00</span>
          <span>17:00</span>
          <span>18:00</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherMap; 