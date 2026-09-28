import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Site, WeatherRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface PerimeterMapProps {
  sites?: Site[];
  selectedSite?: Site | null;
  weatherMap?: Record<number, WeatherRecord>;
  sensorCountMap?: Record<number, number>;
  height?: string;
  zoom?: number;
  interactive?: boolean;
  showZones?: boolean;
  onSelectSite?: (site: Site) => void;
  className?: string;
}

export function PerimeterMap({
  sites = [],
  selectedSite = null,
  weatherMap = {},
  sensorCountMap = {},
  height = '240px',
  zoom = 13,
  interactive = true,
  showZones = true,
  onSelectSite,
  className = '',
}: PerimeterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  // OpenStreetMap Tile Configuration (100% Free, No API Key Required)
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

  // 1. Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates
    const defaultLat = selectedSite
      ? Number(selectedSite.latitude)
      : sites[0]
      ? Number(sites[0].latitude)
      : 20.0;
    const defaultLon = selectedSite
      ? Number(selectedSite.longitude)
      : sites[0]
      ? Number(sites[0].longitude)
      : 0.0;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLon],
      zoom: selectedSite ? zoom : 4,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: false, // Prevent page scroll interception
      doubleClickZoom: interactive,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add standard OpenStreetMap tile layer (100% Free, Zero API Key)
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: tileAttribution,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer group for markers and continuous zone lines
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Force map size recomputation to avoid grey tile rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. React to theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.invalidateSize();
  }, [isDark]);

  // 3. Render Markers & Continuous Zone Contour Lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const displayedSites = selectedSite ? [selectedSite] : sites;
    if (displayedSites.length === 0) return;

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    displayedSites.forEach((site) => {
      const lat = Number(site.latitude);
      const lon = Number(site.longitude);

      if (isNaN(lat) || isNaN(lon)) return;

      const isCurrentSelected = selectedSite?.id === site.id;
      const weather = weatherMap[site.id];
      const sensorCount = sensorCountMap[site.id] ?? 0;

      // Custom technical pin marker
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-8 h-8 rounded-full ${
            isCurrentSelected
              ? 'bg-sky-500/30 animate-ping'
              : 'bg-emerald-500/20'
          }"></div>
          <div class="relative w-4 h-4 rounded-full border-2 ${
            isCurrentSelected
              ? 'bg-sky-400 border-white shadow-[0_0_12px_rgba(56,189,248,0.8)]'
              : 'bg-emerald-500 border-white shadow-[0_0_8px_rgba(16,185,129,0.7)]'
          } flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      // Telemetry popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: ${isDark ? '#f8fafc' : '#0f172a'}; min-width: 175px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px; color: ${isDark ? '#ffffff' : '#0f172a'};">${site.name}</div>
          <div style="color: ${isDark ? '#94a3b8' : '#64748b'}; font-size: 11px; margin-bottom: 8px;">${site.locationLabel}</div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; font-family: monospace; font-size: 11px;">
            <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Coordinates:</span>
            <span style="font-weight: 600; color: ${isDark ? '#f8fafc' : '#0f172a'};">${lat.toFixed(4)}°, ${lon.toFixed(4)}°</span>
          </div>
          ${
            weather
              ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; font-family: monospace; font-size: 11px;">
                  <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Atmosphere:</span>
                  <span style="font-weight: 600; color: #38bdf8;">${Number(weather.temperatureC).toFixed(1)}°C | ${(Number(weather.windSpeedMs) * 3.6).toFixed(0)} km/h</span>
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; font-family: monospace; font-size: 11px;">
            <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Sensors:</span>
            <span style="font-weight: 600; color: #10b981;">${sensorCount} Installed</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: isDark ? 'dark-leaflet-popup' : 'light-leaflet-popup',
      });

      if (onSelectSite) {
        marker.on('click', () => {
          onSelectSite(site);
        });
      }

      marker.addTo(markersGroup);
      bounds.extend([lat, lon]);

      // CONTINUOUS LINE PERIMETER ZONES (No dashed lines: solid continuous contour lines)
      if (showZones) {
        if (selectedSite) {
          // Multi-tier continuous boundary zones for active site

          // 1. Outer Detection Buffer Zone (800m - Continuous Blue Contour)
          const outerZone = L.circle([lat, lon], {
            radius: 800,
            color: isDark ? '#38bdf8' : '#0284c7', // Cyan / Sky Blue
            weight: 2, // Crisp continuous line
            fillColor: isDark ? '#38bdf8' : '#0284c7',
            fillOpacity: 0.07,
          });
          outerZone.bindTooltip('800m Outer Detection Zone (Continuous Contour)', { sticky: true });
          outerZone.addTo(markersGroup);

          // 2. Intermediate Exclusion Buffer Zone (400m - Continuous Amber Contour)
          const midZone = L.circle([lat, lon], {
            radius: 400,
            color: isDark ? '#fbbf24' : '#d97706', // Amber warning
            weight: 2, // Crisp continuous line
            fillColor: isDark ? '#fbbf24' : '#d97706',
            fillOpacity: 0.1,
          });
          midZone.bindTooltip('400m Exclusion Zone (Continuous Contour)', { sticky: true });
          midZone.addTo(markersGroup);

          // 3. Core Facility High-Security Zone (150m - Continuous Red Contour)
          const coreZone = L.circle([lat, lon], {
            radius: 150,
            color: isDark ? '#f87171' : '#dc2626', // Red critical
            weight: 2.5, // Strong continuous line
            fillColor: isDark ? '#f87171' : '#dc2626',
            fillOpacity: 0.16,
          });
          coreZone.bindTooltip('150m Core High-Security Perimeter Zone (Continuous Line)', { sticky: true });
          coreZone.addTo(markersGroup);
        } else {
          // Single outer continuous zone around all fleet sites in multi-site view
          const siteZone = L.circle([lat, lon], {
            radius: 800,
            color: isDark ? '#38bdf8' : '#0284c7',
            weight: 1.5, // Continuous line
            fillColor: isDark ? '#38bdf8' : '#0284c7',
            fillOpacity: 0.06,
          });
          siteZone.bindTooltip(`${site.name}: 800m Perimeter Zone (Continuous Line)`, { sticky: true });
          siteZone.addTo(markersGroup);
        }
      }
    });

    if (selectedSite) {
      map.setView([Number(selectedSite.latitude), Number(selectedSite.longitude)], zoom);
    } else if (displayedSites.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (displayedSites.length === 1) {
      map.setView([Number(displayedSites[0].latitude), Number(displayedSites[0].longitude)], zoom);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [sites, selectedSite, weatherMap, sensorCountMap, isDark, zoom, showZones, onSelectSite]);

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden border border-border bg-surface ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Coordinate HUD Overlay */}
      {selectedSite && (
        <div className="absolute bottom-2 left-2 z-[400] bg-surface/90 backdrop-blur-xs border border-border px-2.5 py-1 rounded text-[10px] font-mono text-muted flex items-center gap-2 pointer-events-none shadow-xs max-w-[calc(100%-16px)] truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="shrink-0">{Number(selectedSite.latitude).toFixed(4)}° N, {Number(selectedSite.longitude).toFixed(4)}° E</span>
          <span className="text-foreground font-semibold uppercase truncate">{selectedSite.name}</span>
        </div>
      )}
    </div>
  );
}
