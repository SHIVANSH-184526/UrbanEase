/* Leaflet Map Integration & Route Planner (js/map.js) */

import { DB } from './state.js';
import { showToast } from './app.js';

let mapInstance = null;
let markersGroup = [];
let railwayLinesGroup = [];
let routeLines = [];
let trafficOverlays = [];
let pollutionOverlay = null;
let weatherOverlay = null;

// Node coordinates database for smart route calculations (Covering Western, Central & Harbour Lines across Mumbai)
const LOCATIONS = {
  csmt: { name: 'CSMT / BMC Headquarters (Central & Harbour Line)', lat: 18.9405, lng: 72.8355 },
  churchgate: { name: 'Churchgate Terminal (Western Line)', lat: 18.9322, lng: 72.8264 },
  dadar: { name: 'Dadar Junction (Western & Central Lines Interchange)', lat: 19.0178, lng: 72.8478 },
  wadala: { name: 'Wadala Road Station (Harbour Line & Monorail)', lat: 19.0166, lng: 72.8586 },
  bkc: { name: 'Bandra-Kurla Complex (BKC Smart Mobility Hub)', lat: 19.0657, lng: 72.8687 },
  bandra: { name: 'Bandra Station (Western Line)', lat: 19.0550, lng: 72.8402 },
  kurla: { name: 'Kurla Junction (Central & Harbour Lines)', lat: 19.0657, lng: 72.8797 },
  chembur: { name: 'Chembur Station (Harbour Line Corridor)', lat: 19.0622, lng: 72.8995 },
  andheri: { name: 'Andheri Hub (Western Line & Metro Line 1)', lat: 19.1197, lng: 72.8464 },
  ghatkopar: { name: 'Ghatkopar Station (Central Line & Metro Line 1)', lat: 19.0860, lng: 72.9080 },
  borivali: { name: 'Borivali Terminal (Western Line North)', lat: 19.2288, lng: 72.8541 },
  thane: { name: 'Thane Central (Central Line North)', lat: 19.1860, lng: 72.9759 },
  vashi: { name: 'Vashi Station (Harbour Line / Navi Mumbai Gateway)', lat: 19.0771, lng: 72.9986 }
};

