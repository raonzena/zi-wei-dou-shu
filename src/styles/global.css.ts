import { globalStyle } from '@vanilla-extract/css';

globalStyle('*, *::before, *::after', { boxSizing: 'border-box' });
globalStyle('body', {
  margin: 0,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  lineHeight: 1.6,
  color: '#202020',
  backgroundColor: '#faf9f6',
});
