import styled from 'styled-components';

const statusGradients = {
  approved: 'success',
  deployed: 'success',
  success: 'success',
  pending: 'warning',
  warning: 'warning',
  rejected: 'danger',
  danger: 'danger',
};

// Pill-shaped status badge. Color is derived from the $status prop.
const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: ${({ theme, $status }) =>
    theme.gradients[statusGradients[$status]] || `linear-gradient(135deg, ${theme.colors.muted}, #495057)`};
`;

export default StatusBadge;
