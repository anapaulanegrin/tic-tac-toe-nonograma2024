import React, { useEffect, useState, version } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

import WinnerModal from './components/WinnerModal';
import { activeClue } from './store/activeClue';

let pengine;

function Game() {

  // State
  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState(null);
  const [colsClues, setColsClues] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [isPaintingMode, setIsPaintingMode] = useState(false);
  const [elemento, setElemento] = useState('X');
  const [modo, setModo] = useState("Cross mode");
  const [winner, setWinner] = useState(false);


  const togglePaintingMode = () => {
    setIsPaintingMode(prevState => !prevState);
    if (modo === "Cross mode") { setModo("Paint mode"); setElemento('#'); }
    if (modo === "Paint mode") { setModo("Cross mode"); setElemento('X'); }
  };

  useEffect(() => {
    // Creation of the pengine server instance.    
    // This is executed just once, after the first render.    
    // The callback will run when the server is ready, and it stores the pengine instance in the pengine variable. 
    PengineClient.init(handleServerReady);
  }, []);

  // useEffect(() => {
  //   if (rowsClues && colsClues) {
  //     checkWinner();
  //   }
  // }, [rowsClues, colsClues]);

  const checkWinner = () => {
    const allActive = document.getElementsByClassName('clue active');
    const allClue = document.getElementsByClassName('clue');
    console.log(allClue);
    if (allActive.length === allClue.length) {
      // ACA se podria forzar q se pinte todo
      console.log('Este es todos los elementos activos ' ,allActive);
      console.log('Este es todos los elementos ' ,allActive);
      setWinner(true);
    }
  };


  function handleServerReady(instance) {
    pengine = instance;
    const queryS = 'init(RowClues, ColumClues, Grid)';
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
        InicialCheck(response['RowClues'], response['ColumClues'], response['Grid'])
      }
    });
  }

  function InicialCheck(row, col, grid) {
    for (let i = 0; i < col.length; i++) {
      for (let j = 0; j < row.length; j++) {
        const squaresS = JSON.stringify(grid).replaceAll('"_"', '_');
        const rowsCluesS = JSON.stringify(row);
        const colsCluesS = JSON.stringify(col);
        const queryS = `put(${grid[i][j]}, [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`;

        pengine.query(queryS, (success, response) => {
          if (success) {
            setGrid(response['ResGrid']);
            const a = response['RowSat'];
            const b = response['ColSat'];
            activeClue(a, b, i, j)
          }
        });
      }
    }
    checkWinner()
  }

  function handleClick(i, j) {
    // No action on click if we are waiting.
    if (waiting) {
      return;
    }

    // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_');
    const rowsCluesS = JSON.stringify(rowsClues);
    const colsCluesS = JSON.stringify(colsClues);
    const queryS = `put("${elemento}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`;
    setWaiting(true);

    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['ResGrid']);
        const a = response['RowSat'];
        const b = response['ColSat'];
        activeClue(a, b, i, j)
      }
      checkWinner()
      setWaiting(false);
    });
  }

  if (!grid) {
    return null;
  }

  const statusText = 'Keep playing!';



  return (
    <div className="game">
      <Board
        grid={grid}
        rowsClues={rowsClues}
        colsClues={colsClues}
        onClick={(i, j) => handleClick(i, j)}

      />
      <div className="game-info">
        {statusText}
      </div>

      <div className="game-mode">
        {modo}
      </div>

      {/* Boton */}
      <div className="button-container">
        <button className={`painting-mode ${isPaintingMode ? 'selected' : ''}`} onClick={togglePaintingMode}>
          {isPaintingMode ? 'Activate cross mode' : 'Activate Paint mode'}
        </button>
      </div>

      {!winner ? '' : <WinnerModal setWinner={setWinner} />}
    </div>
  );
}

export default Game;