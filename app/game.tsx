"use client";

import { useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function emptyBoard(): Cell[] {
  return Array.from({ length: 9 }, () => null);
}

function winnerOf(board: Cell[]) {
  for (const line of LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { player: mark, line };
    }
  }
  return null;
}

function Mark({ player }: { player: Player }) {
  if (player === "X") {
    return (
      <svg className="mark mark-x" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M26 26 L74 74 M74 26 L26 74" />
      </svg>
    );
  }

  return (
    <svg className="mark mark-o" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="24" />
    </svg>
  );
}

export default function Game() {
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [turn, setTurn] = useState<Player>("X");
  const [xStarts, setXStarts] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const win = winnerOf(board);
  const draw = !win && board.every((cell) => cell !== null);
  const over = Boolean(win) || draw;
  const fresh = board.every((cell) => cell === null);

  const headline = win ? `${win.player} wins` : draw ? "It's a draw" : `${turn}'s turn`;
  const detail = win
    ? "Three in a row. That match is settled."
    : draw
      ? "Every square is taken, and nobody has a line."
      : fresh
        ? `${turn} places the first mark.`
        : "Take an open square.";

  function play(index: number) {
    if (board[index] || over) return;

    const next = board.slice();
    next[index] = turn;
    const nextWin = winnerOf(next);
    const nextDraw = !nextWin && next.every((cell) => cell !== null);

    setBoard(next);

    if (nextWin) {
      const player = nextWin.player;
      setScores((current) => ({ ...current, [player]: current[player] + 1 }));
      return;
    }

    if (nextDraw) {
      setScores((current) => ({ ...current, draws: current.draws + 1 }));
      return;
    }

    setTurn(turn === "X" ? "O" : "X");
  }

  function newGame() {
    const nextXStarts = !xStarts;
    setXStarts(nextXStarts);
    setTurn(nextXStarts ? "X" : "O");
    setBoard(emptyBoard());
  }

  return (
    <main className="table">
      <header className="mast">
        <p className="kicker">Two players, one board</p>
        <h1>Square Off</h1>
        <p className="lede">Chalk a line of three before the other one does.</p>
      </header>

      <section className="scores" aria-label="Scoreboard">
        <article
          className={`score score-x${win?.player === "X" ? " is-winner" : ""}${!over && turn === "X" ? " is-active" : ""}`}
          aria-label={`X has ${scores.X} ${scores.X === 1 ? "win" : "wins"}`}
        >
          <span className="score-mark" aria-hidden="true">
            X
          </span>
          <span className="score-value">{scores.X}</span>
          <span className="score-label">wins</span>
        </article>
        <article
          className={`score score-draw${draw ? " is-winner" : ""}`}
          aria-label={`${scores.draws} ${scores.draws === 1 ? "draw" : "draws"}`}
        >
          <span className="score-mark" aria-hidden="true">
            =
          </span>
          <span className="score-value">{scores.draws}</span>
          <span className="score-label">draws</span>
        </article>
        <article
          className={`score score-o${win?.player === "O" ? " is-winner" : ""}${!over && turn === "O" ? " is-active" : ""}`}
          aria-label={`O has ${scores.O} ${scores.O === 1 ? "win" : "wins"}`}
        >
          <span className="score-mark" aria-hidden="true">
            O
          </span>
          <span className="score-value">{scores.O}</span>
          <span className="score-label">wins</span>
        </article>
      </section>

      <p
        className={`status is-${win ? win.player.toLowerCase() : draw ? "draw" : turn.toLowerCase()}`}
        role="status"
        aria-live="polite"
      >
        {headline}
      </p>
      <p className="detail">{detail}</p>

      <div className="board" role="group" aria-label="Tic tac toe board">
        {board.map((cell, index) => {
          const row = Math.floor(index / 3) + 1;
          const column = (index % 3) + 1;
          const winning = win?.line.includes(index) ?? false;
          const label = cell
            ? `Row ${row}, column ${column}, ${cell}${winning ? ", winning square" : ""}`
            : `Row ${row}, column ${column}, empty`;

          return (
            <button
              key={index}
              type="button"
              className={`cell${winning ? ` win win-${win?.player.toLowerCase()}` : ""}`}
              onClick={() => play(index)}
              disabled={Boolean(cell) || over}
              aria-label={label}
            >
              {cell ? <Mark player={cell} /> : null}
            </button>
          );
        })}
      </div>

      <button type="button" className="new-game" onClick={newGame}>
        New Game
      </button>
    </main>
  );
}
