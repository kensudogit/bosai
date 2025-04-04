import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

// レイヤー定義の型
type LayerType = 'standard' | 'pale' | 'english' | 'temperature' | 'precipitation' | 'weather' | 'wind' | 'cloud';

interface LayerConfig {
  name: string;
  url: string;
  attribution: string;
}

interface LayersConfig {
  [key: string]: LayerConfig;
}

// レイヤー定義
const LAYERS: LayersConfig = {
  standard: {
    name: '標準地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
  },
  pale: {
    name: '淡色地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
  },
  english: {
    name: '英語版',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/english/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
  },
  temperature: {
    name: '気温',
    url: 'https://example.com/temperature/{z}/{x}/{y}.png', // 実際のURLに置き換える必要があります
    attribution: '気温データ'
  },
  precipitation: {
    name: '降水量',
    url: 'https://example.com/precipitation/{z}/{x}/{y}.png', // 実際のURLに置き換える必要があります
    attribution: '降水量データ'
  },
  weather: {
    name: '天気',
    url: 'https://example.com/weather/{z}/{x}/{y}.png', // 実際のURLに置き換える必要があります
    attribution: '天気データ'
  },
  wind: {
    name: '風',
    url: 'https://example.com/wind/{z}/{x}/{y}.png', // 実際のURLに置き換える必要があります
    attribution: '風データ'
  },
  cloud: {
    name: '雲',
    url: 'https://example.com/cloud/{z}/{x}/{y}.png', // 実際のURLに置き換える必要があります
    attribution: '雲データ'
  }
};

const WeatherMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [currentLayer, setCurrentLayer] = useState<LayerType>('standard');
  const [currentTime, setCurrentTime] = useState<string>('15:00');
  const [timePosition, setTimePosition] = useState<number>(50); // 0-100の値

  useEffect(() => {
    // 地図の初期化
    const map = L.map('map').setView([35.6812, 139.7671], 10);
    mapRef.current = map;

    // 国土地理院の地図レイヤー
    const stdLayer = L.tileLayer(LAYERS.standard.url, {
      attribution: LAYERS.standard.attribution
    });

    // デフォルトレイヤーの設定
    stdLayer.addTo(map);

    // 地図のクリーンアップ
    return () => {
      map.remove();
    };
  }, []);

  // レイヤー切り替え
  const handleLayerChange = (layerType: LayerType) => {
    if (mapRef.current) {
      // 現在のレイヤーを削除
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current?.removeLayer(layer);
        }
      });

      // 新しいレイヤーを追加
      const newLayer = L.tileLayer(LAYERS[layerType].url, {
        attribution: LAYERS[layerType].attribution
      });
      newLayer.addTo(mapRef.current);
      
      setCurrentLayer(layerType);
      console.log(`Switching to ${layerType} layer`);
    }
  };

  // タイムラインのハンドル移動
  const handleTimelineMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    
    setTimePosition(clampedPosition);
    
    // 時間の計算（13:00-18:00の範囲）
    const totalMinutes = 5 * 60; // 5時間 = 300分
    const minutes = Math.round((clampedPosition / 100) * totalMinutes);
    const hours = Math.floor(minutes / 60) + 13;
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    setCurrentTime(timeString);
  };

  return (
    <div className="weather-map-container">
      <div className="map-area">
        <div id="map" className="map-container"></div>
        
        {/* コントロールパネル */}
        <div className="control-panel">
          <button 
            className={`control-button ${currentLayer === 'standard' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('standard')}
            title="標準地図"
          >
            🗺️
          </button>
          <button 
            className={`control-button ${currentLayer === 'pale' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('pale')}
            title="淡色地図"
          >
            🗺️
          </button>
          <button 
            className={`control-button ${currentLayer === 'english' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('english')}
            title="英語版"
          >
            🗺️
          </button>
          <div className="control-separator"></div>
          <button 
            className={`control-button ${currentLayer === 'temperature' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('temperature')}
            title="気温"
          >
            🌡️
          </button>
          <button 
            className={`control-button ${currentLayer === 'precipitation' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('precipitation')}
            title="降水量"
          >
            💧
          </button>
          <button 
            className={`control-button ${currentLayer === 'weather' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('weather')}
            title="天気"
          >
            🌤️
          </button>
          <button 
            className={`control-button ${currentLayer === 'wind' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('wind')}
            title="風"
          >
            ➡️
          </button>
          <button 
            className={`control-button ${currentLayer === 'cloud' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('cloud')}
            title="雲"
          >
            ☁️
          </button>
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
        <div className="current-time">{currentTime}</div>
        <div className="timeline-slider" onClick={handleTimelineMove}>
          <div className="timeline-track" style={{ width: `${timePosition}%` }}></div>
          <div className="timeline-handle" style={{ left: `${timePosition}%` }}></div>
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