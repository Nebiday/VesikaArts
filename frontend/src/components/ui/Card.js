import styled from 'styled-components';
import { motion } from 'framer-motion';

// White surface card. Pass $hover for the lift-on-hover interaction and
// $glass for the translucent blurred variant used on gradient backgrounds.
const Card = styled(motion.div)`
  position: relative;
  background: ${({ $glass }) =>
    $glass ? 'rgba(255, 255, 255, 0.80)' : 'rgba(255, 255, 255, 0.94)'};
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: transform 0.35s ease, box-shadow 0.35s ease;

  ${({ $hover, theme }) =>
    $hover &&
    `
    &:hover {
      transform: translateY(-6px);
      box-shadow: ${theme.shadows.glow};
    }
  `}
`;

export default Card;
