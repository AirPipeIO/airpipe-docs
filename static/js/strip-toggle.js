document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('strip')) {
    const stripValue = urlParams.get('strip');
    const delay = urlParams.has('delay') ? parseInt(urlParams.get('delay')) : 150;

    const removeHeaderAndFooter = () => {
      setTimeout(() => {
        const headerElement = document.querySelector('.navbar.navbar--fixed-top');
        const footerElement = document.querySelector('.footer.footer--dark');
        
        if (headerElement) {
          headerElement.remove();
        }
        if (footerElement) {
          footerElement.remove();
        }
      }, delay);
    };

    const removeHeader = () => {
      setTimeout(() => {
        const headerElement = document.querySelector('.navbar.navbar--fixed-top');
        
        if (headerElement) {
          headerElement.remove();
        }
      }, delay);
    };

    const removeFooter = () => {
      setTimeout(() => {
        const footerElement = document.querySelector('.footer.footer--dark');
        
        if (footerElement) {
          footerElement.remove();
        }
      }, delay);
    };

    switch(stripValue) {
      case 'all':
        removeHeaderAndFooter();
        break;
      case 'header':
        removeHeader();
        break;
      case 'footer':
        removeFooter();
        break;
      default:
    }
  }
});
