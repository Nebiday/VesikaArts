import { createGlobalStyle } from 'styled-components';

// Global reset + base styles. Single source of truth that replaces the
// previously duplicated App.css / index.css files.
const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${({ theme }) => theme.gradients.aurora};
    background-attachment: fixed;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Drifting aurora blobs behind everything */
  body::before {
    content: '';
    position: fixed;
    inset: -25%;
    z-index: -1;
    background:
      radial-gradient(440px 440px at 18% 28%, rgba(124, 92, 255, 0.38), transparent 60%),
      radial-gradient(400px 400px at 82% 18%, rgba(236, 72, 153, 0.32), transparent 60%),
      radial-gradient(480px 480px at 62% 82%, rgba(34, 211, 238, 0.28), transparent 60%);
    filter: blur(40px);
    animation: auroraFloat 20s ease-in-out infinite alternate;
    pointer-events: none;
  }

  @keyframes auroraFloat {
    0%   { transform: translate3d(0, 0, 0) scale(1); }
    50%  { transform: translate3d(2%, -3%, 0) scale(1.08); }
    100% { transform: translate3d(-2%, 2%, 0) scale(1.05); }
  }

  #root {
    min-height: 100vh;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono};
  }

  a {
    color: inherit;
  }

  button {
    font-family: inherit;
  }

  ::selection {
    background: rgba(139, 92, 246, 0.35);
    color: #fff;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(124, 92, 255, 0.55);
    border-radius: 999px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.04);
  }
`;

export default GlobalStyle;
