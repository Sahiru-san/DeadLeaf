// js/title.js - Load real book data from Supabase
document.addEventListener("DOMContentLoaded", async () => {
  // Get book ID from URL using Navigation
  const params = Navigation.getParams();
  const bookId = params.bookId;
  
  console.log('Loading book ID:', bookId);
  
  try {
    // Fetch book details from Supabase
    const { data: book, error } = await window.supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (error) throw error;
    
    if (!book) {
      console.error('Book not found');
      return;
    }
    
    console.log('Book loaded:', book);
    
    // Fetch chapters for this book
    const { data: chapters, error: chaptersError } = await window.supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number');
    
    if (chaptersError) throw chaptersError;
    
    console.log(`Loaded ${chapters?.length || 0} chapters`);
    
    // Populate the page with real data
    loadTitleData(book, chapters || []);
    
  } catch (error) {
    console.error('Error loading book:', error);
    // Show error message on page
    showError('Failed to load book. Please try again.');
  }
  
  // Also load when theme changes (optional)
  document.addEventListener('themechange', () => {
    // Just refresh - data is already loaded
  });
});

function loadTitleData(book, chapters) {
  
  /* =========================================================
     TEXT CONTENT
     ========================================================= */
  const titleEl = document.querySelector(".title-name");
  const authorEl = document.querySelector(".author");
  const warningEl = document.querySelector(".warning");
  const statusEl = document.querySelector(".status");
  const descTextEl = document.querySelector(".desc-text");
  const totalEl = document.querySelector(".total");
  
  // Update text content with real data
  if (titleEl) titleEl.textContent = book.title || 'Unknown Title';
  if (authorEl) authorEl.textContent = `Author: ${book.author || 'Unknown'}`;
  
  // Optional fields (add default values if not present)
  if (warningEl) {
    warningEl.textContent = book.warning || '⚠️ All Ages';
  }
  
  if (statusEl) {
    const status = book.status || 'ongoing';
    statusEl.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    statusEl.style.color = status === 'completed' ? 'var(--accent)' : 'var(--text-muted)';
  }
  
  if (descTextEl) descTextEl.textContent = book.description || 'No description available.';
  
  if (totalEl) {
    const totalChapters = book.total_chapters || chapters.length || 0;
    totalEl.textContent = `Total Chapters: ${totalChapters}`;
  }
  
  /* =========================================================
     COVER IMAGE
     ========================================================= */
  const coverImg = document.querySelector(".cover-box img");
  if (coverImg) {
    if (book.cover_url) {
      coverImg.src = book.cover_url;
    } else {
      // Default placeholder
      coverImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='300' viewBox='0 0 220 300'%3E%3Crect width='220' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E";
    }
    coverImg.alt = `${book.title} Cover`;
    coverImg.hidden = false;
  }
  
  /* =========================================================
     CONTINUE READING BUTTON
     ========================================================= */
  const continueBtn = document.getElementById("continue-reading");
  const lastChapter = parseInt(localStorage.getItem(`lastChapter_${book.id}`)) || 1;
  const totalChapters = book.total_chapters || chapters.length || 1;
  
  if (continueBtn) {
    if (lastChapter > 1 && lastChapter <= totalChapters) {
      continueBtn.style.display = "block";
      continueBtn.textContent = `Continue Reading (Chapter ${lastChapter})`;
      continueBtn.onclick = () => {
        Navigation.goTo.reader(book.id, lastChapter);
      };
    } else {
      continueBtn.style.display = "block";
      continueBtn.textContent = "Start Reading";
      continueBtn.onclick = () => {
        Navigation.goTo.reader(book.id, 1);
      };
    }
  }
  
  /* =========================================================
     SKELETON HANDLING
     ========================================================= */
  const skeletons = document.getElementById("chapter-skeletons");
  if (skeletons) {
    skeletons.style.display = "none";
  }
  
  document.querySelectorAll(".skeleton").forEach(el => {
    el.style.display = "none";
  });
  
  /* =========================================================
     SHOW REAL CONTENT
     ========================================================= */
  const realInfo = document.querySelector(".real-info");
  const realDesc = document.querySelector(".real-desc");
  
  if (realInfo) {
    realInfo.hidden = false;
    realInfo.style.opacity = "0";
    realInfo.style.animation = "fadeIn 0.5s ease forwards";
  }
  
  if (realDesc) {
    realDesc.hidden = false;
    realDesc.style.opacity = "0";
    realDesc.style.animation = "fadeIn 0.5s ease 0.2s forwards";
  }
  
  /* =========================================================
     CHAPTER LIST
     ========================================================= */
  const list = document.getElementById("chapter-list");
  if (!list) return;
  
  list.hidden = false;
  list.innerHTML = "";
  list.style.opacity = "0";
  list.style.animation = "fadeIn 0.5s ease 0.4s forwards";
  
  if (chapters.length === 0) {
    // No chapters yet
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-chapters";
    emptyMessage.textContent = "No chapters available yet.";
    emptyMessage.style.padding = "30px";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.color = "var(--text-muted)";
    list.appendChild(emptyMessage);
  } else {
    // Add each chapter
    chapters.forEach(chapter => {
      const div = document.createElement("div");
      div.className = "chapter-item";
      div.textContent = chapter.title || `Chapter ${chapter.chapter_number}`;
      div.setAttribute("data-chapter", chapter.chapter_number);
      
      // Highlight last read chapter
      if (chapter.chapter_number === lastChapter) {
        div.style.borderLeft = `4px solid var(--accent)`;
      }
      
      div.onclick = () => {
        // Save which chapter was clicked
        localStorage.setItem(`lastChapter_${book.id}`, chapter.chapter_number);
        Navigation.goTo.reader(book.id, chapter.chapter_number);
      };
      
      list.appendChild(div);
    });
  }
  
  // Add fadeIn animation if not already in CSS
  ensureAnimations();
}

function showError(message) {
  // Hide all skeletons
  document.querySelectorAll(".skeleton").forEach(el => {
    el.style.display = "none";
  });
  
  // Show error message
  const container = document.querySelector(".title-container");
  if (container) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
      text-align: center;
      padding: 60px 20px;
      background: var(--bg-card);
      border-radius: 20px;
      border: 1px solid var(--border);
      margin: 40px auto;
      max-width: 500px;
    `;
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
      <h3 style="margin-bottom: 10px;">Oops! Something went wrong</h3>
      <p style="color: var(--text-muted); margin-bottom: 25px;">${message}</p>
      <a href="library.html" class="back-btn">Back to Library</a>
    `;
    
    // Replace content with error
    document.querySelector('.title-container').innerHTML = '';
    document.querySelector('.title-container').appendChild(errorDiv);
  }
}

function ensureAnimations() {
  // Add fadeIn animation if not already in CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .empty-chapters {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
      background: var(--bg-secondary);
      border-radius: 16px;
      border: 1px dashed var(--border);
    }
  `;
  document.head.appendChild(style);
}