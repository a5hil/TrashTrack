'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Drawer } from 'vaul';
import { binAPI } from '@/lib/api';
import { 
  MapPin, 
  Navigation, 
  List as ListIcon, 
  X, 
  MapIcon,
  Trash2,
  Trophy
} from 'lucide-react';
import { Button, Tag, Skeleton, message } from 'antd';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('@/app/ui/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">Loading map...</div>
});

// Helper for distance calculation (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default function FindBinsPage() {
  const [bins, setBins] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India
  const [mapZoom, setMapZoom] = useState(5);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState(null);

  // Fetch bins on mount
  useEffect(() => {
    const fetchBins = async () => {
      try {
        setLoading(true);
        const response = await binAPI.getBins();
        if (response.success) {
          const formattedBins = response.data.map(bin => ({
            ...bin,
            id: bin._id,
            coordinates: [bin.latitude, bin.longitude],
            addedAt: new Date(bin.createdAt).toLocaleString()
          }));
          setBins(formattedBins);
        }
      } catch (error) {
        console.error('Error fetching bins:', error);
        message.error('Failed to load bins.');
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, []);

  // Get User Location
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
        },
        (error) => {
          console.log('GPS not available, using default location');
          message.warning('Could not get your location. Showing default map view.');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Calculate distances and sort by nearest
  const nearbyBins = useMemo(() => {
    if (!userLocation || bins.length === 0) return bins;

    return bins.map(bin => {
      const distance = getDistanceFromLatLonInKm(
        userLocation[0], userLocation[1],
        bin.coordinates[0], bin.coordinates[1]
      );
      return { ...bin, distance };
    }).sort((a, b) => a.distance - b.distance);
  }, [bins, userLocation]);

  const handleMarkerClick = (pos) => {
    setMapCenter(pos);
    setMapZoom(18);
    // Find the bin at this position to select it
    const bin = bins.find(b => b.coordinates[0] === pos[0] && b.coordinates[1] === pos[1]);
    if (bin) {
        setSelectedBin(bin);
        setIsDrawerOpen(true);
    }
  };
  
  const handleCenterUser = () => {
      if (userLocation) {
          setMapCenter(userLocation);
          setMapZoom(16);
      } else {
          message.info('User location not available yet.');
      }
  }

  const getBinColor = (category) => {
    const colors = {
      'General Waste': '#64748b',
      'Recyclable': '#13ec5b',
      'Organic': '#84cc16',
      'Hazardous': '#ef4444',
      'E-waste': '#f59e0b',
      'Medical': '#ec4899'
    };
    return colors[category] || '#64748b';
  };

  const formatDistance = (dist) => {
      if (dist < 1) {
          return `${(dist * 1000).toFixed(0)} m`;
      }
      return `${dist.toFixed(1)} km`;
  };

  return (
    <div className="flex h-screen w-full flex-col bg-white overflow-hidden font-display">
      
      {/* Header / Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-[400] p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-3 flex items-center gap-3 border border-slate-100">
             <div className="bg-[#13ec5b]/10 p-2 rounded-xl text-[#13ec5b]">
                 <MapPin className="w-6 h-6" />
             </div>
             <div className="flex-1">
                 <h1 className="text-sm font-bold text-slate-900 leading-tight">Find Bins</h1>
                 <p className="text-xs text-slate-500">Locate waste disposal nearby</p>
             </div>
             <Link href="/my-contributions">
                <Button type="text" shape="circle" icon={<Trophy className="w-5 h-5 text-slate-600" />} />
             </Link>
             <Link href="/">
                <Button type="text" shape="circle" icon={<X className="w-5 h-5 text-slate-600" />} />
             </Link>
          </div>
      </div>

      {/* Map Layer */}
      <div className="flex-1 relative z-0">
        <MapComponent 
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation}
            bins={bins}
            handleMarkerClick={handleMarkerClick}
            getBinColor={getBinColor}
        />

        {/* Floating Action Button (FAB) - Visible on Mobile */}
        <div className="absolute bottom-8 right-6 z-[400] flex flex-col gap-3">
            <Link href="/report-waste">
              <button 
                  className="w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform border border-orange-600 hover:bg-orange-600"
                  title="Report waste disposal"
              >
                  <Trash2 className="w-6 h-6" />
              </button>
            </Link>
            <button 
                onClick={handleCenterUser}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 active:scale-95 transition-transform border border-slate-100"
                title="Center on my location"
            >
                <Navigation className="w-6 h-6" />
            </button>
            <button 
                onClick={() => {
                    setSelectedBin(null);
                    setIsDrawerOpen(true);
                }}
                className="w-14 h-14 bg-[#13ec5b] rounded-2xl shadow-xl shadow-[#13ec5b]/30 flex items-center justify-center text-slate-900 active:scale-95 transition-transform font-bold"
                title="Show nearby bins"
            >
                <ListIcon className="w-7 h-7" />
            </button>
        </div>
      </div>

      {/* Nearby Bins Drawer */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[500]" />
          <Drawer.Content className="bg-slate-50 flex flex-col rounded-t-[32px] mt-24 h-[85vh] fixed bottom-0 left-0 right-0 z-[600] border-t border-slate-200 shadow-2xl focus:outline-none">
            
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 bg-white rounded-t-[32px]">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="px-6 pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">
                        {selectedBin ? 'Bin Details' : 'Nearby Bins'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {selectedBin 
                            ? 'View details and get directions' 
                            : `${nearbyBins.length} bins found in your area`
                        }
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <Skeleton active avatar key={i} />)}
                        </div>
                    ) : selectedBin ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Selected Bin Detail View */}
                            <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div 
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                                        style={{ backgroundColor: getBinColor(selectedBin.category) + '20' }}
                                    >
                                        <span>🗑️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{selectedBin.locationName}</h3>
                                        <Tag color={getBinColor(selectedBin.category)} className="mt-1 border-0 px-2 py-0.5 text-xs">
                                            {selectedBin.category}
                                        </Tag>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Distance</p>
                                        <p className="text-xl font-bold text-slate-900 mt-1">
                                            {selectedBin.distance ? formatDistance(selectedBin.distance) : '--'}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Status</p>
                                        <p className="text-xl font-bold text-slate-900 mt-1 capitalize">
                                            {selectedBin.status || 'Active'}
                                        </p>
                                    </div>
                                </div>

                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block
                                    className="bg-[#13ec5b] text-slate-900 font-bold h-12 shadow-lg shadow-[#13ec5b]/20 hover:bg-[#0ea641] border-none mb-3"
                                    onClick={() => {
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBin.coordinates[0]},${selectedBin.coordinates[1]}`, '_blank');
                                    }}
                                >
                                    Get Directions
                                </Button>

                                <Link href="/report-waste" className="w-full">
                                    <Button 
                                        type="default" 
                                        size="large" 
                                        block
                                        className="border-[#13ec5b] text-[#13ec5b] font-bold h-12 hover:bg-[#13ec5b]/10 mb-3"
                                        icon={<Trash2 className="w-5 h-5" />}
                                    >
                                        Report Waste Disposal
                                    </Button>
                                </Link>
                            </div>
                            
                            <Button type="text" block onClick={() => setSelectedBin(null)}>
                                Back to List
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {nearbyBins.length > 0 ? (
                                nearbyBins.map((bin) => (
                                    <div 
                                        key={bin.id}
                                        onClick={() => {
                                            setMapCenter(bin.coordinates);
                                            setMapZoom(18);
                                            setSelectedBin(bin);
                                        }}
                                        className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#13ec5b]/30 transition-all cursor-pointer flex items-center gap-4 active:scale-[0.98]"
                                    >
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0"
                                            style={{ backgroundColor: getBinColor(bin.category) + '20' }}
                                        >
                                            <span role="img" aria-label="bin">🗑️</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate">{bin.locationName}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                <span 
                                                    className="w-2 h-2 rounded-full" 
                                                    style={{ backgroundColor: getBinColor(bin.category) }}
                                                />
                                                {bin.category}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="block text-sm font-bold text-slate-900">
                                                {bin.distance !== undefined ? formatDistance(bin.distance) : '--'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                {bin.status || 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <MapIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No bins found near you</p>
                                    <p className="text-slate-400 text-sm mt-1">Enable location access to find nearby bins</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
