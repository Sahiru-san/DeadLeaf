document.addEventListener("DOMContentLoaded", () => {
  // Get URL parameters using Navigation
  const params = Navigation.getParams();
  const bookId = params.bookId;
  const chapterParam = params.chapter;
  
  // Configuration
  const maxChapters = 50;
  let currentChapter = 1;
  
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
  
  /* ---------- CHAPTER LOADING ---------- */
  function loadChapter(chapterNum) {
    // In a real app, you would fetch chapter content from an API
    // using bookId and chapterNum
    
    const chapterData = {
      title: `Chapter ${chapterNum} — The Weight of Silence`,
      content: `This is the content for Chapter ${chapterNum} of Book ${bookId}. In a real application, this would be loaded from a database or API.
      
      The rain had stopped sometime before dawn, but the streets still glistened as if the city itself refused to let go of the night.
      
      He stood at the corner of the street, coat damp, fingers numb, staring at the building across from him. Memories flooded back—some welcome, most not.
      
      "Sometimes," he whispered to no one, "the quiet is louder than the noise."
      
      End of Chapter ${chapterNum}`
    };
    
    if (chapterTitle) chapterTitle.textContent = chapterData.title;
    if (chapterText) chapterText.textContent = chapterData.content;
    if (chapterNumber) chapterNumber.textContent = `CH-${chapterNum}`;
  }
  
  /* ---------- CHAPTER NAVIGATION ---------- */
  function updateChapter() {
    // Validate chapter number
    currentChapter = Math.max(1, Math.min(currentChapter, maxChapters));
    
    // Load chapter content
    loadChapter(currentChapter);
    
    // Save to localStorage with book-specific key
    localStorage.setItem(`lastChapter_${bookId}`, currentChapter);
    
    // Update UI state
    if (prevBtn) prevBtn.disabled = currentChapter <= 1;
    if (nextBtn) nextBtn.disabled = currentChapter >= maxChapters;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update progress
    updateProgress();
    
    // Update URL without reloading (optional, for bookmarking)
    const url = new URL(window.location);
    url.searchParams.set('ch', currentChapter);
    window.history.replaceState({}, '', url);
  }
  
  /* ---------- INITIALIZE CHAPTER ---------- */
  // Priority: URL param > localStorage > default 1
  if (chapterParam && !isNaN(chapterParam)) {
    currentChapter = parseInt(chapterParam);
  } else {
    const saved = parseInt(localStorage.getItem(`lastChapter_${bookId}`));
    if (saved && !isNaN(saved)) {
      currentChapter = Math.min(Math.max(saved, 1), maxChapters);
    }
  }
  
  // Initial chapter load
  updateChapter();
  
  /* ---------- EVENT LISTENERS ---------- */
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentChapter < maxChapters) {
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
  
  /* ---------- FONT SIZE CONTROLS ---------- */
  let fontSize = parseInt(localStorage.getItem("readerFontSize")) || 18;
  
  // Apply on load
  if (readerContent) {
    readerContent.style.fontSize = fontSize + "px";
  }
  
  // Increase font
  if (incBtn) {
    incBtn.addEventListener("click", () => {
      fontSize = Math.min(fontSize + 1, 26);
      if (readerContent) readerContent.style.fontSize = fontSize + "px";
      localStorage.setItem("readerFontSize", fontSize);
    });
  }
  
  // Decrease font
  if (decBtn) {
    decBtn.addEventListener("click", () => {
      fontSize = Math.max(fontSize - 1, 12);
      if (readerContent) readerContent.style.fontSize = fontSize + "px";
      localStorage.setItem("readerFontSize", fontSize);
    });
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
  
  window.addEventListener("scroll", updateProgress);
  window.addEventListener("resize", updateProgress);
  
  /* ---------- KEYBOARD NAVIGATION ---------- */
  document.addEventListener("keydown", (e) => {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
      case 'ArrowRight':
      case 'd':
        if (currentChapter < maxChapters) {
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
    
    // Right to left swipe (next)
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentChapter < maxChapters) {
        currentChapter++;
        updateChapter();
      } 
      // Left to right swipe (previous)
      else if (diff < 0 && currentChapter > 1) {
        currentChapter--;
        updateChapter();
      }
    }
  }
});

// Save reading progress
async function saveProgress(bookId, chapter, percent) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return; // Not logged in
  
  const { error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      chapter: chapter,
      progress_percent: percent,
      last_read: new Date()
    });
    
  if (error) console.error('Error saving progress:', error);
}