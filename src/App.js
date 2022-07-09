import "./App.css";
import { useState, useEffect } from "react";

const StarsDisplay = (props) => {
  return (
    <>
      {utils.range(1, props.stars).map((starId) => (
        <div className="star" key={starId}></div>
      ))}
    </>
  );
};

const PlayNumber = (props) => {
  return (
    <button
      className="number"
      onClick={() => props.onNumberClick(props.numberId, props.status)}
      style={{ backgroundColor: colors[props.status] }}
    >
      {props.numberId}
    </button>
  );
};

const PlayAgain = (props) => {
  return (
    <div className="game-done">
      <div
        className="message"
        style={{
          color: props.gameStatus === "lost" ? "red" : "green",
        }}
      >
        {props.gameStatus === "lost" ? "Game Over" : "Niceee!"}
      </div>
      <button onClick={props.resetGame}>Play Again</button>
    </div>
  );
};

//custom hook
const useGameState = () => {
  const [stars, setStars] = useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    }
  });

  const setGameState = (newCandidateNums) => {
    if (utils.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums);
    } else {
      const newAvailableNums = availableNums.filter(
        (x) => !newCandidateNums.includes(x)
      );

      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
      setStars(utils.randomSumIn(newAvailableNums, 9));
    }
  };

  return { stars, availableNums, candidateNums, secondsLeft, setGameState };
};

const StarMatch = (props) => {
  const { stars, availableNums, candidateNums, secondsLeft, setGameState } =
    useGameState();

  const candidatesAreWrong = utils.sum(candidateNums) > stars;

  const gameStatus =
    availableNums.length === 0 ? "won" : secondsLeft === 0 ? "lost" : "active";

  const numberStatus = (number) => {
    if (!availableNums.includes(number)) return "used";

    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? "wrong" : "candidate";
    }

    return "available";
  };

  const onNumberClick = (number, currentStatus) => {
    if (gameStatus !== "active" || currentStatus === "used") return;

    const newCandidateNums =
      currentStatus === "available"
        ? candidateNums.concat(number)
        : candidateNums.filter((x) => x !== number);

    setGameState(newCandidateNums);
  };

  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {gameStatus !== "active" ? (
            <PlayAgain gameStatus={gameStatus} resetGame={props.resetGame} />
          ) : (
            <StarsDisplay stars={stars} />
          )}
        </div>
        <div className="right">
          {utils.range(1, 9).map((numberId) => (
            <PlayNumber
              key={numberId}
              numberId={numberId}
              status={numberStatus(numberId)}
              onNumberClick={onNumberClick}
            />
          ))}
        </div>
      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

// Color Theme
const colors = {
  available: "lightgray",
  used: "lightgreen",
  wrong: "lightcoral",
  candidate: "deepskyblue",
};

// Math science
const utils = {
  // Sum an array
  sum: (arr) => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};

const Game = () => {
  const [gameId, setGameId] = useState(1);

  return <StarMatch key={gameId} resetGame={() => setGameId(gameId + 1)} />;
};

function App() {
  return (
    <div className="App">
      <Game />
    </div>
  );
}

export default App;
