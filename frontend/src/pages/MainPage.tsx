import { useAuth } from "../features/auth/AuthProvider"

export default function MainPage() {
    const { user } = useAuth();
    return <h1>hi {user?.userId}</h1>
}
