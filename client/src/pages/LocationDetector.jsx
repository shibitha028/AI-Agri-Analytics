import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { detectLocation } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';

// Default marker icon fix for bundlers (Leaflet's default asset paths break under Vite)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const DEFAULT_CENTER = [11.0168, 76.9558]; // Coimbatore, as a sensible Tamil Nadu default

export default function LocationDetector() {
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState(null);
  const watchIdRef = useRef(null);

  // Location is only ever requested after the user explicitly clicks this button.
  const handleDetect = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await detectLocation({ latitude, longitude, save: true });
          setLocationData({ latitude, longitude, ...res });
          setTracking(true);
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. Please enable location access to use this feature.');
        } else {
          setError('Unable to detect your location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleStop = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const center = locationData ? [locationData.latitude, locationData.longitude] : DEFAULT_CENTER;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>📍 Detect My Location</h1>
          <p>Location is only requested after you explicitly click the button below. Nothing is tracked continuously.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card mb-3">
        <div className="flex-gap">
          {!tracking ? (
            <button className="btn btn-primary" onClick={handleDetect} disabled={loading}>
              {loading ? <span className="spinner"></span> : '📍 Detect My Location'}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleStop}>⏹ Stop Location</button>
          )}
        </div>

        {locationData && (
          <div className="location-status-grid">
            <div className="stat">
              <div className="label">Latitude</div>
              <div className="value">{locationData.latitude.toFixed(5)}</div>
            </div>
            <div className="stat">
              <div className="label">Longitude</div>
              <div className="value">{locationData.longitude.toFixed(5)}</div>
            </div>
            <div className="stat">
              <div className="label">Detected District</div>
              <div className="value">{locationData.detectedDistrict || 'Not determined'}</div>
            </div>
            <div className="stat">
              <div className="label">Location Status</div>
              <div className="value">{locationData.locationStatus}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card mb-3">
        <div className="card-title">🗺️ Map</div>
        <div className="map-container">
          <MapContainer center={center} zoom={locationData ? 11 : 7} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locationData && (
              <Marker position={[locationData.latitude, locationData.longitude]} icon={markerIcon}>
                <Popup>
                  Current Location<br />
                  District: {locationData.detectedDistrict || 'Unknown'}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {loading && <Loader label="Detecting location..." />}

      {locationData?.insight && (
        <div className="insight-banner">
          <span className="icon">🌾</span>
          <div>
            <h4>Location-Based Agricultural Insight</h4>
            <p>{locationData.insight}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
