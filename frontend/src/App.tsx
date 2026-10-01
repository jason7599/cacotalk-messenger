import { useEffect } from "react";
import { useAuthStore } from "./features/auth/authStore";
import LoadingScreen from "./components/LoadingScreen";
import AuthPage from "./pages/AuthPage";
import { BootstrapProvider } from "./shared/BootstrapProvider";
import MainPage from "./pages/MainPage";

export default function App() {
	const user = useAuthStore((s) => s.user);
	const loadingUser = useAuthStore((s) => s.loadingUser);
	const init = useAuthStore((s) => s.init);

	useEffect(() => {
		init();
	}, [init]);

	if (loadingUser) {
		return <LoadingScreen title="VERIFYING YOUR SOUL"/>;
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