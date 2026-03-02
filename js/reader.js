// js/reader.js - Load real chapter content from Supabase
document.addEventListener("DOMContentLoaded", async () => {
  // Get URL parameters using Navigation
  const params = Navigation.getParams();
  const bookId = params.bookId;
  const chapterParam = params.chapter;
  
  console.log('Loading reader:', { bookId, chapterParam });
  
  // Elements
  const chapterTitle = document.querySelector("#chapter-content h2");
  const chapterText = document.querySelector("#chapter-content p");
  const chapterNumber = document.getElementById("chapter-number");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  
  const progressWrapper = document.querySelector(".progress-wrapper");
  const progressBar = document.getElementById("progress-bar");
  
  const readerContent = document.getElementById("chapter-content");
  const incBtn = document.getElementById("font-increase");
  const decBtn = document.getElementById("font-decrease");
  
  // Variables
  let hideTimeout;
  let currentChapter = 1;
  let totalChapters = 1;
  let bookData = null;
  let chaptersData = [];
  
  /* ---------- FETCH BOOK & CHAPTER DATA ---------- */
  async function fetchBookData() {
    try {
      // Fetch book details to get total chapters
      const { data: book, error: bookError } = await window.supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      
      if (bookError) throw bookError;
      
      bookData = book;
      totalChapters = book.total_chapters || 1;
      
      // Fetch all chapters for this book
      const { data: chapters, error: chaptersError } = await window.supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_number');
      
      if (chaptersError) throw chaptersError;
      
      chaptersData = chapters || [];
      console.log(`Loaded ${chaptersData.length} chapters`);
      
    } catch (error) {
      console.error('Error fetching book data:', error);
      showError('Failed to load book content');
    }
  }
  
  /* ---------- FETCH SPECIFIC CHAPTER ---------- */
  async function fetchChapter(chapterNum) {
    try {
      // Find chapter in our cached data
      let chapter = chaptersData.find(c => c.chapter_number === chapterNum);
      
      // If not in cache, fetch directly
      if (!chapter) {
        const { data, error } = await window.supabase
          .from('chapters')
          .select('*')
          .eq('book_id', bookId)
          .eq('chapter_number', chapterNum)
          .single();
        
        if (error) throw error;
        chapter = data;
      }
      
      return chapter;
      
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return null;
    }
  }
  
  /* ---------- LOAD CHAPTER ---------- */
  async function loadChapter(chapterNum) {
    // Show loading state
    if (chapterTitle) chapterTitle.textContent = 'Loading...';
    if (chapterText) chapterText.textContent = 'Please wait while we load the chapter...';
    
    const chapter = await fetchChapter(chapterNum);
    
    if (!chapter) {
      // Chapter not found
      if (chapterTitle) chapterTitle.textContent = `Chapter ${chapterNum}`;
      if (chapterText) chapterText.textContent = 'This chapter is not available yet.';
      return;
    }
    
    // Update UI with chapter content
    if (chapterTitle) {
      chapterTitle.textContent = chapter.title || `Chapter ${chapterNum}`;
    }
    
    if (chapterText) {
      // Format content with paragraphs
      const content = chapter.content || 'No content available.';
      // Split by double newlines to create paragraphs
      const paragraphs = content.split('\n\n').filter(p => p.trim());
      
      if (paragraphs.length > 1) {
        // If we have multiple paragraphs, create separate p elements
        let html = '';
        paragraphs.forEach(p => {
          html += `<p>${p.replace(/\n/g, '<br>')}</p>`;
        });
        chapterText.innerHTML = html;
      } else {
        // Single paragraph
        chapterText.innerHTML = content.replace(/\n/g, '<br>');
      }
    }
    
    if (chapterNumber) chapterNumber.textContent = `CH-${chapterNum}`;
    
    // Save progress
    localStorage.setItem(`lastChapter_${bookId}`, chapterNum);
  }
  
  /* ---------- UPDATE CHAPTER (navigation) ---------- */
  async function updateChapter() {
    // Validate chapter number
    currentChapter = Math.max(1, Math.min(currentChapter, totalChapters));
    
    // Load chapter content
    await loadChapter(currentChapter);
    
    // Update UI state
    if (prevBtn) prevBtn.disabled = currentChapter <= 1;
    if (nextBtn) nextBtn.disabled = currentChapter >= totalChapters;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update progress bar
    updateProgress();
    
    // Update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set('ch', currentChapter);
    window.history.replaceState({}, '', url);
  }
  
  /* ---------- INITIALIZE ---------- */
  async function init() {
    // Check if Supabase is available
    if (!window.supabase) {
      console.error('Supabase not initialized');
      showError('System not ready. Please refresh.');
      return;
    }
    
    // Fetch book data first
    await fetchBookData();
    
    // Determine starting chapter
    if (chapterParam && !isNaN(chapterParam)) {
      currentChapter = parseInt(chapterParam);
    } else {
      const saved = parseInt(localStorage.getItem(`lastChapter_${bookId}`));
      if (saved && !isNaN(saved)) {
        currentChapter = Math.min(Math.max(saved, 1), totalChapters);
      }
    }
    
    // Load initial chapter
    await updateChapter();
    
    // Set up font size from preferences
    setupFontControls();
  }
  
  /* ---------- FONT SIZE CONTROLS (UPDATED) ---------- */
function setupFontControls() {
  // Get both sets of buttons (top bar and sidebar)
  const incBtn = document.getElementById("reader-font-increase") || document.getElementById("font-increase");
  const decBtn = document.getElementById("reader-font-decrease") || document.getElementById("font-decrease");
  const fontSizeIndicator = document.getElementById("font-size-indicator");
  
  let fontSize = parseInt(localStorage.getItem("readerFontSize")) || 18;
  
  // Apply on load
  if (readerContent) {
    readerContent.style.fontSize = fontSize + "px";
  }
  
  // Update indicator if it exists
  if (fontSizeIndicator) {
    fontSizeIndicator.textContent = fontSize + 'px';
  }
  
  // Increase font
  if (incBtn) {
    incBtn.addEventListener("click", () => {
      fontSize = Math.min(fontSize + 1, 26);
      if (readerContent) readerContent.style.fontSize = fontSize + "px";
      localStorage.setItem("readerFontSize", fontSize);
      
      // Update indicator
      if (fontSizeIndicator) {
        fontSizeIndicator.textContent = fontSize + 'px';
      }
    });
  }
  
  // Decrease font
  if (decBtn) {
    decBtn.addEventListener("click", () => {
      fontSize = Math.max(fontSize - 1, 12);
      if (readerContent) readerContent.style.fontSize = fontSize + "px";
      localStorage.setItem("readerFontSize", fontSize);
      
      // Update indicator
      if (fontSizeIndicator) {
        fontSizeIndicator.textContent = fontSize + 'px';
      }
    });
  }
}
  
  /* ---------- PROGRESS BAR ---------- */
  function updateProgress() {
    if (!progressBar) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight > 0) {
      const percent = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${percent}%`;
      
      // Show progress bar
      if (progressWrapper) {
        progressWrapper.classList.add("active");
        clearTimeout(hideTimeout);
        
        hideTimeout = setTimeout(() => {
          progressWrapper.classList.remove("active");
        }, 2000);
      }
    }
  }
  
  /* ---------- SHOW ERROR ---------- */
  function showError(message) {
    const container = document.querySelector('.reader-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
          <h2>Unable to load chapter</h2>
          <p style="color: var(--text-muted); margin-bottom: 30px;">${message}</p>
          <a href="javascript:history.back()" class="back-btn">Go Back</a>
        </div>
      `;
    }
  }
  
  /* ---------- EVENT LISTENERS ---------- */
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentChapter < totalChapters) {
        currentChapter++;
        updateChapter();
      }
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentChapter > 1) {
        currentChapter--;
        updateChapter();
      }
    });
  }
  
  /* ---------- SIDEBAR ---------- */
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  }
  
  function closeMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
  
  if (overlay) overlay.addEventListener("click", closeMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  
  /* ---------- SCROLL PROGRESS ---------- */
  window.addEventListener("scroll", updateProgress);
  window.addEventListener("resize", updateProgress);
  
  /* ---------- KEYBOARD NAVIGATION ---------- */
  document.addEventListener("keydown", (e) => {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
      case 'ArrowRight':
      case 'd':
        if (currentChapter < totalChapters) {
          currentChapter++;
          updateChapter();
        }
        break;
      case 'ArrowLeft':
      case 'a':
        if (currentChapter > 1) {
          currentChapter--;
          updateChapter();
        }
        break;
      case 'Escape':
        if (sidebar.classList.contains("active")) {
          closeMenu();
        }
        break;
    }
  });
  
  /* ---------- TOUCH GESTURES FOR MOBILE ---------- */
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentChapter < totalChapters) {
        currentChapter++;
        updateChapter();
      } else if (diff < 0 && currentChapter > 1) {
        currentChapter--;
        updateChapter();
      }
    }
  }
  
  // Start the reader
  init();
});