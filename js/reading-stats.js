// reading-stats.js
class ReadingStats {
  constructor() {
    this.stats = {
      booksStarted: 0,
      booksCompleted: 0,
      totalChapters: 0,
      streak: 0,
      bestStreak: 7,
      dailyMinutes: 14,
      weeklyChapters: 7,
      yearlyBooks: 3
    };
    
    this.goals = {
      daily: 30,
      weekly: 10,
      yearly: 12
    };
    
    this.init();
  }
  
  init() {
    this.loadStats();
    this.loadGoals();
    this.renderStats();
    this.setupEventListeners();
  }
  
  loadStats() {
    const saved = localStorage.getItem('deadleaf_stats');
    if (saved) {
      this.stats = JSON.parse(saved);
    } else {
      this.calculateStats();
    }
  }
  
  calculateStats() {
    // Get all books from reading progress
    const books = JSON.parse(localStorage.getItem('deadleaf_books') || '[]');
    
    this.stats.booksStarted = books.filter(b => b.lastChapter > 0).length;
    this.stats.booksCompleted = books.filter(b => b.lastChapter === b.totalChapters).length;
    this.stats.totalChapters = books.reduce((sum, b) => sum + (b.lastChapter || 0), 0);
    
    // Calculate streak (simplified for demo)
    const lastRead = localStorage.getItem('deadleaf_last_read');
    if (lastRead) {
      const daysSince = Math.floor((Date.now() - new Date(lastRead)) / (1000 * 60 * 60 * 24));
      this.stats.streak = daysSince <= 1 ? this.stats.streak + 1 : 1;
    }
    
    this.saveStats();
  }
  
  loadGoals() {
    const saved = localStorage.getItem('deadleaf_goals');
    if (saved) {
      this.goals = JSON.parse(saved);
    }
  }
  
  saveStats() {
    localStorage.setItem('deadleaf_stats', JSON.stringify(this.stats));
  }
  
  saveGoals() {
    localStorage.setItem('deadleaf_goals', JSON.stringify(this.goals));
    this.renderStats();
  }
  
  renderStats() {
    // Update stat cards
    document.getElementById('books-started').textContent = this.stats.booksStarted;
    document.getElementById('books-completed').textContent = this.stats.booksCompleted;
    document.getElementById('total-pages').textContent = this.stats.totalChapters;
    document.getElementById('reading-streak').textContent = this.stats.streak;
    
    // Update goals
    const dailyPercent = Math.min(100, (this.stats.dailyMinutes / this.goals.daily) * 100);
    const weeklyPercent = Math.min(100, (this.stats.weeklyChapters / this.goals.weekly) * 100);
    const yearlyPercent = Math.min(100, (this.stats.yearlyBooks / this.goals.yearly) * 100);
    
    document.querySelectorAll('.goal-item')[0].querySelector('.goal-progress-fill').style.width = `${dailyPercent}%`;
    document.querySelectorAll('.goal-item')[0].querySelector('.goal-percent').textContent = `${Math.round(dailyPercent)}%`;
    document.querySelectorAll('.goal-item')[0].querySelector('.goal-time').textContent = `${this.stats.dailyMinutes} min today`;
    
    document.querySelectorAll('.goal-item')[1].querySelector('.goal-progress-fill').style.width = `${weeklyPercent}%`;
    document.querySelectorAll('.goal-item')[1].querySelector('.goal-percent').textContent = `${Math.round(weeklyPercent)}%`;
    document.querySelectorAll('.goal-item')[1].querySelector('.goal-time').textContent = `${this.stats.weeklyChapters} chapters this week`;
    
    document.querySelectorAll('.goal-item')[2].querySelector('.goal-progress-fill').style.width = `${yearlyPercent}%`;
    document.querySelectorAll('.goal-item')[2].querySelector('.goal-percent').textContent = `${Math.round(yearlyPercent)}%`;
    document.querySelectorAll('.goal-item')[2].querySelector('.goal-time').textContent = `${this.stats.yearlyBooks} completed`;
  }
  
  setupEventListeners() {
    // Edit goals button
    document.getElementById('edit-goals')?.addEventListener('click', () => {
      this.openModal();
    });
    
    // Modal close
    document.getElementById('close-modal')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    document.getElementById('cancel-goals')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    // Save goals
    document.getElementById('save-goals')?.addEventListener('click', () => {
      this.goals.daily = parseInt(document.getElementById('goal-daily').value) || 30;
      this.goals.weekly = parseInt(document.getElementById('goal-weekly').value) || 10;
      this.goals.yearly = parseInt(document.getElementById('goal-yearly').value) || 12;
      
      this.saveGoals();
      this.closeModal();
    });
    
    // Close modal on overlay click
    document.querySelector('.modal')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal();
      }
    });
    
    // Listen for reading updates
    document.addEventListener('readingProgressUpdated', (e) => {
      this.updateStats(e.detail);
    });
  }
  
  openModal() {
    document.getElementById('goals-modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    
    // Set current values
    document.getElementById('goal-daily').value = this.goals.daily;
    document.getElementById('goal-weekly').value = this.goals.weekly;
    document.getElementById('goal-yearly').value = this.goals.yearly;
  }
  
  closeModal() {
    document.getElementById('goals-modal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
  }
  
  updateStats({ bookId, chapter }) {
    this.calculateStats();
    this.renderStats();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.readingStats = new ReadingStats();
});