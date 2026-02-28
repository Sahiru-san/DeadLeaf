// profile.js - COMPLETE WORKING VERSION
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Profile page loaded');
  
  // Check if Supabase is available
  if (!window.supabase) {
    console.error('Supabase not initialized!');
    showError('System not ready. Please refresh.');
    return;
  }
  
  try {
    // Get current user
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error) throw error;
    
    if (!user) {
      // No user logged in - redirect to login
      console.log('No user found, redirecting to login');
      window.location.href = 'login.html';
      return;
    }
    
    console.log('User found:', user);
    
    // Display user info
    displayUserInfo(user);
    
    // Load user stats
    await loadUserStats(user.id);
    
    // Load bookmarks count
    loadBookmarksCount();
    
    // Setup event listeners
    setupEventListeners(user);
    
  } catch (error) {
    console.error('Profile error:', error);
    showError('Failed to load profile: ' + error.message);
  }
});

function displayUserInfo(user) {
  // Get name from user metadata (with fallback)
  const fullName = user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   'Reader';
  
  // Get email
  const email = user.email || 'No email';
  
  // Format join date
  const joinDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';
  
  // Update DOM
  document.getElementById('display-name').textContent = fullName;
  document.getElementById('display-email').textContent = email;
  document.getElementById('member-since').textContent = joinDate;
  
  // Optional: Update page title with user's name
  document.title = `${fullName}'s Profile - DeadLeaf`;
}

async function loadUserStats(userId) {
  try {
    // Get reading progress from Supabase
    const { data: progress, error } = await window.supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.warn('Could not load reading stats:', error.message);
    }
    
    const booksRead = progress?.length || 0;
    const chaptersRead = progress?.reduce((sum, p) => sum + (p.last_chapter || 0), 0) || 0;
    
    // Update stats in UI
    document.getElementById('stats-books').textContent = booksRead;
    document.getElementById('stats-chapters').textContent = chaptersRead;
    
  } catch (error) {
    console.warn('Stats loading failed:', error);
  }
}

function loadBookmarksCount() {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('deadleaf_bookmarks') || '[]');
    document.getElementById('stats-bookmarks').textContent = bookmarks.length;
  } catch (error) {
    console.warn('Could not load bookmarks');
    document.getElementById('stats-bookmarks').textContent = '0';
  }
  
  // Streak from localStorage (temporary)
  const streak = localStorage.getItem('reading_streak') || '0';
  document.getElementById('stats-streak').textContent = streak;
}

function setupEventListeners(user) {
  // Handle logout
  const logoutBtn = document.getElementById('profile-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await window.supabase.auth.signOut();
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    });
  }
  
  // Handle edit name
  const editBtn = document.getElementById('edit-name');
  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      const currentName = document.getElementById('display-name').textContent;
      const newName = prompt('Enter your name:', currentName);
      
      if (newName && newName !== currentName) {
        try {
          const { error } = await window.supabase.auth.updateUser({
            data: { full_name: newName }
          });
          
          if (error) throw error;
          
          document.getElementById('display-name').textContent = newName;
          showToast('Name updated successfully!');
          
        } catch (error) {
          alert('Failed to update name: ' + error.message);
        }
      }
    });
  }
  
  // Handle settings toggles (save to localStorage for now)
  const emailNotifications = document.getElementById('email-notifications');
  const publicStats = document.getElementById('public-stats');
  const autoSync = document.getElementById('auto-sync');
  
  if (emailNotifications) {
    emailNotifications.checked = localStorage.getItem('email_notifications') === 'true';
    emailNotifications.addEventListener('change', () => {
      localStorage.setItem('email_notifications', emailNotifications.checked);
    });
  }
  
  if (publicStats) {
    publicStats.checked = localStorage.getItem('public_stats') === 'true';
    publicStats.addEventListener('change', () => {
      localStorage.setItem('public_stats', publicStats.checked);
    });
  }
  
  if (autoSync) {
    autoSync.checked = localStorage.getItem('auto_sync') !== 'false';
    autoSync.addEventListener('change', () => {
      localStorage.setItem('auto_sync', autoSync.checked);
    });
  }
}

function showError(message) {
  const container = document.querySelector('.profile-card');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
        <h2>Something went wrong</h2>
        <p style="color: var(--text-muted); margin-bottom: 30px;">${message}</p>
        <a href="index.html" class="back-btn">Go Home</a>
      </div>
    `;
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'profile-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: #000;
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 500;
    z-index: 10000;
    animation: fadeInOut 2s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}