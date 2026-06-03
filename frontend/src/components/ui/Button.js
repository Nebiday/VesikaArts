import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const variants = {
  primary: css`
    background: ${({ theme }) => theme.gradients.brand};
    color: #fff;
  `,
  secondary: css`
    background: #fff;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};
  `,
  success: css`
    background: ${({ theme }) => theme.gradients.success};
    color: #fff;
  `,
  danger: css`
    background: ${({ theme }) => theme.gradients.danger};
    color: #fff;
  `,
  ghost: css`
    background: ${({ theme }) => theme.colors.muted};
    color: #fff;
  `,
};

// Reusable button built on framer-motion so callers can still pass
// whileHover / whileTap props for micro-interactions.
const Button = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${({ $size }) => ($size === 'sm' ? '0.5rem 1.1rem' : '0.85rem 1.7rem')};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  letter-spacing: 0.2px;
  position: relative;
  overflow: hidden;
  font-size: ${({ $size }) => ($size === 'sm' ? '0.9rem' : '1rem')};
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.3s ease, transform 0.3s ease, background 0.3s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $variant = 'primary' }) => variants[$variant] || variants.primary}

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Button;
