import styled, { css } from 'styled-components';

const fieldStyles = css`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  ${fieldStyles}
`;

const TextArea = styled.textarea`
  ${fieldStyles}
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  ${fieldStyles}
  background: #fff;
  cursor: pointer;
`;

export { InputGroup, Label, Input, TextArea, Select };
