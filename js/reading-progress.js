// reading-progress.js
document.addEventListener("DOMContentLoaded", () => {
  class ReadingProgress {
    constructor() {
      this.continueSection = document.getElementById('continue-section');
      this.continueGrid = document.getElementById('continue-grid');
      this.recentGrid = document.getElementById('recent-grid');
      this.recentSection = document.getElementById('recent-section');
      this.viewAllLink = document.getElementById('view-all-history');
      
      // Sample book data (in real app, this would come from API/localStorage)
      this.books = [
        { id: '1', title: 'Alice in Borderlands', category: 'Manga', totalChapters: 328, lastChapter: 12, lastRead: '2026-02-14', cover: '📘' },
        { id: '2', title: 'Death Note', category: 'Manga', totalChapters: 108, lastChapter: 0, lastRead: null, cover: '📕' },
        { id: '3', title: 'Monster', category: 'Manga', totalChapters: 162, lastChapter: 45, lastRead: '2026-02-13', cover: '📙' },
        { id: '4', title: 'Berserk', category: 'Manga', totalChapters: 364, lastChapter: 0, lastRead: null, cover: '📗' },
        { id: '5', title: 'Solo Leveling', category: 'Manhwa', totalChapters: 179, lastChapter: 89, lastRead: '2026-02-12', cover: '📘' },
        { id: '6', title: 'Tower of God', category: 'Manhwa', totalChapters: 158, lastChapter: 0, lastRead: null, cover: '📕' },
        { id: '7', title: 'The Breaker', category: 'Manhwa', totalChapters: 82, lastChapter: 30, lastRead: '2026-02-10', cover: '📙' },
        { id: '8', title: 'Noblesse', category: 'Manhwa', totalChapters: 220, lastChapter: 0, lastRead: null, cover: '📗' },
        { id: '9', title: '1984', category: 'Books', totalChapters: 45, lastChapter: 12, lastRead: '2026-02-09', cover: '📚' },
        { id: '10', title: 'Dune', category: 'Books', totalChapters: 67, lastChapter: 0, lastRead: null, cover: '📚' },
        { id: '11', title: 'Foundation', category: 'Books', totalChapters: 52, lastChapter: 0, lastRead: null, cover: '📚' },
        { id: '12', title: 'The Hobbit', category: 'Books', totalChapters: 38, lastChapter: 20, lastRead: '2026-02-08', cover: '📚' }
      ];
      
      this.init();
    }
    
    init() {
      // Wait for skeletons to be replaced
      setTimeout(() => {
        this.loadReadingProgress();
        this.setupEventListeners();
      }, 1600);
    }
    
    loadReadingProgress() {
      // Get books with reading progress (lastChapter > 0)
      const inProgress = this.books
        .filter(book => book.lastChapter > 0)
        .sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead))
        .slice(0, 5); // Show max 5 continue reading items
      
      // Get recently added books (all books, sorted by id for demo)
      const recent = [...this.books]
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 4);
      
      this.renderContinueReading(inProgress);
      this.renderRecentBooks(recent);
    }
    
    renderContinueReading(books) {
      if (!this.continueGrid) return;
      
      if (books.length === 0) {
        // Show empty state with premium design
        this.continueSection.style.display = 'block';
        this.continueGrid.innerHTML = `
          <div class="continue-empty">
            <i class="fas fa-book-reader"></i>
            <p>No books in progress</p>
            <span>Start reading to see them here</span>
          </div>
        `;
        return;
      }
      
      this.continueGrid.innerHTML = books.map(book => {
        const progress = ((book.lastChapter / book.totalChapters) * 100).toFixed(1);
        const progressPercent = parseFloat(progress);
        
        return `
          <div class="continue-card" onclick="Navigation.goTo.reader('${book.id}', '${book.lastChapter}')">
            <div class="continue-cover">${book.cover}</div>
            <div class="continue-info">
              <h3 class="continue-title">${book.title}</h3>
              <div class="continue-meta">
                <span class="continue-category">${book.category}</span>
                <span class="continue-chapter">Ch ${book.lastChapter}/${book.totalChapters}</span>
              </div>
              <div class="continue-progress">
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-percent">${progress}%</span>
              </div>
              <div class="continue-last-read">Last read ${this.timeAgo(book.lastRead)}</div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    renderRecentBooks(books) {
      if (!this.recentGrid) return;
      
      this.recentGrid.innerHTML = books.map(book => {
        return `
          <div class="recent-card" onclick="Navigation.goTo.title('${book.id}')">
            <div class="recent-cover">${book.cover}</div>
            <div class="recent-info">
              <h4 class="recent-title">${book.title}</h4>
              <span class="recent-category">${book.category}</span>
            </div>
          </div>
        `;
      }).join('');
    }
    
    timeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    }
    
    setupEventListeners() {
      // View all history link
      if (this.viewAllLink) {
        this.viewAllLink.addEventListener('click', (e) => {
          e.preventDefault();
          // In a real app, this would open a history page or modal
          console.log('View all history clicked');
        });
      }
      
      // Listen for reading progress updates from reader
      document.addEventListener('readingProgressUpdated', (e) => {
        this.updateBookProgress(e.detail);
      });
    }
    
    updateBookProgress({ bookId, chapter }) {
      const book = this.books.find(b => b.id === bookId);
      if (book) {
        book.lastChapter = chapter;
        book.lastRead = new Date().toISOString().split('T')[0];
        this.loadReadingProgress(); // Re-render
      }
    }
  }
  
  // Initialize reading progress
  new ReadingProgress();
});