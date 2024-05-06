document.addEventListener("DOMContentLoaded", function() {
  // Parse query parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check if the 'sidebar' parameter is present and set to 'full'
  if (urlParams.has('sidebar') && urlParams.get('sidebar') === 'full') {
    const navbarElement = document.querySelector('.navbar__toggle');
    navbarElement.click();
  }
});
