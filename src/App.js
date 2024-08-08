import { useState } from "react";

function Square({ value, onSquareClick, winningSquares, boardLocation  }) {
  if (winningSquares.length !== 0 && winningSquares.includes(boardLocation)) {
    return (
      <button className="win-square" onClick={onSquareClick}>
        {value}
      </button>
    );
  } else {
    return (
      <button className="square" onClick={onSquareClick}>
        {value}
      </button>
    );
  }
}

function Board({ xIsNext, squares, onPlay, winningSquares, chunkedSquares}) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        winningSquares = lines[i];
        return squares[a];
      }
    }
    return null;
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every((square) => square !== null)) {
    status = "Draw";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {chunkedSquares.map((chunk, outerIndex) => (
        <div key={outerIndex} className="board-row">
          {chunk.map((square, innerIndex) => {
            return (
              <Square
                key={innerIndex}
                value={square}
                onSquareClick={() =>
                  handleClick(chunk.length * outerIndex + innerIndex)
                }
                winningSquares={winningSquares}
                boardLocation={chunk.length * outerIndex + innerIndex}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [toggle, setToggle] = useState(true);
  const [winningSquares] = useState([]);
  const [moveCoords, setMoveCoords] = useState({row: 0, col: 0});
  const [moveCoordsHistory, setMoveCoordsHistory] = useState(Array(9).fill());
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const sortMovesButton = "Sort";

  const chunkedSquares = [];
  for (let i = 0; i < currentSquares.length; i += 3) {
    chunkedSquares.push(currentSquares.slice(i, i + 3));
  }

  function handlePlay(nextSquares) {
    const chunkedNextSquares = [];
    for (let i = 0; i < nextSquares.length; i += 3) {
      chunkedNextSquares.push(nextSquares.slice(i, i + 3));
    }

    let col = 0;
    for (let i = 0; i < 3; i++) {
      if (!areArraysEqual(chunkedSquares[i], chunkedNextSquares[i])) {
        chunkedSquares[i].find((square, index) => {
          if (square !== chunkedNextSquares[i][index]) {
            col = chunkedNextSquares[i].indexOf(chunkedNextSquares[i][index]);
          }
        });
        setMoveCoordsHistory([...moveCoordsHistory.slice(0, currentMove + 1), {row: i, col: col}]);
        setMoveCoords({row: i, col: col});
      }
    }
    
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function areArraysEqual(a, b) {
    if (typeof a === "object" && typeof b === "object") {
      return a.length === b.length && a.every((val, index) => val === b[index]);
    }
    return false;
  }

  function sortMoves(moves) {
    return moves.sort((a, b) => {
      if (toggle) {
        return a.key - b.key;
      } else {
        return b.key - a.key;
      }
    });
  }

  const moves = history.map((squares, move) => {
    if (areArraysEqual(squares, currentSquares)) {
      return <li key={move}>{"You are at move #" + move + " (" + moveCoords.row + "," + moveCoords.col + ")"}</li>;
    }
    let description;
    const text = "Go to move #" + move;
    if (move > 0) {
      description = moveCoordsHistory[move] === undefined ? text :  text + " (" + moveCoordsHistory[move].row  + "," + moveCoordsHistory[move].col + ")";
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningSquares={winningSquares}
          chunkedSquares={chunkedSquares}
        />
      </div>
      <div className="game-info">
        <button onClick={() => setToggle(!toggle)}>{sortMovesButton}</button>
        <ol>{sortMoves(moves)}</ol>
      </div>
    </div>
  );
}
