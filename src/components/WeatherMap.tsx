import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTemperatureHigh, FaCloudRain, FaCloud } from 'react-icons/fa';
import { WiDaySunny } from 'react-icons/wi';
import axios from 'axios';
import './WeatherMap.css';

// レイヤー定義の型
type LayerType = 'standard' | 'pale' | 'english' | 'temperature' | 'precipitation' | 'weather' | 'wind' | 'cloud';

interface LayerConfig {
  name: string;
  url: string;
  attribution: string;
  opacity?: number;
}

interface LayersConfig {
  [key: string]: LayerConfig;
}

interface WeatherData {
  id: number;
  name: string;
  lat: number;
  lon: number;
  temperature: number;
  precipitation: number;
  weather: string;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
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
    url: 'https://example.com/temperature/{z}/{x}/{y}.png',
    attribution: '気温データ',
    opacity: 0.7
  },
  precipitation: {
    name: '降水量',
    url: 'https://example.com/precipitation/{z}/{x}/{y}.png',
    attribution: '降水量データ',
    opacity: 0.7
  },
  weather: {
    name: '天気',
    url: 'https://example.com/weather/{z}/{x}/{y}.png',
    attribution: '天気データ',
    opacity: 0.7
  },
  wind: {
    name: '風',
    url: 'https://example.com/wind/{z}/{x}/{y}.png',
    attribution: '風データ',
    opacity: 0.7
  },
  cloud: {
    name: '雲',
    url: 'https://example.com/cloud/{z}/{x}/{y}.png',
    attribution: '雲データ',
    opacity: 0.7
  }
};

const WeatherMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [currentLayer, setCurrentLayer] = useState<LayerType>('standard');
  const [currentTime, setCurrentTime] = useState<string>('15:00');
  const [timePosition, setTimePosition] = useState<number>(50);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [opacity, setOpacity] = useState<number>(0.7);
  const [selectedMarker, setSelectedMarker] = useState<WeatherData | null>(null);

  // 気象データの取得
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // 実際のAPIエンドポイントに置き換える必要があります
        const response = await axios.get('https://api.example.com/weather');
        setWeatherData(response.data);
      } catch (error) {
        console.error('気象データの取得に失敗しました:', error);
      }
    };

    fetchWeatherData();
  }, [currentTime]);

  // 地図の初期化
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([35.6812, 139.7671], 10);
      mapRef.current = map;

      // 国土地理院の地図レイヤー
      const stdLayer = L.tileLayer(LAYERS.standard.url, {
        attribution: LAYERS.standard.attribution
      });

      stdLayer.addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // マーカーの更新
  useEffect(() => {
    if (mapRef.current && weatherData.length > 0) {
      // 既存のマーカーを削除
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });

      // 新しいマーカーを追加
      weatherData.forEach((data) => {
        const marker = L.marker([data.lat, data.lon], {
          icon: L.divIcon({
            className: 'weather-marker',
            html: `<div class="marker-content">${data.temperature}°C</div>`,
            iconSize: [30, 30]
          })
        });

        marker.on('click', () => {
          setSelectedMarker(data);
        });

        marker.addTo(mapRef.current!);
      });
    }
  }, [weatherData]);

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
        attribution: LAYERS[layerType].attribution,
        opacity: LAYERS[layerType].opacity || 1
      });
      newLayer.addTo(mapRef.current);
      
      setCurrentLayer(layerType);
    }
  };

  // 透明度の変更
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);

    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          layer.setOpacity(newOpacity);
        }
      });
    }
  };

  // タイムラインのハンドル移動
  const handleTimelineMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    
    setTimePosition(clampedPosition);
    
    const totalMinutes = 5 * 60;
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
            <FaTemperatureHigh />
          </button>
          <button 
            className={`control-button ${currentLayer === 'precipitation' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('precipitation')}
            title="降水量"
          >
            <FaCloudRain />
          </button>
          <button 
            className={`control-button ${currentLayer === 'weather' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('weather')}
            title="天気"
          >
            <WiDaySunny />
          </button>
          <button 
            className={`control-button ${currentLayer === 'wind' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('wind')}
            title="風"
          >
            <FaWind />
          </button>
          <button 
            className={`control-button ${currentLayer === 'cloud' ? 'active' : ''}`} 
            onClick={() => handleLayerChange('cloud')}
            title="雲"
          >
            <FaCloud />
          </button>
        </div>

        {/* 透明度コントロール */}
        <div className="opacity-control">
          <label>透明度: {Math.round(opacity * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={handleOpacityChange}
          />
        </div>

        {/* 地名ラベル */}
        <div className="city-label tokyo-label">東京</div>

        {/* ズームコントロール */}
        <div className="zoom-controls">
          <button className="zoom-button" onClick={() => mapRef.current?.zoomIn()}>+</button>
          <button className="zoom-button" onClick={() => mapRef.current?.zoomOut()}>-</button>
        </div>

        {/* マーカーポップアップ */}
        {selectedMarker && (
          <div className="marker-popup">
            <h3>{selectedMarker.name}</h3>
            <div className="weather-info">
              <div><FaTemperatureHigh /> 気温: {selectedMarker.temperature}°C</div>
              <div><FaCloudRain /> 降水量: {selectedMarker.precipitation}mm</div>
              <div><WiDaySunny /> 天気: {selectedMarker.weather}</div>
              <div><FaWind /> 風: {selectedMarker.windSpeed}m/s ({selectedMarker.windDirection}°)</div>
              <div><FaCloud /> 雲量: {selectedMarker.cloudCover}%</div>
            </div>
            <button className="close-button" onClick={() => setSelectedMarker(null)}>×</button>
          </div>
        )}
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