import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/index.css';
import '../v5-light-page.css';
import V5LightReferenceApp from '../__components__/V5LightReferenceApp.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <V5LightReferenceApp />
  </React.StrictMode>,
);
