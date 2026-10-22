/* Citizen Dashboard Module (js/dashboard.js) */

import { DB } from './state.js';
import { showToast } from './app.js';

export function RenderUserDashboard(user) {
  const outlet = document.getElementById('router-outlet');
  
  // Fetch dynamic statistics based on actual storage data
  const complaints = DB.getComplaints();
  const userComplaints = complaints.filter(c => c.reporter === user.username);
  const totalReportsCount = userComplaints.length;
  const pendingReportsCount = userComplaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length;
  const resolvedReportsCount = userComplaints.filter(c => c.status === 'resolved').length;

  // Notifications for current user
  const dbUsers = DB.getUsers();
  const currentUserObj = dbUsers.find(u => u.username === user.username) || user;
  const userNotifications = currentUserObj.notifications || [
    { id: 'notif-1', complaintId: 'UE-2026-00124', message: 'Your complaint UE-2026-00124 has been verified by municipal operators.', date: '2026-07-12T09:00:00Z', read: true },
    { id: 'notif-2', complaintId: 'UE-2026-00124', message: 'Your complaint UE-2026-00124 has been assigned to Municipal Works Division.', date: '2026-07-12T10:12:00Z', read: true },
    { id: 'notif-3', complaintId: 'UE-2026-00124', message: 'Your complaint UE-2026-00124 has been successfully resolved!', date: '2026-07-14T16:45:00Z', read: false }
  ];
  const unreadNotifCount = userNotifications.filter(n => !n.read).length;
  
  outlet.innerHTML = `
    <div class="dashboard-container">
      
      <!-- Dashboard Sidebar -->
      <aside class="db-sidebar">
        <div class="db-user-card">
          <div class="db-avatar">${user.name.charAt(0)}</div>
          <div class="db-user-info">
            <span class="db-user-name">${user.name}</span>
            <span class="db-user-role">${user.role} Account</span>
          </div>
        </div>
        
        <nav class="db-nav">
          <a href="#/dashboard" class="db-nav-link active"><i data-lucide="layout-dashboard"></i> Dashboard</a>
          <a href="#/complaints" class="db-nav-link"><i data-lucide="plus-circle"></i> Report New Issue</a>
          <a href="#/track" class="db-nav-link"><i data-lucide="search"></i> Track Complaint</a>
          <a href="#/map" class="db-nav-link"><i data-lucide="map"></i> Interactive Map</a>
          <a href="#/profile" class="db-nav-link"><i data-lucide="user-cog"></i> Profile Settings</a>
        </nav>
      </aside>

      <!-- Dashboard Main Work Area -->
      <main class="db-main">
        
        <div class="db-header">
          <div>
            <h1>Citizen Portal Dashboard</h1>
            <p style="color:var(--text-secondary); margin-top:0.3rem;">Welcome back, ${user.name.split(' ')[0]}. Academic Smart City Engineering Prototype.</p>
          </div>
          
          <!-- Quick Action Buttons -->
          <div class="db-header-actions" style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <a href="#/complaints" class="btn btn-primary"><i data-lucide="plus-circle"></i> Report New Issue</a>
            <a href="#/track" class="btn btn-outline"><i data-lucide="search"></i> Track Complaint</a>
            <a href="#/complaints" class="btn btn-outline"><i data-lucide="list"></i> View My Complaints</a>
          </div>
        </div>

        <!-- 1. Stats Counter Cards -->
        <div class="stats-grid">
          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${user.reputationScore} / 100</span>
              <span class="stat-label">Reputation Meter</span>
            </div>
            <div class="stat-icon" style="background-color: var(--color-resolved-bg); color: var(--color-resolved);"><i data-lucide="medal"></i></div>
          </div>

          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${totalReportsCount}</span>
              <span class="stat-label">Total Complaints Submitted</span>
            </div>
            <div class="stat-icon" style="background-color: var(--primary-glow); color: var(--primary);"><i data-lucide="file-text"></i></div>
          </div>

          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${pendingReportsCount}</span>
              <span class="stat-label">Pending / In-Progress</span>
            </div>
            <div class="stat-icon" style="background-color: var(--color-pending-bg); color: var(--color-pending);"><i data-lucide="clock"></i></div>
          </div>

          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${resolvedReportsCount}</span>
              <span class="stat-label">Resolved Complaints</span>
            </div>
            <div class="stat-icon" style="background-color: var(--color-resolved-bg); color: var(--color-resolved);"><i data-lucide="check-circle-2"></i></div>
          </div>
        </div>

        <!-- 2. Main Dashboard Layout -->
        <div class="dashboard-layout-grid">
          
          <!-- Column 1: Recent Complaints List & Notifications Feed -->
          <div style="display:flex; flex-direction:column; gap:2rem;">
            
            <!-- Citizen Notification System Panel -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span style="display:flex; align-items:center; gap:0.5rem;">
                  <i data-lucide="bell" style="color:var(--primary);"></i> Citizen Notifications
                  ${unreadNotifCount > 0 ? `<span class="badge badge-rejected">${unreadNotifCount} New</span>` : ''}
                </span>
                ${unreadNotifCount > 0 ? `<button id="btn-mark-notifs-read" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:0.2rem 0.6rem;">Mark All Read</button>` : ''}
              </div>
              
              <div style="display:flex; flex-direction:column; gap:0.8rem; max-height:260px; overflow-y:auto;">
                ${userNotifications.length === 0 ? `
                  <p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">No notifications yet.</p>
                ` : userNotifications.map(n => `
                  <div class="notif-item ${!n.read ? 'unread' : ''}">
                    <i data-lucide="${n.read ? 'bell-off' : 'bell-ring'}" style="width:16px; height:16px; color:${!n.read ? 'var(--primary)' : 'var(--text-muted)'}; margin-top:0.2rem; flex-shrink:0;"></i>
                    <div class="notif-content">
                      <span class="notif-msg">${n.message}</span>
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.2rem;">
                        <span class="notif-date">${new Date(n.date).toLocaleString()}</span>
                        <a href="#/track?id=${n.complaintId}" style="font-size:0.75rem; color:var(--primary); font-weight:700;">View Tracker &rarr;</a>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Recent Submitted Complaints -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span>📋 My Recent Complaints</span>
                <a href="#/complaints" style="color:var(--primary); font-size:0.8rem; font-weight:700;">View All &rarr;</a>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.8rem;">
                ${userComplaints.length === 0 ? `
                  <div class="empty-state">
                    <i data-lucide="file-plus" class="empty-state-icon"></i>
                    <p>No complaints reported by your account yet.</p>
                    <a href="#/complaints" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Report Your First Issue</a>
                  </div>
                ` : userComplaints.slice(0, 4).map(c => `
                  <div style="padding:0.9rem; border-radius:10px; background:var(--bg-secondary); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; gap:1rem;">
                    <div style="min-width:0;">
                      <div style="display:flex; gap:0.4rem; align-items:center; margin-bottom:0.2rem;">
                        <span class="badge badge-${c.status}">${c.status}</span>
                        <span class="badge badge-priority-${c.priority || 'medium'}">${(c.priority || 'medium').toUpperCase()}</span>
                        <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">${c.id}</span>
                      </div>
                      <h4 style="font-size:0.9rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</h4>
                      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.1rem;">📍 ${c.address || 'Central District'}</p>
                    </div>
                    <a href="#/track?id=${c.id}" class="btn btn-outline btn-sm" style="font-size:0.75rem; flex-shrink:0;">Track Status</a>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- AI Mobility Recommendations Widget -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span>🤖 AI Priority & Mobility Advisory</span>
                <span class="badge badge-resolved">Live Advisory</span>
              </div>
              <div class="ai-suggestions-list">
                <div class="ai-suggestion-item">
                  <i data-lucide="zap" class="ai-suggestion-icon"></i>
                  <div class="ai-suggestion-text">
                    <h4>Best Time to Travel: Central Corridor</h4>
                    <p>Based on smart signal queue lengths, traffic density on Residency Road drops by 35% starting at 10:15 AM. Plan departures accordingly.</p>
                  </div>
                </div>

                <div class="ai-suggestion-item" style="border-left-color: var(--color-pending);">
                  <i data-lucide="accessibility" class="ai-suggestion-icon" style="color:var(--color-pending);"></i>
                  <div class="ai-suggestion-text">
                    <h4>Accessibility Alert: MG Road Metro Station</h4>
                    <p>Elevator B is fully active. Pedestrians with strollers or wheelchairs can access Platform 1 barrier-free.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Column 2: SOS panel, Weather & Contacts -->
          <div style="display:flex; flex-direction:column; gap:2rem;">
            
            <!-- SOS Emergency Panel -->
            <div class="sos-card">
              <h3>🚨 Emergency Services SOS</h3>
              <p>Pressing the button below broadcasts instant GPS telemetry coordinates to City Emergency Dispatch Teams.</p>
              <button id="sos-btn-trigger" class="sos-btn">SOS</button>
              <p style="font-size:0.75rem; margin-top:0.3rem; opacity:0.8;">Single click triggers demo response callout.</p>
            </div>

            <!-- Environmental Summary Card -->
            <div class="widget-card glass">
              <div class="widget-title"><span>🌤️ City Environment Feed</span></div>
              <div class="env-widget">
                <div class="env-row">
                  <div class="env-info">
                    <i data-lucide="cloud-sun" class="env-icon"></i>
                    <span class="env-label">Weather Forecast</span>
                  </div>
                  <span class="env-value">28&deg;C, Scattered Clouds</span>
                </div>
                
                <div class="env-row">
                  <div class="env-info">
                    <i data-lucide="wind" class="env-icon" style="color:var(--color-resolved);"></i>
                    <span class="env-label">Air Quality (AQI)</span>
                  </div>
                  <span class="env-value" style="color:var(--color-resolved);">84 (Good)</span>
                </div>

                <div class="env-row">
                  <div class="env-info">
                    <i data-lucide="droplets" class="env-icon" style="color:var(--primary);"></i>
                    <span class="env-label">Humidity Index</span>
                  </div>
                  <span class="env-value">62%</span>
                </div>
              </div>
            </div>

            <!-- Emergency Numbers -->
            <div class="widget-card glass">
              <div class="widget-title"><span>📞 Emergency Contacts</span></div>
              <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                  <span>Smart City Command Control</span>
                  <strong>1912</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                  <span>Emergency Police Assistance</span>
                  <strong>112</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                  <span>Fire Responder Control</span>
                  <strong>101</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:0.1rem;">
                  <span>Ambulance Services</span>
                  <strong>108</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  `;

  lucide.createIcons();
  bindDashboardControls(user, userNotifications);
}

function bindDashboardControls(user, userNotifications) {
  const sosBtn = document.getElementById('sos-btn-trigger');
  
  if (sosBtn) {
    sosBtn.addEventListener('click', () => {
      showToast('🚨 EMERGENCY SOS SENT! Dispatching telemetry logs to Command Center.', 'error', 6000);
      
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
      overlay.style.color = 'white';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '99999';
      overlay.style.gap = '2rem';
      overlay.style.animation = 'flashSOSOverlay 1s infinite alternate';

      overlay.innerHTML = `
        <i data-lucide="shield-alert" style="width: 120px; height: 120px;"></i>
        <h1 style="font-size: 3rem; font-family:var(--font-heading); font-weight:800; color:white; text-align:center;">SOS METRICS DISPATCHED</h1>
        <p style="font-size: 1.2rem; max-width:600px; text-align:center; color:white; font-weight:600;">
          Emergency command vehicles have locked GPS tracking coordinates. First responders alerted. Help is on the way.
        </p>
        <button id="close-sos-overlay" class="btn btn-secondary btn-lg" style="background-color:white; color:#ef4444; border:none; padding:1rem 2rem; font-size:1.1rem; border-radius:50px; font-weight:800;">DISMISS SOS PROTOCOL</button>
      `;

      document.body.appendChild(overlay);
      lucide.createIcons();

      const style = document.createElement('style');
      style.id = 'sos-animation-style';
      style.textContent = `
        @keyframes flashSOSOverlay {
          from { opacity: 0.95; }
          to { opacity: 0.85; }
        }
      `;
      document.head.appendChild(style);

      document.getElementById('close-sos-overlay').addEventListener('click', () => {
        overlay.remove();
        style.remove();
        showToast('Emergency SOS dismissed.', 'info');
      });
    });
  }

  // Mark all notifications read button
  const markReadBtn = document.getElementById('btn-mark-notifs-read');
  if (markReadBtn) {
    markReadBtn.addEventListener('click', () => {
      const updatedNotifs = userNotifications.map(n => ({ ...n, read: true }));
      DB.updateUser(user.username, { notifications: updatedNotifs });
      showToast('Notifications marked as read.', 'success');
      RenderUserDashboard(user);
    });
  }
}
