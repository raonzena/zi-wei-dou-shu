import { style } from '@vanilla-extract/css';
import { colors } from '../../styles/theme.css';

export const container = style({
  minHeight: '7.5rem',
  margin: '2rem 0 1.5rem',
  paddingTop: '.75rem',
  borderTop: `1px solid ${colors.line}`,
  overflow: 'hidden',
});

export const label = style({
  display: 'block',
  marginBottom: '.5rem',
  color: colors.muted,
  fontSize: '.75rem',
  lineHeight: 1.5,
  textAlign: 'center',
});
