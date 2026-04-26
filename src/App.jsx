import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import englishWords from "an-array-of-english-words";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const THEMES = [
  {
    day: "Sunday",
    name: "Purple",
    bg: "from-violet-500 via-purple-400 to-fuchsia-300",
    glow: "bg-violet-400",
    button: "bg-violet-700 hover:bg-violet-600",
  },
  {
    day: "Monday",
    name: "Red",
    bg: "from-rose-400 via-red-300 to-pink-200",
    glow: "bg-rose-400",
    button: "bg-rose-700 hover:bg-rose-600",
  },
  {
    day: "Tuesday",
    name: "Orange",
    bg: "from-orange-400 via-amber-300 to-yellow-200",
    glow: "bg-orange-400",
    button: "bg-orange-700 hover:bg-orange-600",
  },
  {
    day: "Wednesday",
    name: "Yellow",
    bg: "from-yellow-300 via-amber-200 to-orange-100",
    glow: "bg-yellow-300",
    button: "bg-yellow-600 hover:bg-yellow-500",
  },
  {
    day: "Thursday",
    name: "Green",
    bg: "from-emerald-400 via-green-300 to-lime-200",
    glow: "bg-emerald-400",
    button: "bg-emerald-700 hover:bg-emerald-600",
  },
  {
    day: "Friday",
    name: "Blue",
    bg: "from-sky-400 via-blue-300 to-cyan-200",
    glow: "bg-sky-400",
    button: "bg-sky-700 hover:bg-sky-600",
  },
  {
    day: "Saturday",
    name: "Indigo",
    bg: "from-indigo-500 via-blue-400 to-violet-300",
    glow: "bg-indigo-400",
    button: "bg-indigo-700 hover:bg-indigo-600",
  },
];

function buildWordList() {
  return Array.from(
    new Set(
      englishWords
        .map((word) => word.toLowerCase().trim())
        .filter((word) => /^[a-z]{5}$/.test(word))
    )
  );
}

function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

function checkGuess(guess, answer) {
  const result = Array(WORD_LENGTH).fill("absent");
  const answerLetters = answer.split("");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
      answerLetters[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;

    const foundIndex = answerLetters.indexOf(guess[i]);
    if (foundIndex !== -1) {
      result[i] = "present";
      answerLetters[foundIndex] = null;
    }
  }

  return result;
}

