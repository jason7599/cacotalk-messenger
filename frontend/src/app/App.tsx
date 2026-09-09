import AuthPage from "../pages/AuthPage";
import LoadingScreen from "../components/LoadingScreen";
import MainPage from "../pages/MainPage";
import { useAuth } from "../features/auth/AuthProvider";

export default function App() {
	const { user, loadingUser } = useAuth();

	if (loadingUser) {
		return <LoadingScreen title="VERIFYING YOUR SOUL"/>;
	}

	return user 
		? <MainPage />
		: <AuthPage />
	;
};