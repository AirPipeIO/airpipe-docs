document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('sidebar') && urlParams.get('sidebar') === 'full') {
    const delay = urlParams.has('delay') ? parseInt(urlParams.get('delay')) : 150;

    const clickNavbarToggle = () => {
      const navbarElement = document.querySelector('.navbar__toggle');
      navbarElement.click();
    };

    const checkNavbarToggle = () => {
      const navbarElement = document.querySelector('.navbar__toggle');
      if (navbarElement) {
        setTimeout(clickNavbarToggle, delay); 
      } else {
        setTimeout(checkNavbarToggle, delay);
      }
    };

    checkNavbarToggle();
  }
});
