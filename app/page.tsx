"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "./lib/supabase";

export default function Home() {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative">
        {/* Configuration Notice */}
        {!supabaseConfigured && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800">Database Configuration Required</h3>
                  <p className="text-yellow-700 text-xs mt-1">
                    Configure Supabase environment variables to use database features. See README.md for setup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              Quotation System
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Professional invoice and quotation management for multiple companies with advanced features and seamless workflow
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <Link
                href="/quotation/create"
                className="group bg-white text-blue-600 px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl border border-blue-100 hover:border-blue-200 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-lg font-semibold">New Quotation</span>
              </Link>
              <Link
                href="/bulk-quotation"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-lg font-semibold">Bulk Quotes</span>
              </Link>
            </div>
          </div>

          {/* Premium Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
            {/* Bulk Company Quotations Card */}
            <div className="group relative bg-gradient-to-br from-white via-white to-gray-50/50 rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all duration-700 border border-gray-100/50 hover:scale-[1.02] overflow-hidden">
              {/* Elegant background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-purple-50/30 to-sky-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/20 via-purple-100/20 to-sky-100/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>

              <div className="relative z-10">
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-red-500 via-purple-500 to-sky-500 text-white p-5 rounded-2xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-red-600 group-hover:via-purple-600 group-hover:to-sky-600 transition-all duration-500 mb-2">
                      Bulk Company Quotations
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-sky-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
                  </div>
                </div>

                <p className="text-gray-600 mb-10 text-lg leading-relaxed font-medium">
                  Create quotations for all three companies (GTC, GDC, Rudharma) simultaneously with synchronized customer data and items. Perfect for providing multiple options to the same customer.
                </p>

                <div className="space-y-6">
                  <Link
                    href="/bulk-quotation"
                    className="group/btn relative bg-gradient-to-r from-red-600 via-purple-600 to-sky-600 text-white px-10 py-5 rounded-2xl hover:from-red-700 hover:via-purple-700 hover:to-sky-700 transition-all duration-500 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 group-hover/btn:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-lg font-semibold relative z-10">Create Bulk Quotations</span>
                  </Link>

                  <div className="flex justify-center space-x-4">
                    <span className="inline-flex items-center px-5 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      GTC
                    </span>
                    <span className="inline-flex items-center px-5 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      GDC
                    </span>
                    <span className="inline-flex items-center px-5 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-sky-50 to-sky-100 text-sky-700 border border-sky-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 bg-sky-500 rounded-full mr-2"></div>
                      Rudharma
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multiparty Quotation Card */}
            <div className="group relative bg-gradient-to-br from-white via-white to-gray-50/50 rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all duration-700 border border-gray-100/50 hover:scale-[1.02] overflow-hidden">
              {/* Elegant background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/30 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/20 via-purple-100/20 to-pink-100/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>

              <div className="relative z-10">
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-5 rounded-2xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-500 mb-2">
                      Multiparty Quotations
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
                  </div>
                </div>

                <p className="text-gray-600 mb-10 text-lg leading-relaxed font-medium">
                  Create quotations for multiple parties with percentage-based pricing adjustments, subject lines, and comprehensive party management.
                </p>

                <Link
                  href="/multiparty-quotation"
                  className="group/btn relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 group-hover/btn:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-lg font-semibold relative z-10">Create Multiparty Quote</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Individual Company Cards */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Company Quotations
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Create professional quotations for individual companies with their unique branding
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {/* Global Trading Corporation */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                {/* Elegant background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-red-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300 mb-2">
                      Global Trading Corporation
                    </h3>
                    <div className="w-12 h-1 bg-red-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed text-center">
                    Create quotations for GTC with their specific letterhead and company details.
                  </p>

                  <Link
                    href="/gtc-quotation"
                    className="group/btn bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create Quote</span>
                  </Link>
                </div>
              </div>

              {/* Global Digital Connect */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 mb-2">
                      Global Digital Connect
                    </h3>
                    <div className="w-12 h-1 bg-purple-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed text-center">
                    Create quotations for GDC with their digital services branding and templates.
                  </p>

                  <Link
                    href="/quotation/create"
                    className="group/btn bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create Quote</span>
                  </Link>
                </div>
              </div>

              {/* Rudharma Enterprises */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-sky-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-sky-100/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-sky-600 transition-colors duration-300 mb-2">
                      Rudharma Enterprises
                    </h3>
                    <div className="w-12 h-1 bg-sky-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed text-center">
                    Create quotations for Rudharma with their specific letterhead and company details.
                  </p>

                  <Link
                    href="/rudharma-quotation"
                    className="group/btn bg-gradient-to-r from-sky-600 to-sky-700 text-white px-6 py-3 rounded-xl hover:from-sky-700 hover:to-sky-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create Quote</span>
                  </Link>
                </div>
              </div>

              {/* SA Promotions */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-pink-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-100/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 mb-2">
                      SA Promotions
                    </h3>
                    <div className="w-12 h-1 bg-pink-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed text-center">
                    Create quotations for SA Promotions with their unique branding and promotional services.
                  </p>

                  <Link
                    href="/sa-promotions-quotation"
                    className="group/btn bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create Quote</span>
                  </Link>
                </div>
              </div>

              {/* Sanghi Stationers */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-teal-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-100/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 mb-2">
                      Sanghi Stationers
                    </h3>
                    <div className="w-12 h-1 bg-teal-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed text-center">
                    Create quotations for Sanghi Stationers & Enterprises with their stationery business branding.
                  </p>

                  <Link
                    href="/sanghi-stationers-quotation"
                    className="group/btn bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create Quote</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Additional Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional invoicing and quotation services with advanced features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Taxable Invoices */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-start mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-2xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-500 mb-2">
                        Taxable Invoices
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-8 text-lg leading-relaxed font-medium">
                    Create professional taxable invoices with GST calculations, detailed itemization, and Hindi language support.
                  </p>

                  <div className="space-y-4">
                    <Link
                      href="/taxable-invoice/create"
                      className="group/btn relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-500 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 group-hover/btn:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-lg font-semibold relative z-10">Create Tax Invoice</span>
                    </Link>

                    <Link
                      href="/taxable-invoice/list"
                      className="group/btn relative bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover/btn:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="relative z-10 text-base font-semibold">View Saved Invoices</span>
                    </Link>

                    <Link
                      href="/reports"
                      className="group/btn relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover/btn:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="relative z-10 text-base font-semibold">Sales Reports</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Regular Quotations */}
              <div className="group relative bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-start mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-2xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500 mb-2">
                        Regular Quotations
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-8 text-lg leading-relaxed font-medium">
                    Create standard quotations with customizable templates, professional formatting, and company-specific branding.
                  </p>

                  <Link
                    href="/quotation/create"
                    className="group/btn relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 group-hover/btn:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-lg font-semibold relative z-10">Create Quotation</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-16 border border-white/20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage quotations and invoices professionally
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-r from-red-500 via-purple-500 to-sky-500 text-white p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bulk Company Quotes</h3>
                <p className="text-gray-600 text-sm">Generate quotations for all three companies simultaneously with synchronized data.</p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Percentage Pricing</h3>
                <p className="text-gray-600 text-sm">Apply percentage increases to base amounts with automatic calculations.</p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Generation</h3>
                <p className="text-gray-600 text-sm">Professional PDF exports with company-specific branding and templates.</p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Sync</h3>
                <p className="text-gray-600 text-sm">Smart synchronization with manual override protection for individual customization.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-gray-600 mb-2">
                © 2025 Quotation System. Built for professional business management.
              </p>
              <p className="text-sm text-gray-500">
                Streamline your quotation and invoice workflow with our comprehensive solution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
