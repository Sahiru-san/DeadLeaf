// library-search.js
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById('library-search');
  const clearButton = document.getElementById('clear-search');
  const searchStats = document.getElementById('search-stats');
  const resultCountSpan = document.getElementById('result-count');
  const noResultsDiv = document.getElementById('no-results');
  
  // Get all category grids and their cards
  const mangaGrid = document.getElementById('manga-grid');
  const manhwaGrid = document.getElementById('manhwa-grid');
  const booksGrid = document.getElementById('books-grid');
  
  // Store original cards data
  let allBooks = [];
  let categoryTitles = [];
  
  // Initialize book data after skeletons are replaced
  function initializeBookData() {
    // Wait for skeletons to be replaced (simulate loading)
    setTimeout(() => {
      const allCards = document.querySelectorAll('.card:not(.skeleton)');
      
      allBooks = Array.from(allCards).map((card, index) => {
        const title = card.querySelector('.book-preview')?.textContent || `Book ${index + 1}`;
        const category = card.closest('.grid')?.id || 'unknown';
        return {
          element: card,
          title: title,
          category: category,
          html: card.outerHTML
        };
      });
      
      // Store category titles
      categoryTitles = document.querySelectorAll('.category-title');
      
      // Initial stats update
      updateStats(allBooks.length);
    }, 1600);
  }
  
  // Filter function
  function filterBooks(searchTerm) {
    if (!searchTerm.trim()) {
      // Show all books
      allBooks.forEach(book => {
        book.element.style.display = 'block';
      });
      
      // Show all category titles
      categoryTitles.forEach(title => {
        title.style.display = 'block';
      });
      
      // Show all grids if they have visible children
      [mangaGrid, manhwaGrid, booksGrid].forEach(grid => {
        if (grid) {
          grid.style.display = 'grid';
        }
      });
      
      // Hide no results
      if (noResultsDiv) {
        noResultsDiv.classList.remove('show');
      }
      
      updateStats(allBooks.length);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    let visibleCount = 0;
    
    // Track which categories have visible books
    const categoriesWithVisible = new Set();
    
    // Filter books
    allBooks.forEach(book => {
      const matches = book.title.toLowerCase().includes(term);
      book.element.style.display = matches ? 'block' : 'none';
      if (matches) {
        visibleCount++;
        categoriesWithVisible.add(book.category);
      }
    });
    
    // Hide empty categories
    categoryTitles.forEach(title => {
      const nextGrid = title.nextElementSibling;
      if (nextGrid && nextGrid.classList.contains('grid')) {
        const hasVisibleBooks = Array.from(nextGrid.children).some(
          child => child.style.display !== 'none'
        );
        title.style.display = hasVisibleBooks ? 'block' : 'none';
      }
    });
    
    // Show/hide no results
    if (visibleCount === 0) {
      if (noResultsDiv) {
        noResultsDiv.classList.add('show');
      }
    } else {
      if (noResultsDiv) {
        noResultsDiv.classList.remove('show');
      }
    }
    
    updateStats(visibleCount);
  }
  
  // Update search stats
  function updateStats(count) {
    if (searchStats && resultCountSpan) {
      resultCountSpan.textContent = count;
      
      if (searchInput.value.trim()) {
        searchStats.classList.add('visible');
      } else {
        searchStats.classList.remove('visible');
      }
    }
  }
  
  // Clear search
  function clearSearch() {
    if (searchInput) {
      searchInput.value = '';
      filterBooks('');
      searchInput.focus();
    }
    
    if (clearButton) {
      clearButton.style.opacity = '0';
      clearButton.style.pointerEvents = 'none';
    }
  }
  
  // Event listeners
  if (searchInput) {
    // Input event for real-time filtering
    searchInput.addEventListener('input', (e) => {
      filterBooks(e.target.value);
      
      // Show/hide clear button
      if (clearButton) {
        if (e.target.value.length > 0) {
          clearButton.style.opacity = '1';
          clearButton.style.pointerEvents = 'auto';
        } else {
          clearButton.style.opacity = '0';
          clearButton.style.pointerEvents = 'none';
        }
      }
    });
    
    // Focus effects
    searchInput.addEventListener('focus', () => {
      document.querySelector('.search-container').classList.add('focused');
    });
    
    searchInput.addEventListener('blur', () => {
      document.querySelector('.search-container').classList.remove('focused');
    });
    
    // Keyboard shortcut (Cmd+K or Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        clearSearch();
        searchInput.blur();
      }
    });
  }
  
  // Clear button
  if (clearButton) {
    clearButton.addEventListener('click', clearSearch);
    clearButton.style.opacity = '0';
    clearButton.style.pointerEvents = 'none';
  }
  
  // Initialize after a short delay (to allow skeleton replacement)
  initializeBookData();
  
  // Re-initialize when theme changes (in case cards are re-rendered)
  document.addEventListener('themechange', () => {
    setTimeout(initializeBookData, 100);
  });
});