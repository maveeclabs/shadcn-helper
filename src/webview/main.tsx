import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import mainCss from './styles/main.css';

const style = document.createElement('style');
style.textContent = mainCss;
document.head.appendChild(style);

const root = createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
