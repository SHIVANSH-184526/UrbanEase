/* Admin Dashboard Panel Logic (js/admin.js) */

import { DB } from './state.js';
import { showToast } from './app.js';
import { RenderAnalyticsCharts } from './analytics.js';

let activeAdminTab = 'complaints';
let activeReviewId = null;
let resolutionImageBase64 = '';

export function RenderAdminDashboard(adminUser) {
  const outlet = document.getElementById('router-outlet');

  outlet.innerHTML = `
    <div class="dashboard-container">
      
      <!-- Admin Sidebar -->
      <aside class="db-sidebar">
        <div class="db-user-card">
          <div class="db-avatar" style="background-color: var(--secondary); color: var(--bg-primary);">${adminUser.name.charAt(0)}</div>
          <div class="db-user-info">
            <span class="db-user-name">${adminUser.name}</span>
            <span class="db-user-role">Administrator</span>
          </div>
        </div>
        
        <nav class="db-nav">
          <button class="db-nav-link admin-nav-btn" data-tab="complaints"><i data-lucide="message-square-warning"></i> Complaints</button>
          <button class="db-nav-link admin-nav-btn" data-tab="users"><i data-lucide="users"></i> User Accounts</button>
          <button class="db-nav-link admin-nav-btn" data-tab="analytics"><i data-lucide="bar-chart-3"></i> Smart City Analytics</button>
          <button class="db-nav-link admin-nav-btn" data-tab="system"><i data-lucide="settings"></i> Configurations</button>
        </nav>
      </aside>

      <!-- Admin Main Panel -->
      <main class="db-main" id="admin-main-panel">
        <!-- Rendered dynamically based on active tab -->
      </main>

    </div>
  `;

  lucide.createIcons();
  
  const tabBtns = document.querySelectorAll('.admin-nav-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab, adminUser);
    });
  });

  switchTab(activeAdminTab, adminUser);
}

function switchTab(tab, adminUser) {
  activeAdminTab = tab;
  
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const panel = document.getElementById('admin-main-panel');
  if (!panel) return;

  activeReviewId = null;

  if (tab === 'complaints') {
    renderComplaintManager(panel, adminUser);
  } else if (tab === 'users') {
    renderUserManager(panel, adminUser);
  } else if (tab === 'analytics') {
    renderAnalyticsTab(panel);
  } else if (tab === 'system') {
    renderSystemConfig(panel, adminUser);
  }

  lucide.createIcons();
}

/* ==========================================
   COMPLAINTS MANAGER PANEL & FILTERS
   ========================================== */
