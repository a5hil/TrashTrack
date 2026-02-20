'use client';

import React, { useState } from 'react';
import { Layout, Input, Button, Avatar, Form, Radio, Upload, Badge, Tooltip } from 'antd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  CloudUploadOutlined,
  CloseOutlined,
  PlusOutlined,
  MinusOutlined,
  AimOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Dragger } = Upload;

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

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    console.log('Form Submitted:', values);
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
          <MapContainer 
            center={[40.7128, -74.0060]} 
            zoom={13} 
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Markers */}
            <Marker position={[40.7150, -74.0100]} icon={createCustomIcon('active')}>
              <Popup>
                <strong>Site #1024</strong><br/>
                <span className="text-green-600">Verified Active</span><br/>
                <span className="text-xs text-slate-500">Last cleaned: 2h ago</span>
              </Popup>
            </Marker>

            <Marker position={[40.7128, -74.0060]} icon={createCustomIcon('warning')}>
              <Popup>
                <strong>Report #8821</strong><br/>
                <span className="text-yellow-600">Pending Verification</span>
              </Popup>
            </Marker>

            <Marker position={[40.7080, -73.9980]} icon={createCustomIcon('critical')}>
              <Popup>
                <strong>Critical Overflow</strong><br/>
                <span className="text-red-600">Requires immediate attention</span>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Floating Map Controls */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-[400]">
            <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col">
              <Button type="text" className="w-10 h-10 flex items-center justify-center text-slate-600" icon={<PlusOutlined />} />
              <div className="h-px w-full bg-slate-200 my-0.5"></div>
              <Button type="text" className="w-10 h-10 flex items-center justify-center text-slate-600" icon={<MinusOutlined />} />
            </div>
            <Tooltip title="My Location" placement="right">
              <Button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-slate-600 border-none" icon={<AimOutlined />} />
            </Tooltip>
          </div>

          <div className={`absolute top-6 transition-all duration-300 z-[400] ${isSidebarOpen ? 'right-[390px]' : 'right-6'}`}>
            <Button className="h-10 bg-white rounded-lg shadow-lg flex items-center gap-2 font-medium text-slate-700 border-none" icon={<DatabaseOutlined />}>
              Map Layers
            </Button>
          </div>
        </div>

        {/* Floating Right Sidebar using AntD Form */}
        <div 
          className={`absolute top-4 right-4 bottom-4 w-[360px] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-100 z-[500] transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg m-0">New Report</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-0">Submit illegal dumping or new site</p>
            </div>
            <Button type="text" icon={<CloseOutlined />} onClick={() => setIsSidebarOpen(false)} />
          </div>

          {/* Sidebar Form Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ severity: 'medium' }}>
              
              <Form.Item label="COORDINATES" name="coordinates">
                <Input 
                  prefix={<EnvironmentOutlined className="text-[#13ec5b]" />} 
                  value="40.7128° N, 74.0060° W" 
                  readOnly 
                  className="bg-[#13ec5b]/10 border-[#13ec5b]/20 font-mono text-sm py-2"
                  suffix={<span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">Auto-filled</span>}
                />
              </Form.Item>

              <Form.Item label="LOCATION NAME" name="locationName">
                <Input placeholder="e.g. Behind Central Market" size="large" className="bg-slate-50 text-sm" />
              </Form.Item>

              <Form.Item label="SEVERITY" name="severity">
                <Radio.Group className="w-full grid grid-cols-3 gap-2" optionType="button" buttonStyle="solid">
                  <Radio.Button value="low" className="text-center rounded-lg border-slate-200">Low</Radio.Button>
                  <Radio.Button value="medium" className="text-center rounded-lg border-slate-200">Medium</Radio.Button>
                  <Radio.Button value="high" className="text-center rounded-lg border-slate-200">High</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="DESCRIPTION" name="description">
                <TextArea placeholder="Describe the waste type and volume..." rows={3} className="bg-slate-50 text-sm resize-none" />
              </Form.Item>

              <Form.Item label="EVIDENCE PHOTOS" name="photos">
                <Dragger className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#13ec5b]">
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined className="text-slate-400 text-3xl" />
                  </p>
                  <p className="text-sm text-slate-500 mb-1"><span className="font-semibold text-slate-700">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                </Dragger>
              </Form.Item>
            </Form>
          </div>

          {/* Sidebar Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 backdrop-blur rounded-b-xl">
            <div className="flex gap-3">
              <Button size="large" className="flex-1 font-medium text-slate-700 bg-white" onClick={() => form.resetFields()}>
                Cancel
              </Button>
              <Button size="large" type="primary" className="flex-1 font-bold bg-[#13ec5b] text-[#0d1b12] hover:bg-green-400 border-none shadow-lg shadow-green-500/20" onClick={() => form.submit()}>
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
