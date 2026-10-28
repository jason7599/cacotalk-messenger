import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./index.css";
import { ModalProvider } from './components/ModalProvider.tsx';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ModalProvider>
			<App />
			{import.meta.env.DEV && (
				<div
					aria-hidden="true"
					className="pointer-events-none fixed inset-0 z-9999 grid select-none place-items-center overflow-hidden"
				>
					<span className="-rotate-30 text-[22vw] font-black tracking-loud text-warn opacity-[0.125]">
						DEV
					</span>
				</div>
			)}
		</ModalProvider>
	</StrictMode>
);