function renderComplaintManager(container, adminUser) {
  const allComplaints = DB.getComplaints();

  // Admin KPI Calculations
  const totalCount = allComplaints.length;
  const pendingCount = allComplaints.filter(c => c.status === 'submitted' || c.status === 'under-review').length;
  const inProgressCount = allComplaints.filter(c => c.status === 'verified' || c.status === 'assigned' || c.status === 'in-progress').length;
  const resolvedCount = allComplaints.filter(c => c.status === 'resolved').length;
  const highPriorityCount = allComplaints.filter(c => c.priority === 'high' || c.priority === 'critical').length;
  const avgResolutionTimeDays = "1.8 days"; // Simulated average resolution metric

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>Municipal Incident Control</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Process citizen reports across 6 resolution stages, inspect location pins, and attach resolution proof photos.</p>
      </div>
    </div>

    <!-- Admin KPI Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value">${totalCount}</span>
          <span class="stat-label">Total Complaints</span>
        </div>
        <div class="stat-icon" style="background-color: var(--primary-glow); color: var(--primary);"><i data-lucide="files"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value">${pendingCount}</span>
          <span class="stat-label">Pending Review</span>
        </div>
        <div class="stat-icon" style="background-color: var(--color-pending-bg); color: var(--color-pending);"><i data-lucide="clock"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value">${inProgressCount}</span>
          <span class="stat-label">In-Progress Operations</span>
        </div>
        <div class="stat-icon" style="background-color: rgba(6, 182, 212, 0.15); color: #06b6d4;"><i data-lucide="wrench"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value">${resolvedCount}</span>
          <span class="stat-label">Resolved Cases</span>
        </div>
        <div class="stat-icon" style="background-color: var(--color-resolved-bg); color: var(--color-resolved);"><i data-lucide="check-circle-2"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value" style="color:var(--color-error);">${highPriorityCount}</span>
          <span class="stat-label">High / Critical Priority</span>
        </div>
        <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.15); color: var(--color-error);"><i data-lucide="alert-octagon"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value" style="color:var(--accent);">${avgResolutionTimeDays}</span>
          <span class="stat-label">Avg Resolution Speed</span>
        </div>
        <div class="stat-icon" style="background-color: rgba(34, 211, 238, 0.15); color: var(--accent);"><i data-lucide="timer"></i></div>
      </div>
    </div>

    <!-- Search & Multi-Filter Bar -->
    <div class="glass" style="padding:1.2rem; display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
          <i data-lucide="filter" style="color:var(--primary);"></i> Search & Filter Queue
        </span>
        <button id="btn-admin-reset-filters" class="btn btn-outline btn-sm" style="font-size:0.75rem;">Reset Filters</button>
      </div>

      <div style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap:0.8rem;">
        <input type="text" id="admin-search-input" class="form-control" placeholder="Search Title, ID (UE-2026-...), Address...">
        
        <select id="admin-filter-category" class="form-control">
          <option value="">All Categories</option>
          <option value="pothole">Pothole</option>
          <option value="broken-traffic-signal">Broken Traffic Signal</option>
          <option value="streetlight-problem">Streetlight Problem</option>
          <option value="garbage-waste">Garbage / Waste</option>
          <option value="water-leakage">Water Leakage</option>
          <option value="road-damage">Road Damage</option>
          <option value="footpath-obstruction">Footpath Obstruction</option>
          <option value="accessibility-issue">Accessibility Issue</option>
          <option value="other">Other</option>
        </select>

        <select id="admin-filter-status" class="form-control">
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under-review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In-Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select id="admin-filter-priority" class="form-control">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>

    <!-- Main Complaints Table / Grid Layout -->
    <div class="complaints-container" style="margin-top:1rem;">
      
      <!-- List Queue -->
      <div class="widget-card glass">
        <div class="widget-title">
          <span id="queue-count-label">📋 Review Queue (${allComplaints.length})</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.8rem; max-height:600px; overflow-y:auto; padding-right:0.2rem;" id="admin-complaints-list">
          <!-- Populated via Javascript -->
        </div>
      </div>

      <!-- Action detail review panel -->
      <div id="admin-review-panel" class="glass widget-card hidden">
        <!-- Rendered on selecting complaint -->
      </div>

    </div>
  `;

  bindFilterControls(allComplaints, adminUser);
  applyFiltersAndRender(allComplaints, adminUser);
}

function bindFilterControls(allComplaints, adminUser) {
  const searchInput = document.getElementById('admin-search-input');
  const catFilter = document.getElementById('admin-filter-category');
  const statusFilter = document.getElementById('admin-filter-status');
  const priorityFilter = document.getElementById('admin-filter-priority');
  const resetBtn = document.getElementById('btn-admin-reset-filters');

  const onFilterChange = () => {
    applyFiltersAndRender(allComplaints, adminUser);
  };

  searchInput.addEventListener('input', onFilterChange);
  catFilter.addEventListener('change', onFilterChange);
  statusFilter.addEventListener('change', onFilterChange);
  priorityFilter.addEventListener('change', onFilterChange);

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    catFilter.value = '';
    statusFilter.value = '';
    priorityFilter.value = '';
    applyFiltersAndRender(allComplaints, adminUser);
  });
}

function applyFiltersAndRender(allComplaints, adminUser) {
  const searchVal = (document.getElementById('admin-search-input')?.value || '').toLowerCase();
  const catVal = document.getElementById('admin-filter-category')?.value || '';
  const statusVal = document.getElementById('admin-filter-status')?.value || '';
  const priorityVal = document.getElementById('admin-filter-priority')?.value || '';

  const filtered = allComplaints.filter(c => {
    const textMatch = !searchVal || 
      c.title.toLowerCase().includes(searchVal) || 
      c.id.toLowerCase().includes(searchVal) || 
      (c.address && c.address.toLowerCase().includes(searchVal)) ||
      c.description.toLowerCase().includes(searchVal);

    const catMatch = !catVal || c.category === catVal;
    const statusMatch = !statusVal || c.status === statusVal;
    const priorityMatch = !priorityVal || (c.priority || 'medium') === priorityVal;

    return textMatch && catMatch && statusMatch && priorityMatch;
  });

  const countLabel = document.getElementById('queue-count-label');
  if (countLabel) countLabel.textContent = `📋 Review Queue (${filtered.length} matching)`;

  const listContainer = document.getElementById('admin-complaints-list');
  if (!listContainer) return;

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="filter-x" class="empty-state-icon"></i>
        <p>No complaints match the selected filter criteria.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  listContainer.innerHTML = filtered.map(c => {
    let badgeClass = `badge-${c.status}`;
    let priorityClass = `badge-priority-${c.priority || 'medium'}`;

    return `
      <div class="glass glass-hover p-4 admin-comp-card" data-id="${c.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div style="min-width:0; flex:1;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
            <span class="badge ${badgeClass}">${c.status}</span>
            <span class="badge ${priorityClass}">${(c.priority || 'medium').toUpperCase()}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${c.id}</span>
          </div>
          <h4 style="font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</h4>
          <div style="display:flex; gap:1rem; font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
            <span>📍 ${c.address || 'Central Ward'}</span>
            <span>Reporter: <strong>${c.reporter}</strong></span>
          </div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--text-muted);"></i>
      </div>
    `;
  }).join('');

  lucide.createIcons();

  document.querySelectorAll('.admin-comp-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      showComplaintReview(id, adminUser);
    });
  });
}

function showComplaintReview(id, adminUser) {
  activeReviewId = id;
  resolutionImageBase64 = '';
  const panel = document.getElementById('admin-review-panel');
  if (!panel) return;

  const complaints = DB.getComplaints();
  const c = complaints.find(item => item.id === id);

  if (!c) return;

  const dateStr = new Date(c.date).toLocaleString();

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem;">
      <div>
        <span class="badge badge-${c.status}">${c.status}</span>
        <span class="badge badge-priority-${c.priority || 'medium'}">${(c.priority || 'medium').toUpperCase()}</span>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">Review ID: ${c.id}</span>
        <h3 style="font-size:1.3rem; font-weight:800; margin-top:0.5rem;">${c.title}</h3>
      </div>
      <button id="btn-close-review" class="btn-icon" style="border:none;"><i data-lucide="x"></i></button>
    </div>

    <div style="font-size:0.9rem; line-height:1.6; display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary);">${c.description}</p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-top:0.5rem; font-size:0.8rem; background:var(--bg-secondary); padding:0.8rem; border-radius:8px;">
        <div>Reporter: <strong>${c.reporter}</strong></div>
        <div>Filing Date: <strong>${dateStr}</strong></div>
        <div>Location Address: <strong>${c.address || 'Central District'}</strong></div>
        <div>GPS Pin: <strong>${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</strong></div>
      </div>

      <!-- AI Risk Evaluation Card -->
      <div class="ai-risk-card" style="margin-top:0.4rem;">
        <div class="ai-risk-header">
          <span>🤖 AI Priority Evaluation (Rule-Based Simulation)</span>
          <span class="ai-risk-score-badge ai-risk-score-${c.priority}">${c.riskScore || 65}/100</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">${c.priorityReason || 'Evaluated under standard municipal priority guidelines.'}</p>
      </div>
    </div>

    <!-- Before Image -->
    ${c.image ? `
      <div style="border-radius:10px; overflow:hidden; border:1px solid var(--border-color); max-height:180px; width:100%;">
        <img src="${c.image}" alt="Incident Before Photo" style="width:100%; height:100%; object-fit:cover;">
      </div>
    ` : ''}

    <form id="admin-action-form" class="auth-form" style="border-top:1px solid var(--border-color); padding-top:1rem; gap:1rem;">
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
        <div class="form-group">
          <label>Assign Department</label>
          <select id="act-department" class="form-control">
            <option value="Unassigned" ${c.department === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
            <option value="Municipal Works Division" ${c.department === 'Municipal Works Division' ? 'selected' : ''}>Municipal Works</option>
            <option value="Traffic Management Directorate" ${c.department === 'Traffic Management Directorate' ? 'selected' : ''}>Traffic Management</option>
            <option value="Solid Waste Management" ${c.department === 'Solid Waste Management' ? 'selected' : ''}>Solid Waste Dept</option>
            <option value="City Power & Lighting Dept" ${c.department === 'City Power & Lighting Dept' ? 'selected' : ''}>Power & Lighting</option>
            <option value="Metro Accessibility Unit" ${c.department === 'Metro Accessibility Unit' ? 'selected' : ''}>Metro Access Unit</option>
          </select>
        </div>

        <div class="form-group">
          <label>Update Status (6-Stage Workflow)</label>
          <select id="act-status" class="form-control">
            <option value="submitted" ${c.status === 'submitted' ? 'selected' : ''}>1. Submitted</option>
            <option value="under-review" ${c.status === 'under-review' ? 'selected' : ''}>2. Under Review</option>
            <option value="verified" ${c.status === 'verified' ? 'selected' : ''}>3. Verified</option>
            <option value="assigned" ${c.status === 'assigned' ? 'selected' : ''}>4. Assigned</option>
            <option value="in-progress" ${c.status === 'in-progress' ? 'selected' : ''}>5. In Progress</option>
            <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>6. Resolved (Attach Proof)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Override Priority Level</label>
        <select id="act-priority" class="form-control">
          <option value="low" ${c.priority === 'low' ? 'selected' : ''}>Low Priority</option>
          <option value="medium" ${c.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
          <option value="high" ${c.priority === 'high' ? 'selected' : ''}>High Priority</option>
          <option value="critical" ${c.priority === 'critical' ? 'selected' : ''}>Critical Priority</option>
        </select>
      </div>

      <!-- Resolution Proof Upload Section (Shown when Resolved selected or active) -->
      <div id="resolution-proof-section" class="form-group ${c.status === 'resolved' ? '' : 'hidden'}" style="background:var(--color-resolved-bg); padding:1rem; border-radius:10px; border:1px dashed var(--color-resolved);">
        <label style="color:var(--color-resolved); font-weight:700;">Resolution Proof (After Image & Remarks)</label>
        <input type="file" id="act-resolution-file" accept="image/*" class="form-control" style="margin-bottom:0.5rem;">
        <textarea id="act-resolution-remarks" class="form-control" rows="2" placeholder="Detail resolution actions taken (e.g. Road filled & compacted)...">${c.resolutionRemarks || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Add Official Admin Remarks (Timeline Log)</label>
        <textarea id="act-comment" class="form-control" rows="2" placeholder="e.g. Crew dispatched. Work scheduled."></textarea>
      </div>

      <div style="display:flex; gap:1rem;">
        <button type="submit" class="btn btn-primary" style="flex:1;">Save Status & Trigger Notification</button>
        <button type="button" id="btn-suspend-reporter" class="btn btn-outline" style="border-color:var(--color-error); color:var(--color-error);">Suspend Reporter</button>
      </div>
    </form>
  `;

  panel.classList.remove('hidden');
  lucide.createIcons();

  // Handle Resolution file upload
  const resFileInput = document.getElementById('act-resolution-file');
  if (resFileInput) {
    resFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          resolutionImageBase64 = evt.target.result;
          showToast('Resolution proof photo loaded.', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Toggle Resolution Proof section when status changes
  const statusSelect = document.getElementById('act-status');
  statusSelect.addEventListener('change', (e) => {
    const proofSec = document.getElementById('resolution-proof-section');
    if (e.target.value === 'resolved') {
      proofSec.classList.remove('hidden');
    } else {
      proofSec.classList.add('hidden');
    }
  });

  // Close review
  document.getElementById('btn-close-review').addEventListener('click', () => {
    panel.classList.add('hidden');
    activeReviewId = null;
  });

  // Action submission
  document.getElementById('admin-action-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const dept = document.getElementById('act-department').value;
    const status = document.getElementById('act-status').value;
    const priority = document.getElementById('act-priority').value;
    const commentText = document.getElementById('act-comment').value.trim();
    const resolutionRemarks = document.getElementById('act-resolution-remarks')?.value.trim() || c.resolutionRemarks;

    const comments = [...c.comments];
    if (commentText) {
      comments.unshift({
        author: 'admin',
        comment: commentText,
        date: new Date().toISOString()
      });
    }

    const updatedFields = {
      department: dept,
      status,
      priority,
      comments
    };

    if (status === 'resolved') {
      updatedFields.resolutionRemarks = resolutionRemarks || 'Resolved by municipal operator.';
      if (resolutionImageBase64) {
        updatedFields.resolutionImage = resolutionImageBase64;
      } else if (!c.resolutionImage) {
        // Fallback default resolution proof image if none uploaded
        updatedFields.resolutionImage = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=600&auto=format&fit=crop';
      }
      updatedFields.resolvedAt = new Date().toISOString();
    }

    DB.updateComplaint(c.id, updatedFields);
    DB.addAuditLog(adminUser.name, `Updated status to "${status}" for complaint ${c.id}`, c.id);

    showToast(`Updated status to "${status.toUpperCase()}" for ${c.id}`, 'success');
    
    // Refresh List & Details
    const allComplaints = DB.getComplaints();
    applyFiltersAndRender(allComplaints, adminUser);
    showComplaintReview(c.id, adminUser);
  });

  // Suspend reporter click
  document.getElementById('btn-suspend-reporter').addEventListener('click', () => {
    const reporter = DB.getUsers().find(u => u.username === c.reporter);
    if (!reporter) return;

    if (reporter.role === 'admin') {
      showToast('Cannot suspend administrative accounts.', 'error');
      return;
    }

    DB.updateUser(c.reporter, { status: 'suspended', reputationScore: 0 });
    DB.addAuditLog(adminUser.name, `Suspended user ${c.reporter} for false report activity`, c.reporter);
    
    showToast(`Suspended citizen account: ${c.reporter}`, 'success');
    showComplaintReview(c.id, adminUser);
  });
}

