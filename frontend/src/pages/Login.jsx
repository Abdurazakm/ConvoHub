import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await login({
        username,
        password,
      });

      alert("Login successful");

      // Optional: save token to localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", username);

      navigate("/chat", { state: { username, token: res.token } });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        className="border p-2 m-2 rounded w-64 text-white"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 m-2 rounded w-64 text-white"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
        onClick={handleLogin}
      >
        Login
      </button>
      <p className="mt-2 text-sm">
        Don't have an account?{" "}
        <span
          className="text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate("/register")}
        >
          Register
        </span>
      </p>
    </div>
  );
}
