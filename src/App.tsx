import { useCallback, useState } from "react";
import {
  ApiError,
  clearAuthToken,
  getNextRound,
  setAuthToken,
  startSession,
} from "./api/client";
import type {
  AuthResponse,
  GameSessionResponse,
  RoundResponse,
} from "./api/types";
import AuthForm from "./components/AuthForm";
import Instructions from "./components/Instructions";
import Leaderboard from "./components/Leaderboard";
import TrialPlayer from "./components/TrialPlayer";

const USERNAME_STORAGE_KEY = "ideophone-arena-username";
const ROLE_STORAGE_KEY = "ideophone-arena-role";

type AuthState = {
  username: string;
  role?: string;
};

type AppView = "auth" | "instructions" | "game";

function readStoredAuth(): AuthState | null {
  const username = localStorage.getItem(USERNAME_STORAGE_KEY);
  if (!username) {
    return null;
  }

  return {
    username,
    role: localStorage.getItem(ROLE_STORAGE_KEY) ?? undefined,
  };
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => readStoredAuth());
  const [view, setView] = useState<AppView>(() =>
    readStoredAuth() ? "instructions" : "auth",
  );
  const [session, setSession] = useState<GameSessionResponse | null>(null);
  const [round, setRound] = useState<RoundResponse | null>(null);
  const [isLoadingRound, setIsLoadingRound] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [sessionComplete, setSessionComplete] = useState(false);
  const [scoreRefreshKey, setScoreRefreshKey] = useState(0);

  function handleAuthenticated(response: AuthResponse) {
    setAuthToken(response.token);
    localStorage.setItem(USERNAME_STORAGE_KEY, response.username ?? "player");
    if (response.role) {
      localStorage.setItem(ROLE_STORAGE_KEY, response.role);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
    setAuth({ username: response.username ?? "player", role: response.role });
    setView("instructions");
    setError("");
  }

  const handleLogout = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setAuth(null);
    setView("auth");
    setSession(null);
    setRound(null);
    setError("");
    setSessionComplete(false);
  }, []);

  const handleAuthExpired = useCallback(
    (message: string) => {
      handleLogout();
      setError(message || "Please log in again.");
    },
    [handleLogout],
  );

  const loadNextRound = useCallback(
    async (sessionUuid: string) => {
      setIsLoadingRound(true);
      setError("");

      try {
        const nextRound = await getNextRound(sessionUuid);
        setRound(nextRound);
        setSessionComplete(false);
      } catch (caught) {
        if (caught instanceof ApiError && [401, 403].includes(caught.status)) {
          handleAuthExpired(caught.message);
          return;
        }

        if (
          caught instanceof ApiError &&
          caught.status === 404 &&
          /complete/i.test(caught.message)
        ) {
          setRound(null);
          setSessionComplete(true);
          return;
        }

        setError(caught instanceof Error ? caught.message : "Round failed to load");
      } finally {
        setIsLoadingRound(false);
      }
    },
    [handleAuthExpired],
  );

  async function handleStart() {
    setIsStarting(true);
    setError("");
    setSessionComplete(false);

    try {
      const createdSession = await startSession();
      setSession(createdSession);
      setView("game");
      await loadNextRound(createdSession.sessionUuid);
    } catch (caught) {
      if (caught instanceof ApiError && [401, 403].includes(caught.status)) {
        handleAuthExpired(caught.message);
        return;
      }

      setError(caught instanceof Error ? caught.message : "Game failed to start");
    } finally {
      setIsStarting(false);
    }
  }

  function handleAnswered() {
    setScoreRefreshKey((key) => key + 1);
  }

  function renderMain() {
    if (!auth || view === "auth") {
      return <AuthForm onAuthenticated={handleAuthenticated} />;
    }

    if (view === "instructions") {
      return (
        <Instructions
          error={error}
          isStarting={isStarting}
          onStart={handleStart}
        />
      );
    }

    if (sessionComplete) {
      return (
        <section className="complete-panel">
          <h1>Session complete</h1>
          <p>You have answered every playable round in this session.</p>
          <button className="primary-button" type="button" onClick={handleStart}>
            Start New Session
          </button>
        </section>
      );
    }

    if (isLoadingRound && !round) {
      return <p className="status-text">Loading next round...</p>;
    }

    if (session && round) {
      return (
        <TrialPlayer
          key={round.roundId}
          round={round}
          sessionUuid={session.sessionUuid}
          onAnswered={handleAnswered}
          onAuthExpired={handleAuthExpired}
          onNeedNextRound={() => void loadNextRound(session.sessionUuid)}
        />
      );
    }

    return (
      <section className="complete-panel">
        <h1>Ready</h1>
        <p>Start a session to fetch the first round.</p>
        {error ? <p className="error-text centered">{error}</p> : null}
        <button className="primary-button" type="button" onClick={handleStart}>
          Start Game
        </button>
      </section>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <button
          className="site-title"
          type="button"
          onClick={() => setView(auth ? "instructions" : "auth")}
        >
          Ideophone Arena
        </button>

        {auth ? (
          <div className="user-controls">
            <span>{auth.username}</span>
            <button className="secondary-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </header>

      <main className="site-main">
        {error && (!auth || view === "auth") ? (
          <p className="error-text centered">{error}</p>
        ) : null}
        {renderMain()}
        <Leaderboard
          isAuthenticated={Boolean(auth)}
          refreshKey={scoreRefreshKey}
          onAuthExpired={handleAuthExpired}
        />
      </main>
    </div>
  );
}
