document.addEventListener("DOMContentLoaded", () => {
  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem("theme") || "dark";
  
  // Apply theme to body
  document.body.setAttribute("data-theme", savedTheme);
  
  // Also apply class for night mode (backward compatibility)
  if (savedTheme === "night") {
    document.body.classList.add("night");
  } else {
    document.body.classList.remove("night");
  }
  
  // Theme switcher buttons
  const themeButtons = document.querySelectorAll("[data-set-theme]");
  
  themeButtons.forEach(btn => {
    // Add active class to current theme button
    if (btn.getAttribute("data-set-theme") === savedTheme) {
      btn.classList.add("active-theme");
    }
    
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-set-theme");
      
      // Update body attribute
      document.body.setAttribute("data-theme", theme);
      
      // Update night class for backward compatibility
      if (theme === "night") {
        document.body.classList.add("night");
      } else {
        document.body.classList.remove("night");
      }
      
      // Save to localStorage
      localStorage.setItem("theme", theme);
      
      // Update active button
      themeButtons.forEach(b => b.classList.remove("active-theme"));
      btn.classList.add("active-theme");
      
      // Dispatch custom event for other components
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    });
  });
  
  // Add CSS for active theme button
  const style = document.createElement('style');
  style.textContent = `
    .theme-switcher button.active-theme {
      background: var(--accent) !important;
      color: #000000 !important;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
});