/* ==========================================
   USER MANAGEMENT PANEL
   ========================================== */
function renderUserManager(container, adminUser) {
  const users = DB.getUsers();

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>User Moderation Control</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Approve newly registered accounts, block fake users, reset credentials, and modify permissions.</p>
      </div>
    </div>

    <div class="widget-card glass">
      <div class="widget-title"><span>👥 Registered Smart City Accounts</span></div>
      <div class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Reputation</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              let statusClass = 'badge-approved';
              if (u.status === 'suspended') statusClass = 'badge-rejected';
              if (u.status === 'pending') statusClass = 'badge-pending';
              
              return `
                <tr>
                  <td style="font-weight:700;">${u.username}</td>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td style="text-transform:capitalize;">${u.role}</td>
                  <td><span class="badge ${statusClass}">${u.status}</span></td>
                  <td><strong>${u.reputationScore}</strong></td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:0.4rem;">
                      ${u.status === 'pending' ? `<button class="btn btn-secondary btn-icon user-action-btn" data-action="approve" data-user="${u.username}" title="Approve Registration" style="padding:0.3rem 0.5rem; font-size:0.75rem;"><i data-lucide="check" style="width:12px; height:12px;"></i> Approve</button>` : ''}
                      ${u.status === 'active' && u.role !== 'admin' ? `<button class="btn btn-outline user-action-btn" data-action="suspend" data-user="${u.username}" title="Suspend Account" style="color:var(--color-rejected); border-color:rgba(239,68,68,0.25); padding:0.3rem 0.5rem; font-size:0.75rem;"><i data-lucide="ban" style="width:12px; height:12px;"></i> Suspend</button>` : ''}
                      ${u.status === 'suspended' ? `<button class="btn btn-outline user-action-btn" data-action="activate" data-user="${u.username}" title="Reactivate Account" style="color:var(--color-resolved); border-color:rgba(16,185,129,0.25); padding:0.3rem 0.5rem; font-size:0.75rem;"><i data-lucide="shield-check" style="width:12px; height:12px;"></i> Activate</button>` : ''}
                      <button class="btn btn-outline btn-icon user-action-btn" data-action="reset" data-user="${u.username}" title="Reset User Password"><i data-lucide="key-round" style="width:12px; height:12px;"></i></button>
                      ${u.role !== 'admin' ? `<button class="btn btn-outline btn-icon user-action-btn" data-action="delete" data-user="${u.username}" title="Delete User" style="color:var(--color-rejected);"><i data-lucide="trash-2" style="width:12px; height:12px;"></i></button>` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  lucide.createIcons();

  document.querySelectorAll('.user-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const username = btn.getAttribute('data-user');
      handleUserModeration(action, username, adminUser);
    });
  });
}

function handleUserModeration(action, username, adminUser) {
  if (action === 'approve') {
    DB.updateUser(username, { status: 'active' });
    DB.addAuditLog(adminUser.name, `Approved user account registration for ${username}`, username);
    showToast(`Account approved and activated: ${username}`, 'success');
  } else if (action === 'suspend') {
    DB.updateUser(username, { status: 'suspended', reputationScore: 0 });
    DB.addAuditLog(adminUser.name, `Suspended user ${username}`, username);
    showToast(`Account suspended: ${username}`, 'success');
  } else if (action === 'activate') {
    DB.updateUser(username, { status: 'active', reputationScore: 70 });
    DB.addAuditLog(adminUser.name, `Activated suspended user ${username}`, username);
    showToast(`Account reactivated successfully: ${username}`, 'success');
  } else if (action === 'reset') {
    const defaultResetPassword = 'reset123';
    DB.updateUser(username, { password: defaultResetPassword });
    DB.addAuditLog(adminUser.name, `Reset password for user ${username}`, username);
    showToast(`Credentials reset. Password is: "${defaultResetPassword}"`, 'info', 5000);
  } else if (action === 'delete') {
    if (confirm(`Are you sure you want to permanently delete user: ${username}?`)) {
      DB.deleteUser(username);
      DB.addAuditLog(adminUser.name, `Deleted user ${username}`, username);
      showToast(`User deleted from registry: ${username}`, 'success');
    }
  }

  renderUserManager(document.getElementById('admin-main-panel'), adminUser);
}

/* ==========================================
   SMART CITY ANALYTICS PANEL
   ========================================== */
function renderAnalyticsTab(container) {
  const complaints = DB.getComplaints();
  
  // Calculate Feedback Average Rating
  const feedbacks = complaints.filter(c => c.feedback && c.feedback.rating).map(c => c.feedback);
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : "4.8";

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>Smart City Mobility Analytics</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Aggregate metrics on complaint trends, resolution percentages, high-risk locations, and citizen satisfaction ratings.</p>
      </div>
    </div>

    <!-- Analytics Top Stats Bar -->
    <div class="stats-grid">
      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value" style="color:var(--color-resolved);">⭐ ${avgRating} / 5.0</span>
          <span class="stat-label">Citizen Satisfaction Rating</span>
        </div>
        <div class="stat-icon" style="background-color: var(--color-resolved-bg); color: var(--color-resolved);"><i data-lucide="star"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value">94.8%</span>
          <span class="stat-label">Resolution Percentage</span>
        </div>
        <div class="stat-icon" style="background-color: var(--primary-glow); color: var(--primary);"><i data-lucide="percent"></i></div>
      </div>

      <div class="stat-card glass">
        <div class="stat-content">
          <span class="stat-value">1.8 Days</span>
          <span class="stat-label">Average Resolution Time</span>
        </div>
        <div class="stat-icon" style="background-color: rgba(6, 182, 212, 0.15); color: #06b6d4;"><i data-lucide="clock"></i></div>
      </div>
    </div>

    <!-- Charts Layout Grid -->
    <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); margin-top:1.5rem;">
      
      <!-- Chart 1: Categories -->
      <div class="widget-card glass">
        <div class="widget-title"><span>📊 Complaint Categories Distribution</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-categories"></canvas>
        </div>
      </div>

      <!-- Chart 2: Statuses -->
      <div class="widget-card glass">
        <div class="widget-title"><span>📈 Case Resolution Performance (6-Stage Workflow)</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-resolutions"></canvas>
        </div>
      </div>

      <!-- Chart 3: Monthly Trends -->
      <div class="widget-card glass">
        <div class="widget-title"><span>👥 Monthly Citizen Complaint Trends</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-registrations"></canvas>
        </div>
      </div>

      <!-- Chart 4: Fake vs Verified -->
      <div class="widget-card glass">
        <div class="widget-title"><span>⚠️ Verified Incidents vs. Blocked Spam</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-fake-trends"></canvas>
        </div>
      </div>

    </div>

    <!-- High-Risk Locations Table -->
    <div class="widget-card glass" style="margin-top:2rem;">
      <div class="widget-title"><span>📍 High-Risk Incident Hotspots</span></div>
      <div class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Hotspot Location</th>
              <th>Category</th>
              <th>Risk Score</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.slice(0, 5).map(c => `
              <tr>
                <td style="font-weight:700;">${c.address || 'Residency Road'}</td>
                <td style="text-transform:capitalize;">${c.category.replace('-', ' ')}</td>
                <td><span class="ai-risk-score-badge ai-risk-score-${c.priority || 'medium'}">${c.riskScore || 65}/100</span></td>
                <td><span class="badge badge-priority-${c.priority || 'medium'}">${(c.priority || 'medium').toUpperCase()}</span></td>
                <td><span class="badge badge-${c.status}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    RenderAnalyticsCharts();
  }, 100);
}

