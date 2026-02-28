// ad-modal.js
class AdManager {
  constructor() {
    this.modal = null;
    this.accessExpiry = localStorage.getItem('access_expiry');
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
        <h2>📺 Support DeadLeaf</h2>
        <p>Watch one 30-second ad to get <strong>24 hours of uninterrupted reading</strong>.</p>
        
        <div class="ad-video-container">
          <!-- Replace this with actual ad embed code -->
          <div class="ad-placeholder">
            <i class="fas fa-play-circle"></i>
            <span>Ad will play here</span>
          </div>
        </div>
        
        <button class="watch-ad-btn" id="watch-ad-btn">
          <i class="fas fa-play"></i>
          Watch Ad (30s)
        </button>
        <p class="ad-note">No redirects. Just one quick ad.</p>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    
    document.getElementById('watch-ad-btn').addEventListener('click', () => {
      this.playAd();
    });
  }
  
  playAd() {
    const container = document.querySelector('.ad-video-container');
    
    // Replace placeholder with actual video player
    // This is where you'd integrate an ad network like:
    // - Google Ad Manager
    // - AdSense video ads
    // - Or a custom video
    
    container.innerHTML = `
      <video id="ad-video" width="100%" controls autoplay>
        <source src="path/to/your/ad.mp4" type="video/mp4">
        Your browser does not support video ads.
      </video>
    `;
    
    const video = document.getElementById('ad-video');
    video.addEventListener('ended', () => {
      this.grantAccess();
    });
    
    // Disable seeking and controls
    video.controls = false;
  }
  
  grantAccess() {
    // Grant 24 hours access
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('access_expiry', expiry);
    
    // Show success message
    this.modal.innerHTML = `
      <div class="ad-modal-content success">
        <i class="fas fa-check-circle"></i>
        <h2>Access Granted!</h2>
        <p>You now have 24 hours of uninterrupted reading.</p>
        <button class="continue-btn" onclick="document.getElementById('ad-modal').remove()">
          Continue Reading →
        </button>
      </div>
    `;
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      this.modal.remove();
    }, 3000);
  }
}

// Initialize on all pages
document.addEventListener('DOMContentLoaded', () => {
  // Don't show ad on auth pages
  if (!window.location.pathname.includes('login') && 
      !window.location.pathname.includes('signup')) {
    window.adManager = new AdManager();
  }
});