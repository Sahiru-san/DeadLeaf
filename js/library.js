// js/library.js - Real data fetching for library page

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Show loading skeletons (they're already in HTML)
    
    // Fetch books from Supabase
    const { data: books, error } = await window.supabase
      .from('books')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    if (!books || books.length === 0) {
      console.log('No books found in database');
      // Show empty state
      document.querySelectorAll('.horizontal-scroll').forEach(scroll => {
        scroll.innerHTML = '<div class="empty-message">No books available</div>';
      });
      return;
    }
    
    console.log('Fetched books:', books);
    
    // Categorize books
    const mangaBooks = books.filter(b => b.category === 'Manga');
    const manhwaBooks = books.filter(b => b.category === 'Manhwa');
    const booksCategory = books.filter(b => b.category === 'Books');
    
    // Render books in horizontal scroll sections
    renderBooks('manga-scroll', mangaBooks);
    renderBooks('manhwa-scroll', manhwaBooks);
    renderBooks('books-scroll', booksCategory);
    
    document.dispatchEvent(new CustomEvent('booksLoaded'));
    
  } catch (error) {
    console.error('Error loading books:', error);
  }
});

function renderBooks(containerId, books) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }
  
  container.innerHTML = ''; // Clear skeletons
  
  if (books.length === 0) {
    container.innerHTML = '<div class="empty-message">No books available</div>';
    return;
  }
  
  books.forEach(book => {
    const card = createBookCard(book);
    container.appendChild(card);
  });
}

function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-book-id', book.id);
  card.onclick = () => Navigation.goTo.title(book.id);
  
  // Get reading progress from localStorage (temporary)
  const lastChapter = parseInt(localStorage.getItem(`lastChapter_${book.id}`)) || 0;
  const progress = lastChapter > 0 && book.total_chapters > 0
    ? ((lastChapter / book.total_chapters) * 100).toFixed(1)
    : 0;
  
  card.setAttribute('data-progress', progress);
  
  if (progress > 0) {
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