import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./index.css";
import App from './app/App.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';
import { ModalProvider } from './components/ModalProvider.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider>
		<ModalProvider>
			<App />
		</ModalProvider>
		</AuthProvider>
	</StrictMode>,
);
