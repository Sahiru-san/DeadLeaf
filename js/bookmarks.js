// bookmarks.js - COMPLETELY REWRITTEN & FIXED
class BookmarksManager {
  constructor() {
    this.bookmarks = [];
    this.panel = null;
    this.readerBtn = null;
    this.currentSelection = null;
    this.isAuthenticated = false;
    this.user = null;
    this.init();
  }
  
  async init() {
    // Check if user is logged in (Supabase ready)
    await this.checkAuth();
    this.loadBookmarks();
    this.createPanel();
    this.setupButtons();
    this.setupEventListeners();
    this.updateBookmarkBadge();
  }
  
  async checkAuth() {
    // Check if Supabase is available
    if (window.supabase) {
      try {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (user) {
          this.isAuthenticated = true;
          this.user = user;
          console.log('User authenticated:', user.email);
        }
      } catch (error) {
        console.log('Auth check failed, using localStorage only');
      }
    }
  }
  
  loadBookmarks() {
    // Try to load from localStorage first
    const saved = localStorage.getItem('deadleaf_bookmarks');
    this.bookmarks = saved ? JSON.parse(saved) : [];
    
    // If authenticated, try to load from Supabase (future)
    if (this.isAuthenticated) {
      // this.loadBookmarksFromSupabase();
    }
  }
  
  saveBookmarks() {
    // Always save to localStorage as backup
    localStorage.setItem('deadleaf_bookmarks', JSON.stringify(this.bookmarks));
    
    // If authenticated, save to Supabase (future)
    if (this.isAuthenticated) {
      // this.saveBookmarksToSupabase();
    }
    
    this.updatePanel();
    this.updateBookmarkBadge();
  }
  
