import React, { useState, useEffect } from "react";
import "../index.css";

function App() {
  const [solution, setSolution] = useState("");

  useEffect(() => {
    const getWord = async () => {
      const word = await getRandomWord();
      setSolution(word);
    };
    getWord();
  }, []);

  return (
    <>
      <h1>Wordle </h1>
      <Line solution={solution} />
    </>
  );
}

export default App;

async function getRandomWord() {
  try {
    const response = await fetch("https://api.datamuse.com/words?sp=?????");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const words = data.map((obj) => obj.word);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    console.log(randomWord);
    return randomWord;
  } catch (error) {
    console.error("Error fetching word:", error);
    return "hello"; // Fallback word in case of an error
  }
}

function Line({ solution }) {
  const [tries, setTries] = useState(Array(6).fill("")); // holds the guesses for each line
  const [currentGuess, setCurrentGuess] = useState(""); // stores the current guess
  const [currentLine, setCurrentLine] = useState(0); // tracks the current line for input
  const [isGameOver, setIsGameOver] = useState(false); // tracks game state

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return; // don't allow typing if the game is over

      if (e.key === "Enter") {
        if (currentGuess.length === 5) {
          // update the guesses array when Enter is pressed
          setTries((prevTries) => {
            const newTries = [...prevTries];
            newTries[currentLine] = currentGuess; // update the current line with the guess
            return newTries;
          });

          // check if the guess is correct
          if (currentGuess === solution) {
            setIsGameOver(true); // set the game to over if the guess is correct
          } else {
            // move to the next line after Enter is pressed
            setCurrentLine((prev) => {
              if (prev + 1 < 6) {
                return prev + 1;
              } else {
                setIsGameOver(true);
                return prev;
              }
            }); // ensure we don't go over 6 tries
            if (currentLine < 5) {
              setCurrentGuess(""); // clear the current guess after submitting
            }
          }
        }
        return;
      }

      if (e.key === "Backspace") {
        // handle backspace here to avoid async state update issues
        setCurrentGuess((prevGuess) => prevGuess.slice(0, -1)); // handle backspace
        return;
      }

      if (e.key.length === 1 && currentGuess.length < 5) {
        // only append characters if it's a single key and currentGuess is less than 5 characters
        setCurrentGuess((prevGuess) => prevGuess + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentGuess, isGameOver, currentLine]);

  return (
    <>
      <ul>
        {tries.map((guess, i) => (
          <li className="line" key={i}>
            <Tile
              guess={i === currentLine ? currentGuess : guess}
              solution={solution}
              isSubmitted={i < currentLine || (i === currentLine && isGameOver)}
            />
            {/* Only the current line will show currentGuess */}
          </li>
        ))}
      </ul>
      {isGameOver && (
        <p>
          You {currentLine == 5 ? "lose" : "win"}, the word is : {solution}
        </p>
      )}
      {isGameOver && (
        <button onClick={() => window.location.reload()}>Play Again</button>
      )}
    </>
  );
}

function Tile({ guess, solution, isSubmitted }) {
  const wordLength = 5;

  return (
    <>
      {Array.from({ length: wordLength }).map((_, i) => {
        let className = "tile"; // Default style

        if (isSubmitted) {
          if (guess[i] === solution[i]) {
            className += " correct"; // Right letter in right place
          } else if (solution.includes(guess[i])) {
            className += " present"; // Right letter, wrong place
          } else {
            className += " absent"; // Wrong letter
          }
        }

        return (
          <div className={className} key={i}>
            {guess[i] || ""}
          </div>
        );
      })}
    </>
  );
}
