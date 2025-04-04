import './App.css';
import WeatherMap from './components/WeatherMap';

// ダミーデータ
const csvFeatureCollections = { features: [] };
const config = { shikuchoson: "サンプル", tiles: [] };
const imageNames: string[] = [];
const shikuchosonBoundary = {
  bbox: [139.0, 35.0, 140.0, 36.0],
  geometry: {
    type: "Polygon",
    coordinates: [[[139.0, 35.0], [140.0, 35.0], [140.0, 36.0], [139.0, 36.0], [139.0, 35.0]]]
  }
};

function App() {
  return (
    <div className="App">
      <WeatherMap />
    </div>
  );
}

export default App;
