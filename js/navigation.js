// navigation.js
const Navigation = {
  // Navigate to specific pages
  goTo: {
    home: () => window.location.href = 'index.html',
    library: () => window.location.href = 'library.html',
    
    // Title page with book ID
    title: (bookId = '1') => window.location.href = `title.html?id=${bookId}`,
    
    // Reader with book ID and chapter
    reader: (bookId = '1', chapter = '1') => {
      window.location.href = `reader.html?book=${bookId}&ch=${chapter}`;
    },
    
    // Back navigation based on current page
    back: () => {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      
      const navigationMap = {
        'reader.html': () => {
          const params = Navigation.getParams();
          Navigation.goTo.title(params.bookId);
        },
        'title.html': () => Navigation.goTo.library(),
        'library.html': () => Navigation.goTo.home(),
        'index.html': () => window.history.back() // fallback for landing page
      };
      
      const navigate = navigationMap[currentPage];
      if (navigate) {
        navigate();
      } else {
        window.history.back(); // fallback
      }
    }
  },
  
  // Get URL parameters
  getParams: () => {
    const params = new URLSearchParams(window.location.search);
    return {
      bookId: params.get('book') || params.get('id') || '1',
      chapter: parseInt(params.get('ch')) || 1
    };
  },
  
  // Initialize navigation for all pages
  init: () => {
    document.addEventListener('click', (e) => {
      // Handle data-navigate attributes
      const navElement = e.target.closest('[data-navigate]');
      if (navElement) {
        e.preventDefault();
        const destination = navElement.dataset.navigate;
        const bookId = navElement.dataset.bookId;
        const chapter = navElement.dataset.chapter;
        
        switch(destination) {
          case 'home':
            Navigation.goTo.home();
            break;
          case 'library':
            Navigation.goTo.library();
            break;
          case 'title':
            Navigation.goTo.title(bookId);
            break;
          case 'reader':
            Navigation.goTo.reader(bookId, chapter);
            break;
          case 'back':
            Navigation.goTo.back();
            break;
        }
      }
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
});

// Make it globally available
window.Navigation = Navigation;