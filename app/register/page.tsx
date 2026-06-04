"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const { error } = await signUp(
      email,
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Register Success");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-[400px] border border-zinc-800 p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6">
          Register
        </h1>

        <input
          className="w-full bg-zinc-900 p-3 mb-3 rounded"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full bg-zinc-900 p-3 mb-3 rounded"
          placeholder="Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 p-3 rounded"
        >
          Register
        </button>
      </div>
    </main>
  );
}