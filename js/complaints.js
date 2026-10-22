/* Citizen Complaints Portal Logic (js/complaints.js) */

import { DB, calculateAIPriority } from './state.js';
import { showToast } from './app.js';

let selectedCoordinates = null;
let currentDetailId = null;
let imageBase64 = '';

export function RenderComplaintsPortal(user) {
  const outlet = document.getElementById('router-outlet');
  
  outlet.innerHTML = `
    <div class="dashboard-container">
      
      <!-- Sidebar navigation -->
      <aside class="db-sidebar">
        <div class="db-user-card">
          <div class="db-avatar">${user.name.charAt(0)}</div>
          <div class="db-user-info">
            <span class="db-user-name">${user.name}</span>
            <span class="db-user-role">${user.role} Account</span>
          </div>
        </div>
        
        <nav class="db-nav">
          <a href="#/dashboard" class="db-nav-link"><i data-lucide="layout-dashboard"></i> Dashboard</a>
          <a href="#/map" class="db-nav-link"><i data-lucide="map"></i> Interactive Map</a>
          <a href="#/complaints" class="db-nav-link active"><i data-lucide="message-square-warning"></i> Report Issue</a>
          <a href="#/track" class="db-nav-link"><i data-lucide="search"></i> Track Complaint</a>
          <a href="#/profile" class="db-nav-link"><i data-lucide="user-cog"></i> Profile Settings</a>
        </nav>
      </aside>

      <!-- Main Portal Content -->
      <main class="db-main">
        
        <div class="db-header">
          <div>
            <h1>Citizen Incident Portal</h1>
            <p style="color:var(--text-secondary); margin-top:0.3rem;">File urban mobility & accessibility complaints and track resolution cycles in real time.</p>
          </div>
          <div class="db-header-actions">
            <!-- Summary reputation block -->
            <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); display:flex; align-items:center; gap:0.5rem; background:var(--card-bg); padding:0.5rem 1rem; border-radius:10px; border:1px solid var(--card-border);">
              <i data-lucide="medal" style="color:var(--color-resolved); width:18px; height:18px;"></i>
              <span>Reputation Score: <strong>${user.reputationScore}</strong></span>
            </div>
          </div>
        </div>

        <!-- Portal Columns Grid -->
        <div class="complaints-container">
          
          <!-- Column 1: Submit Form -->
          <div class="glass" style="padding: 2rem; display:flex; flex-direction:column; gap:1.5rem; height:fit-content;">
            <h3 style="font-size: 1.25rem; font-weight: 700; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem; display:flex; align-items:center; justify-content:space-between;">
              <span>
                <i data-lucide="edit-3" style="color:var(--primary); vertical-align:middle; display:inline-block; margin-right:0.4rem;"></i>
                File New Infrastructure Report
              </span>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:500;">Academic Prototype</span>
            </h3>

            <!-- Fake Warning Alert -->
            <div class="warning-alert-banner">
              <i data-lucide="alert-triangle"></i>
              <div>
                <strong>Identity verified via GPS.</strong> Filing fake or spam reports will decrease your reputation score and lead to account suspension.
              </div>
            </div>

            <form id="complaint-submit-form" class="auth-form">
              <div class="form-group">
                <label>Issue Category</label>
                <select id="comp-category" class="form-control" required>
                  <option value="" disabled selected>Choose issue category...</option>
                  <option value="pothole">Pothole</option>
                  <option value="broken-traffic-signal">Broken Traffic Signal</option>
                  <option value="streetlight-problem">Streetlight Problem</option>
                  <option value="garbage-waste">Garbage / Waste</option>
                  <option value="water-leakage">Water Leakage</option>
                  <option value="road-damage">Road Damage</option>
                  <option value="footpath-obstruction">Footpath Obstruction</option>
                  <option value="accessibility-issue">Accessibility Issue</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div class="form-group">
                <label>Report Title</label>
                <input type="text" id="comp-title" class="form-control" placeholder="Brief summary (e.g. Deep pothole near school gate)" required>
              </div>

              <div class="form-group">
                <label>Detailed Description</label>
                <textarea id="comp-description" class="form-control" rows="3" placeholder="Provide dimensions, safety hazards, nearby landmarks, or special obstacle notes..." required></textarea>
              </div>

              <div class="form-group">
                <label>Location & Address</label>
                <div style="display:flex; gap:0.5rem; margin-bottom:0.4rem;">
                  <input type="text" id="comp-coords" class="form-control" placeholder="Coordinates (e.g. 19.0178, 72.8478)..." readonly required style="cursor:not-allowed;">
                  <button type="button" id="btn-comp-geolocation" class="btn btn-outline" style="padding:0 0.8rem;" title="Use Current GPS Location"><i data-lucide="locate"></i> Auto</button>
                  <button type="button" id="btn-comp-gps" class="btn btn-outline" style="padding:0 0.8rem;" title="Pin Location"><i data-lucide="map-pin"></i> Pin</button>
                </div>
                <input type="text" id="comp-address" class="form-control" placeholder="Human-readable address or area name (e.g. Residency Road Junction, Ward 4)" required>
                <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Click "Auto" for device GPS or tap mini-map to pin exact coordinates.</span>
              </div>

              <!-- Mini map for GPS verification -->
              <div id="mini-map" class="glass" style="height:160px; width:100%; border-radius:10px; z-index:1;"></div>

              <div class="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" id="comp-datetime" class="form-control" required>
              </div>

              <!-- Optional Contact Information -->
              <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:10px; display:flex; flex-direction:column; gap:0.8rem;">
                <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Contact Information (Optional)</span>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
                  <input type="text" id="comp-contact-name" class="form-control" placeholder="Your Name" value="${user.name}">
                  <input type="email" id="comp-contact-email" class="form-control" placeholder="Email Address" value="${user.email}">
                </div>
                <input type="tel" id="comp-contact-phone" class="form-control" placeholder="Phone Number (e.g. +91 98765 43210)">
              </div>

              <!-- Image Upload Drag Zone -->
              <div class="form-group">
                <label>Upload Supporting Photo</label>
                <div class="image-upload-zone" id="upload-zone">
                  <i data-lucide="camera" style="width:32px; height:32px; color:var(--text-muted);"></i>
                  <span style="font-size:0.85rem; font-weight:600;">Drag image file here or click to browse</span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">Max size 2MB. JPEG, PNG.</span>
                  <input type="file" id="comp-image-file" accept="image/*" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
                </div>
                
                <div id="upload-preview-container" class="image-preview-container">
                  <img id="upload-preview" src="" alt="Incident Preview">
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%;">Submit & Generate Complaint ID</button>
            </form>
          </div>

          <!-- Column 2: Complaints List & Details view -->
          <div style="display:flex; flex-direction:column; gap:2rem;">
            
            <!-- Details view block (Conditional) -->
            <div id="complaint-details-panel" class="glass widget-card hidden">
              <!-- Dynamically populated when a complaint is clicked -->
            </div>

            <!-- List view -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span>📋 Active Municipal Reports</span>
                <a href="#/track" style="font-size:0.8rem; color:var(--primary); font-weight:700;">Lookup by ID &rarr;</a>
              </div>
              
              <div id="complaints-list-container" style="display:flex; flex-direction:column; gap:1rem; max-height:650px; overflow-y:auto; padding-right:0.2rem;">
                <!-- Populated via Javascript -->
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  `;

  lucide.createIcons();
  
  // Set default datetime picker to current local time
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('comp-datetime').value = now.toISOString().slice(0, 16);

  // DOM setup
  setTimeout(() => {
    initMiniMap();
    bindComplaintsControls(user);
    renderComplaintsList(user);
  }, 100);
}

