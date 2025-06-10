"use client";

import React from 'react';
import { Skeleton } from "@heroui/react";

export default function ProjectLoading() {
  return (
    <div className="w-full min-h-screen">
      {/* Skeleton для верхней части */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4 flex justify-end gap-2">
          <Skeleton className="w-40 h-10 rounded-lg" />
          <Skeleton className="w-40 h-10 rounded-lg" />
        </div>
      </div>

      {/* Skeleton для главного изображения */}
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="w-full h-[600px] rounded-lg mb-8" />
      </div>

      {/* Skeleton для информационных плашек */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="bg-white dark:bg-[#2C2C2C] py-6 rounded-b-xl px-6 shadow-small">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-20 h-4 rounded mb-2" />
                <Skeleton className="w-24 h-6 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton для основного контента */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Левая колонка */}
          <div className="w-full lg:w-[calc(100%-400px-2rem)] p-[1px]">
            {/* About Project Skeleton */}
            <div className="mb-8">
              <Skeleton className="w-48 h-8 rounded mb-4" />
              <div className="space-y-2">
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-3/4 h-4 rounded" />
              </div>
            </div>

            {/* Special Offers Skeleton */}
            <div className="mb-8">
              <Skeleton className="w-48 h-8 rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#2C2C2C] p-6 rounded-lg shadow-small"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="w-3/4 h-6 rounded mb-2" />
                        <Skeleton className="w-full h-4 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className="w-full lg:w-[400px] overflow-visible">
            <div className="bg-white dark:bg-[#2C2C2C] p-6 rounded-lg shadow-small mb-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="w-3/4 h-6 rounded" />
                <Skeleton className="w-full h-4 rounded" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2C2C2C] p-6 rounded-lg shadow-small">
              <div className="flex flex-col gap-4">
                <div>
                  <Skeleton className="w-3/4 h-6 rounded mb-2" />
                  <Skeleton className="w-1/2 h-4 rounded" />
                </div>
                <div>
                  <Skeleton className="w-1/2 h-4 rounded mb-2" />
                  <Skeleton className="w-3/4 h-6 rounded" />
                </div>
                <Skeleton className="w-full h-12 rounded" />
                <Skeleton className="w-3/4 h-4 rounded mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 