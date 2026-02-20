'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Drawer } from 'vaul';
import { Recycle, Trash2, Leaf, AlertTriangle, Battery, Cross, BarChart3, Clock, MapPin, Map, CheckCircle2, Copy, AlertCircle, MoreHorizontal, Info, Check } from 'lucide-react';
import { Layout, Input, Button, Avatar, Badge, Tooltip, Modal, Form, Select, Card, List, Tag, Space, message } from 'antd';
import { binAPI } from '@/lib/api';
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  PlusOutlined,
  MinusOutlined,
  AimOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  CloseOutlined,
  LinkOutlined,
  CompassOutlined,
  MoreOutlined,
  CopyOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Header } = Layout;

// Dynamically import the map component with no SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-200">Loading map...</div>
});

export default function AdminDashboard() {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India center
  const [mapZoom, setMapZoom] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [isAddBinModalOpen, setIsAddBinModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [bins, setBins] = useState([]);
  const [form] = Form.useForm();
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  // Helper function to get category icon
  const getCategoryIcon = (category, className = "w-6 h-6") => {
    const iconMap = {
      'Recyclable': <Recycle className={className} />,
      'General Waste': <Trash2 className={className} />,
      'Organic': <Leaf className={className} />,
      'Hazardous': <AlertTriangle className={className} />,
      'E-waste': <Battery className={className} />,
      'Medical': <Cross className={className} />
    };
    return iconMap[category] || <Trash2 className={className} />;
  };

  // Get user's GPS location on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          console.log('GPS Location:', latitude, longitude);
        },
        (error) => {
          console.log('GPS not available, using default India location');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Fetch bins from database on mount
  useEffect(() => {
    const fetchBins = async () => {
      try {
        const response = await binAPI.getBins();
        if (response.success) {
          // Convert MongoDB response to expected format
          const formattedBins = response.data.map(bin => ({
            ...bin,
            id: bin._id, // MongoDB uses _id
            coordinates: [bin.latitude, bin.longitude],
            addedAt: new Date(bin.createdAt).toLocaleString()
          }));
          setBins(formattedBins);
        }
      } catch (error) {
        console.error('Error fetching bins:', error);
        message.error('Failed to load bins from database');
      }
    };

    fetchBins();
  }, []);

  const handleLocationClick = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    } else {
      // Try to get location again
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            setMapCenter([latitude, longitude]);
            setMapZoom(15);
          },
          (error) => {
            console.log('GPS permission denied or unavailable');
          }
        );
      }
    }
  };

  const handleMarkerClick = (position) => {
    setMapCenter(position);
    setMapZoom(18);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const handleAddBin = async (values) => {
    try {
      const coordinates = selectedCoordinates || [
        parseFloat(values.latitude) || mapCenter[0],
        parseFloat(values.longitude) || mapCenter[1]
      ];

      console.log('Adding bin with values:', {
        locationName: values.locationName,
        category: values.category,
        coordinates,
        selectedCoordinates
      });

      // Validate coordinates
      if (!coordinates || coordinates.length !== 2) {
        message.error('Invalid coordinates. Please select a location.');
        return;
      }

      if (typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
        message.error('Coordinates must be numbers');
        return;
      }

      // Call API to create bin in database
      const response = await binAPI.createBin({
        locationName: values.locationName,
        coordinates: coordinates,
        category: values.category
      });

      if (response.success) {
        const newBin = response.data;
        // Add to local state with formatted data
        const formattedBin = {
          ...newBin,
          id: newBin._id,
          coordinates: [newBin.latitude, newBin.longitude],
          addedAt: new Date(newBin.createdAt).toLocaleString()
        };
        
        setBins([...bins, formattedBin]);
        message.success(`${values.category} bin added successfully!`);
        setIsAddBinModalOpen(false);
        form.resetFields();
        setSelectedCoordinates(null);
        setIsSelectingLocation(false);
        
        // Zoom to the added bin location
        setMapCenter(coordinates);
        setMapZoom(16);
      } else {
        message.error(response.error || 'Failed to add bin');
      }
    } catch (error) {
      console.error('Error adding bin:', error);
      message.error(error.message || 'Failed to add bin. Please try again.');
    }
  };

  const handleDeleteBin = async (id) => {
    try {
      const response = await binAPI.deleteBin(id);
      if (response.success) {
        setBins(bins.filter(bin => bin.id !== id && bin._id !== id));
        message.success('Bin removed successfully!');
      }
    } catch (error) {
      console.error('Error deleting bin:', error);
      message.error('Failed to delete bin. Please try again.');
    }
  };

  const handleMapClick = (coords) => {
    if (isSelectingLocation) {
      setSelectedCoordinates(coords);
      form.setFieldsValue({
        latitude: coords[0].toFixed(6),
        longitude: coords[1].toFixed(6)
      });
      setMapCenter(coords);
      setMapZoom(16);
      message.success('Location selected! Click "Continue" to proceed.');
    }
  };

  const handleMarkerDetailsOpen = (markerData) => {
    setSelectedMarker(markerData);
    setIsDetailsDrawerOpen(true);
  };

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleSelectLocationMode = () => {
    setIsSelectingLocation(true);
    setIsAddBinModalOpen(false);
    message.info('Click on the map to select a location');
  };

  const handleCancelSelectLocation = () => {
    setIsSelectingLocation(false);
    setSelectedCoordinates(null);
    message.info('Selection cancelled');
  };

  const handleReopenModal = () => {
    setIsAddBinModalOpen(true);
    setIsSelectingLocation(false);
  };

  const copyCoordinates = (lat, lng) => {
    const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(coords).then(() => {
      message.success('Coordinates copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy coordinates');
    });
  };

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

  const handleUseMyLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      message.loading('Getting your location...', 0);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoordinates([latitude, longitude]);
          form.setFieldsValue({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          });
          setMapCenter([latitude, longitude]);
          setMapZoom(16);
          message.destroy();
          message.success('Location acquired successfully!');
        },
        (error) => {
          message.destroy();
          message.error('Failed to get location. Please enable GPS or enter manually.');
          console.error('GPS Error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      message.error('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="flex h-screen flex-col w-full font-display bg-[#f6f8f6] text-slate-900 overflow-hidden">
      
      {/* Top Navigation */}
      <Header className="flex z-50 relative items-center justify-between whitespace-nowrap border-b border-solid border-[#e7f3eb] bg-white/90 backdrop-blur-sm px-6 py-3 shadow-sm h-auto leading-normal">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-[#0d1b12]">
            <div className="size-8 text-[#13ec5b]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight m-0">EcoTrack Admin</h2>
          </div>
          
          <div className="hidden md:flex flex-col min-w-64 max-w-96">
            <Input 
              size="large" 
              placeholder="Search areas, markers or IDs" 
              prefix={<SearchOutlined className="text-[#4c9a66]" />} 
              className="bg-[#e7f3eb] border-none rounded-lg hover:bg-[#e7f3eb] focus:bg-[#e7f3eb]"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6">
            <a className="text-slate-900 text-sm font-medium hover:text-[#13ec5b] transition-colors" href="#">Dashboard</a>
            <a className="text-slate-500 text-sm font-medium hover:text-[#13ec5b] transition-colors" href="#">Reports</a>
            <a className="text-slate-500 text-sm font-medium hover:text-[#13ec5b] transition-colors" href="#">Users</a>
            <a className="text-slate-500 text-sm font-medium hover:text-[#13ec5b] transition-colors" href="#">Settings</a>
          </nav>
          <div className="flex gap-4 items-center">
            <Badge dot>
              <Button type="text" shape="circle" icon={<BellOutlined className="text-lg text-slate-600" />} />
            </Badge>
            <Button type="text" shape="circle" icon={<SettingOutlined className="text-lg text-slate-600" />} />
            <Avatar size="large" src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" className="cursor-pointer border-2 border-white shadow-sm" />
          </div>
        </div>
      </Header>

      {/* Main Content Area */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Interactive Map Layer */}
        <div className="absolute inset-0 z-0 bg-slate-200">
          <MapComponent 
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation}
            handleMarkerClick={handleMarkerClick}
            bins={bins}
            getBinColor={getBinColor}
            handleMapClick={handleMapClick}
            handleMarkerDetailsOpen={handleMarkerDetailsOpen}
            selectedCoordinates={selectedCoordinates}
            isSelectingLocation={isSelectingLocation}
          />

          {/* Floating Map Controls */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-[400]">
            <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col">
              <Button 
                type="text" 
                className="w-10 h-10 flex items-center justify-center text-slate-600" 
                icon={<PlusOutlined />} 
                onClick={handleZoomIn}
              />
              <div className="h-px w-full bg-slate-200 my-0.5"></div>
              <Button 
                type="text" 
                className="w-10 h-10 flex items-center justify-center text-slate-600" 
                icon={<MinusOutlined />} 
                onClick={handleZoomOut}
              />
            </div>
            <Tooltip title="My Location" placement="right">
              <Button 
                className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-slate-600 border-none" 
                icon={<AimOutlined />}
                onClick={handleLocationClick}
              />
            </Tooltip>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-2 z-[400]">
            <Tooltip title="View Bins List" placement="left">
              <Button 
                className="h-10 bg-white rounded-lg shadow-lg flex items-center gap-2 font-medium text-slate-700 border-none"
                icon={<UnorderedListOutlined />}
                onClick={() => setIsListModalOpen(true)}
              >
                Bins ({bins.length})
              </Button>
            </Tooltip>
            <Tooltip title="Add New Bin" placement="left">
              <Button 
                type="primary"
                className="h-10 bg-[#13ec5b] hover:bg-[#0ea641] rounded-lg shadow-lg flex items-center gap-2 font-medium text-slate-900 border-none"
                icon={<PlusOutlined />}
                onClick={() => setIsAddBinModalOpen(true)}
              >
                Add Bin
              </Button>
            </Tooltip>
          </div>

          {/* Floating Selection Panel */}
          {isSelectingLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-[500] min-w-[320px] border-4 border-[#13ec5b]">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#13ec5b]/20 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-[#13ec5b]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Select Location</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Click anywhere on the map to pin your location
                </p>
                
                {selectedCoordinates && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-700 font-medium mb-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Location Selected
                    </p>
                    <p className="text-xs text-slate-600 font-mono">
                      {selectedCoordinates[0].toFixed(6)}°, {selectedCoordinates[1].toFixed(6)}°
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    block
                    size="large"
                    onClick={handleCancelSelectLocation}
                    className="font-medium"
                  >
                    Cancel
                  </Button>
                  {selectedCoordinates && (
                    <Button 
                      block
                      size="large"
                      type="primary"
                      onClick={handleReopenModal}
                      className="bg-[#13ec5b] hover:bg-[#0ea641] text-slate-900 border-none font-semibold"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Bin Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EnvironmentOutlined className="text-[#13ec5b]" />
            <span>Add New Waste Bin</span>
          </div>
        }
        open={isAddBinModalOpen}
        onCancel={() => {
          setIsAddBinModalOpen(false);
          form.resetFields();
          setSelectedCoordinates(null);
          setIsSelectingLocation(false);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBin}
          className="mt-4"
        >
          <Form.Item
            label="Location Name"
            name="locationName"
            rules={[{ required: true, message: 'Please enter location name' }]}
          >
            <Input 
              placeholder="e.g., Central Park Entrance" 
              size="large"
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button
              block
              size="large"
              icon={<AimOutlined />}
              onClick={handleUseMyLocation}
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 font-medium"
            >
              Use GPS
            </Button>
            <Button
              block
              size="large"
              icon={<CompassOutlined />}
              onClick={handleSelectLocationMode}
              type={isSelectingLocation ? 'primary' : 'default'}
              className={isSelectingLocation ? 'bg-[#13ec5b] text-slate-900 border-none' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300'}
            >
              {isSelectingLocation ? 'Selecting...' : 'Pick from Map'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Latitude"
              name="latitude"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input 
                placeholder="e.g., 28.6139" 
                size="large"
                type="number"
                step="0.000001"
              />
            </Form.Item>

            <Form.Item
              label="Longitude"
              name="longitude"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input 
                placeholder="e.g., 77.2090" 
                size="large"
                type="number"
                step="0.000001"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Bin Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select size="large" placeholder="Select bin type">
              <Select.Option value="General Waste">
                <Tag color="default">General Waste</Tag>
              </Select.Option>
              <Select.Option value="Recyclable">
                <Tag color="green">Recyclable</Tag>
              </Select.Option>
              <Select.Option value="Organic">
                <Tag color="lime">Organic</Tag>
              </Select.Option>
              <Select.Option value="Hazardous">
                <Tag color="red">Hazardous</Tag>
              </Select.Option>
              <Select.Option value="E-waste">
                <Tag color="orange">E-waste</Tag>
              </Select.Option>
              <Select.Option value="Medical">
                <Tag color="pink">Medical</Tag>
              </Select.Option>
            </Select>
          </Form.Item>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Tip: Use GPS, pick from map, or enter coordinates manually
            </p>
            {selectedCoordinates && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-600 mb-0 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Location: {selectedCoordinates[0].toFixed(4)}°, {selectedCoordinates[1].toFixed(4)}°
                </p>
                {isSelectingLocation && (
                  <Button 
                    size="small" 
                    type="text" 
                    danger
                    onClick={handleCancelSelectLocation}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              size="large" 
              onClick={() => {
                setIsAddBinModalOpen(false);
                form.resetFields();
                setSelectedCoordinates(null);
                setIsSelectingLocation(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              className="flex-1 bg-[#13ec5b] hover:bg-[#0ea641] text-slate-900"
            >
              Add Bin
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Bins List Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UnorderedListOutlined className="text-[#13ec5b]" />
              <span>Waste Bins Management</span>
            </div>
            <Tag color="green">{bins.length} Total</Tag>
          </div>
        }
        open={isListModalOpen}
        onCancel={() => setIsListModalOpen(false)}
        footer={null}
        width={700}
      >
        {bins.length === 0 ? (
          <div className="text-center py-12">
            <EnvironmentOutlined className="text-6xl text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No bins added yet</p>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsListModalOpen(false);
                setIsAddBinModalOpen(true);
              }}
              className="bg-[#13ec5b] hover:bg-[#0ea641] text-slate-900"
            >
              Add Your First Bin
            </Button>
          </div>
        ) : (
          <List
            className="mt-4"
            dataSource={bins}
            renderItem={(bin) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => {
                      setMapCenter(bin.coordinates);
                      setMapZoom(18);
                      setIsListModalOpen(false);
                    }}
                  >
                    View on Map
                  </Button>,
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteBin(bin.id)}
                  >
                    Remove
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getBinColor(bin.category) }}
                    >
                      {getCategoryIcon(bin.category, 'w-6 h-6')}
                    </div>
                  }
                  title={
                    <Space>
                      <span className="font-semibold">{bin.locationName}</span>
                      <Tag color={getBinColor(bin.category)}>{bin.category}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {bin.coordinates[0].toFixed(4)}°, {bin.coordinates[1].toFixed(4)}°
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Added: {bin.addedAt}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Desktop Details Panel */}
      {selectedMarker && (
        <div className="hidden md:block fixed left-4 top-24 bottom-4 w-96 bg-[#f6f8f6] rounded-2xl shadow-2xl border border-slate-200 z-[600] overflow-hidden">
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 bg-[#f6f8f6] px-6 pt-6 pb-4 border-b border-slate-200 z-10">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bin Details</h2>
                <div className="flex gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-[#13ec5b] transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={() => setSelectedMarker(null)}
                    size="small"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-red-500"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">View bin information and status</p>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Category Display */}
              <div className="flex justify-center pt-4 pb-6">
                <div className="flex flex-col items-center gap-3 px-8 py-4 rounded-2xl bg-[#13ec5b] shadow-lg">
                  <div className="text-slate-900">
                    {getCategoryIcon(selectedMarker.category || 'General Waste', 'w-12 h-12')}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedMarker.category || 'General Waste'}
                  </span>
                </div>
              </div>

              {/* Coordinates Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#13ec5b]/20 text-[#13ec5b] shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Coordinates</span>
                      <div className="font-mono text-sm text-slate-900 font-medium">
                        {selectedMarker.coordinates[0].toFixed(4)}° N <span className="text-slate-400 mx-1">|</span> {selectedMarker.coordinates[1].toFixed(4)}° E
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyCoordinates(selectedMarker.coordinates[0], selectedMarker.coordinates[1])}
                    className="text-[#13ec5b] hover:text-[#0ea641] hover:bg-[#13ec5b]/10 transition-all p-2 rounded-lg"
                    title="Copy coordinates"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Current Status</h3>
                  <span className="inline-flex items-center rounded-full bg-[#13ec5b]/20 px-2 py-0.5 text-xs font-medium text-[#13ec5b] ring-1 ring-inset ring-[#13ec5b]/30">
                    Active
                  </span>
                </div>
                
                {/* Grid Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Capacity Card */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-slate-500">Capacity</span>
                      <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-2xl font-bold text-slate-900">85</span>
                      <span className="text-sm font-medium text-[#13ec5b] mb-1">%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-[#13ec5b] w-[85%]"></div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">Almost full</p>
                  </div>

                  {/* Last Service Card */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-slate-500">Last Service</span>
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-2xl font-bold text-slate-900">2</span>
                      <span className="text-sm font-medium text-slate-500 mb-1">days ago</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-[#13ec5b]" />
                      <p className="text-[10px] text-slate-400">Schedule on track</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <button 
                    onClick={() => openInGoogleMaps(selectedMarker.coordinates[0], selectedMarker.coordinates[1])}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border-2 border-[#13ec5b] py-4 px-4 text-sm font-bold text-[#13ec5b] hover:bg-[#13ec5b] hover:text-slate-900 hover:border-[#0ea641] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                  >
                    <Map className="w-5 h-5" />
                    <span>Open in Google Maps</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Details Drawer */}
      <Drawer.Root open={isDetailsDrawerOpen && selectedMarker} onOpenChange={setIsDetailsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[700] md:hidden" />
          <Drawer.Content className="bg-[#f6f8f6] flex flex-col rounded-t-[2rem] fixed bottom-0 left-0 right-0 z-[800] md:hidden border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col overflow-y-auto max-h-[85vh]">
              {/* Handle */}
              <div className="flex w-full items-center justify-center pt-4 pb-2">
                <div className="h-1.5 w-12 rounded-full bg-slate-300"></div>
              </div>
              
              {selectedMarker && (
                <>
                  {/* Header */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bin Details</h2>
                      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-[#13ec5b] transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">View bin information and status</p>
                  </div>

                  {/* Category Display */}
                  <div className="flex justify-center px-6 pb-6 pt-2">
                    <div className="flex flex-col items-center gap-3 px-8 py-4 rounded-2xl bg-[#13ec5b] shadow-lg">
                      <div className="text-slate-900">
                        {getCategoryIcon(selectedMarker.category || 'General Waste', 'w-12 h-12')}
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {selectedMarker.category || 'General Waste'}
                      </span>
                    </div>
                  </div>

                  {/* Coordinates Bar */}
                  <div className="px-6 mb-6">
                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#13ec5b]/20 text-[#13ec5b] shadow-sm">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Coordinates</span>
                          <div className="font-mono text-sm text-slate-900 font-medium">
                            {selectedMarker.coordinates[0].toFixed(4)}° N <span className="text-slate-400 mx-1">|</span> {selectedMarker.coordinates[1].toFixed(4)}° E
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyCoordinates(selectedMarker.coordinates[0], selectedMarker.coordinates[1])}
                        className="text-[#13ec5b] hover:text-[#0ea641] hover:bg-[#13ec5b]/10 transition-all p-2 rounded-lg"
                        title="Copy coordinates"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="px-6 pb-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900">Current Status</h3>
                      <span className="inline-flex items-center rounded-full bg-[#13ec5b]/20 px-2 py-0.5 text-xs font-medium text-[#13ec5b] ring-1 ring-inset ring-[#13ec5b]/30">
                        Active
                      </span>
                    </div>
                    
                    {/* Grid Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Capacity Card */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-slate-500">Capacity</span>
                          <BarChart3 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-2xl font-bold text-slate-900">85</span>
                          <span className="text-sm font-medium text-[#13ec5b] mb-1">%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#13ec5b] w-[85%]"></div>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400">Almost full</p>
                      </div>

                      {/* Last Service Card */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-slate-500">Last Service</span>
                          <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex items-end gap-1 mb-1">
                          <span className="text-2xl font-bold text-slate-900">2</span>
                          <span className="text-sm font-medium text-slate-500 mb-1">days ago</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle2 className="w-4 h-4 text-[#13ec5b]" />
                          <p className="text-[10px] text-slate-400">Schedule on track</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6">
                      <button 
                        onClick={() => openInGoogleMaps(selectedMarker.coordinates[0], selectedMarker.coordinates[1])}
                        className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#13ec5b] py-4 px-4 text-sm font-bold text-slate-900 shadow-lg hover:bg-[#0ea641] active:scale-[0.98] transition-all"
                      >
                        <Map className="w-5 h-5" />
                        <span>Open in Google Maps</span>
                      </button>
                    </div>
                  </div>

                  {/* iOS Home Indicator Spacing */}
                  <div className="h-6 w-full"></div>
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
