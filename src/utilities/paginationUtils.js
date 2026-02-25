/**
 * Generates a range of page numbers with ellipses ('...') for sliding window pagination.
 * Time Complexity: O(1) conceptually, limited by `totalPages`. Space Complexity: O(N).
 * * @param {number} currentPage - The currently active page number
 * @param {number} totalPages - The total number of pages available
 * @param {number} [delta=2] - The number of adjacent pages to show on each side of the current page
 * @returns {(number|string)[]} - Array representing the pagination structure (e.g., [1, '...', 4, 5, 6, '...', 10])
 */
export const getPaginationRange = (currentPage, totalPages, delta = 2) => {
  // Edge case: If 1 or 0 pages, just return [1]
  if (totalPages <= 1) return [1];

  const ranges = [];
  const rangeWithDots = [];
  let previousPage;

  // 1. Calculate the core ranges to display
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // First page
      i === totalPages || // Last page
      (i >= currentPage - delta && i <= currentPage + delta) // Immediate neighbors
    ) {
      ranges.push(i);
    }
  }

  // 2. Insert ellipses where gaps exist
  for (const pageNumber of ranges) {
    if (previousPage) {
      if (pageNumber - previousPage === 2) {
        // If the gap is exactly 1 page, just print that page instead of dots
        rangeWithDots.push(previousPage + 1);
      } else if (pageNumber - previousPage !== 1) {
        // If the gap is > 1 page, insert ellipses
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(pageNumber);
    previousPage = pageNumber;
  }

  return rangeWithDots;
};