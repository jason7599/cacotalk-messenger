import { useEffect, useState } from "react";
import { getAuthUser, type AuthUserResponse } from "../features/auth/authApi";

export default function App() {
	const [authUser, setAuthUser] = useState<AuthUserResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadAuthUser() {
			try {
				setAuthUser((await getAuthUser()));
			} finally {
				setLoading(false);
			}
		}

		loadAuthUser();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return authUser ? <div>{authUser.userId}</div> : <div>idiot</div>;
};