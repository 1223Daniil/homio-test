'use client';

import { useEffect, useRef, useState } from "react";
import { Loader } from "@mantine/core";
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProjectWithRelations } from "../types";
import { UnitWithRelations } from "@/components/projects/UnitCardSearchResult";
import { ProjectMapCard } from "./ProjectMapCard";
import { UnitMapCard } from "./UnitMapCard";
import { useLocale, useTranslations } from "next-intl";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "unit" | "project";
  data: ProjectWithRelations | UnitWithRelations[];
  count?: number; // Количество юнитов для маркеров типа "unit"
  price?: number | null; // Минимальная цена для маркеров типа "project"
}

interface SearchPageMapProps {
  markers: MapMarker[];
  searchType: "units" | "projects";
  loading?: boolean;
  onMarkerClick?: (id: string) => void;
  defaultCenter?: [number, number]; // [lat, lng]
  defaultZoom?: number;
}

export function SearchPageMap({ 
  markers, 
  searchType,
  loading = false,
  onMarkerClick,
  defaultCenter = [7.8804, 98.3923], // Phuket coordinates
  defaultZoom = 11
}: SearchPageMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<UnitWithRelations[] | null>(null);
  const t = useTranslations('Search');

  useEffect(() => {
    // Проверяем существование контейнера
    const container = document.getElementById('search-results-map');
    if (!container) {
      console.error('Map container not found');
      return;
    }

    try {
      // Initialize map if not exists
      if (!mapRef.current) {
        mapRef.current = L.map('search-results-map', {
          center: defaultCenter,
          zoom: defaultZoom,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false
        });

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '',
          maxZoom: 19,
          language: 'en'
        }).addTo(mapRef.current);

        // Initialize markers layer
        markersRef.current = L.layerGroup().addTo(mapRef.current);
      }

      // Clear existing markers
      if (markersRef.current) {
        markersRef.current.clearLayers();
      }

      // Add new markers
      if (markers.length > 0 && markersRef.current && mapRef.current) {
        console.log('Adding markers to map:', markers);

        markers.forEach(marker => {
          const icon = L.divIcon({
            className: `map-marker ${marker.type === 'project' ? 'project-marker' : 'unit-marker'}`,
            html: marker.type === 'project' 
              ? `
                <div class="marker-content project">
                  <div class="marker-price">
                    <span>${t('from')} ฿${(() => {
                      const project = marker.data as ProjectWithRelations;
                      // Используем тот же метод расчета, что и в ProjectMapCard
                      const priceRange = project.units.reduce(
                        (acc, unit) => {
                          if (!unit.price) return acc;
                          return {
                            min: Math.min(acc.min, unit.price),
                            max: Math.max(acc.max, unit.price)
                          };
                        },
                        { min: Infinity, max: -Infinity }
                      );
                      
                      if (priceRange.min === Infinity) return '0';
                      
                      // Конвертируем в миллионы и форматируем до 3 знаков после запятой
                      const priceInM = (priceRange.min / 1000000).toFixed(3);
                      return priceInM;
                    })()}${t('million')}</span>
                  </div>
                  <div class="marker-dot"></div>
                </div>
              `
              : `
                <div class="marker-content unit">
                  <div class="marker-cluster">
                    <span>${marker.count || 0}</span>
                  </div>
                </div>
              `,
            iconSize: marker.type === 'project' ? [120, 40] : [40, 40],
            iconAnchor: marker.type === 'project' ? [60, 20] : [20, 20]
          });

          const leafletMarker = L.marker([marker.lat, marker.lng], { icon });

          if (marker.type === 'project') {
            leafletMarker.on('click', () => {
              setSelectedProject(marker.data as ProjectWithRelations);
              setSelectedUnits(null);
              if (onMarkerClick) {
                onMarkerClick(marker.id);
              }
            });
          } else {
            console.log('Unit marker clicked:', marker);
            leafletMarker.on('click', () => {
              setSelectedProject(null);
              const units = marker.data as UnitWithRelations[];
              console.log('Setting selected units:', units);
              setSelectedUnits(units);
              if (onMarkerClick) {
                onMarkerClick(marker.id);
              }
            });
          }

          leafletMarker.addTo(markersRef.current!);
        });

        // Fit bounds to show all markers
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        mapRef.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15 // Ограничиваем максимальное приближение
        });

        // Принудительно обновляем размер карты
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup on unmount
    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markersRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up map:', error);
      }
    };
  }, [markers, searchType, onMarkerClick, defaultCenter, defaultZoom]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full"
    >
      <div 
        id="search-results-map" 
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      <AnimatePresence>
        {selectedProject && (
          <ProjectMapCard 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
        {selectedUnits && (
          <UnitMapCard 
            units={selectedUnits}
            onClose={() => setSelectedUnits(null)}
          />
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .map-marker {
          background: none;
          border: none;
        }
        
        .marker-content {
          position: relative;
          text-align: center;
        }
        
        /* Стили для маркера проекта */
        .marker-content.project {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .marker-content.project .marker-price {
          background: white;
          color: #1a1a1a;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
          height: 36px;
          transition: all 0.2s ease;
        }

        .marker-content.project .marker-dot {
          width: 16px;
          height: 16px;
          background: #2563eb;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .marker-content.project:hover .marker-price {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        /* Стили для маркера юнитов */
        .marker-content.unit .marker-cluster {
          width: 36px;
          height: 36px;
          background: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
        
        /* Стили для попапа */
        .custom-popup {
          margin-top: -8px;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        
        .marker-popup {
          padding: 16px;
        }
        
        .marker-popup h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #1f2937;
        }
        
        .marker-popup p {
          margin: 4px 0;
          color: #4b5563;
          font-size: 14px;
        }
        
        .marker-popup .popup-actions {
          margin-top: 12px;
        }
        
        .marker-popup .view-details {
          width: 100%;
          padding: 8px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .marker-popup .view-details:hover {
          background: #1d4ed8;
        }
      `}</style>
    </motion.div>
  );
} 