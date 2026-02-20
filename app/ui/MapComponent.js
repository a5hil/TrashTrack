"use client";

import { divIcon } from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Custom Map Markers using Leaflet's divIcon to match your original Tailwind design
const createCustomIcon = (type) => {
  let htmlContent = "";

  if (type === "active") {
    htmlContent = `
      <div class="relative flex items-center justify-center">
        <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13ec5b] opacity-75"></div>
        <div class="relative inline-flex rounded-full h-8 w-8 bg-[#13ec5b] border-2 border-white shadow-md items-center justify-center text-slate-900 font-bold">♻</div>
      </div>
    `;
  } else if (type === "warning") {
    htmlContent = `
      <div class="relative flex items-center justify-center">
        <div class="relative inline-flex rounded-full h-8 w-8 bg-yellow-400 border-2 border-white shadow-md items-center justify-center text-slate-900 font-bold">!</div>
      </div>
    `;
  } else if (type === "critical") {
    htmlContent = `
      <div class="relative flex items-center justify-center">
        <div class="relative inline-flex rounded-full h-8 w-8 bg-red-500 border-2 border-white shadow-md items-center justify-center text-white font-bold">X</div>
      </div>
    `;
  }

  return divIcon({
    className: "custom-marker-icon",
    html: htmlContent,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Create waste report pin icon
const createWasteReportIcon = () => {
  const htmlContent = `
    <div class="relative flex items-center justify-center">
      <div class="w-6 h-8 bg-orange-500 rounded-b-full border-2 border-orange-600 shadow-lg flex items-center justify-center text-white">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
      <div class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-orange-600"></div>
    </div>
  `;

  return divIcon({
    className: "custom-waste-report-icon",
    html: htmlContent,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
  });
};

// Create bin icon with custom color
const createBinIcon = (color) => {
  const htmlContent = `
    <div class="relative flex items-center justify-center">
      <div class="relative inline-flex rounded-full h-10 w-10 border-3 border-white shadow-lg items-center justify-center" style="background-color: ${color}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12zM10 11v6M14 11v6" />
        </svg>
      </div>
    </div>
  `;

  return divIcon({
    className: "custom-bin-icon",
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
    className: "custom-selection-icon",
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
    },
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
  isSelectingLocation,
  wasteReports = [],
}) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      zoomControl={false}
      className="h-full w-full min-h-[400px]"
    >
      <MapUpdater center={mapCenter} zoom={mapZoom} />
      {handleMapClick && <MapClickHandler onMapClick={handleMapClick} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

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
                  type: "bin",
                  ...bin,
                });
              }
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <strong className="text-base">{bin.locationName}</strong>
              <br />
              <span
                className="inline-block mt-1 px-2 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: getBinColor(bin.category) }}
              >
                {bin.category}
              </span>
              <br />
              <span className="text-xs text-slate-500 mt-2 block">
                📍 {bin.coordinates[0].toFixed(4)}°,{" "}
                {bin.coordinates[1].toFixed(4)}°
              </span>
              <span className="text-xs text-slate-400 block">
                Added: {bin.addedAt}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Waste Report Markers */}
      {wasteReports.map((report, idx) => (
        <Marker
          key={`waste-${idx}`}
          position={[report.coordinates.latitude, report.coordinates.longitude]}
          icon={createWasteReportIcon()}
          eventHandlers={{
            click: () => {
              if (handleMarkerDetailsOpen) {
                handleMarkerDetailsOpen({
                  type: "waste_report",
                  title: "Waste Report",
                  reportedAt: report.reportedAt,
                  coordinates: [report.coordinates.latitude, report.coordinates.longitude],
                  description: report.description,
                });
              }
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <strong className="text-base">Waste Hotspot Report</strong>
              <br />
              <span className="text-xs text-slate-600 block mt-1">
                {new Date(report.reportedAt).toLocaleString()}
              </span>
              {report.description && (
                <span className="text-xs text-slate-500 block mt-1">
                  {report.description}
                </span>
              )}
              <span className="text-xs text-slate-500 mt-2 block">
                📍 {report.coordinates.latitude.toFixed(6)}°,{" "}
                {report.coordinates.longitude.toFixed(6)}°
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Selection Marker */}
      {selectedCoordinates && isSelectingLocation && (
        <Marker position={selectedCoordinates} icon={createSelectionIcon()}>
          <Popup>
            <strong>Selected Location</strong>
            <br />
            <span className="text-xs text-slate-500">
              {selectedCoordinates[0].toFixed(6)}°,{" "}
              {selectedCoordinates[1].toFixed(6)}°
            </span>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
