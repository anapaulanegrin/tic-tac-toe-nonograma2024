import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

import WinnerModal from './components/WinnerModal';
import { activeClue, activeClueInicial } from './store/activeClue';

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

  useEffect(() => {
    if (grid && rowsClues && colsClues) {
      checkWinner(rowsClues.length, colsClues.length);
    }
  }, [grid, rowsClues, colsClues]);

  const checkWinner = (row, col) => {
    const allActive = window.document.getElementsByClassName('active');
    const total = row + col;

    if (allActive.length === total) {
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
            // console.log('cuadrado en grilla: ', ',en la fila: ', i,'y columna: ', j);
            activeClueInicial(a, b, i, j)
          }
        });
      }
    }
    checkWinner(row.length, col.length)
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

      checkWinner(rowsClues.length, colsClues.length)
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
      {/* <div className="game-info">
        {statusText}
      </div> */}

      {/* <div className="game-mode">
        {modo}
      </div> */}

      {/* Boton   {` ${isPaintingMode ? 'selected' : ''}`}  onClick={ (e) => e.currentTarget(elem => elem.value)} value={active} */}
      <div className="buttons-container">
        <div className='slider'>
          <button className={`mode-boton ${isPaintingMode ? 'selected' : ''}`} onClick={togglePaintingMode}>
            {isPaintingMode ? '⬛' : 'X'}
          </button>
        </div>
        <button className='pist-button pista'>💡</button>
        <button className='pist-button todo'>🤞</button>
      </div>

      {!winner ? '' : <WinnerModal setWinner={setWinner} />}
    </div>
  );
}

export default Game;