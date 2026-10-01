import { useEffect } from "react";
import { useAuthStore } from "./features/auth/authStore";
import LoadingScreen from "./components/LoadingScreen";
import AuthPage from "./pages/AuthPage";
import { BootstrapProvider } from "./shared/BootstrapProvider";
import MainPage from "./pages/MainPage";
import ErrorScreen from "./components/ErrorScreen";

export default function App() {
	const user = useAuthStore((s) => s.user);
	const loadingUser = useAuthStore((s) => s.loadingUser);
	const init = useAuthStore((s) => s.init);
	const error = useAuthStore((s) => s.error);

	useEffect(() => {
		init();
	}, [init]);

	if (loadingUser) {
		return <LoadingScreen title="VERIFYING YOUR SOUL"/>;
	}

	if (error) {
		return (
			<ErrorScreen
				eyebrow="AUTHENTICATION // LINK SEVERED"
				title="THE UNDERWORLD IS DOWN"
				message={error}
				onRetry={init}
			/>
		);
	}

	if (!user) {
		return <AuthPage />;
	}

	return (
		<BootstrapProvider>
			<MainPage />
		</BootstrapProvider>
	);
};