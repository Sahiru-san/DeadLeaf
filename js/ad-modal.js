// ad-modal.js - FIXED with 30-second timer
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
        
        <div class="ad-video-container" id="ad-video-container">
          <div class="ad-placeholder">
            <i class="fas fa-play-circle"></i>
            <span>Ready to play</span>
          </div>
        </div>
        
        <div class="ad-timer" id="ad-timer" style="display: none;">30s remaining</div>
        
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
    const container = document.getElementById('ad-video-container');
    const watchBtn = document.getElementById('watch-ad-btn');
    const timerEl = document.getElementById('ad-timer');
    
    // Hide watch button, show timer
    watchBtn.style.display = 'none';
    timerEl.style.display = 'block';
    
    // Use a short sample video (30 seconds)
    // You can replace this URL with your actual ad video
    container.innerHTML = `
      <video id="ad-video" width="100%" height="100%" style="object-fit: cover;" autoplay>
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4">
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/webm">
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
      </video>
    `;
    
    const video = document.getElementById('ad-video');
    
    // Force video to end after 30 seconds
    let timeLeft = 30;
    timerEl.textContent = `${timeLeft}s remaining`;
    
    // Update timer every second
    const timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s remaining`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.grantAccess();
      }
    }, 1000);
    
    // Also handle video ending naturally (if shorter than 30s)
    video.addEventListener('ended', () => {
      clearInterval(timer);
      this.grantAccess();
    });
    
    // Disable seeking and controls
    video.controls = false;
    
    // Prevent skipping
    video.addEventListener('seeked', () => {
      video.currentTime = video.duration - timeLeft;
    });
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
      const modal = document.getElementById('ad-modal');
      if (modal) modal.remove();
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