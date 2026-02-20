'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { 
  Recycle, 
  MapPin, 
  Award, 
  Leaf,
  Zap,
  Users,
  ArrowRight,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser, clearUserSession } from '@/lib/auth';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated();
    const currentUser = getCurrentUser();
    
    setIsAuth(authenticated);
    if (authenticated && currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
    setIsAuth(false);
    router.push('/login');
  };

  // If not authenticated, show login prompt instead of main content
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">TrashTrack</h1>
            <p className="text-xl text-slate-300">Manage Waste, Earn Rewards</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 border border-slate-700 space-y-6">
            <p className="text-lg text-slate-300">Please log in to access TrashTrack</p>
            <Link href="/login" className="inline-block w-full">
              <Button 
                type="primary"
                size="large"
                block
                className="bg-[#13ec5b] text-slate-900 font-bold text-base h-12 border-none hover:bg-[#0ea641]"
              >
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#13ec5b]/20 rounded-lg flex items-center justify-center text-[#13ec5b] font-bold text-xl">
            ♻️
          </div>
          <h1 className="text-2xl font-bold">TrashTrack</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">Welcome, <strong>{user.username}</strong></span>
              <Button 
                type="text" 
                className="text-white hover:text-red-400 h-10 flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
          <Link href="/find-bins">
            <Button 
              type="primary"
              className="bg-[#13ec5b] text-slate-900 font-semibold h-10 border-none hover:bg-[#0ea641]"
            >
              Find Bins
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                Manage Waste,
                <span className="text-[#13ec5b]"> Earn Rewards</span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                TrashTrack makes responsible waste management easy. Categorize your waste, find nearby disposal facilities, and earn credits for every contribution to a cleaner planet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/find-bins" className="flex-1">
                <Button 
                  type="primary"
                  size="large"
                  block
                  className="bg-[#13ec5b] text-slate-900 font-bold text-base h-14 border-none hover:bg-[#0ea641] shadow-lg shadow-[#13ec5b]/30"
                >
                  Start Finding Bins <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Button>
              </Link>
              <Button 
                size="large"
                block
                className="border border-slate-600 text-white hover:bg-slate-800 text-base h-14"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Bins Available</p>
                <p className="text-3xl font-bold text-[#13ec5b]">500+</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Active Users</p>
                <p className="text-3xl font-bold text-[#13ec5b]">10K+</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Waste Recorded</p>
                <p className="text-3xl font-bold text-[#13ec5b]">50T</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 lg:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#13ec5b]/20 to-transparent rounded-3xl blur-2xl"></div>
            <div className="relative h-full bg-slate-800/50 backdrop-blur rounded-3xl border border-slate-700 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-6 p-8">
                <div className="inline-block bg-[#13ec5b]/20 p-6 rounded-2xl">
                  <MapPin className="w-24 h-24 text-[#13ec5b]" />
                </div>
                <h3 className="text-2xl font-bold">Locate & Dispose</h3>
                <p className="text-slate-300">Find the nearest waste disposal facilities in your area</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-y border-slate-700">
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4">How TrashTrack Works</h2>
          <p className="text-xl text-slate-300">A smarter approach to waste management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 hover:border-[#13ec5b]/50 transition-all group">
            <div className="inline-block bg-[#13ec5b]/20 p-4 rounded-xl mb-6 group-hover:bg-[#13ec5b]/30 transition-all">
              <Recycle className="w-8 h-8 text-[#13ec5b]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Categorize Waste</h3>
            <p className="text-slate-400">Sort your waste into proper categories: recyclable, organic, hazardous, e-waste, medical, and general waste.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 hover:border-[#13ec5b]/50 transition-all group">
            <div className="inline-block bg-[#13ec5b]/20 p-4 rounded-xl mb-6 group-hover:bg-[#13ec5b]/30 transition-all">
              <MapPin className="w-8 h-8 text-[#13ec5b]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Find Bins</h3>
            <p className="text-slate-400">Discover nearby waste disposal bins and facilities with real-time distance calculations and status updates.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 hover:border-[#13ec5b]/50 transition-all group">
            <div className="inline-block bg-[#13ec5b]/20 p-4 rounded-xl mb-6 group-hover:bg-[#13ec5b]/30 transition-all">
              <BarChart3 className="w-8 h-8 text-[#13ec5b]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Track Impact</h3>
            <p className="text-slate-400">Monitor your waste disposal metrics and see how much you're contributing to environmental sustainability.</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 hover:border-[#13ec5b]/50 transition-all group">
            <div className="inline-block bg-[#13ec5b]/20 p-4 rounded-xl mb-6 group-hover:bg-[#13ec5b]/30 transition-all">
              <Award className="w-8 h-8 text-[#13ec5b]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Earn Credits</h3>
            <p className="text-slate-400">Get rewarded with credits based on waste type, quantity, and proper disposal habits.</p>
          </div>
        </div>
      </section>

      {/* Why Choose TrashTrack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">Why Choose TrashTrack?</h2>
              <p className="text-xl text-slate-300">We're committed to making waste management accessible, rewarding, and impactful.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#13ec5b]/20 text-[#13ec5b]">
                    <Leaf className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Environment First</h3>
                  <p className="text-slate-400">Every action contributes to a cleaner, greener planet.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#13ec5b]/20 text-[#13ec5b]">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Easy to Use</h3>
                  <p className="text-slate-400">Simple interface designed for everyone to participate.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#13ec5b]/20 text-[#13ec5b]">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Community Driven</h3>
                  <p className="text-slate-400">Join thousands of people making a difference in waste management.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative h-96 lg:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#13ec5b]/20 to-transparent rounded-3xl blur-2xl"></div>
            <div className="relative h-full bg-slate-800/50 backdrop-blur rounded-3xl border border-slate-700 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-6 p-8">
                <div className="inline-block bg-[#13ec5b]/20 p-6 rounded-2xl">
                  <Award className="w-24 h-24 text-[#13ec5b]" />
                </div>
                <h3 className="text-2xl font-bold">Earn & Achieve</h3>
                <p className="text-slate-300">Get rewarded for responsible waste disposal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[#13ec5b]/20 to-slate-800/50 backdrop-blur rounded-3xl border border-[#13ec5b]/30 p-12 sm:p-16 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join the TrashTrack community today and be part of a movement toward responsible waste management and environmental sustainability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-bins">
              <Button 
                type="primary"
                size="large"
                className="bg-[#13ec5b] text-slate-900 font-bold text-base h-14 border-none hover:bg-[#0ea641] px-8 shadow-lg shadow-[#13ec5b]/30"
              >
                Start Now <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-[#13ec5b] transition">Features</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">Pricing</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-[#13ec5b] transition">About</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">Blog</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-[#13ec5b] transition">Docs</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">Support</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-[#13ec5b] transition">Privacy</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">Terms</a></li>
                <li><a href="#" className="hover:text-[#13ec5b] transition">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">© 2026 TrashTrack. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-[#13ec5b] transition">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-[#13ec5b] transition">Facebook</a>
              <a href="#" className="text-slate-400 hover:text-[#13ec5b] transition">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