let miniMapInstance = null;

export function cleanupMiniMap() {
  if (miniMapInstance) {
    try {
      miniMapInstance.remove();
    } catch (e) {}
    miniMapInstance = null;
  }
}

function initMiniMap() {
  const mapEl = document.getElementById('mini-map');
  if (!mapEl) return;

  cleanupMiniMap();
  if (mapEl._leaflet_id) {
    mapEl._leaflet_id = null;
  }

  const defaultLat = 19.0178;
  const defaultLng = 72.8478;

  try {
    miniMapInstance = L.map('mini-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(miniMapInstance);

    let selectionMarker = null;

    miniMapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      selectedCoordinates = { lat, lng };

      const coordsEl = document.getElementById('comp-coords');
      const addressEl = document.getElementById('comp-address');
      if (coordsEl) coordsEl.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (addressEl && !addressEl.value) {
        addressEl.value = `Location Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }

      if (selectionMarker) {
        selectionMarker.setLatLng(e.latlng);
      } else {
        const icon = L.divIcon({
          className: 'gps-selection-dot',
          html: `<div style="background-color: var(--primary); border: 2px solid white; border-radius:50%; width:14px; height:14px; box-shadow:0 0 10px var(--primary-glow);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        selectionMarker = L.marker(e.latlng, { icon }).addTo(miniMapInstance);
      }

      miniMapInstance.panTo(e.latlng);
    });
  } catch (err) {
    console.error('Error initializing mini-map:', err);
  }
}

