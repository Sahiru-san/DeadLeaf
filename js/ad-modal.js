// js/ad-modal.js - COMPLETE PRODUCTION VERSION
class AdManager {
  constructor() {
    this.modal = null;
    this.accessExpiry = localStorage.getItem('access_expiry');
    this.adCompleted = false;
    this.checkAccess();
  }
  
  checkAccess() {
    const now = Date.now();
    if (!this.accessExpiry || now > parseInt(this.accessExpiry)) {
      this.showAdModal();
    }
  }
  
  showAdModal() {
    // Create modal if it doesn't exist
    if (document.getElementById('ad-modal')) return;
    
    this.modal = document.createElement('div');
    this.modal.id = 'ad-modal';
    this.modal.className = 'ad-modal';
    this.modal.innerHTML = `
      <div class="ad-modal-content">
        <div class="ad-header">
          <h2>📺 Support DeadLeaf</h2>
          <p class="ad-description">Watch one 30-second ad to get <strong>24 hours of uninterrupted reading</strong>.</p>
        </div>
        
        <div class="ad-container" id="ad-container">
          <div class="ad-placeholder">
            <i class="fas fa-play-circle"></i>
            <span>Ready to play</span>
          </div>
        </div>
        
        <div class="ad-timer" id="ad-timer" style="display: none;">
          <div class="timer-circle">
            <svg width="60" height="60">
              <circle class="timer-bg" cx="30" cy="30" r="26" stroke="var(--border)" stroke-width="3" fill="none"/>
              <circle class="timer-progress" cx="30" cy="30" r="26" stroke="var(--accent)" stroke-width="3" fill="none"
                stroke-dasharray="163.36" stroke-dashoffset="0" transform="rotate(-90 30 30)"/>
            </svg>
            <span class="timer-text" id="timer-text">30s</span>
          </div>
        </div>
        
        <button class="watch-ad-btn" id="watch-ad-btn">
          <i class="fas fa-play"></i>
          Watch Ad (30s)
        </button>
        <p class="ad-note">✓ No redirects • Just one quick ad</p>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    
    document.getElementById('watch-ad-btn').addEventListener('click', () => {
      this.playAd();
    });
  }
  
  playAd() {
    const container = document.getElementById('ad-container');
    const watchBtn = document.getElementById('watch-ad-btn');
    const timerEl = document.getElementById('ad-timer');
    
    // Hide watch button, show timer
    watchBtn.style.display = 'none';
    timerEl.style.display = 'block';
    
    // OPTION 1: Ezoic Integration
    this.loadEzoicAd(container, timerEl);
    
    // OPTION 2: Google Ad Manager Integration (uncomment to use)
    // this.loadGoogleAd(container, timerEl);
    
    // OPTION 3: Fallback/Test Ad (use this while setting up real ads)
    // this.loadTestAd(container, timerEl);
  }
  
  loadEzoicAd(container, timerEl) {
    // Create Ezoic placeholder
    container.innerHTML = '<div id="ezoic-pub-ad-placeholder-103"></div>';
    
    // Check if Ezoic is loaded
    if (window.ezstandalone) {
      window.ezstandalone.cmd = window.ezstandalone.cmd || [];
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone.showAds(103);
        
        // Listen for ad completion (Ezoic specific)
        window.ezstandalone.onAdComplete = (placementId) => {
          if (placementId === 103) {
            this.startTimer(timerEl);
          }
        };
      });
    } else {
      // Fallback if Ezoic not loaded
      console.warn('Ezoic not loaded, using test ad');
      this.loadTestAd(container, timerEl);
    }
  }
  
  loadGoogleAd(container, timerEl) {
    // Create Google Ad Manager container
    container.innerHTML = '<div id="div-gpt-ad-rewarded"></div>';
    
    // Load GPT library if not already loaded
    if (!window.googletag) {
      const script = document.createElement('script');
      script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      script.async = true;
      document.head.appendChild(script);
    }
    
    // Define and show rewarded ad
    window.googletag = window.googletag || {cmd: []};
    window.googletag.cmd.push(() => {
      const adSlot = window.googletag.defineOutOfPageSlot(
        '/1234567/rewarded_video', // Replace with your ad unit path
        'div-gpt-ad-rewarded'
      );
      
      if (adSlot) {
        adSlot.addService(window.googletag.pubads());
        
        // Listen for ad events
        window.googletag.pubads().addEventListener('slotOnload', (event) => {
          if (event.slot === adSlot) {
            this.startTimer(timerEl);
          }
        });
        
        window.googletag.pubads().addEventListener('slotRequested', () => {
          window.googletag.display('div-gpt-ad-rewarded');
        });
        
        window.googletag.enableServices();
        window.googletag.display('div-gpt-ad-rewarded');
      }
    });
  }
  
  loadTestAd(container, timerEl) {
    // Test ad using sample video (for development/testing)
    container.innerHTML = `
      <video id="test-ad-video" class="ad-video" autoplay playsinline>
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4">
      </video>
    `;
    
    const video = document.getElementById('test-ad-video');
    video.controls = false;
    
    // Start timer
    this.startTimer(timerEl);
    
    // Also end when video ends
    video.addEventListener('ended', () => {
      this.grantAccess();
    });
  }
  
  startTimer(timerEl) {
    let timeLeft = 30;
    const timerText = document.getElementById('timer-text');
    const progressCircle = document.querySelector('.timer-progress');
    const circumference = 163.36; // 2πr where r=26
    
    const updateTimer = () => {
      timeLeft--;
      timerText.textContent = `${timeLeft}s`;
      
      // Update circle progress
      const offset = circumference * (1 - (timeLeft / 30));
      progressCircle.style.strokeDashoffset = offset;
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        this.grantAccess();
      }
    };
    
    const timerInterval = setInterval(updateTimer, 1000);
  }
  
  grantAccess() {
    // Prevent double granting
    if (this.adCompleted) return;
    this.adCompleted = true;
    
    // Grant 24 hours access (24 * 60 * 60 * 1000 = 86400000 ms)
    const expiry = Date.now() + 86400000;
    localStorage.setItem('access_expiry', expiry);
    
    // Show success message
    this.modal.innerHTML = `
      <div class="ad-modal-content success">
        <div class="success-animation">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Access Granted!</h2>
        <p class="success-message">You now have <strong>24 hours</strong> of uninterrupted reading.</p>
        <p class="success-note">Happy reading 📖</p>
        <button class="continue-btn" id="continue-reading-btn">
          Continue Reading →
        </button>
      </div>
    `;
    
    // Add click handler for continue button
    document.getElementById('continue-reading-btn').addEventListener('click', () => {
      this.modal.remove();
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (this.modal.parentNode) {
        this.modal.remove();
      }
    }, 5000);
  }
}

// Initialize on all pages
document.addEventListener('DOMContentLoaded', () => {
  // Don't show ad on auth pages or already accessed pages
  if (!window.location.pathname.includes('login') && 
      !window.location.pathname.includes('signup') &&
      !window.location.pathname.includes('privacy') &&
      !window.location.pathname.includes('terms')) {
    window.adManager = new AdManager();
  }
});