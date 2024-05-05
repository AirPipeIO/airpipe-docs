document.addEventListener("DOMContentLoaded", function() {
  // Parse query parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check if the 'sidebar' parameter is present and set to 'full'
  if (urlParams.has('sidebar') && urlParams.get('sidebar') === 'full') {
    // Open the sidebar
    document.querySelector('.sidebar.sidebar--hidden').classList.remove('sidebar--hidden');
    // Update the navbar class to show the sidebar
    document.querySelector('.navbar.navbar--fixed-top').classList.add('navbar-sidebar--show');
  }
});
