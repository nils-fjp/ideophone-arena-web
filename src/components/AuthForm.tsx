import { useState } from "react";
import type { FormEvent } from "react";
import { login, register } from "../api/client";
import type { AuthResponse } from "../api/types";

type AuthMode = "login" | "register";

type AuthFormProps = {
  onAuthenticated: (response: AuthResponse) => void;
};

export default function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response =
        mode === "login"
          ? await login({ username, password })
          : await register({ username, email, password });

      onAuthenticated(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === "login" ? "tab-button active" : "tab-button"}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "tab-button active" : "tab-button"}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <h1 id="auth-title">Ideophone Arena</h1>
      <p className="muted">
        Choose the Japanese ideophone that best matches the target meaning.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            autoComplete="username"
            minLength={3}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        {mode === "register" ? (
          <label>
            Email
            <input
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        ) : null}

        <label>
          Password
          <input
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={8}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Working..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
    </section>
  );
}
