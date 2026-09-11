import {
  createGlobalTheme,
  createGlobalThemeContract,
} from '@vanilla-extract/css';

export const colors = createGlobalThemeContract({
  paper: 'color-paper',
  ink: 'color-ink',
  accent: 'color-accent',
  tint: 'color-tint',
  line: 'color-line',
  muted: 'color-muted',
});
createGlobalTheme(':root', colors, {
  paper: '#F7F3E8',
  ink: '#292923',
  accent: '#A6382E',
  tint: '#F3E5DC',
  line: '#C9BDA5',
  muted: '#686354',
});
export const serif = 'var(--font-serif), serif';