  createPanel() {
    // Remove existing panel if any
    const existingPanel = document.getElementById('bookmarks-panel');
    if (existingPanel) existingPanel.remove();
    
    const panel = document.createElement('div');
    panel.id = 'bookmarks-panel';
    panel.className = 'bookmarks-panel';
    panel.innerHTML = `
      <div class="bookmarks-header">
        <h2>
          <i class="fas fa-bookmark"></i>
          Bookmarks
        </h2>
        <span id="close-bookmarks" class="close-bookmarks">✕</span>
      </div>
      <div class="bookmarks-stats">
        <span>Saved moments</span>
        <span id="bookmark-count">0</span>
      </div>
      <div class="bookmarks-list" id="bookmarks-list">
        <!-- Bookmarks will be injected here -->
      </div>
    `;
    
    document.body.appendChild(panel);
    this.panel = panel;
    
    // Close button
    document.getElementById('close-bookmarks').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closePanel();
    });
    
    // Close on overlay click
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        this.closePanel();
      });
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel.classList.contains('active')) {
        this.closePanel();
      }
    });
  }
  
  setupButtons() {
    // Top bar bookmark toggle button - FIXED
    const toggleBtn = document.getElementById('bookmarks-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePanel();
      });
    }
    
    // Sidebar bookmark link - FIXED
    const sidebarLink = document.getElementById('sidebar-bookmarks');
    if (sidebarLink) {
      sidebarLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePanel();
      });
    }
    
    // Create reader floating button if on reader page
    if (window.location.pathname.includes('reader.html')) {
      this.createReaderButton();
    }
  }
  
  createReaderButton() {
    // Remove existing button if any
    const existingBtn = document.getElementById('bookmark-reader-btn');
    if (existingBtn) existingBtn.remove();
    
    const btn = document.createElement('button');
    btn.id = 'bookmark-reader-btn';
    btn.className = 'bookmark-reader-btn';
    btn.innerHTML = '<i class="fas fa-bookmark"></i>';
    btn.title = 'View bookmarks';
    btn.setAttribute('aria-label', 'View bookmarks');
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePanel();
    });
    
    document.body.appendChild(btn);
    this.readerBtn = btn;
  }
  
  updateBookmarkBadge() {
    const badges = document.querySelectorAll('.bookmark-count-badge');
    badges.forEach(badge => {
      badge.textContent = this.bookmarks.length;
      badge.style.display = this.bookmarks.length > 0 ? 'flex' : 'none';
    });
  }
  
  setupEventListeners() {
    // Listen for text selection in reader - FIXED
    if (window.location.pathname.includes('reader.html')) {
      // Use mouseup for desktop
      document.addEventListener('mouseup', (e) => {
        // Small delay to ensure selection is complete
        setTimeout(() => this.handleTextSelection(e), 200);
      });
      
      // Use touchend for mobile
      document.addEventListener('touchend', (e) => {
        setTimeout(() => this.handleTextSelection(e), 300);
      });
      
      // Listen for scrolling to hide tooltip
      window.addEventListener('scroll', () => {
        this.removeTooltip();
      });
    }
    
    // Listen for clicks outside tooltip
    document.addEventListener('mousedown', (e) => {
      if (this.currentSelection && 
          !e.target.closest('.bookmark-tooltip') && 
          !e.target.closest('.bookmark-reader-btn')) {
        this.removeTooltip();
      }
    });
  }
  
  handleTextSelection(e) {
    // Don't show tooltip if clicking on button or panel
    if (e.target.closest('.bookmark-reader-btn') || 
        e.target.closest('.bookmarks-panel') ||
        e.target.closest('#bookmarks-toggle')) {
      return;
    }
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // Remove existing tooltip
    this.removeTooltip();
    
    // Check if there's a valid selection (more than 10 chars, less than 500)
    if (selectedText && selectedText.length > 10 && selectedText.length < 500) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Only show if selection is visible
        if (rect.width > 0 && rect.height > 0) {
          this.showTooltip(selectedText, rect, range);
        }
      } catch (error) {
        console.log('Could not get selection range');
      }
    }
  }
  
  showTooltip(text, rect, range) {
    const tooltip = document.createElement('div');
    tooltip.className = 'bookmark-tooltip';
    tooltip.innerHTML = `
      <i class="fas fa-bookmark"></i>
      <span>Save this moment</span>
    `;
    
    // Position tooltip above selection
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 50}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    // Ensure tooltip stays within viewport
    document.body.appendChild(tooltip);
    
    // Adjust if tooltip goes off screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.left < 10) {
      tooltip.style.left = '20px';
      tooltip.style.transform = 'none';
    }
    if (tooltipRect.right > window.innerWidth - 10) {
      tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
      tooltip.style.transform = 'none';
    }
    
    this.currentSelection = { tooltip, text, range };
    
    tooltip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.addBookmark(text, range);
    });
  }
  
  removeTooltip() {
    if (this.currentSelection) {
      this.currentSelection.tooltip.remove();
      this.currentSelection = null;
    }
  }
  
  addBookmark(text, range) {
    // Get current book and chapter info
    const params = Navigation.getParams();
    const bookId = params.bookId || '1';
    const chapter = params.chapter || 1;
    
    // Get book title
    const bookTitle = this.getBookTitle(bookId);
    
    // Create bookmark object
    const bookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId: bookId,
      bookTitle: bookTitle,
      chapter: chapter,
      text: text.length > 200 ? text.substring(0, 200) + '...' : text,
      fullText: text,
      date: new Date().toISOString(),
      userId: this.user?.id || 'local'
    };
    
    // Add to bookmarks
    this.bookmarks.unshift(bookmark);
    this.saveBookmarks();
    
    // Show success toast
    this.showToast('Bookmark saved!');
    
    // Remove tooltip
    this.removeTooltip();
    
    // Animate reader button
    if (this.readerBtn) {
      this.readerBtn.classList.add('active');
      setTimeout(() => {
        this.readerBtn.classList.remove('active');
      }, 1000);
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('bookmarkAdded', { detail: bookmark }));
  }
  
  removeBookmark(id) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this.saveBookmarks();
    this.showToast('Bookmark removed');
    
    // If panel is open, update it
    if (this.panel && this.panel.classList.contains('active')) {
      this.updatePanel();
    }
  }
  
  showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.bookmark-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide after 2 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  getBookTitle(bookId) {
    // Try to get from localStorage first (for real books)
    const books = JSON.parse(localStorage.getItem('deadleaf_books') || '[]');
    const book = books.find(b => b.id === bookId);
    if (book) return book.title;
    
    // Fallback to dummy titles
    const titles = {
      '1': 'Alice in Borderlands',
      '2': 'Death Note',
      '3': 'Monster',
      '4': 'Berserk',
      '5': 'Solo Leveling',
      '6': 'Tower of God',
      '7': 'The Breaker',
      '8': 'Noblesse',
      '9': '1984',
      '10': 'Dune',
      '11': 'Foundation',
      '12': 'The Hobbit'
    };
    return titles[bookId] || 'Unknown Book';
  }
  
  updatePanel() {
    const list = document.getElementById('bookmarks-list');
    const countSpan = document.getElementById('bookmark-count');
    
    if (!list) return;
    
    if (countSpan) {
      countSpan.textContent = this.bookmarks.length;
    }
    
    if (this.bookmarks.length === 0) {
      list.innerHTML = `
        <div class="bookmarks-empty">
          <i class="fas fa-bookmark"></i>
          <h3>No bookmarks yet</h3>
          <p>Select text while reading to save your favorite moments</p>
          <div class="hint">✨ Just highlight and click save</div>
        </div>
      `;
      return;
    }
    
    list.innerHTML = this.bookmarks.map(bookmark => {
      const date = new Date(bookmark.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
          <div class="bookmark-book">
            <div class="bookmark-book-cover">📖</div>
            <span class="bookmark-book-title">${bookmark.bookTitle}</span>
          </div>
          <div class="bookmark-chapter">Chapter ${bookmark.chapter}</div>
          <div class="bookmark-text">"${bookmark.text}"</div>
          <div class="bookmark-meta">
            <span class="bookmark-date">
              <i class="far fa-clock"></i>
              ${formattedDate}
            </span>
            <div class="bookmark-actions">
              <button class="goto-bookmark" title="Go to this moment">
                <i class="fas fa-eye"></i>
              </button>
              <button class="delete-bookmark" title="Delete bookmark">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners to bookmark items
    list.querySelectorAll('.bookmark-item').forEach(item => {
      const id = item.dataset.bookmarkId;
      const bookmark = this.bookmarks.find(b => b.id === id);
      
      if (!bookmark) return;
      
      // Click on item to go to bookmark
      item.addEventListener('click', (e) => {
        // Don't trigger if clicking on buttons
        if (!e.target.closest('button')) {
          Navigation.goTo.reader(bookmark.bookId, bookmark.chapter);
          this.closePanel();
        }
      });
      
      // Delete button
      item.querySelector('.delete-bookmark')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.removeBookmark(id);
        item.remove(); // Remove from DOM immediately
        
        // Update count
        if (countSpan) {
          countSpan.textContent = this.bookmarks.length;
        }
        
        // Show empty state if no bookmarks left
        if (this.bookmarks.length === 0) {
          this.updatePanel();
        }
      });
      
      // Go to button
      item.querySelector('.goto-bookmark')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        Navigation.goTo.reader(bookmark.bookId, bookmark.chapter);
        this.closePanel();
      });
    });
  }
  
  togglePanel() {
    if (!this.panel) {
      this.createPanel();
    }
    
    this.panel.classList.toggle('active');
    this.updatePanel(); // Refresh panel content
    
    // Toggle overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.toggle('active');
    }
    
    // Prevent body scroll when panel is open
    document.body.style.overflow = this.panel.classList.contains('active') ? 'hidden' : '';
  }
  
  closePanel() {
    if (!this.panel) return;
    
    this.panel.classList.remove('active');
    
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure other scripts are loaded
  setTimeout(() => {
    window.bookmarksManager = new BookmarksManager();
    console.log('Bookmarks manager initialized');
  }, 100);
});