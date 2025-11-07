// Utility function for smooth scrolling to page sections
// Handles smooth scrolling with offset for fixed headers

/**
 * Smoothly scrolls to a section on the page
 * @param {string} sectionId - The ID of the section to scroll to
 * @param {number} offset - Optional offset in pixels (default: 80 for header)
 */
export const scrollToSection = (sectionId, offset = 80) => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // If element not found, try again after a short delay (for dynamic content)
      setTimeout(() => {
        const retryElement = document.getElementById(sectionId);
        if (retryElement) {
          const elementPosition = retryElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
    }
  }, 50);
};

