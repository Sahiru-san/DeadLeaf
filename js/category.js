// js/category.js
document.addEventListener('DOMContentLoaded', () => {
  // Get category from URL
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('type') || 'manga';
  
  // Update page title
  document.getElementById('category-name').textContent = 
    category.charAt(0).toUpperCase() + category.slice(1);
  document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} - DeadLeaf`;
  
  // Sample data (replace with Supabase later)
  const booksData = {
    manga: [
      { id: 1, title: 'Alice in Borderlands', chapters: 328, progress: 12 },
      { id: 2, title: 'Death Note', chapters: 108, progress: 0 },
      { id: 3, title: 'Monster', chapters: 162, progress: 45 },
      { id: 4, title: 'Berserk', chapters: 364, progress: 0 },
      { id: 13, title: 'Attack on Titan', chapters: 139, progress: 0 },
      { id: 14, title: 'One Piece', chapters: 1089, progress: 0 },
      { id: 15, title: 'Naruto', chapters: 700, progress: 0 },
      { id: 16, title: 'Demon Slayer', chapters: 205, progress: 0 },
    ],
    manhwa: [
      { id: 5, title: 'Solo Leveling', chapters: 179, progress: 89 },
      { id: 6, title: 'Tower of God', chapters: 158, progress: 0 },
      { id: 7, title: 'The Breaker', chapters: 82, progress: 30 },
      { id: 8, title: 'Noblesse', chapters: 220, progress: 0 },
      { id: 17, title: 'The Beginning After the End', chapters: 182, progress: 0 },
      { id: 18, title: 'Omniscient Reader', chapters: 189, progress: 0 },
    ],
    books: [
      { id: 9, title: '1984', chapters: 45, progress: 12 },
      { id: 10, title: 'Dune', chapters: 67, progress: 0 },
      { id: 11, title: 'Foundation', chapters: 52, progress: 0 },
      { id: 12, title: 'The Hobbit', chapters: 38, progress: 20 },
      { id: 19, title: 'The Name of the Wind', chapters: 92, progress: 0 },
      { id: 20, title: 'Mistborn', chapters: 38, progress: 0 },
    ]
  };
  
  let currentBooks = booksData[category] || booksData.manga;
  let filteredBooks = [...currentBooks];
  let currentPage = 1;
  const booksPerPage = 12;
  
  // Update count
  document.getElementById('category-count').textContent = 
    `${filteredBooks.length} titles`;
  
  // Load books
  loadBooks();
  
  // Sort dropdown
  const sortBtn = document.getElementById('sort-btn');
  const sortMenu = document.getElementById('sort-menu');
  
  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortMenu.classList.toggle('show');
  });
  
  // Close sort menu when clicking outside
  document.addEventListener('click', () => {
    sortMenu.classList.remove('show');
  });
  
  // Sort options
  document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', () => {
      const sortType = option.dataset.sort;
      document.getElementById('current-sort').textContent = option.textContent;
      sortBooks(sortType);
      sortMenu.classList.remove('show');
    });
  });
  
  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      // Update active chip
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const filter = chip.dataset.filter;
      filterBooks(filter);
    });
  });
  
  // Load more button
  const loadMoreBtn = document.getElementById('load-more');
  loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    loadBooks(true);
  });
  
  function loadBooks(append = false) {
    const grid = document.getElementById('category-grid');
    const start = (currentPage - 1) * booksPerPage;
    const end = currentPage * booksPerPage;
    const booksToShow = filteredBooks.slice(0, end);
    
    if (!append) {
      grid.innerHTML = ''; // Clear skeletons
    }
    
    booksToShow.forEach(book => {
      const card = createBookCard(book);
      grid.appendChild(card);
    });
    
    // Hide load more if no more books
    if (end >= filteredBooks.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-flex';
    }
    
    // Hide no results if books exist
    const noResults = document.getElementById('no-results');
    if (filteredBooks.length === 0) {
      noResults.style.display = 'block';
      grid.style.display = 'none';
      loadMoreBtn.style.display = 'none';
    } else {
      noResults.style.display = 'none';
      grid.style.display = 'grid';
    }
  }
  
  function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-book-id', book.id);
    card.onclick = () => Navigation.goTo.title(book.id);
    
    const progress = book.progress > 0 
      ? ((book.progress / book.chapters) * 100).toFixed(1) 
      : 0;
    
    card.setAttribute('data-progress', progress);
    
    if (book.progress > 0) {
      card.innerHTML = `
        <div class="card-content">
          <div class="card-title">${book.title}</div>
          <div class="card-progress">
            <span class="card-progress-text">${progress}%</span>
            <div class="card-progress-bar">
              <div class="card-progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="card-content">
          <div class="card-title">${book.title}</div>
        </div>
      `;
    }
    
    return card;
  }
  
  function sortBooks(type) {
    switch(type) {
      case 'latest':
        filteredBooks.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        filteredBooks.sort((a, b) => b.progress - a.progress);
        break;
      case 'a-z':
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    
    currentPage = 1;
    loadBooks();
  }
  
  function filterBooks(filter) {
    if (filter === 'all') {
      filteredBooks = [...currentBooks];
    } else if (filter === 'ongoing') {
      filteredBooks = currentBooks.filter(book => book.progress < book.chapters);
    } else if (filter === 'completed') {
      filteredBooks = currentBooks.filter(book => book.progress === book.chapters);
    } else if (filter === 'popular') {
      filteredBooks = [...currentBooks].sort((a, b) => b.progress - a.progress);
    } else if (filter === 'new') {
      filteredBooks = [...currentBooks].sort((a, b) => b.id - a.id);
    }
    
    document.getElementById('category-count').textContent = 
      `${filteredBooks.length} titles`;
    
    currentPage = 1;
    loadBooks();
  }
});