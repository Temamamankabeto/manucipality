"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  maintenanceAssets: number;
  damagedAssets: number;
  disposedAssets: number;
  totalTransfers: number;
  totalAuctions: number;
};

const mockData: DashboardData = {
  totalAssets: 120,
  availableAssets: 45,
  assignedAssets: 50,
  maintenanceAssets: 10,
  damagedAssets: 8,
  disposedAssets: 7,
  totalTransfers: 25,
  totalAuctions: 5,
};

export default function AssetDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-500 text-sm">
        Failed to load dashboard data
      </div>
    );
  }

  const cards = [
    { title: "Total Assets", value: data.totalAssets },
    { title: "Available Assets", value: data.availableAssets },
    { title: "Assigned Assets", value: data.assignedAssets },
    { title: "Under Maintenance", value: data.maintenanceAssets },
    { title: "Damaged Assets", value: data.damagedAssets },
    { title: "Disposed Assets", value: data.disposedAssets },
    { title: "Total Transfers", value: data.totalTransfers },
    { title: "Total Auctions", value: data.totalAuctions },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Asset Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all asset activities and status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Asset Overview
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Assets</span>
              <span className="text-gray-900 font-medium">
                {data.totalAssets}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Available</span>
              <span className="text-gray-900 font-medium">
                {data.availableAssets}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Assigned</span>
              <span className="text-gray-900 font-medium">
                {data.assignedAssets}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance</span>
              <span className="text-gray-900 font-medium">
                {data.maintenanceAssets}
              </span>
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Operations Summary
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Transfers</span>
              <span className="text-gray-900 font-medium">
                {data.totalTransfers}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auctions</span>
              <span className="text-gray-900 font-medium">
                {data.totalAuctions}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Damaged</span>
              <span className="text-gray-900 font-medium">
                {data.damagedAssets}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Disposed</span>
              <span className="text-gray-900 font-medium">
                {data.disposedAssets}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}