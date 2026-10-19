import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { Minus, Plus, Maximize, ArrowUp } from 'lucide-react';
import { categories, mapById, portals } from '../data';
import type { Area, MapId, Point } from '../types';
import { svgIcon } from './Icons';
const latlng = (p: [number, number]): L.LatLngTuple => [-p[1], p[0]];
function bounds(id: MapId) { const [a,b] = mapById[id].bounds; return L.latLngBounds(latlng(a), latlng(b)); }
export default function MapView({ mapId, points, completed, onSelect, onMapChange, area, mini = false, selected }: { mapId: MapId; points: Point[]; completed: Set<string>; onSelect?: (p: Point) => void; onMapChange?: (id: MapId) => void; area?: Area | 'all'; mini?: boolean; selected?: Point }) {
  const element = useRef<HTMLDivElement>(null); const instance = useRef<L.Map | null>(null); const layer = useRef<L.LayerGroup | null>(null);
  const callback = useRef(onSelect); callback.current = onSelect; const portalCallback = useRef(onMapChange); portalCallback.current = onMapChange;
  const [zoom, setZoom] = useState(0);
  useEffect(() => {
    if (!element.current) return;
    const map = L.map(element.current, { crs: L.CRS.Simple, zoomControl: false, attributionControl: false, minZoom: -4, maxZoom: 5, zoomSnap: .25, wheelPxPerZoomLevel: 240, wheelDebounceTime: 80, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, scrollWheelZoom: !mini, touchZoom: true, keyboard: true }); instance.current = map;
    L.imageOverlay(mapById[mapId].image, bounds(mapId), { interactive: false, className: 'map-cartography' }).addTo(map);
    map.fitBounds(bounds(mapId), { padding: mini ? [10,10] : [20,20] });
    if (mini && selected?.position) {
      if (selected.start) map.fitBounds(L.latLngBounds([latlng(selected.start), latlng(selected.position)]), { padding: [35,35], maxZoom: 1 });
      else map.setView(latlng(selected.position), Math.min(map.getZoom() + (mapId === 'gotham' ? 2 : .5), 3));
    }
    map.setMaxBounds(bounds(mapId).pad(.7)); map.on('zoomend', () => setZoom(map.getZoom())); setZoom(map.getZoom());
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(element.current);
    return () => { observer.disconnect(); map.remove(); instance.current = null; layer.current = null; };
  }, [mapId, mini, selected?.id]);
  useEffect(() => {
    const map = instance.current; if (!map) return; if (layer.current) map.removeLayer(layer.current);
    const group = mini ? L.layerGroup() : L.markerClusterGroup({ maxClusterRadius: 35, disableClusteringAtZoom: 1, spiderfyOnMaxZoom: true, showCoverageOnHover: false, animate: false, iconCreateFunction: cluster => {
      const allDone = cluster.getAllChildMarkers().every(marker => (marker.options as L.MarkerOptions & { done?: boolean }).done);
      return L.divIcon({ html: `<span>${cluster.getChildCount()}</span>`, className: `map-cluster ${allDone ? 'cluster-done' : ''}`, iconSize: [38,38] });
    } }); layer.current = group;
    for (const p of mini && selected ? [selected] : points) {
      if (p.map !== mapId || !p.position) continue; const done = completed.has(p.id);
      const marker = L.marker(latlng(p.position), { title: `${categories[p.category].label} ${p.number}: ${p.title}${done ? ' · Completato' : ''}`, alt: p.title, keyboard: !mini, icon: L.divIcon({ className: `map-pin ${p.category} ${done ? 'pin-done' : ''} ${mini ? 'pin-selected' : ''}`, html: svgIcon(p.category,done), iconSize: [32,32], iconAnchor: [16,16] }), ...({ done } as L.MarkerOptions) });
      if (!mini) marker.on('click', () => callback.current?.(p)); marker.addTo(group);
      marker.on('add', () => { const el = marker.getElement(); if (el) { el.setAttribute('role','button'); el.setAttribute('aria-label',marker.options.title ?? p.title); } });
    }
    if (!mini && mapId === 'gotham') for (const portal of portals.filter(p => !area || area === 'all' || area === p.area)) {
      L.marker(latlng(portal.position), { title: `Apri ${portal.title} · posizione del complesso`, icon: L.divIcon({ className: 'map-portal', html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18M5 21V7l7-4 7 4v14M10 21v-6h4v6M9 9h.01M15 9h.01"/></svg>', iconSize: [30,30] }) }).on('click', () => portalCallback.current?.(portal.map)).addTo(group);
    }
    if (mini && selected?.start && selected.position) {
      L.polyline([latlng(selected.start),latlng(selected.position)], { color: '#d5ba86', weight: 2, dashArray: '5 7', opacity: .7 }).addTo(group);
      L.marker(latlng(selected.start), { title: 'Partenza', icon: L.divIcon({ className: 'map-start', html: 'P', iconSize: [28,28] }) }).addTo(group);
    }
    if (mini && mapById[mapId].entry) L.marker(latlng(mapById[mapId].entry!), { title: 'Ingresso / accesso', icon: L.divIcon({ className: 'map-start entry', html: '↳', iconSize: [26,26] }) }).addTo(group);
    group.addTo(map); return () => { if (map.hasLayer(group)) map.removeLayer(group); };
  }, [points, mapId, completed, mini, selected, area]);
  return <div className={`map-shell ${mini ? 'mini-map' : ''}`}><div className="leaflet-map" ref={element} aria-label={mini ? 'Posizione del punto selezionato' : `Mappa interattiva: ${mapById[mapId].label}`} />{!mini && <><div className="map-topline"><span className="map-location"><span className="live-dot" />{mapById[mapId].label}</span><span className="map-coordinates">{mapId === 'gotham' ? 'GOTHAM CITY / NEW GOTHAM' : 'MAPPA INTERNA'}</span></div><div className="compass" aria-hidden="true"><span>N</span><ArrowUp size={27} strokeWidth={1} /></div><div className="map-controls"><button aria-label="Ingrandisci mappa" onClick={() => instance.current?.zoomIn(.5)}><Plus size={18} /></button><button aria-label="Riduci mappa" onClick={() => instance.current?.zoomOut(.5)}><Minus size={18} /></button><span /><button aria-label="Ripristina inquadratura" onClick={() => instance.current?.fitBounds(bounds(mapId), { padding: [20,20] })}><Maximize size={17} /></button></div><div className="map-bottomline"><span>Cartografia vettoriale <i>·</i> Coordinate da guide</span><span>{Math.round(100 * 2 ** zoom)}% <i>↗</i></span></div></>}</div>;
}
