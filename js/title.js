document.addEventListener("DOMContentLoaded", () => {
  // Get book ID from URL using Navigation
  const params = Navigation.getParams();
  const bookId = params.bookId;
  
  // Simulated loading delay
  setTimeout(() => loadTitleData(bookId), 800);
  
  // Also load when theme changes
  document.addEventListener('themechange', () => loadTitleData(bookId));
});

function loadTitleData(bookId) {
  /* =========================================================
     DUMMY DATA (REPLACE WITH API LATER)
     ========================================================= */
  const data = {
    id: bookId,
    title: "Alice in Borderlands",
    author: "Sakamoto Taro",
    warning: "⚠ R-rated · Violence · Adult Language",
    status: "Status: Completed",
    description: "An aimless gamer comes to an unknown place where he and his friends are forced to play deadly games to survive. Each game has different objectives, and failure results in immediate death by red lasers fired from the sky. As they participate in more games, they uncover clues about the mysterious world they're trapped in.",
    total: "Total Chapters: 328",
    chapters: 12,
    coverUrl: "https://via.placeholder.com/220x300/1a1a1a/ffffff?text=Cover",
    rating: "4.8/5",
    genres: ["Survival", "Psychological", "Thriller"]
  };

  /* =========================================================
     TEXT CONTENT
     ========================================================= */
  const titleEl = document.querySelector(".title-name");
  const authorEl = document.querySelector(".author");
  const warningEl = document.querySelector(".warning");
  const statusEl = document.querySelector(".status");
  const descTextEl = document.querySelector(".desc-text");
  const totalEl = document.querySelector(".total");
  
  // Update text content
  if (titleEl) titleEl.textContent = data.title;
  if (authorEl) authorEl.textContent = `Author: ${data.author}`;
  if (warningEl) warningEl.textContent = data.warning;
  if (statusEl) statusEl.textContent = data.status;
  if (descTextEl) descTextEl.textContent = data.description;
  if (totalEl) totalEl.textContent = data.total;
  
  /* =========================================================
     COVER IMAGE
     ========================================================= */
  const coverImg = document.querySelector(".cover-box img");
  if (coverImg) {
    coverImg.src = data.coverUrl;
    coverImg.alt = `${data.title} Cover`;
    coverImg.onload = () => {
      coverImg.hidden = false;
    };
    coverImg.onerror = () => {
      coverImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='300' viewBox='0 0 220 300'%3E%3Crect width='220' height='300' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3ECover%3C/text%3E%3C/svg%3E";
      coverImg.hidden = false;
    };
  }
  
  /* =========================================================
     CONTINUE READING BUTTON
     ========================================================= */
  const continueBtn = document.getElementById("continue-reading");
  const lastChapter = parseInt(localStorage.getItem(`lastChapter_${bookId}`)) || 1;
  
  if (continueBtn) {
    if (lastChapter > 1 && lastChapter <= data.chapters) {
      continueBtn.style.display = "block";
      continueBtn.textContent = `Continue Reading (Chapter ${lastChapter})`;
      continueBtn.onclick = () => {
        Navigation.goTo.reader(bookId, lastChapter);
      };
    } else if (lastChapter > data.chapters) {
      continueBtn.style.display = "block";
      continueBtn.textContent = "Read From Beginning";
      continueBtn.onclick = () => {
        Navigation.goTo.reader(bookId, 1);
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
  
  for (let i = 1; i <= data.chapters; i++) {
    const div = document.createElement("div");
    div.className = "chapter-item";
    div.textContent = `Chapter ${i}`;
    div.setAttribute("data-chapter", i);
    
    // Highlight last read chapter
    if (i === lastChapter) {
      div.style.borderLeft = `4px solid var(--accent)`;
    }
    
    div.onclick = () => {
      // Save which chapter was clicked for this specific book
      localStorage.setItem(`lastChapter_${bookId}`, i);
      Navigation.goTo.reader(bookId, i);
    };
    
    list.appendChild(div);
  }
  
  // Add fadeIn animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}