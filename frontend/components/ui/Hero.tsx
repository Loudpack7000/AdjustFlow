'use client';

import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                🚀 All-in-One Project Management Platform
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Streamline Your Workflow with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                AdjustFlow
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              The all-in-one project management platform that rivals Job Nimbus. 
              Manage projects, organize documents, track tasks, and build better client relationships—all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white border-2 border-slate-600 rounded-lg hover:border-slate-400 hover:bg-slate-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-slate-700">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-slate-400">Organized</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-slate-400">Access</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">Unlimited</div>
                <div className="text-sm text-slate-400">Projects</div>
              </div>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative">
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl overflow-hidden">
              {/* Dashboard Screenshot Container */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden border border-slate-600">
                {/* Try to load actual dashboard screenshot, fallback to mockup */}
                <div className="relative w-full h-full">
                  {/* Placeholder Mockup - Shows when image doesn't exist */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                    {/* Mock Dashboard UI */}
                    <div className="h-full flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                        <div className="h-4 w-32 bg-slate-600 rounded"></div>
                        <div className="h-8 w-8 bg-blue-500/30 rounded-full"></div>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="h-2 w-16 bg-slate-600 rounded mb-2"></div>
                          <div className="h-6 w-12 bg-blue-400/30 rounded"></div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="h-2 w-16 bg-slate-600 rounded mb-2"></div>
                          <div className="h-6 w-12 bg-green-400/30 rounded"></div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="h-2 w-16 bg-slate-600 rounded mb-2"></div>
                          <div className="h-6 w-12 bg-purple-400/30 rounded"></div>
                        </div>
                      </div>
                      
                      {/* Task List */}
                      <div className="flex-1 bg-slate-700/30 rounded-lg p-4 space-y-2">
                        <div className="h-2 w-24 bg-slate-600 rounded mb-3"></div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-4 w-4 border border-slate-600 rounded"></div>
                            <div className="flex-1 h-3 bg-slate-600 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actual Image - Uncomment and add your screenshot */}
                  {/* 
                  <Image
                    src="/dashboard-hero.png"
                    alt="AdjustFlow Dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                  */}
                </div>
              </div>
              
              {/* Stats Bar */}
              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">24</div>
                  <div className="text-xs text-slate-400">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">156</div>
                  <div className="text-xs text-slate-400">Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">42</div>
                  <div className="text-xs text-slate-400">Tasks</div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
