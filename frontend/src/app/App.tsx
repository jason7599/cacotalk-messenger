import AuthPage from "../pages/AuthPage";
import LoadingScreen from "../components/LoadingScreen";
import MainPage from "../pages/MainPage";
import { useAuth } from "../features/auth/AuthProvider";
import { BootstrapProvider } from "./BootstrapProvider";

export default function App() {
	const { user, loadingUser } = useAuth();

	if (loadingUser) {
		return <LoadingScreen title="VERIFYING YOUR SOUL"/>;
	}

	if (!user) {
		return <AuthPage />
	}

	return (
		<BootstrapProvider>
			<MainPage />
		</BootstrapProvider>
	)
};