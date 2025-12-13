import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api.js";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ now defined

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await register({
        username,
        password,
      });
      alert(res.message);

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