export function RenderMapPage(user) {
  const outlet = document.getElementById('router-outlet');
  
  // Base structural container
  outlet.innerHTML = `
    <div class="map-page-container">
      
      <!-- Drawer Sidebar Control -->
      <aside class="map-sidebar-drawer">
        
        <!-- Section 1: Router Planner -->
        <div class="map-drawer-section">
          <div class="map-drawer-title"><i data-lucide="route"></i> Smart Route Planner</div>
          <div class="route-selector-inputs">
            <div class="route-input-wrapper">
              <i data-lucide="map-pin" class="route-input-icon"></i>
              <select id="route-source" class="route-select-field">
                <option value="" disabled selected>Select Source...</option>
                ${Object.entries(LOCATIONS).map(([key, loc]) => `<option value="${key}">${loc.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="route-input-wrapper">
              <i data-lucide="navigation" class="route-input-icon"></i>
              <select id="route-destination" class="route-select-field">
                <option value="" disabled selected>Select Destination...</option>
                ${Object.entries(LOCATIONS).map(([key, loc]) => `<option value="${key}">${loc.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Mode selectors -->
          <div class="route-modes-grid">
            <input type="radio" id="mode-fastest" name="route-mode" value="fastest" checked class="route-mode-checkbox">
            <label for="mode-fastest" class="route-mode-label" title="Fastest Route">
              <i data-lucide="zap"></i><span>Fast</span>
            </label>

            <input type="radio" id="mode-wheelchair" name="route-mode" value="wheelchair" class="route-mode-checkbox">
            <label for="mode-wheelchair" class="route-mode-label" title="Wheelchair Accessible Route">
              <i data-lucide="accessibility"></i><span>Access</span>
            </label>

            <input type="radio" id="mode-emergency" name="route-mode" value="emergency" class="route-mode-checkbox">
            <label for="mode-emergency" class="route-mode-label" title="Emergency Services Corridor">
              <i data-lucide="ambulance"></i><span>SOS</span>
            </label>

            <input type="radio" id="mode-cycle" name="route-mode" value="cycling" class="route-mode-checkbox">
            <label for="mode-cycle" class="route-mode-label" title="Eco Cycling Route">
              <i data-lucide="bike"></i><span>Cycle</span>
            </label>
          </div>

          <div id="route-output-box" class="route-output-details hidden"></div>
        </div>

        <!-- Section 2: Facility Map Filters -->
        <div class="map-drawer-section">
          <div class="map-drawer-title"><i data-lucide="layers-3"></i> POI Map Filters</div>
          <div class="filter-tags-group">
            <input type="checkbox" id="filter-metro" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-metro" class="filter-tag-label"><i data-lucide="train"></i> Transit & Rails</label>

            <input type="checkbox" id="filter-hospitals" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-hospitals" class="filter-tag-label"><i data-lucide="heart-pulse"></i> Hospitals</label>

            <input type="checkbox" id="filter-parking" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-parking" class="filter-tag-label"><i data-lucide="square-p"></i> Parking</label>

            <input type="checkbox" id="filter-complaints" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-complaints" class="filter-tag-label"><i data-lucide="message-square-warning"></i> Issues</label>
          </div>
        </div>

        <!-- Section 3: Smart Cities Layers -->
        <div class="map-drawer-section">
          <div class="map-drawer-title"><i data-lucide="activity"></i> Demo Map Layers</div>
          <div class="layers-menu">
            <div class="layer-toggle-row">
              <span class="layer-toggle-info"><i data-lucide="gauge" class="env-icon" style="color:var(--color-rejected);"></i> Traffic Heat Overlay</span>
              <label class="switch">
                <input type="checkbox" id="layer-traffic">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="layer-toggle-row">
              <span class="layer-toggle-info"><i data-lucide="wind" class="env-icon" style="color:var(--accent);"></i> Air Quality (AQI) Layer</span>
              <label class="switch">
                <input type="checkbox" id="layer-aqi">
                <span class="slider"></span>
              </label>
            </div>

            <div class="layer-toggle-row">
              <span class="layer-toggle-info"><i data-lucide="cloud-sun" class="env-icon" style="color:var(--color-pending);"></i> Weather Cloud Overlay</span>
              <label class="switch">
                <input type="checkbox" id="layer-weather">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

      </aside>

      <!-- Map View Canvas -->
      <section class="map-canvas-wrapper">
        <div id="map"></div>
        
        <!-- Floating Navigation Controls -->
        <div class="map-floating-overlay">
          <button id="btn-recenter" class="map-floating-btn" title="Recenter to Mumbai Smart City"><i data-lucide="locate-fixed"></i></button>
          <button id="btn-mock-gps" class="map-floating-btn" title="Simulate Current GPS Position"><i data-lucide="user-check"></i></button>
        </div>
      </section>

    </div>
  `;

  lucide.createIcons();
  
  // Allow DOM to settle before initializing map
  setTimeout(() => {
    initLeafletMap();
    bindMapControls();
  }, 100);
}

export function cleanupMap() {
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {}
    mapInstance = null;
    markersGroup = [];
    railwayLinesGroup = [];
    routeLines = [];
    trafficOverlays = [];
    pollutionOverlay = null;
    weatherOverlay = null;
  }
}

function initLeafletMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  cleanupMap();
  if (mapEl._leaflet_id) {
    mapEl._leaflet_id = null;
  }

  // Center map on Mumbai (around Dadar / Bandra / BKC so Western, Central, and Harbour lines are all clearly framed)
  const centerLat = 19.0300;
  const centerLng = 72.8600;

  try {
    mapInstance = L.map('map', {
      zoomControl: true
    }).setView([centerLat, centerLng], 12);

    // Load OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    // Render original point markers and rail corridors
    updateMarkers();
  } catch (err) {
    console.error('Error initializing Leaflet map:', err);
  }
}

function updateMarkers() {
  // Clear any existing markers & railway lines
  markersGroup.forEach(m => mapInstance.removeLayer(m));
  markersGroup = [];
  railwayLinesGroup.forEach(l => mapInstance.removeLayer(l));
  railwayLinesGroup = [];

  const showHospitals = document.getElementById('filter-hospitals')?.checked;
  const showTransit = document.getElementById('filter-metro')?.checked;
  const showParking = document.getElementById('filter-parking')?.checked;
  const showComplaints = document.getElementById('filter-complaints')?.checked;

  // 1. Render Public Transit (Suburban Western Line, Central Line, Harbour Line & Metro)
  if (showTransit) {
    // A. Draw Mumbai Suburban Railway Corridors
    const railCorridors = [
      {
        name: 'Western Line (Churchgate - Dadar - Bandra - Andheri - Borivali)',
        color: '#dc2626', // Red
        coords: [
          [18.9322, 72.8264], // Churchgate
          [18.9442, 72.8236], // Marine Lines
          [18.9698, 72.8194], // Mumbai Central
          [18.9950, 72.8300], // Lower Parel
          [19.0178, 72.8430], // Dadar WR
          [19.0550, 72.8402], // Bandra
          [19.0820, 72.8385], // Santacruz
          [19.1197, 72.8464], // Andheri
          [19.1640, 72.8495], // Goregaon
          [19.2288, 72.8541]  // Borivali
        ]
      },
      {
        name: 'Central Main Line (CSMT - Byculla - Dadar - Kurla - Ghatkopar - Thane)',
        color: '#2563eb', // Blue
        coords: [
          [18.9398, 72.8355], // CSMT
          [18.9770, 72.8330], // Byculla
          [19.0060, 72.8380], // Parel
          [19.0180, 72.8480], // Dadar CR
          [19.0400, 72.8620], // Sion
          [19.0657, 72.8797], // Kurla CR
          [19.0860, 72.9080], // Ghatkopar
          [19.1270, 72.9340], // Kanjurmarg
          [19.1860, 72.9759]  // Thane
        ]
      },
      {
        name: 'Harbour Line (CSMT - Wadala Road - Kurla - Chembur - Vashi)',
        color: '#16a34a', // Green
        coords: [
          [18.9398, 72.8355], // CSMT
          [18.9680, 72.8430], // Dockyard Road
          [18.9980, 72.8540], // Sewri
          [19.0166, 72.8586], // Wadala Road
          [19.0340, 72.8640], // GTB Nagar
          [19.0657, 72.8797], // Kurla HR
          [19.0622, 72.8995], // Chembur
          [19.0500, 72.9310], // Mankhurd
          [19.0771, 72.9986]  // Vashi (Navi Mumbai)
        ]
      },
      {
        name: 'Metro Line 1 (Versova - Andheri - Ghatkopar Cross Connector)',
        color: '#9333ea', // Purple
        coords: [
          [19.1310, 72.8170], // Versova
          [19.1197, 72.8464], // Andheri Metro
          [19.1110, 72.8660], // Chakala
          [19.1020, 72.8880], // Saki Naka
          [19.0860, 72.9080]  // Ghatkopar Metro
        ]
      }
    ];

    railCorridors.forEach(corridor => {
      const line = L.polyline(corridor.coords, {
        color: corridor.color,
        weight: 5,
        opacity: 0.85,
        dashArray: corridor.name.includes('Metro') ? '4, 8' : null
      }).addTo(mapInstance)
        .bindPopup(`<strong>🚆 ${corridor.name}</strong><br><span style="font-size:0.8rem; color:#64748b;">Active High-Capacity Transit Corridor</span>`);
      railwayLinesGroup.push(line);
    });

    // B. Render Transit Stations Markers
    const stations = DB.getStations();
    stations.forEach(s => {
      const isMetro = s.type === 'metro';
      const isRailway = s.type === 'railway';
      let color = '#3b82f6';
      let iconSymbol = 'bus';
      if (isMetro) {
        color = '#8b5cf6';
        iconSymbol = 'subway';
      } else if (isRailway) {
        color = '#ea580c';
        iconSymbol = 'train';
      }
      
      const icon = L.divIcon({
        className: `custom-map-marker marker-transit`,
        html: `<div style="background-color: ${color}; color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><i data-lucide="${iconSymbol}" style="width:14px; height:14px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([s.lat, s.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>${isRailway ? '🚆' : isMetro ? '🚇' : '🚌'} ${s.name}</h3>
          <p><strong>Corridor:</strong> ${s.routes.join(', ')}</p>
          <p><strong>Address:</strong> ${s.address}</p>
          <p><strong>Access status:</strong> ${s.accessible ? '✅ Wheelchair Accessible Ramps & Elevators' : '⚠️ Limited Accessibility'}</p>
          <p><strong>Schedule:</strong> ${s.timetable[0]}</p>
        `);
      markersGroup.push(m);
    });
  }

  // 2. Render Static Locations (Hospitals across Mumbai)
  if (showHospitals) {
    const hospitalLocations = [
      { name: 'KEM Hospital & Seth GS Medical College', lat: 19.0034, lng: 72.8427, spec: 'Emergency 24x7. Trauma center. Fully Ramp Accessible (Parel / Dadar).' },
      { name: 'Lilavati Hospital & Research Centre', lat: 19.0515, lng: 72.8290, spec: '24x7 Multi-speciality Emergency Hub (Bandra West).' },
      { name: 'Kokilaben Dhirubhai Ambani Hospital', lat: 19.1311, lng: 72.8252, spec: 'Full Accessibility, Wheelchair bays & Level 1 Trauma (Andheri West).' },
      { name: 'Sir H. N. Reliance Foundation Hospital', lat: 18.9565, lng: 72.8193, spec: 'Advanced Critical Care & Barrier-Free Entry (Girgaon / South Mumbai).' },
      { name: 'Fortis Hospital Mulund', lat: 19.1678, lng: 72.9392, spec: 'Central Line Emergency & Super Speciality (Mulund / Thane).' },
      { name: 'Tata Memorial Hospital', lat: 19.0068, lng: 72.8420, spec: 'Premier Oncology Centre with Accessible Facilities (Parel).' }
    ];

    hospitalLocations.forEach(h => {
      const icon = L.divIcon({
        className: 'custom-map-marker marker-hospital',
        html: `<div style="background-color: var(--color-rejected); color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><i data-lucide="heart-pulse" style="width:14px; height:14px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([h.lat, h.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>🏥 ${h.name}</h3>
          <p>${h.spec}</p>
          <p>Coordinates: ${h.lat}, ${h.lng}</p>
        `);
      markersGroup.push(m);
    });
  }

  // 3. Render Parking Lots in Mumbai
  if (showParking) {
    const parkingLots = DB.getParking();
    parkingLots.forEach(p => {
      const freeSpots = p.capacity - p.occupied;
      const pct = Math.floor((freeSpots / p.capacity) * 100);
      const color = pct > 20 ? 'var(--color-resolved)' : 'var(--color-pending)';
      
      const icon = L.divIcon({
        className: 'custom-map-marker marker-parking',
        html: `<div style="background-color: var(--primary); color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><span style="font-weight:800; font-size:11px;">P</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([p.lat, p.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>🅿️ ${p.name}</h3>
          <p>Address: ${p.address}</p>
          <p>Charges: ${p.charges}</p>
          <p>Access parking: ${p.accessible ? '♿ Yes, dedicated accessible bays' : '⚠️ Standard spaces only'}</p>
          <p>Availability: <strong style="color:${color};">${freeSpots} / ${p.capacity} slots free</strong></p>
        `);
      markersGroup.push(m);
    });
  }

  // 4. Render Active Complaints (Only non-rejected ones)
  if (showComplaints) {
    const complaints = DB.getComplaints().filter(c => c.status !== 'rejected');
    complaints.forEach(c => {
      let iconColor = 'var(--color-pending)';
      if (c.status === 'resolved') iconColor = 'var(--color-resolved)';
      if (c.status === 'in-progress') iconColor = 'var(--color-progress)';
      if (c.status === 'under-review') iconColor = 'var(--color-review)';

      const icon = L.divIcon({
        className: 'custom-map-marker marker-complaint',
        html: `<div style="background-color: ${iconColor}; color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><i data-lucide="alert-triangle" style="width:12px; height:12px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([c.lat, c.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>⚠️ Complaint ID: ${c.id}</h3>
          <p><strong>${c.title}</strong></p>
          <p>Status: <span class="badge badge-${c.status}">${c.status}</span></p>
          <p>Priority: <span style="text-transform:capitalize; font-weight:700; color:var(--color-error);">${c.priority || 'medium'} (${c.riskScore || 65}/100)</span></p>
          <p>Address: ${c.address}</p>
          <a href="#/complaints" style="color:var(--primary); font-size:0.8rem; font-weight:700;">Track progress & support &rarr;</a>
        `);
      markersGroup.push(m);
    });
  }

  lucide.createIcons();
}

function bindMapControls() {
  // Bind Recentering controls to Mumbai
  document.getElementById('btn-recenter').addEventListener('click', () => {
    mapInstance.setView([19.0300, 72.8600], 12);
    showToast('Map recentered to Mumbai Smart City Region.', 'info');
  });

  // Bind Mock GPS position in Mumbai (BKC Mobility Hub)
  document.getElementById('btn-mock-gps').addEventListener('click', () => {
    const mockUserLat = 19.0657; // BKC Hub
    const mockUserLng = 72.8687;

    mapInstance.setView([mockUserLat, mockUserLng], 15);

    const icon = L.divIcon({
      className: 'user-gps-marker',
      html: `<div class="pulse-marker" style="background-color: #10b981; border: 3px solid white; border-radius:50%; width:20px; height:20px; box-shadow:0 0 0 10px rgba(16,185,129,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker([mockUserLat, mockUserLng], { icon }).addTo(mapInstance)
      .bindPopup('<h3>📍 Your Location (Mumbai BKC Hub)</h3><p>Accuracy: &plusmn; 4 meters</p>')
      .openPopup();

    showToast('GPS position calibrated to BKC Smart Hub.', 'success');
  });

  // Bind POI filter checkboxes
  const filterCheckboxes = document.querySelectorAll('.filter-tag-checkbox');
  filterCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateMarkers();
    });
  });

  // Bind Route planner selects
  const sourceSelect = document.getElementById('route-source');
  const destSelect = document.getElementById('route-destination');
  const modeRadios = document.getElementsByName('route-mode');

  const onRouteFormChange = () => {
    const srcKey = sourceSelect.value;
    const destKey = destSelect.value;
    
    let activeMode = 'fastest';
    for (const r of modeRadios) {
      if (r.checked) activeMode = r.value;
    }

    if (srcKey && destKey) {
      calculateAndDrawRoute(srcKey, destKey, activeMode);
    }
  };

  sourceSelect.addEventListener('change', onRouteFormChange);
  destSelect.addEventListener('change', onRouteFormChange);
  modeRadios.forEach(r => r.addEventListener('change', onRouteFormChange));

  // Bind Switch overlays (Layers)
  document.getElementById('layer-traffic').addEventListener('change', (e) => {
    toggleTrafficLayer(e.target.checked);
  });
  document.getElementById('layer-aqi').addEventListener('change', (e) => {
    toggleAqiLayer(e.target.checked);
  });
  document.getElementById('layer-weather').addEventListener('change', (e) => {
    toggleWeatherLayer(e.target.checked);
  });
}

function calculateAndDrawRoute(srcKey, destKey, mode) {
  // Clear any existing route lines
  routeLines.forEach(l => mapInstance.removeLayer(l));
  routeLines = [];

  if (srcKey === destKey) {
    showToast('Source and Destination cannot be identical.', 'warning');
    document.getElementById('route-output-box').classList.add('hidden');
    return;
  }

  const src = LOCATIONS[srcKey];
  const dest = LOCATIONS[destKey];

  // Draw polyline with realistic curved coordinates for Mumbai road paths
  const midLat = (src.lat + dest.lat) / 2;
  const midLng = (src.lng + dest.lng) / 2;
  
  let routePath = [
    [src.lat, src.lng],
    [midLat + 0.003, midLng - 0.004],
    [dest.lat, dest.lng]
  ];

  let color = '#2563eb'; // standard primary
  let speedMultiplier = 1.0;
  let recommendation = '';
  let modeName = 'Vehicle';

  if (mode === 'wheelchair') {
    color = '#10b981'; // Green friendly
    speedMultiplier = 4.2; // much slower
    recommendation = '♿ Barrier-Free Route: Access ramps verified at railway crossings and audited footpaths.';
    modeName = 'Wheelchair';
  } else if (mode === 'emergency') {
    color = '#ef4444'; // SOS Red
    speedMultiplier = 0.65; // much faster
    recommendation = '🚨 Emergency Priority Route: Mumbai Traffic Police control room green-lights corridor signals.';
    modeName = 'Emergency Responder';
  } else if (mode === 'cycling') {
    color = '#06b6d4'; // Cyan cycling lane
    speedMultiplier = 2.5;
    recommendation = '🚴 Eco-Cycling Route: Prioritizes coastal promenade pathways and lower vehicle emission zones.';
    modeName = 'Bicycle';
  } else {
    // fastest (car)
    recommendation = '🚗 Standard Highway/Arterial Route: Optimized for Mumbai traffic flow.';
  }

  // Draw on Map
  const poly = L.polyline(routePath, {
    color,
    weight: 6,
    opacity: 0.85,
    dashArray: mode === 'wheelchair' ? '1, 10' : null
  }).addTo(mapInstance);
  
  routeLines.push(poly);

  // Auto-fit route
  mapInstance.fitBounds(poly.getBounds(), { padding: [50, 50] });

  // Calculate simulated distances & durations
  const rawDist = Math.sqrt(Math.pow(dest.lat - src.lat, 2) + Math.pow(dest.lng - src.lng, 2)) * 111.32;
  const finalDistance = Math.max(1.2, rawDist * 1.25); // Pad for Mumbai arterial turns

  // Traffic density check
  const isTrafficOverlayOn = document.getElementById('layer-traffic')?.checked;
  const trafficImpact = isTrafficOverlayOn ? 1.55 : 1.0; // 55% increase under peak Mumbai traffic

  let finalDurationMinutes = Math.round((finalDistance / (38 / speedMultiplier)) * 60 * trafficImpact);
  if (finalDurationMinutes < 4) finalDurationMinutes = 5;

  const outputBox = document.getElementById('route-output-box');
  outputBox.innerHTML = `
    <div class="route-output-row">
      <span>Travel Mode:</span>
      <span class="route-output-value">${modeName}</span>
    </div>
    <div class="route-output-row">
      <span>Total Distance:</span>
      <span class="route-output-value">${finalDistance.toFixed(2)} km</span>
    </div>
    <div class="route-output-row">
      <span>Est. Commute Time:</span>
      <span class="route-output-value" style="color: ${finalDurationMinutes > 35 ? 'var(--color-pending)' : 'var(--color-resolved)'}">${finalDurationMinutes} mins</span>
    </div>
    <div class="route-output-row">
      <span>Mumbai Traffic Index:</span>
      <span class="route-output-value" style="color: ${isTrafficOverlayOn ? 'var(--color-rejected)' : 'var(--color-resolved)'}">${isTrafficOverlayOn ? 'Heavy (Peak Hours Delay)' : 'Normal Flow'}</span>
    </div>
    <div class="route-recommendation-badge">
      <i data-lucide="info" style="width:14px; height:14px; flex-shrink:0;"></i>
      <span>${recommendation}</span>
    </div>
  `;
  outputBox.classList.remove('hidden');
  lucide.createIcons();
  
  showToast(`Calculated route for ${modeName}`, 'success');
}

// Map Overlays Toggles (Layer simulations)
function toggleTrafficLayer(enable) {
  // Clear old ones
  trafficOverlays.forEach(o => mapInstance.removeLayer(o));
  trafficOverlays = [];

  if (!enable) {
    const srcKey = document.getElementById('route-source')?.value;
    const destKey = document.getElementById('route-destination')?.value;
    if (srcKey && destKey) {
      calculateAndDrawRoute(srcKey, destKey, document.querySelector('input[name="route-mode"]:checked').value);
    }
    return;
  }

  // Draw simulated heavy congestion vectors along Mumbai highways
  const heavyRoads = [
    // Western Express Highway (Bandra to Andheri)
    [[19.0550, 72.8402], [19.0850, 72.8520], [19.1197, 72.8464]],
    // Eastern Express Highway (Sion to Chembur)
    [[19.0178, 72.8478], [19.0400, 72.8620], [19.0622, 72.8995]],
    // BKC Connector / Kalanagar Junction
    [[19.0550, 72.8402], [19.0657, 72.8687]]
  ];

  heavyRoads.forEach((pts, idx) => {
    const color = idx === 0 ? '#ef4444' : '#f59e0b';
    const line = L.polyline(pts, {
      color,
      weight: 12,
      opacity: 0.6,
      className: 'traffic-heatmap-line'
    }).addTo(mapInstance);
    trafficOverlays.push(line);
  });

  const srcKey = document.getElementById('route-source')?.value;
  const destKey = document.getElementById('route-destination')?.value;
  if (srcKey && destKey) {
    calculateAndDrawRoute(srcKey, destKey, document.querySelector('input[name="route-mode"]:checked').value);
  }

  showToast('Mumbai traffic congestion heatmap enabled.', 'info');
}

function toggleAqiLayer(enable) {
  if (pollutionOverlay) {
    mapInstance.removeLayer(pollutionOverlay);
    pollutionOverlay = null;
  }

  if (!enable) return;

  // Render air quality zones (semi-transparent red circle over Chembur / Deonar industrial belt)
  pollutionOverlay = L.circle([19.0550, 72.9050], {
    color: '#ef4444',
    fillColor: '#f87171',
    fillOpacity: 0.25,
    radius: 2000
  }).addTo(mapInstance)
    .bindPopup('<h3>😷 AQI Level: 182 (Moderate to Unhealthy)</h3><p>Higher PM2.5 detected along the Chembur-Kurla industrial transition zone. Cyclists advised to take coastal green paths.</p>');

  showToast('Air Quality Index overlay loaded for Mumbai region.', 'info');
}

function toggleWeatherLayer(enable) {
  if (weatherOverlay) {
    mapInstance.removeLayer(weatherOverlay);
    weatherOverlay = null;
  }

  if (!enable) return;

  // Draw coastal monsoon cloud vectors
  const weatherZone = [
    [18.9100, 72.8000],
    [19.1600, 72.8000],
    [19.1600, 72.8800],
    [18.9100, 72.8600]
  ];

  weatherOverlay = L.polygon(weatherZone, {
    color: '#9ca3af',
    fillColor: '#d1d5db',
    fillOpacity: 0.35
  }).addTo(mapInstance)
    .bindPopup('<h3>☁️ Coastal Showers & High Tide Warning</h3><p>Arabian Sea coastal monsoon clouds active. Low-lying railway subways under water logging surveillance.</p>');

  showToast('Weather Cloud tracker overlayed.', 'info');
}
