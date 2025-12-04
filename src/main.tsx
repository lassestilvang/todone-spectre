import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { TodoneDatabase } from './database/db';
import { SyncEngine } from './database/sync';

async function initializeApp() {
  try {
    const db = new TodoneDatabase();
    const syncEngine = new SyncEngine(db);

    await db.initialize();
    await syncEngine.initialize();

    console.log('Database and sync engine initialized');

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Fallback: render app without database
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

// Start the application
initializeApp();