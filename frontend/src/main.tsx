import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./index.css";
import App from './app/App.tsx';
import { ModalProvider } from './components/ModalProvider.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ModalProvider>
			<App />
		</ModalProvider>
	</StrictMode>
);