function bindComplaintsControls(user) {
  const form = document.getElementById('complaint-submit-form');
  const fileInput = document.getElementById('comp-image-file');
  const uploadZone = document.getElementById('upload-zone');
  const previewImg = document.getElementById('upload-preview');
  const previewContainer = document.getElementById('upload-preview-container');

  // Geolocation Auto-Detect Button
  document.getElementById('btn-comp-geolocation').addEventListener('click', () => {
    if ('geolocation' in navigator) {
      showToast('Acquiring GPS position from device...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          selectedCoordinates = { lat, lng };
          document.getElementById('comp-coords').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          document.getElementById('comp-address').value = `Current Geolocation (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          showToast('GPS position acquired successfully.', 'success');
        },
        (err) => {
          console.warn('Geolocation fallback used:', err);
          // Fallback location near Dadar Interchange, Mumbai
          const lat = 19.0178;
          const lng = 72.8478;
          selectedCoordinates = { lat, lng };
          document.getElementById('comp-coords').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          document.getElementById('comp-address').value = `Dadar Transit Interchange, Mumbai`;
          showToast('Calibrated GPS position to Mumbai Dadar Central Hub.', 'info');
        },
        { timeout: 5000 }
      );
    } else {
      const lat = 19.0178;
      const lng = 72.8478;
      selectedCoordinates = { lat, lng };
      document.getElementById('comp-coords').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      document.getElementById('comp-address').value = `Dadar Transit Interchange, Mumbai`;
      showToast('GPS position calibrated to Mumbai Dadar Hub.', 'info');
    }
  });

  // Coordinates Pin Calibration Btn
  document.getElementById('btn-comp-gps').addEventListener('click', () => {
    const lat = 19.0590;
    const lng = 72.8420;
    selectedCoordinates = { lat, lng };
    document.getElementById('comp-coords').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    document.getElementById('comp-address').value = `Western Express Highway, Bandra East, Mumbai`;
    showToast('GPS pin set to Bandra WEH Junction.', 'success');
  });

  // Handle Image Upload base64 conversion
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size exceeds 2MB threshold.', 'error');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        imageBase64 = evt.target.result;
        previewImg.src = imageBase64;
        previewContainer.style.display = 'block';
        uploadZone.style.display = 'none';
        showToast('Supporting photo attached successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('comp-category').value;
    const title = document.getElementById('comp-title').value.trim();
    const description = document.getElementById('comp-description').value.trim();
    const address = document.getElementById('comp-address').value.trim();
    const datetime = document.getElementById('comp-datetime').value;
    const contactName = document.getElementById('comp-contact-name').value.trim();
    const contactEmail = document.getElementById('comp-contact-email').value.trim();
    const contactPhone = document.getElementById('comp-contact-phone').value.trim();

    if (!selectedCoordinates) {
      showToast('Coordinates missing. Click "Auto" or tap the map to pin coordinates.', 'warning');
      return;
    }

    // 1. Duplicate Detection Check
    const existingComplaints = DB.getComplaints();
    const duplicate = existingComplaints.find(c => {
      if (c.category !== category || c.status === 'resolved' || c.status === 'rejected') return false;
      const latDiff = Math.abs(c.lat - selectedCoordinates.lat);
      const lngDiff = Math.abs(c.lng - selectedCoordinates.lng);
      return latDiff < 0.003 && lngDiff < 0.003;
    });

    if (duplicate) {
      showDuplicateAlertModal(duplicate, user);
      return;
    }

    // 2. Submit Complaint
    submitComplaint(title, category, description, address, datetime, { name: contactName, email: contactEmail, phone: contactPhone }, user);
  });
}

function submitComplaint(title, category, description, address, datetime, contactInfo, user) {
  // Generate unique Complaint ID (e.g. UE-2026-00129)
  const complaints = DB.getComplaints();
  const nextNum = 129 + complaints.length;
  const compId = `UE-2026-00${nextNum}`;

  // Execute transparent Rule-Based AI Priority Calculation
  const aiResult = calculateAIPriority(category, title, description, address);

  const newComplaint = {
    id: compId,
    title,
    description,
    category,
    severity: aiResult.priority === 'critical' || aiResult.priority === 'high' ? 'high' : (aiResult.priority === 'medium' ? 'medium' : 'low'),
    priority: aiResult.priority,
    riskScore: aiResult.riskScore,
    priorityReason: aiResult.reason,
    status: 'submitted', // 6-stage workflow start
    lat: selectedCoordinates.lat,
    lng: selectedCoordinates.lng,
    address,
    image: imageBase64,
    resolutionImage: '',
    resolutionRemarks: '',
    resolvedAt: '',
    reporter: user.username,
    contactInfo,
    supports: 1,
    supportedBy: [user.username],
    department: 'Unassigned',
    comments: [
      { author: 'system', comment: `Complaint registered with Complaint ID: ${compId}. AI Risk Score evaluated: ${aiResult.riskScore}/100 (${aiResult.priority.toUpperCase()}).`, date: new Date().toISOString() }
    ],
    feedback: null,
    date: datetime ? new Date(datetime).toISOString() : new Date().toISOString()
  };

  DB.addComplaint(newComplaint);

  // Reputation score update
  const newReputation = Math.min(100, user.reputationScore + 2);
  DB.updateUser(user.username, { reputationScore: newReputation });

  // Reset form
  document.getElementById('complaint-submit-form').reset();
  document.getElementById('comp-coords').value = '';
  document.getElementById('upload-preview-container').style.display = 'none';
  document.getElementById('upload-zone').style.display = 'flex';
  selectedCoordinates = null;
  imageBase64 = '';

  // Show Confirmation Modal
  showConfirmationModal(newComplaint, user);
}

function showConfirmationModal(complaint, user) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content glass">
      <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.8rem;">
        <div style="width:60px; height:60px; border-radius:50%; background:var(--color-resolved-bg); color:var(--color-resolved); display:flex; align-items:center; justify-content:center; font-size:2rem;">
          <i data-lucide="check-circle-2"></i>
        </div>
        <h2 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800;">Complaint Submitted!</h2>
        <span class="badge badge-submitted" style="font-size:0.9rem; padding:0.4rem 1rem;">ID: ${complaint.id}</span>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:12px; display:flex; flex-direction:column; gap:0.6rem; font-size:0.85rem;">
        <div><strong>Title:</strong> ${complaint.title}</div>
        <div><strong>Category:</strong> ${complaint.category.replace('-', ' ').toUpperCase()}</div>
        <div><strong>Location:</strong> ${complaint.address}</div>
        <div><strong>Submitted Date:</strong> ${new Date(complaint.date).toLocaleString()}</div>
        
        <!-- AI Risk Card -->
        <div class="ai-risk-card" style="margin-top:0.4rem;">
          <div class="ai-risk-header">
            <span>🤖 AI Priority Evaluation (Rule-Based Simulation)</span>
            <span class="ai-risk-score-badge ai-risk-score-${complaint.priority}">${complaint.riskScore}/100 (${complaint.priority.toUpperCase()})</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">${complaint.priorityReason}</p>
        </div>
      </div>

      <div style="display:flex; gap:1rem; margin-top:0.5rem;">
        <a href="#/track" id="btn-modal-track" class="btn btn-primary" style="flex:1;">Track Status Now</a>
        <button id="btn-modal-close" class="btn btn-outline" style="flex:1;">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  lucide.createIcons();

  document.getElementById('btn-modal-close').addEventListener('click', () => {
    modal.remove();
    RenderComplaintsPortal(user);
  });

  document.getElementById('btn-modal-track').addEventListener('click', () => {
    modal.remove();
    window.location.hash = `#/track?id=${complaint.id}`;
  });
}

function showDuplicateAlertModal(existing, currentUser) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content glass">
      <h3 style="color:var(--color-warning); font-size:1.3rem; display:flex; align-items:center; gap:0.5rem;">
        <i data-lucide="alert-circle"></i> Potential Duplicate Detected
      </h3>
      <p style="font-size:0.95rem; line-height:1.5; color:var(--text-secondary);">
        Another active report of the same category has already been logged nearby at this location.
      </p>
      
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:10px;">
        <strong style="color:var(--primary); font-size:0.9rem;">${existing.title}</strong>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Complaint ID: <strong>${existing.id}</strong> | Status: <span class="badge badge-${existing.status}">${existing.status}</span></p>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.2rem;">Submitted: ${new Date(existing.date).toLocaleDateString()}</p>
      </div>

      <p style="font-size:0.9rem; color:var(--text-secondary);">
        We recommend <strong>supporting this existing complaint</strong> to raise its priority score.
      </p>

      <div style="display:flex; gap:1rem; margin-top:0.5rem;">
        <button id="modal-btn-support" class="btn btn-primary" style="flex:1;">Support Existing Alert</button>
        <button id="modal-btn-force" class="btn btn-outline" style="flex:1;">File Anyway</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  lucide.createIcons();

  document.getElementById('modal-btn-support').addEventListener('click', () => {
    modal.remove();
    supportComplaint(existing.id, currentUser);
  });

  document.getElementById('modal-btn-force').addEventListener('click', () => {
    modal.remove();
    const category = document.getElementById('comp-category').value;
    const title = document.getElementById('comp-title').value.trim();
    const description = document.getElementById('comp-description').value.trim();
    const address = document.getElementById('comp-address').value.trim();
    const datetime = document.getElementById('comp-datetime').value;
    const contactName = document.getElementById('comp-contact-name').value.trim();
    const contactEmail = document.getElementById('comp-contact-email').value.trim();
    const contactPhone = document.getElementById('comp-contact-phone').value.trim();
    submitComplaint(title, category, description, address, datetime, { name: contactName, email: contactEmail, phone: contactPhone }, currentUser);
  });
}

function supportComplaint(compId, user) {
  const complaints = DB.getComplaints();
  const c = complaints.find(item => item.id === compId);

  if (c) {
    if (c.supportedBy.includes(user.username)) {
      showToast('You have already supported this incident.', 'warning');
      return;
    }

    const newSupports = c.supports + 1;
    const newSupportedBy = [...c.supportedBy, user.username];
    
    DB.updateComplaint(compId, {
      supports: newSupports,
      supportedBy: newSupportedBy
    });

    const reporter = DB.getUsers().find(u => u.username === c.reporter);
    if (reporter) {
      DB.updateUser(c.reporter, { reputationScore: Math.min(100, reporter.reputationScore + 3) });
    }
    DB.updateUser(user.username, { reputationScore: Math.min(100, user.reputationScore + 1) });

    showToast('Upvoted successfully. Priority level recalibrated.', 'success');
    RenderComplaintsPortal(user);
    showComplaintDetails(compId, user);
  }
}

function renderComplaintsList(currentUser) {
  const container = document.getElementById('complaints-list-container');
  const complaints = DB.getComplaints();

  if (complaints.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="folder-open" class="empty-state-icon"></i>
        <h3>No complaints reported yet.</h3>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = complaints.map(c => {
    let iconClass = `badge-${c.status}`;
    let priorityClass = `badge-priority-${c.priority || 'medium'}`;

    return `
      <div class="glass glass-hover p-4 complaint-list-card" data-id="${c.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div style="min-width:0; flex:1;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
            <span class="badge ${iconClass}">${c.status}</span>
            <span class="badge ${priorityClass}">${(c.priority || 'medium').toUpperCase()}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${c.id}</span>
          </div>
          <h4 style="font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</h4>
          <div style="display:flex; gap:1rem; font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
            <span>Category: <strong style="text-transform:capitalize;">${c.category.replace('-', ' ')}</strong></span>
            <span>Supports: <strong>${c.supports}</strong></span>
          </div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--text-muted); width:20px; height:20px; flex-shrink:0; margin-left:0.5rem;"></i>
      </div>
    `;
  }).join('');

  lucide.createIcons();

  document.querySelectorAll('.complaint-list-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      showComplaintDetails(id, currentUser);
    });
  });
}

