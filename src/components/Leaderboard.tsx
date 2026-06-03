import { useEffect, useState } from "react";
import { ApiError, getLeaderboard, getMyAttempts } from "../api/client";
import type { AttemptResponse, LeaderboardEntry } from "../api/types";

type LeaderboardProps = {
  isAuthenticated: boolean;
  refreshKey: number;
  onAuthExpired: (message: string) => void;
};

export default function Leaderboard({
  isAuthenticated,
  refreshKey,
  onAuthExpired,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadScores() {
      setError("");

      try {
        const entries = await getLeaderboard();
        if (isMounted) {
          setLeaderboard(entries);
        }

        if (isAuthenticated) {
          const recentAttempts = await getMyAttempts();
          if (isMounted) {
            setAttempts(recentAttempts);
          }
        } else if (isMounted) {
          setAttempts([]);
        }
      } catch (caught) {
        if (caught instanceof ApiError && [401, 403].includes(caught.status)) {
          onAuthExpired(caught.message);
          return;
        }

        if (isMounted) {
          setError(caught instanceof Error ? caught.message : "Scores failed");
        }
      }
    }

    void loadScores();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, onAuthExpired, refreshKey]);

  return (
    <section className="score-section" aria-labelledby="leaderboard-title">
      <div className="score-column">
        <h2 id="leaderboard-title">Leaderboard</h2>
        {leaderboard.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Correct</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.username}>
                  <td>{entry.username}</td>
                  <td>
                    {entry.totalCorrect} / {entry.totalAnswered}
                  </td>
                  <td>{Math.round(entry.accuracy * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No scores yet.</p>
        )}
      </div>

      {isAuthenticated ? (
        <div className="score-column">
          <h2>Recent Attempts</h2>
          {attempts.length > 0 ? (
            <ul className="attempt-list">
              {attempts.slice(0, 5).map((attempt, index) => (
                <li key={`${attempt.answeredAt ?? "attempt"}-${index}`}>
                  <span>{attempt.correct ? "Correct" : "Incorrect"}</span>
                  <strong>{attempt.prompt}</strong>
                  <span>
                    {attempt.selectedKana}
                    {attempt.correctKana ? ` / ${attempt.correctKana}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No attempts yet.</p>
          )}
        </div>
      ) : null}

      {error ? <p className="error-text centered">{error}</p> : null}
    </section>
  );
}
