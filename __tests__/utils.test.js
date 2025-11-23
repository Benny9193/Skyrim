/**
 * Unit tests for utility functions
 */

describe('Utility Functions', () => {
  describe('Number Formatting', () => {
    test('should format large numbers with commas', () => {
      const formatNumber = (num) => num.toLocaleString();

      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    test('should handle decimal numbers', () => {
      const formatDecimal = (num, decimals) => num.toFixed(decimals);

      expect(formatDecimal(3.14159, 2)).toBe('3.14');
      expect(formatDecimal(10, 2)).toBe('10.00');
    });
  });

  describe('String Utilities', () => {
    test('should capitalize first letter', () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    test('should convert to title case', () => {
      const titleCase = (str) =>
        str.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('the elder scrolls')).toBe('The Elder Scrolls');
    });

    test('should truncate long text', () => {
      const truncate = (str, maxLength) =>
        str.length > maxLength ? str.substring(0, maxLength) + '...' : str;

      expect(truncate('This is a long text', 10)).toBe('This is a ...');
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('Array Utilities', () => {
    test('should remove duplicates', () => {
      const unique = (arr) => [...new Set(arr)];

      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    test('should shuffle array', () => {
      const shuffle = (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('should chunk array', () => {
      const chunk = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    });
  });

  describe('Date Utilities', () => {
    test('should format date', () => {
      const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      };

      const testDate = new Date('2024-01-15');
      expect(formatDate(testDate)).toBe('January 15, 2024');
    });

    test('should calculate time ago', () => {
      const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
      };

      const now = new Date();
      const oneMinuteAgo = new Date(now - 60 * 1000);
      const oneHourAgo = new Date(now - 60 * 60 * 1000);

      expect(timeAgo(oneMinuteAgo)).toContain('1 minutes ago');
      expect(timeAgo(oneHourAgo)).toContain('1 hours ago');
    });
  });
});
