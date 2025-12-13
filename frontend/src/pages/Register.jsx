import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ now defined

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/register`, {
        username,
        password,
      });
      alert(res.data.message);

      navigate("/"); // ✅ go to Login
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

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
        className="bg-green-500 px-4 py-2 rounded mt-2 hover:bg-green-600"
        onClick={handleRegister}
      >
        Register
      </button>

      <p className="mt-2 text-sm">
        Already have an account?{" "}
        <span
          className="text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate("/")}   
        >
          Login
        </span>
      </p>
    </div>
  );
}
