import { useState } from "react";
import api from "../api/axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
    };

    return (
        <div>
            <h2>Login</h2>
            <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}