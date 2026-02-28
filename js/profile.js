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
  
  // Add this to your profile.js - replaces the old edit name function

// Handle edit name - NEW INLINE VERSION
const editBtn = document.getElementById('edit-name');
const editModal = document.getElementById('edit-name-modal');
const editInput = document.getElementById('edit-name-input');
const cancelBtn = document.getElementById('cancel-edit');
const saveBtn = document.getElementById('save-edit');
const charCount = document.getElementById('char-count');

if (editBtn && editModal) {
  editBtn.addEventListener('click', () => {
    // Get current name
    const currentName = document.getElementById('display-name').textContent;
    editInput.value = currentName;
    charCount.textContent = `${currentName.length}/50`;
    
    // Show modal
    editModal.style.display = 'flex';
    
    // Focus input
    setTimeout(() => editInput.focus(), 100);
  });
  
  // Character counter
  editInput.addEventListener('input', () => {
    const len = editInput.value.length;
    charCount.textContent = `${len}/50`;
    
    // Visual feedback when near limit
    if (len > 45) {
      charCount.style.color = '#ff6b6b';
    } else {
      charCount.style.color = 'var(--text-muted)';
    }
  });
  
  // Handle save
  saveBtn.addEventListener('click', async () => {
    const newName = editInput.value.trim();
    
    if (!newName) {
      showEditError('Name cannot be empty');
      return;
    }
    
    // Show loading state
    saveBtn.classList.add('loading');
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
      // Update in Supabase
      const { error } = await window.supabase.auth.updateUser({
        data: { full_name: newName }
      });
      
      if (error) throw error;
      
      // Update display
      document.getElementById('display-name').textContent = newName;
      
      // Close modal
      editModal.style.display = 'none';
      
      // Show success message
      showEditSuccess('Name updated successfully!');
      
    } catch (error) {
      console.error('Update failed:', error);
      showEditError('Failed to update name. Please try again.');
    } finally {
      // Reset button
      saveBtn.classList.remove('loading');
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Save Changes';
    }
  });
  
  // Handle cancel
  cancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
  });
  
  // Close on click outside
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.style.display = 'none';
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal.style.display === 'flex') {
      editModal.style.display = 'none';
    }
  });
}

// Helper functions for edit feedback
function showEditError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'edit-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    background: rgba(255, 69, 58, 0.1);
    color: #ff453a;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 13px;
    margin-bottom: 20px;
    border-left: 3px solid #ff453a;
  `;
  
  const modalContent = document.querySelector('.edit-modal-content');
  const existingError = modalContent.querySelector('.edit-error');
  if (existingError) existingError.remove();
  
  modalContent.insertBefore(errorDiv, modalContent.querySelector('.edit-input-group'));
  
  setTimeout(() => {
    if (errorDiv.parentNode) errorDiv.remove();
  }, 3000);
}

function showEditSuccess(message) {
  const toast = document.createElement('div');
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
    z-index: 10001;
    animation: slideUpToast 0.3s ease, fadeOut 2s ease 1.7s forwards;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// Add keyframe animation for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUpToast {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }
`;
document.head.appendChild(style);
  
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