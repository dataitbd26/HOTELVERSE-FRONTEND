// src/utils/paginationUtils.js

/**
 * Generates a range of page numbers with dots (...) for sliding window pagination
 * @param {number} currentPage - The current active page
 * @param {number} totalPages - Total number of pages available
 * @returns {Array} - e.g., [1, '...', 4, 5, 6, '...', 10]
 */
export const getPaginationRange = (currentPage, totalPages) => {
  const delta = 2; // Number of pages to show on each side of current page
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    // Always include first page, last page, and pages within delta of current
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};