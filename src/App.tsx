import "./styles/global.css";
import { AuthProvider } from "./features/auth/AuthProvider";
import { KeyboardProvider } from "./features/keyboard/KeyboardProvider";
import { KeyboardShortcuts } from "./features/keyboard/KeyboardShortcuts";
import { KeyboardHelp } from "./features/keyboard/KeyboardHelp";
import { default as AppRouter } from "./router";

function App() {
  return (
      <AuthProvider>
        <KeyboardProvider>
          <KeyboardShortcuts>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <header className="bg-primary-500 text-white p-4 shadow-md">
                <h1 className="text-2xl font-bold">Todone</h1>
              </header>

              <main className="container mx-auto p-4">
                <AppRouter />
              </main>

              <footer className="text-center p-4 text-gray-500 dark:text-gray-400">
                <p>© {new Date().getFullYear()} Todone. All rights reserved.</p>
              </footer>
            </div>
            <KeyboardHelp />
          </KeyboardShortcuts>
        </KeyboardProvider>
      </AuthProvider>
  );
}

export { App };
export default App;