/* ==========================================
   SYSTEM CONFIGURATION PANEL
   ========================================== */
function renderSystemConfig(container, adminUser) {
  const settings = DB.getSystemSettings();
  const logs = DB.getAuditLogs();

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>Portal System Settings</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Manage registration approvals, publish system announcements, and review admin actions logs.</p>
      </div>
    </div>

    <div class="dashboard-layout-grid">
      
      <div style="display:flex; flex-direction:column; gap:2rem;">
        
        <div class="widget-card glass">
          <div class="widget-title"><span>🔧 Registration Workflows</span></div>
          <div class="layers-menu">
            <div class="layer-toggle-row">
              <div>
                <strong style="display:block; font-size:0.9rem;">Enforce Admin Approvals</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">When turned on, new user accounts require manual activation.</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="sett-approval" ${settings.approvalWorkflowEnabled ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="widget-card glass">
          <div class="widget-title"><span>📢 Issue Global Municipal Announcement</span></div>
          <form id="announcement-form" class="auth-form" style="gap:1rem;">
            <div class="form-group">
              <label>Headline Title</label>
              <input type="text" id="ann-title" class="form-control" placeholder="e.g. Accessibility audit done" required>
            </div>
            
            <div class="form-group">
              <label>Notice Content</label>
              <textarea id="ann-body" class="form-control" rows="3" placeholder="Provide full details and date timelines..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Publish Announcement</button>
          </form>
        </div>

      </div>

      <div class="widget-card glass">
        <div class="widget-title">
          <span>📜 Administrative Audit Log</span>
          <i data-lucide="shield-check" style="color:var(--color-resolved);"></i>
        </div>
        <div class="logs-table-wrapper" style="max-height: 400px; overflow-y:auto;">
          <table class="logs-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Operation</th>
                <th>Target</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td style="font-weight:700; white-space:nowrap;">${l.adminName}</td>
                  <td>${l.action}</td>
                  <td>${l.target}</td>
                  <td style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">${new Date(l.timestamp).toLocaleTimeString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  document.getElementById('sett-approval').addEventListener('change', (e) => {
    const approvalWorkflowEnabled = e.target.checked;
    DB.setSystemSettings({ ...settings, approvalWorkflowEnabled });
    DB.addAuditLog(adminUser.name, `Toggled Enforce Approvals to ${approvalWorkflowEnabled}`, 'System Settings');
    showToast(`Approvals workflow registration is now ${approvalWorkflowEnabled ? 'Enabled' : 'Disabled'}.`, 'info');
  });

  document.getElementById('announcement-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('ann-title').value.trim();
    const content = document.getElementById('ann-body').value.trim();

    const newAnnouncement = {
      title,
      content,
      date: new Date().toISOString(),
      author: adminUser.name
    };

    DB.addAnnouncement(newAnnouncement);
    DB.addAuditLog(adminUser.name, `Published notice headline: "${title}"`, 'Announcements Board');

    showToast('Global notice successfully published to citizen dashboard.', 'success');
    document.getElementById('announcement-form').reset();
    switchTab('system', adminUser);
  });
}
