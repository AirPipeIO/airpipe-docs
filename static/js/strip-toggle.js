document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('strip')) {
    const stripValue = urlParams.get('strip');

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
      }, 150);
    };

    const removeHeader = () => {
      setTimeout(() => {
        const headerElement = document.querySelector('.navbar.navbar--fixed-top');
        
        if (headerElement) {
          headerElement.remove();
        }
      }, 150);
    };

    const removeFooter = () => {
      setTimeout(() => {
        const footerElement = document.querySelector('.footer.footer--dark');
        
        if (footerElement) {
          footerElement.remove();
        }
      }, 150);
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
