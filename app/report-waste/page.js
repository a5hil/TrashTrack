"use client";

import {
  Button,
  ConfigProvider,
  Form,
  Input,
  message,
  theme,
} from "antd";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { wasteAPI } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("@/app/ui/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full flex items-center justify-center bg-slate-800 text-slate-400 rounded-2xl border border-slate-700">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span>Loading Map...</span>
      </div>
    </div>
  ),
});

export default function ReportWastePage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState(null); // { lat, lng }
  const [userLocation, setUserLocation] = useState(null);
  const [userId, setUserId] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);

  // Get user ID from session
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.id);
    }
  }, []);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          // Auto-set current location as default
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      const hide = message.loading("Getting your location...", 0);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          hide();
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setLocation({ lat: latitude, lng: longitude });
          message.success("Location updated!");
        },
        (error) => {
          hide();
          console.error("Error getting location:", error);
          message.error("Failed to get location. Please check permissions.");
        },
      );
    } else {
      message.error("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (values) => {
    if (!userId) {
      message.error("Please log in to submit a report.");
      return;
    }

    if (!location) {
      message.error("Please select a location.");
      return;
    }

    try {
      setSubmitting(true);

      const reportData = {
        userId,
        wasteType: "waste_hotspot",
        quantity: 1,
        unit: "pieces",
        description: values.description || "Waste accumulation reported",
        binLocation: "Reported Waste Hotspot",
        coordinates: {
          latitude: location.lat,
          longitude: location.lng,
        },
      };

      const data = await wasteAPI.submitReport(reportData);

      if (data.success) {
        message.success({
          content: (
            <div className="flex flex-col gap-1">
              <span className="font-bold">Report Submitted!</span>
              <span className="text-xs">
                Thank you! Our team will review this location.
              </span>
            </div>
          ),
          duration: 5,
          icon: <CheckCircle className="text-emerald-500" />,
        });

        form.resetFields();
        setLocation(null);
        handleUseCurrentLocation();
      } else {
        message.error(data.message || "Failed to submit report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      message.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#13ec5b",
          colorBgContainer: "#1f2937",
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/find-bins">
                <Button
                  type="text"
                  shape="circle"
                  icon={<ArrowLeft className="w-5 h-5" />}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Report Waste Location
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Help us identify areas needing bins
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Info Card */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3">
              <div className="text-emerald-400 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-emerald-400 mb-1">How it works:</p>
                <p>Mark the location where you see waste accumulation. Multiple reports in the same area will be marked as high priority for bin placement.</p>
              </div>
            </div>

            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="flex-1 flex flex-col gap-6"
            >
              {/* Map */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Location on Map
                </label>
                <div className="relative min-h-[350px] rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                  <MapComponent
                    mapCenter={
                      location
                        ? [location.lat, location.lng]
                        : userLocation || [28.6139, 77.209]
                    }
                    mapZoom={16}
                    userLocation={userLocation}
                    isSelectingLocation={true}
                    selectedCoordinates={
                      location ? [location.lat, location.lng] : null
                    }
                    handleMapClick={(coords) => {
                      setLocation({ lat: coords[0], lng: coords[1] });
                    }}
                  />

                  {/* Current Location Button - Overlay on Map */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <Button
                      type="primary"
                      onClick={handleUseCurrentLocation}
                      className="bg-blue-600 hover:bg-blue-500 border-none shadow-lg"
                    >
                      📍 Use My Location
                    </Button>
                  </div>

                  {/* Instruction Overlay */}
                  {!location && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                      <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-lg border border-slate-700 text-sm animate-bounce">
                        Tap map to pin waste location
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Coordinates Display */}
                {location && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-300">
                    <p className="font-mono">
                      📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description Field */}
              <Form.Item
                label={
                  <span className="text-slate-300 font-medium">
                    Description (Optional)
                  </span>
                }
                name="description"
              >
                <Input.TextArea
                  placeholder="Describe the situation (e.g., large pile blocking sidewalk, attracting animals, etc.)"
                  rows={3}
                  maxLength={300}
                  showCount
                  className="bg-slate-900/50 border-slate-600 text-white rounded-xl"
                />
              </Form.Item>

              {/* Submit Button */}
              <div className="mt-auto pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  disabled={!location}
                  className="h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:bg-slate-700"
                >
                  Submit Report
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
