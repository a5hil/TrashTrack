'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Markers using Leaflet's divIcon to match your original Tailwind design
const createCustomIcon = (type) => {
  let htmlContent = '';
  
  if (type === 'active') {
    htmlContent = `
      <div class="relative flex items-center justify-center">
        <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13ec5b] opacity-75"></div>
        <div class="relative inline-flex rounded-full h-8 w-8 bg-[#13ec5b] border-2 border-white shadow-md items-center justify-center text-slate-900 font-bold">♻</div>
      </div>
    `;
  } else if (type === 'warning') {
    htmlContent = `
      <div class="relative flex items-center justify-center">
        <div class="relative inline-flex rounded-full h-8 w-8 bg-yellow-400 border-2 border-white shadow-md items-center justify-center text-slate-900 font-bold">!</div>
      </div>
    `;
  } else if (type === 'critical') {
    htmlContent = `
      <div class="relative flex items-center justify-center">
        <div class="relative inline-flex rounded-full h-8 w-8 bg-red-500 border-2 border-white shadow-md items-center justify-center text-white font-bold">X</div>
      </div>
    `;
  }

  return divIcon({
    className: 'custom-marker-icon',
    html: htmlContent,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Create bin icon with custom color
const createBinIcon = (color) => {
  const htmlContent = `
    <div class="relative flex items-center justify-center">
      <div class="relative inline-flex rounded-full h-10 w-10 border-3 border-white shadow-lg items-center justify-center text-2xl" style="background-color: ${color}">
        🗑️
      </div>
    </div>
  `;

  return divIcon({
    className: 'custom-bin-icon',
    html: htmlContent,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Create selection pin icon
const createSelectionIcon = () => {
  const htmlContent = `
    <div class="relative flex items-center justify-center">
      <div class="animate-bounce">
        <div class="relative inline-flex rounded-full h-12 w-12 bg-[#13ec5b] border-4 border-white shadow-xl items-center justify-center text-2xl">
          📍
        </div>
      </div>
    </div>
  `;

  return divIcon({
    className: 'custom-selection-icon',
    html: htmlContent,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// Component to update map view when center/zoom changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  
  return null;
}

export default function MapComponent({ 
  mapCenter, 
  mapZoom, 
  userLocation, 
  handleMarkerClick, 
  bins = [], 
  getBinColor, 
  handleMapClick,
  handleMarkerDetailsOpen,
  selectedCoordinates,
  isSelectingLocation
}) {
  return (
    <MapContainer 
      center={mapCenter} 
      zoom={mapZoom} 
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <MapUpdater center={mapCenter} zoom={mapZoom} />
      {handleMapClick && <MapClickHandler onMapClick={handleMapClick} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      {/* Markers - Show near user location or default India locations */}
      <Marker 
        position={userLocation ? [userLocation[0] + 0.002, userLocation[1] + 0.004] : [28.6139, 77.2090]} 
        icon={createCustomIcon('active')}
        eventHandlers={{
          click: () => {
            const pos = userLocation ? [userLocation[0] + 0.002, userLocation[1] + 0.004] : [28.6139, 77.2090];
            handleMarkerClick(pos);
            if (handleMarkerDetailsOpen) {
              handleMarkerDetailsOpen({
                type: 'active',
                title: 'Site #1024',
                status: 'Verified Active',
                description: 'Last cleaned: 2h ago',
                coordinates: pos
              });
            }
          }
        }}
      >
        <Popup>
          <strong>Site #1024</strong><br/>
          <span className="text-green-600">Verified Active</span><br/>
          <span className="text-xs text-slate-500">Last cleaned: 2h ago</span>
        </Popup>
      </Marker>

      <Marker 
        position={userLocation ? [userLocation[0], userLocation[1]] : [28.6129, 77.2295]} 
        icon={createCustomIcon('warning')}
        eventHandlers={{
          click: () => {
            const pos = userLocation ? [userLocation[0], userLocation[1]] : [28.6129, 77.2295];
            handleMarkerClick(pos);
            if (handleMarkerDetailsOpen) {
              handleMarkerDetailsOpen({
                type: 'warning',
                title: 'Report #8821',
                status: 'Pending Verification',
                coordinates: pos
              });
            }
          }
        }}
      >
        <Popup>
          <strong>Report #8821</strong><br/>
          <span className="text-yellow-600">Pending Verification</span>
        </Popup>
      </Marker>

      <Marker 
        position={userLocation ? [userLocation[0] - 0.005, userLocation[1] - 0.002] : [28.5355, 77.3910]} 
        icon={createCustomIcon('critical')}
        eventHandlers={{
          click: () => {
            const pos = userLocation ? [userLocation[0] - 0.005, userLocation[1] - 0.002] : [28.5355, 77.3910];
            handleMarkerClick(pos);
            if (handleMarkerDetailsOpen) {
              handleMarkerDetailsOpen({
                type: 'critical',
                title: 'Critical Overflow',
                status: 'Requires immediate attention',
                coordinates: pos
              });
            }
          }
        }}
      >
        <Popup>
          <strong>Critical Overflow</strong><br/>
          <span className="text-red-600">Requires immediate attention</span>
        </Popup>
      </Marker>

      {/* Render Waste Bins */}
      {bins.map((bin) => (
        <Marker
          key={bin.id}
          position={bin.coordinates}
          icon={createBinIcon(getBinColor(bin.category))}
          eventHandlers={{
            click: () => {
              if (handleMarkerDetailsOpen) {
                handleMarkerDetailsOpen({
                  type: 'bin',
                  ...bin
                });
              }
            }
          }}
        >
          <Popup>
            <div className="p-2">
              <strong className="text-base">{bin.locationName}</strong><br/>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: getBinColor(bin.category) }}>
                {bin.category}
              </span><br/>
              <span className="text-xs text-slate-500 mt-2 block">
                📍 {bin.coordinates[0].toFixed(4)}°, {bin.coordinates[1].toFixed(4)}°
              </span>
              <span className="text-xs text-slate-400 block">
                Added: {bin.addedAt}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Selection Marker */}
      {selectedCoordinates && isSelectingLocation && (
        <Marker
          position={selectedCoordinates}
          icon={createSelectionIcon()}
        >
          <Popup>
            <strong>Selected Location</strong><br/>
            <span className="text-xs text-slate-500">
              {selectedCoordinates[0].toFixed(6)}°, {selectedCoordinates[1].toFixed(6)}°
            </span>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
