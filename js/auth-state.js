// js/auth-state.js - UPDATED for Supabase
document.addEventListener('DOMContentLoaded', async () => {
  // Wait a moment for supabase to initialize
  setTimeout(() => {
    updateAuthUI();
  }, 200);
});

async function updateAuthUI() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  // Check if Supabase is available
  if (!window.supabase) {
    console.log('Supabase not initialized yet');
    return;
  }
  
  try {
    // Get current user
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    // Find auth links in sidebar
    const sidebarLinks = sidebar.querySelectorAll('a');
    let signInLink = null;
    let signUpLink = null;
    
    sidebarLinks.forEach(link => {
      if (link.textContent.includes('Sign In') || link.getAttribute('href') === 'login.html') {
        signInLink = link;
      }
      if (link.textContent.includes('Sign Up') || link.getAttribute('href') === 'signup.html') {
        signUpLink = link;
      }
    });
    
    if (user && !error) {
      // User IS logged in
      console.log('User logged in:', user.email);
      
      // Hide sign in/up links
      if (signInLink) signInLink.style.display = 'none';
      if (signUpLink) signUpLink.style.display = 'none';
      
      // Add logout button if not exists
      if (!document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('a');
        logoutBtn.id = 'logout-btn';
        logoutBtn.href = '#';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.style.marginTop = '10px';
        logoutBtn.style.borderTop = '1px solid var(--border)';
        logoutBtn.style.paddingTop = '15px';
        
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          await window.supabase.auth.signOut();
          window.location.reload();
        });
        
        // Insert before theme controls
        const themeControls = sidebar.querySelector('.theme-controls');
        if (themeControls) {
          sidebar.insertBefore(logoutBtn, themeControls);
        } else {
          sidebar.appendChild(logoutBtn);
        }
      }
    } else {
      // User is NOT logged in
      console.log('No user logged in');
      
      // Show sign in/up links
      if (signInLink) signInLink.style.display = 'block';
      if (signUpLink) signUpLink.style.display = 'block';
      
      // Remove logout button if exists
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) logoutBtn.remove();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

// Listen for auth changes
if (window.supabase) {
  window.supabase.auth.onAuthStateChange(() => {
    updateAuthUI();
  });
}