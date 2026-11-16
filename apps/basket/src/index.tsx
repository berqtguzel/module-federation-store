import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.createElement('div');
rootElement.id = 'root';
document.body.style.margin = '0';
document.body.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
document.body.style.background = '#f4f6f8';
document.body.appendChild(rootElement);

createRoot(rootElement).render(<App />);