export function showComplaintDetails(id, currentUser) {
  currentDetailId = id;
  const panel = document.getElementById('complaint-details-panel');
  if (!panel) return;

  const complaints = DB.getComplaints();
  const c = complaints.find(item => item.id === id);

  if (!c) return;

  const dateStr = new Date(c.date).toLocaleString();
  
  // 6-Stage Timeline Workflow Stepper
  const stages = ['submitted', 'under-review', 'verified', 'assigned', 'in-progress', 'resolved'];
  const activeIndex = stages.indexOf(c.status);

  const timelineHTML = `
    <div class="status-timeline">
      <div class="status-timeline-line"></div>
      <div class="status-timeline-progress" style="width: ${activeIndex > 0 ? (activeIndex / (stages.length - 1)) * 90 : 0}%;"></div>
      ${stages.map((stg, idx) => {
        let nodeClass = '';
        if (idx === activeIndex) nodeClass = 'active';
        else if (idx < activeIndex) nodeClass = 'completed';
        
        return `
          <div class="timeline-step ${nodeClass}">
            <div class="step-node">${idx + 1}</div>
            <div class="step-label" style="text-transform:capitalize;">${stg.replace('-', ' ')}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem;">
      <div>
        <span class="badge badge-${c.status}">${c.status}</span>
        <span class="badge badge-priority-${c.priority || 'medium'}">${(c.priority || 'medium').toUpperCase()}</span>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">ID: ${c.id}</span>
        <h3 style="font-size:1.3rem; font-weight:800; margin-top:0.5rem;">${c.title}</h3>
      </div>
      <button id="btn-close-details" class="btn-icon" style="border:none;"><i data-lucide="x"></i></button>
    </div>

    <!-- Description & Specs -->
    <div style="font-size:0.9rem; line-height:1.6; display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary);">${c.description}</p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-top:0.5rem; font-size:0.8rem; background:var(--bg-secondary); padding:0.8rem; border-radius:8px;">
        <div>Category: <strong style="text-transform:capitalize;">${c.category.replace('-', ' ')}</strong></div>
        <div>Location Address: <strong>${c.address || 'Central District'}</strong></div>
        <div>Reporter: <strong>${c.reporter}</strong></div>
        <div>Filing Date: <strong>${dateStr}</strong></div>
        <div>Assigned Dept: <strong>${c.department || 'Unassigned'}</strong></div>
        <div>GPS Coordinates: <strong>${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</strong></div>
      </div>

      <!-- AI Risk Evaluation Card -->
      <div class="ai-risk-card" style="margin-top:0.4rem;">
        <div class="ai-risk-header">
          <span>🤖 AI Priority Classification (Rule-Based Simulation)</span>
          <span class="ai-risk-score-badge ai-risk-score-${c.priority}">${c.riskScore || 65}/100 (${(c.priority || 'medium').toUpperCase()})</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">${c.priorityReason || 'Evaluated under standard municipal priority guidelines.'}</p>
      </div>
    </div>

    <!-- 6-Stage Timeline -->
    <h4 style="font-weight:700; font-size:0.95rem; margin-top:0.8rem;">6-Stage Progress Tracker</h4>
    ${timelineHTML}

    <!-- Resolution Proof Section (Before vs After Photos) -->
    ${c.status === 'resolved' || c.resolutionImage ? `
      <div style="border-top:1px solid var(--border-color); padding-top:1rem; margin-top:0.5rem;">
        <h4 style="font-weight:700; font-size:0.95rem; color:var(--color-resolved); display:flex; align-items:center; gap:0.4rem;">
          <i data-lucide="check-check"></i> Resolution Proof & Verification Details
        </h4>

        ${c.resolutionRemarks ? `
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.4rem; background:var(--color-resolved-bg); padding:0.8rem; border-radius:8px;">
            <strong>Operator Remarks:</strong> ${c.resolutionRemarks}
          </p>
        ` : ''}

        <div class="proof-comparison-grid">
          <div class="proof-card">
            <div class="proof-card-label before">Before Incident Image</div>
            <div class="proof-img-wrapper">
              <img src="${c.image || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop'}" alt="Before Photo">
            </div>
          </div>
          
          <div class="proof-card">
            <div class="proof-card-label after">After Resolution Proof</div>
            <div class="proof-img-wrapper">
              <img src="${c.resolutionImage || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=600&auto=format&fit=crop'}" alt="After Resolution Photo">
            </div>
          </div>
        </div>
      </div>
    ` : `
      ${c.image ? `
        <div style="border-radius:10px; overflow:hidden; border:1px solid var(--border-color); max-height:200px; width:100%; margin-top:0.5rem;">
          <img src="${c.image}" alt="Incident Image" style="width:100%; height:100%; object-fit:cover;">
        </div>
      ` : ''}
    `}

    <!-- Citizen Feedback Rating Form (If Resolved) -->
    ${c.status === 'resolved' ? `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:10px; margin-top:1rem;">
        <h4 style="font-weight:700; font-size:0.9rem; margin-bottom:0.4rem;">Citizen Feedback Rating</h4>
        ${c.feedback ? `
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <div style="display:flex; align-items:center; gap:0.4rem; color:var(--color-pending); font-weight:700;">
              <span>${'★'.repeat(c.feedback.rating)}${'☆'.repeat(5 - c.feedback.rating)}</span>
              <span style="font-size:0.85rem; color:var(--text-primary); font-weight:600;">(${c.feedback.rating}/5 Stars)</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); font-style:italic;">"${c.feedback.comment}"</p>
          </div>
        ` : `
          <form id="feedback-rating-form" style="display:flex; flex-direction:column; gap:0.8rem;">
            <p style="font-size:0.8rem; color:var(--text-secondary);">Was your issue resolved satisfactorily?</p>
            <div style="display:flex; gap:0.5rem; font-size:1.4rem;">
              <select id="feed-stars-select" class="form-control" style="width:120px;">
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★☆ (4)</option>
                <option value="3">★★★☆☆ (3)</option>
                <option value="2">★★☆☆☆ (2)</option>
                <option value="1">★☆☆☆☆ (1)</option>
              </select>
              <input type="text" id="feed-text-input" class="form-control" placeholder="Optional comments..." style="flex:1;">
              <button type="submit" class="btn btn-primary btn-sm">Submit Rating</button>
            </div>
          </form>
        `}
      </div>
    ` : ''}

    <!-- Upvote support area -->
    <div class="community-vote-box" style="margin-top:1rem;">
      <div class="community-vote-stats">
        <span class="vote-count">${c.supports} Supporters</span>
        <span class="vote-desc">Priority level adjusts dynamically based on support size.</span>
      </div>
      <button id="btn-upvote-comp" class="btn ${currentUser && c.supportedBy.includes(currentUser.username) ? 'btn-outline' : 'btn-primary'}" ${currentUser && c.supportedBy.includes(currentUser.username) ? 'disabled' : ''}>
        <i data-lucide="thumbs-up"></i> ${currentUser && c.supportedBy.includes(currentUser.username) ? 'Supported' : 'Support Issue'}
      </button>
    </div>

    <!-- Official responses comments list -->
    <div class="comments-section">
      <h4 style="font-weight:700; font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
        <i data-lucide="message-square" style="color:var(--primary);"></i> Official Review Log (${c.comments.length})
      </h4>
      <div class="comments-list">
        ${c.comments.length === 0 
          ? '<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No responses logged yet by operators.</p>'
          : c.comments.map(comm => `
              <div class="comment-card">
                <div class="comment-author-row">
                  <span class="comment-author"><i data-lucide="shield" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:0.2rem;"></i> ${comm.author}</span>
                  <span class="comment-date">${new Date(comm.date).toLocaleString()}</span>
                </div>
                <div class="comment-body">${comm.comment}</div>
              </div>
            `).join('')
        }
      </div>
    </div>
  `;

  panel.classList.remove('hidden');
  lucide.createIcons();

  // Bind close details
  document.getElementById('btn-close-details').addEventListener('click', () => {
    panel.classList.add('hidden');
    currentDetailId = null;
  });

  // Bind upvote details
  if (currentUser) {
    document.getElementById('btn-upvote-comp').addEventListener('click', () => {
      supportComplaint(c.id, currentUser);
    });
  }

  // Bind feedback submission
  const feedbackForm = document.getElementById('feedback-rating-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rating = parseInt(document.getElementById('feed-stars-select').value, 10);
      const comment = document.getElementById('feed-text-input').value.trim() || 'Resolved satisfactorily.';

      DB.updateComplaint(c.id, {
        feedback: {
          rating,
          comment,
          submittedAt: new Date().toISOString()
        }
      });

      showToast('Thank you for rating your resolution experience!', 'success');
      showComplaintDetails(c.id, currentUser);
    });
  }
}

/* Dedicated Public Complaint Tracker View */
export function RenderComplaintTrackerPage(prefilledId = '') {
  const outlet = document.getElementById('router-outlet');
  const user = DB.getCurrentUser();

  outlet.innerHTML = `
    <div style="padding: 3rem 2rem; max-width: 900px; margin: 0 auto; width: 100%;">
      <div style="text-align:center; margin-bottom: 2rem;">
        <span class="hero-tag">Complaint Tracker</span>
        <h1 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin-top: 0.5rem;">Track Incident Resolution Progress</h1>
        <p style="color: var(--text-secondary); margin-top: 0.5rem;">Enter any unique Complaint ID (e.g. <code>UE-2026-00124</code>) to view status timelines, before/after proof, and department updates.</p>
      </div>

      <div class="glass" style="padding: 1.5rem; display: flex; gap: 0.8rem; margin-bottom: 2rem;">
        <div style="position: relative; flex: 1;">
          <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 18px; height: 18px;"></i>
          <input type="text" id="tracker-id-input" class="form-control" style="padding-left: 2.5rem;" placeholder="Enter Complaint ID (e.g. UE-2026-00124)" value="${prefilledId}">
        </div>
        <button id="btn-track-lookup" class="btn btn-primary"><i data-lucide="search"></i> Lookup Status</button>
      </div>

      <div id="complaint-details-panel" class="glass widget-card hidden">
        <!-- Rendered when ID is found -->
      </div>
    </div>
  `;

  lucide.createIcons();

  const searchInput = document.getElementById('tracker-id-input');
  const searchBtn = document.getElementById('btn-track-lookup');

  const performLookup = () => {
    const query = searchInput.value.trim().toUpperCase();
    if (!query) {
      showToast('Please enter a Complaint ID.', 'warning');
      return;
    }

    const complaints = DB.getComplaints();
    const match = complaints.find(c => c.id.toUpperCase() === query || c.id.replace(/-/g, '').toUpperCase() === query.replace(/-/g, ''));
    if (match) {
      showComplaintDetails(match.id, user);
      showToast(`Loaded tracker info for ${match.id}`, 'success');
    } else {
      showToast(`No complaint found with ID: ${query}`, 'error');
      document.getElementById('complaint-details-panel').classList.add('hidden');
    }
  };

  searchBtn.addEventListener('click', performLookup);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performLookup();
  });

  if (prefilledId) {
    performLookup();
  }
}