function Tile({ letter, status, delay = 0 }) {
  const classes = {
    empty: "bg-white/70 border-white/60 text-slate-900",
    typing: "bg-white border-slate-500 text-slate-900 scale-105",
    correct: "bg-emerald-500 border-emerald-500 text-white",
    present: "bg-amber-400 border-amber-400 text-white",
    absent: "bg-slate-500 border-slate-500 text-white",
  };

  const shouldFlip = status === "correct" || status === "present" || status === "absent";

  return (
    <motion.div
      initial={{ rotateX: shouldFlip ? -90 : 0, scale: letter && status === "typing" ? 1.06 : 1 }}
      animate={{ rotateX: 0, scale: 1 }}
      transition={{ delay, duration: 0.35 }}
      className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-black uppercase shadow-md transition ${classes[status]}`}
    >
      {letter}
    </motion.div>
  );
}

function Keyboard({ onKey, keyStatus }) {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

  function getKeyClass(key) {
    if (keyStatus[key] === "correct") return "bg-emerald-500 text-white";
    if (keyStatus[key] === "present") return "bg-amber-400 text-white";
    if (keyStatus[key] === "absent") return "bg-slate-500 text-white";
    return "bg-white/70 hover:bg-white text-slate-900";
  }

  return (
    <div className="mt-5 space-y-2 w-full max-w-xl">
      {rows.map((row, rowIndex) => (
        <div key={row} className="flex justify-center gap-1 sm:gap-1.5">
          {rowIndex === 2 && (
            <button
              onClick={() => onKey("Enter")}
              className="px-3 sm:px-4 rounded-xl bg-slate-950 text-white text-xs sm:text-sm font-black shadow-md"
            >
              ENTER
            </button>
          )}

          {row.split("").map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className={`h-10 sm:h-12 min-w-7 sm:min-w-10 px-1 sm:px-2 rounded-xl font-black uppercase shadow-md transition ${getKeyClass(key)}`}
            >
              {key}
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              onClick={() => onKey("Backspace")}
              className="px-3 sm:px-4 rounded-xl bg-slate-950 text-white text-xs sm:text-sm font-black shadow-md"
            >
              DEL
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WordleMobileReadyGame() {
  const inputRef = useRef(null);
  const words = useMemo(() => buildWordList(), []);
  const theme = THEMES[new Date().getDay()];

  const [answer, setAnswer] = useState(() => getRandomWord(words));
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("Tap anywhere and guess the word");
  const [gameOver, setGameOver] = useState(false);

  const keyStatus = useMemo(() => {
    const priority = { correct: 3, present: 2, absent: 1 };
    const map = {};

    guesses.forEach((guess) => {
      const result = checkGuess(guess, answer);
      guess.split("").forEach((letter, index) => {
        const status = result[index];
        if (!map[letter] || priority[status] > priority[map[letter]]) {
          map[letter] = status;
        }
      });
    });

    return map;
  }, [guesses, answer]);

  function focusMobileInput() {
    inputRef.current?.focus();
  }

  function newGame() {
    const newAnswer = getRandomWord(words);
    setAnswer(newAnswer);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setMessage("New game started");
    setTimeout(focusMobileInput, 50);
  }

  function submitGuess() {
    if (gameOver) return;

    if (currentGuess.length !== WORD_LENGTH) {
      setMessage("Please enter 5 letters");
      return;
    }

    if (!words.includes(currentGuess)) {
      setMessage("Not in word list");
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess("");

    if (currentGuess === answer) {
      setMessage("Correct! You win!");
      setGameOver(true);
      return;
    }

    if (nextGuesses.length === MAX_GUESSES) {
      setMessage(`Game over. Answer: ${answer.toUpperCase()}`);
      setGameOver(true);
      return;
    }

    setMessage("Keep trying");
  }

  function handleKey(key) {
    if (key === "Enter") {
      submitGuess();
      return;
    }

    if (key === "Backspace") {
      if (!gameOver) setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (gameOver) return;

    if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => (prev + key.toLowerCase()).slice(0, WORD_LENGTH));
    }
  }

  function handleMobileInput(event) {
    if (gameOver) return;

    const value = event.target.value
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, WORD_LENGTH);

    setCurrentGuess(value);
  }

  function handleMobileKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitGuess();
    }
  }

  useEffect(() => {
    function listener(event) {
      handleKey(event.key);
    }

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });

  const board = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      const guess = guesses[rowIndex];
      const result = checkGuess(guess, answer);
      return guess.split("").map((letter, index) => ({ letter, status: result[index] }));
    }

    if (rowIndex === guesses.length) {
      return Array.from({ length: WORD_LENGTH }, (_, index) => ({
        letter: currentGuess[index] || "",
        status: currentGuess[index] ? "typing" : "empty",
      }));
    }

    return Array.from({ length: WORD_LENGTH }, () => ({ letter: "", status: "empty" }));
  });

  return (
    <main
      onClick={focusMobileInput}
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${theme.bg} flex items-center justify-center p-3 sm:p-4`}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        value={currentGuess}
        onChange={handleMobileInput}
        onKeyDown={handleMobileKeyDown}
        className="absolute left-0 top-0 h-px w-px opacity-0 pointer-events-none"
      />

      <div className={`absolute -top-24 -left-24 h-72 w-72 ${theme.glow} rounded-full blur-3xl opacity-40`} />
      <div className={`absolute top-1/3 -right-24 h-80 w-80 ${theme.glow} rounded-full blur-3xl opacity-30`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.35),transparent_35%)]" />

      <section className="relative w-full max-w-2xl rounded-[2rem] bg-white/50 backdrop-blur-2xl border border-white/60 shadow-2xl p-4 sm:p-8 flex flex-col items-center">
        <header className="w-full flex items-start justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <div className="inline-flex rounded-full bg-white/65 px-3 py-1 text-xs sm:text-sm font-black text-slate-700 shadow-sm mb-2">
              {theme.day} · {theme.name}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
              Wordle Rainbow
            </h1>
            <p className="text-slate-700 mt-1 text-sm sm:text-base font-medium">
              Mobile-ready 5-letter word game
            </p>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              newGame();
            }}
            className={`rounded-2xl px-3 sm:px-4 py-2 text-white text-sm sm:text-base font-black shadow-lg transition ${theme.button}`}
          >
            New Game
          </button>
        </header>

        <div className="mb-4 sm:mb-5 min-h-10 rounded-full bg-white/65 px-5 py-2 text-center text-slate-800 font-bold shadow-sm">
          {message}
        </div>

        <div className="grid gap-2 sm:gap-3">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2 sm:gap-3">
              {row.map((tile, tileIndex) => (
                <Tile
                  key={tileIndex}
                  letter={tile.letter}
                  status={tile.status}
                  delay={rowIndex < guesses.length ? tileIndex * 0.08 : 0}
                />
              ))}
            </div>
          ))}
        </div>

        <Keyboard onKey={handleKey} keyStatus={keyStatus} />
      </section>
    </main>
  );
}
