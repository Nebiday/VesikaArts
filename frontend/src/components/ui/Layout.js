import styled from 'styled-components';

// Full-height page wrapper. $variant controls the background:
//  - 'light' (default): soft page gradient
//  - 'brand': brand purple gradient
const PageContainer = styled.div`
  min-height: 100vh;
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '2.5rem 2rem')};
  background: transparent;
  position: relative;
  z-index: 0;
`;

// Centered content wrapper with a configurable max width.
const ContentContainer = styled.div`
  max-width: ${({ theme, $maxWidth }) => $maxWidth || theme.layout.maxWidth};
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #d8ccff 50%, #9be7ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 10px 30px rgba(124, 92, 255, 0.35));

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.1rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.78);
  font-size: 1.2rem;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export { PageContainer, ContentContainer, PageTitle, Subtitle, SectionTitle };
