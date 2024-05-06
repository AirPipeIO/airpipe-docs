document.addEventListener("DOMContentLoaded", function() {
  // Parse query parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check if the 'sidebar' parameter is present and set to 'full'
  if (urlParams.has('sidebar') && urlParams.get('sidebar') === 'full') {
    // Function to simulate clicking on the navbar toggle
    const clickNavbarToggle = () => {
      const navbarElement = document.querySelector('.navbar__toggle');
      navbarElement.click();
    };

    const checkNavbarToggle = () => {
      const navbarElement = document.querySelector('.navbar__toggle');
      if (navbarElement) {
        clickNavbarToggle(); 
      } else {
        setTimeout(checkNavbarToggle, 100);
      }
    };

    checkNavbarToggle();
  }
});
