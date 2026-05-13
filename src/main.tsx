import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
