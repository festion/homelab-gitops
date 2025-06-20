import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './generated.css';

import RouterRoot from './router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterRoot />
  </StrictMode>
);
