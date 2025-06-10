import { useEffect, useRef } from "react";
import { Loader } from "@mantine/core";
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "unit" | "project";
  data: any;
}

interface SearchResultsMapProps {
  markers: MapMarker[];
  activeType: "unit" | "project";
  onMarkerClick?: (id: string) => void;
}

export function SearchResultsMap({ markers, activeType, onMarkerClick }: SearchResultsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([13.7563, 100.5018], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    } else {
      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Add new markers with custom icons
    markers.forEach(marker => {
      const icon = L.divIcon({
        className: `map-marker ${activeType === 'project' ? 'project-marker' : 'unit-marker'}`,
        html: `<div class="marker-content">
                <div class="marker-pin"></div>
                <div class="marker-title">${marker.title}</div>
              </div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .addTo(markersRef.current!)
        .bindPopup(marker.title);

      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker.id);
        });
      }
    });

    // Fit bounds if there are markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, activeType, onMarkerClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    >
      <div id="map" style={{ width: '100%', height: '100%', minHeight: '500px' }}>
        <Loader />
      </div>
      <style jsx global>{`
        .map-marker {
          background: none;
          border: none;
        }
        .marker-content {
          position: relative;
          text-align: center;
        }
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #0091ff;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -15px;
          transition: all 0.3s ease;
        }
        .marker-pin::after {
          content: '';
          width: 24px;
          height: 24px;
          margin: 3px 0 0 3px;
          background: #fff;
          position: absolute;
          border-radius: 50%;
        }
        .marker-title {
          position: absolute;
          width: max-content;
          padding: 4px 8px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-size: 12px;
          white-space: nowrap;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: all 0.3s ease;
        }
        .map-marker:hover .marker-title {
          opacity: 1;
          top: -40px;
        }
        .project-marker .marker-pin {
          background: #0091ff;
        }
        .unit-marker .marker-pin {
          background: #00c853;
        }
      `}</style>
    </motion.div>
  );
} 