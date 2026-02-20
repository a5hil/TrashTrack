'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Leaf, Droplets, Zap, AlertCircle, Award } from 'lucide-react';
import { Button, Card, Tag, Statistic, Spin, Empty, message } from 'antd';
import { wasteAPI } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export default function MyContributionsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalWaste: 0,
    reportCount: 0,
    wasteBreakdown: {}
  });

  // Get user ID from session
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.id);
    } else {
      message.error('User information not found.');
    }
  }, []);

  // Fetch waste reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await wasteAPI.getReports(userId);
        if (response.success) {
          setReports(response.data);
          calculateStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        message.error('Failed to load your contributions.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  const calculateStats = (reportsList) => {
    let totalCredits = 0;
    let totalWaste = 0;
    const breakdown = {};

    reportsList.forEach(report => {
      totalCredits += report.creditsEarned || 0;
      totalWaste += report.quantity || 0;

      if (!breakdown[report.wasteType]) {
        breakdown[report.wasteType] = { quantity: 0, credits: 0, count: 0 };
      }
      breakdown[report.wasteType].quantity += report.quantity;
      breakdown[report.wasteType].credits += report.creditsEarned || 0;
      breakdown[report.wasteType].count += 1;
    });

    setStats({
      totalCredits: Math.round(totalCredits * 10) / 10,
      totalWaste: Math.round(totalWaste * 10) / 10,
      reportCount: reportsList.length,
      wasteBreakdown: breakdown
    });
  };

  const getWasteColor = (wasteType) => {
    const colors = {
      'General Waste': '#64748b',
      'Recyclable': '#13ec5b',
      'Organic': '#84cc16',
      'Hazardous': '#ef4444',
      'E-waste': '#f59e0b',
      'Medical': '#ec4899'
    };
    return colors[wasteType] || '#64748b';
  };

  const getWasteIcon = (wasteType) => {
    const icons = {
      'General Waste': '🗑️',
      'Recyclable': '♻️',
      'Organic': '🌱',
      'Hazardous': '⚠️',
      'E-waste': '🔌',
      'Medical': '🏥'
    };
    return icons[wasteType] || '🗑️';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/find-bins">
              <Button 
                type="text" 
                shape="circle" 
                icon={<ArrowLeft className="w-5 h-5 text-slate-300" />}
                className="text-slate-300 hover:text-white"
              />
            </Link>
            <div>
              <h1 className="text-xl font-bold">My Contributions</h1>
              <p className="text-xs text-slate-400">Track your waste disposal impact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" tip="Loading your contributions..." />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#13ec5b]/20 to-slate-800/50 border-[#13ec5b]/30">
                <Statistic
                  title={<span className="text-slate-300 text-sm">Total Credits</span>}
                  value={stats.totalCredits}
                  prefix={<Trophy className="w-5 h-5 text-[#13ec5b] mr-2" />}
                  valueStyle={{ color: '#13ec5b', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/20 to-slate-800/50 border-blue-500/30">
                <Statistic
                  title={<span className="text-slate-300 text-sm">Total Waste</span>}
                  value={stats.totalWaste}
                  suffix="kg"
                  valueStyle={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-slate-800/50 border-purple-500/30">
                <Statistic
                  title={<span className="text-slate-300 text-sm">Reports</span>}
                  value={stats.reportCount}
                  valueStyle={{ color: '#a855f7', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-slate-800/50 border-amber-500/30">
                <Statistic
                  title={<span className="text-slate-300 text-sm">Impact</span>}
                  value={Math.round((stats.totalWaste / 1000) * 100) / 100}
                  suffix="tons"
                  valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </div>

            {/* Waste Breakdown */}
            {stats.reportCount > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-[#13ec5b]" />
                  Waste Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(stats.wasteBreakdown).map(([wasteType, data]) => (
                    <div
                      key={wasteType}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: getWasteColor(wasteType) + '40', backgroundColor: getWasteColor(wasteType) + '10' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getWasteIcon(wasteType)}</span>
                          <div>
                            <h3 className="font-semibold text-white">{wasteType}</h3>
                            <p className="text-xs text-slate-400">{data.count} reports</p>
                          </div>
                        </div>
                        <Trophy className="w-5 h-5" style={{ color: getWasteColor(wasteType) }} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400">Quantity</p>
                          <p className="text-lg font-bold text-white">{data.quantity} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Credits</p>
                          <p className="text-lg font-bold" style={{ color: getWasteColor(wasteType) }}>
                            {data.credits}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Reports */}
            {stats.reportCount > 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#13ec5b]" />
                  Recent Reports
                </h2>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: getWasteColor(report.wasteType) + '30' }}
                          >
                            {getWasteIcon(report.wasteType)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{report.wasteType}</h3>
                            <p className="text-sm text-slate-400">{report.binLocation}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatDate(report.reportedAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: getWasteColor(report.wasteType) }}>
                            {report.creditsEarned}
                          </div>
                          <p className="text-xs text-slate-400">credits</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-600/50">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-300">
                            <strong>{report.quantity}</strong> {report.unit}
                          </span>
                          <Tag
                            color={getWasteColor(report.wasteType)}
                            className="border-0"
                            style={{ color: 'white' }}
                          >
                            {report.wasteType}
                          </Tag>
                          {report.verified && (
                            <Tag color="green" className="border-0" icon={<Award className="w-3 h-3" />}>
                              Verified
                            </Tag>
                          )}
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-sm text-slate-400 mt-3 italic">"{report.description}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-white mb-2">No Reports Yet</h3>
                      <p className="text-slate-400 mb-4">Start reporting waste disposal to earn credits and track your impact!</p>
                      <Link href="/report-waste">
                        <Button
                          type="primary"
                          className="bg-[#13ec5b] text-slate-900 font-bold border-none hover:bg-[#0ea641]"
                        >
                          Report Your First Waste
                        </Button>
                      </Link>
                    </div>
                  }
                />
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
