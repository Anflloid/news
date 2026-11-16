import '@testing-library/jest-dom';

// Приховуємо попередження React Router про версію 7
const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) return;
  originalWarn(...args);
};
