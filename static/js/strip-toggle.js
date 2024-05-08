document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('strip')) {
    const stripValue = urlParams.get('strip');

    const removeHeaderAndFooter = () => {
      const headerElement = document.querySelector('.navbar.navbar--fixed-top');
      const footerElement = document.querySelector('.footer.footer--dark');
      
      if (headerElement) {
        headerElement.remove();
      }
      if (footerElement) {
        footerElement.remove();
      }
    };

    const removeHeader = () => {
      const headerElement = document.querySelector('.navbar.navbar--fixed-top');
      
      if (headerElement) {
        headerElement.remove();
      }
    };

    const removeFooter = () => {
      const footerElement = document.querySelector('.footer.footer--dark');
      
      if (footerElement) {
        footerElement.remove();
      }
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
        // Invalid 'strip' value, do nothing
    }
  }
});
