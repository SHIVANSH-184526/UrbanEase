/* Static Information Pages Renderer (js/pages.js) */

import { showToast } from './app.js';

export function RenderStaticPage(pageKey) {
  const outlet = document.getElementById('router-outlet');
  
  if (pageKey === 'features') {
    renderFeaturesPage(outlet);
  } else if (pageKey === 'vision') {
    renderVisionPage(outlet);
  } else if (pageKey === 'faq') {
    renderFaqPage(outlet);
  } else if (pageKey === 'about') {
    renderAboutPage(outlet);
  } else if (pageKey === 'contact') {
    renderContactPage(outlet);
  } else if (pageKey === 'feedback') {
    renderFeedbackPage(outlet);
  } else if (pageKey === 'privacy-policy') {
    renderPrivacyPage(outlet);
  } else if (pageKey === 'terms') {
    renderTermsPage(outlet);
  }

  lucide.createIcons();
}

function renderFeaturesPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Core Features</span>
      <h1 class="hero-title">UrbanEase Engineering Prototype Capabilities</h1>
      <p class="hero-subtitle">Explore the technological components built to connect citizens with smart municipal mobility & accessibility solutions.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; display:flex; flex-direction:column; gap:3rem;">
      <div class="cards-grid">
        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="alert-triangle"></i></div>
          <h3 class="feature-card-title">9 Issue Categories</h3>
          <p class="feature-card-desc">Allows citizens to report Potholes, Broken Signals, Streetlight Failures, Garbage, Water Leaks, Road Damage, Footpath Obstructions, Accessibility Issues, and Other concerns.</p>
        </div>
        
        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="cpu"></i></div>
          <h3 class="feature-card-title">Rule-Based AI Priority Engine</h3>
          <p class="feature-card-desc">Automatically calculates Priority (Low/Medium/High/Critical), Risk Scores (0-100), and transparent safety justification reasons upon incident filing.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="git-pull-request"></i></div>
          <h3 class="feature-card-title">6-Stage Status Tracker</h3>
          <p class="feature-card-desc">Tracks reported issues across 6 clear stages: Submitted &rarr; Under Review &rarr; Verified &rarr; Assigned &rarr; In Progress &rarr; Resolved.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="image-check"></i></div>
          <h3 class="feature-card-title">Before & After Proof</h3>
          <p class="feature-card-desc">Allows municipal operators to upload resolution photo proof and operator remarks for citizen verification upon completion.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="bell"></i></div>
          <h3 class="feature-card-title">Citizen Notification System</h3>
          <p class="feature-card-desc">Dispatches live status alerts to citizen dashboards as departments inspect, assign, and resolve reported infrastructure cases.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="bar-chart-3"></i></div>
          <h3 class="feature-card-title">Smart City Analytics</h3>
          <p class="feature-card-desc">Provides municipal administrators with visual dashboards on category distributions, resolution speeds, hotspot locations, and citizen satisfaction ratings.</p>
        </div>
      </div>
    </section>
  `;
}

function renderVisionPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Smart City Vision</span>
      <h1 class="hero-title">Towards Barrier-Free Urban Mobility</h1>
      <p class="hero-subtitle">Learn about our academic research goals to ensure all citizens enjoy safe and accessible transit.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 900px; margin: 0 auto; display:flex; flex-direction:column; gap:2.5rem; line-height:1.7;">
      <div>
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; margin-bottom:1rem;">Universal Mobility Goals</h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">
          In modern smart cities, physical movement is a basic human right. Traditional public structures often present unintended barriers to citizens carrying strollers, wheelchair users, and the elderly.
        </p>
        <p style="color:var(--text-secondary);">
          Our academic vision is to bridge the gap between physical infrastructure and digital information, giving commuters immediate visual guidance to travel through paths that are safe and accommodating.
        </p>
      </div>

      <div class="glass" style="padding:2rem; background: linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(37,99,235,0.05) 100%);">
        <h3 style="font-weight:700; margin-bottom:0.8rem; color:var(--primary);">Future Integration Architecture</h3>
        <ul style="padding-left:1.2rem; display:flex; flex-direction:column; gap:0.6rem; font-size:0.9rem; color:var(--text-secondary);">
          <li><strong>Real Machine Learning Models</strong>: Seamless replacement of our rule-based AI priority engine with trained ML models.</li>
          <li><strong>IoT Smart Parking & Signal Sensors</strong>: Live API synchronization with municipal traffic controllers.</li>
          <li><strong>GIS & Mapbox Integration</strong>: Drop-in replacement for Leaflet mock layers.</li>
        </ul>
      </div>
    </section>
  `;
}

function renderFaqPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Citizen FAQ</span>
      <h1 class="hero-title">Frequently Asked Questions</h1>
      <p class="hero-subtitle">Find quick answers regarding reporting procedures, tracking IDs, and AI priority classification.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto;">
      <div style="display:flex; flex-direction:column; gap:1.2rem;">
        
        <details class="glass" style="padding:1.2rem; cursor:pointer;" open>
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>Is UrbanEase an official government application?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            No. UrbanEase is an academic/prototype project and is not an official government service. It is designed to demonstrate smart urban mobility workflows and API-ready architectures.
          </p>
        </details>

        <details class="glass" style="padding:1.2rem; cursor:pointer;">
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>How do I track my complaint progress?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            After filing a report, a unique Complaint ID (e.g., <code>UE-2026-00124</code>) is generated. You can enter this ID on the 'Track Complaint' page to view its 6-stage visual timeline (Submitted &rarr; Under Review &rarr; Verified &rarr; Assigned &rarr; In Progress &rarr; Resolved), before/after resolution proof photos, and department comments.
          </p>
        </details>

        <details class="glass" style="padding:1.2rem; cursor:pointer;">
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>How does the AI Priority Classification work?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            UrbanEase utilizes a transparent rule-based AI priority simulation engine. It analyzes category hazard levels, pedestrian proximity, and critical risk factors to compute a Priority level (Low, Medium, High, Critical), a Risk Score (0–100), and a clear reasoning statement.
          </p>
        </details>

        <details class="glass" style="padding:1.2rem; cursor:pointer;">
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>How do citizens provide resolution feedback?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            Once a complaint reaches the 'Resolved' stage, citizens can inspect the operator's After Photo proof and submit a 1–5 Star Rating along with optional feedback remarks.
          </p>
        </details>

      </div>
    </section>
  `;

  document.querySelectorAll('details').forEach(el => {
    el.addEventListener('toggle', () => {
      const icon = el.querySelector('i');
      if (icon) {
        icon.style.transform = el.open ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });
}

function renderAboutPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">About Initiative</span>
      <h1 class="hero-title">Academic Engineering Prototype</h1>
      <p class="hero-subtitle">Developed to explore AI-powered smart urban mobility & citizen reporting platforms.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 900px; margin: 0 auto; line-height:1.7; display:flex; flex-direction:column; gap:2rem;">
      <h2 style="font-family:var(--font-heading); font-size:1.8rem;">Project Positioning</h2>
      <p style="color:var(--text-secondary);">
        UrbanEase is an academic/prototype project and is not an official government service. It demonstrates how modern web architectures, Leaflet maps, rule-based AI prioritization, and 6-stage workflows can improve urban mobility resolution.
      </p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-top:1rem;">
        <div class="glass" style="padding:1.5rem;">
          <h4 style="font-weight:700; margin-bottom:0.5rem; color:var(--primary);">Academic Prototype</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary);">Designed for demonstration and research into civic technology workflows and accessible UI design.</p>
        </div>
        <div class="glass" style="padding:1.5rem;">
          <h4 style="font-weight:700; margin-bottom:0.5rem; color:var(--primary);">API & ML Ready</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary);">Structured so mock data and rule-based logic can later be replaced with REST APIs, databases, and trained ML models.</p>
        </div>
      </div>
    </section>
  `;
}

function renderContactPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Contact Center</span>
      <h1 class="hero-title">Academic Support Inquiries</h1>
      <p class="hero-subtitle">Have questions regarding the prototype implementation? Send an inquiry to the research team.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
      <div class="glass" style="padding:2.5rem;">
        <form id="contact-form" class="auth-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="cnt-name" class="form-control" placeholder="Enter your full name" required>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="cnt-email" class="form-control" placeholder="Enter email address" required>
          </div>

          <div class="form-group">
            <label>Inquiry Subject</label>
            <input type="text" id="cnt-subject" class="form-control" placeholder="e.g. Prototype research questions" required>
          </div>

          <div class="form-group">
            <label>Message Content</label>
            <textarea id="cnt-message" class="form-control" rows="4" placeholder="Detail your query..." required></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Submit Inquiry</button>
        </form>
      </div>
    </section>
  `;

  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cnt-name').value.trim();
    const ticketId = Math.floor(10000 + Math.random() * 90000);
    
    showToast(`Thank you, ${name}. Inquiry ticket #${ticketId} created successfully.`, 'success', 5000);
    document.getElementById('contact-form').reset();
  });
}

function renderFeedbackPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Feedback Registry</span>
      <h1 class="hero-title">Platform Experience Feedback</h1>
      <p class="hero-subtitle">Help us evaluate the urban mobility prototype. Rate your experience below.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
      <div class="glass" style="padding:2.5rem; display:flex; flex-direction:column; gap:1.5rem;">
        <h3 style="font-weight:700;">Rate Your Experience</h3>
        
        <div style="display:flex; justify-content:center; gap:0.8rem; font-size:2rem; margin:1rem 0;">
          <i data-lucide="star" class="star-rating-icon" data-val="1" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="2" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="3" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="4" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="5" style="cursor:pointer; color:var(--text-muted);"></i>
        </div>

        <form id="feedback-form" class="auth-form">
          <div class="form-group">
            <label>Suggestions & Comments</label>
            <textarea id="feed-comments" class="form-control" rows="4" placeholder="Share feedback on usability or features..." required></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Submit Feedback</button>
        </form>
      </div>
    </section>
  `;

  lucide.createIcons();

  let ratingValue = 0;
  const stars = document.querySelectorAll('.star-rating-icon');
  stars.forEach((star, idx) => {
    star.addEventListener('click', () => {
      ratingValue = idx + 1;
      stars.forEach((s, sIdx) => {
        if (sIdx < ratingValue) {
          s.style.fill = 'var(--color-pending)';
          s.style.color = 'var(--color-pending)';
        } else {
          s.style.fill = 'none';
          s.style.color = 'var(--text-muted)';
        }
      });
    });
  });

  document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (ratingValue === 0) {
      showToast('Please select a star rating rating.', 'warning');
      return;
    }

    showToast('Feedback submitted successfully. Thank you!', 'success');
    document.getElementById('feedback-form').reset();
    stars.forEach(s => {
      s.style.fill = 'none';
      s.style.color = 'var(--text-muted)';
    });
    ratingValue = 0;
  });
}

function renderPrivacyPage(outlet) {
  outlet.innerHTML = `
    <section style="padding:5rem 2rem; max-width:800px; margin:0 auto; line-height:1.8;">
      <h1 style="font-family:var(--font-heading); font-size:2.5rem; font-weight:800; margin-bottom:1.5rem;">Privacy Policy</h1>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">Last Updated: October 8, 2026</p>
      
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
        UrbanEase is an academic/prototype project and is not an official government service. This portal collects mock GPS parameters and profile configurations solely for demonstrating the system engineering prototype.
      </p>

      <h3 style="font-weight:700; margin:1.5rem 0 0.8rem 0;">Local Data Storage</h3>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">
        All registration accounts, uploaded photos, and coordinate parameters are saved locally within your browser's <code>localStorage</code> database and are not sent to external server databases.
      </p>
    </section>
  `;
}

function renderTermsPage(outlet) {
  outlet.innerHTML = `
    <section style="padding:5rem 2rem; max-width:800px; margin:0 auto; line-height:1.8;">
      <h1 style="font-family:var(--font-heading); font-size:2.5rem; font-weight:800; margin-bottom:1.5rem;">Terms & Conditions</h1>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">Last Updated: October 8, 2026</p>
      
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
        UrbanEase is an academic/prototype project and is not an official government service.
      </p>

      <h3 style="font-weight:700; margin:1.5rem 0 0.8rem 0;">Prototype Etiquette</h3>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">
        Users must not create spam files or fake reviews. Doing so decreases reputation meters and restricts access credentials.
      </p>
    </section>
  `;
}
