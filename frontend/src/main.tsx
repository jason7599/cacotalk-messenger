import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./index.css";
import App from './app/App.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>,
);
