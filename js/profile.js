// profile.js
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await window.supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Display user info
  document.getElementById('display-name').textContent = user.user_metadata?.full_name || 'Reader';
  document.getElementById('display-email').textContent = user.email;
  document.getElementById('member-since').textContent = new Date(user.created_at).toLocaleDateString();
  
  // Load stats
  loadUserStats(user.id);
  
  // Load bookmarks count
  const bookmarks = JSON.parse(localStorage.getItem('deadleaf_bookmarks') || '[]');
  document.getElementById('stats-bookmarks').textContent = bookmarks.length;
  
  // Handle logout
  document.getElementById('profile-logout').addEventListener('click', async () => {
    await window.supabase.auth.signOut();
    window.location.href = 'index.html';
  });
  
  // Handle edit name
  document.getElementById('edit-name').addEventListener('click', () => {
    const newName = prompt('Enter your name:', user.user_metadata?.full_name || '');
    if (newName) {
      window.supabase.auth.updateUser({
        data: { full_name: newName }
      }).then(() => {
        document.getElementById('display-name').textContent = newName;
      });
    }
  });
});

async function loadUserStats(userId) {
  // Get reading progress from Supabase
  const { data: progress } = await window.supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId);
  
  const booksRead = progress?.length || 0;
  const chaptersRead = progress?.reduce((sum, p) => sum + (p.last_chapter || 0), 0) || 0;
  
  document.getElementById('stats-books').textContent = booksRead;
  document.getElementById('stats-chapters').textContent = chaptersRead;
  document.getElementById('stats-streak').textContent = localStorage.getItem('reading_streak') || 0;
}