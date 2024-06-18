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

  const [gridAuxiliar, setGridAuxiliar] = useState(null);
  const [helpMode, setHelpMode] = useState(false)

  const [openHelp, setOpenHelp] = useState(false)

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
      inicialGridWinner(rowsClues, colsClues);
    }
  }, [grid, rowsClues, colsClues]);

  // useEffect( () => {
  //   inicialGridWinner(rowsClues, colsClues);
  // }, [grid])

  const checkClue = () => {
    // Entra en estado de busqueda?
    setHelpMode(prevState => !prevState)
    console.log(helpMode);
  }

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
    // let rowsCluesS = null;
    // let colsCluesS = null;
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
        InicialCheck(response['RowClues'], response['ColumClues'], response['Grid']);
        // rowsCluesS = response['ColumClues'];
        // colsCluesS = response['ColumClues'];
        setGridAuxiliar(response['Grid']);
        // inicialGridWinner(response['RowClues'], response['ColumClues'])
      }
    });
    // const rowSol = JSON.stringify(rowsCluesS)
    // const colSol = JSON.stringify(colsCluesS)
    // const queryGridWin = `grillaGanadora(${rowSol},${colSol},Grilla)`;
    // pengine.query(queryGridWin, (success, response) => {
    //   if (success) {
    //     // console.log(response['Grilla']);
    //     // console.log(grid);
    //     setGridAuxiliar(response['Grilla']);
    //   }
    // });
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

    if (helpMode) {
      // console.log('esta es la grilla vista',grid[i][j]);
      // console.log('esta es la grilla nueva',gridAuxiliar[i][j]);
      grid[i][j] = gridAuxiliar[i][j]
      setHelpMode(prevState => !prevState)
      // console.log(helpMode);

    } else {

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
  }

  if (!grid) {
    return null;
  }

  const inicialGridWinner = (row, col) => {
    const rowsCluesS = JSON.stringify(row);
    const colsCluesS = JSON.stringify(col);
    const queryGridWin = `grillaGanadora(${rowsCluesS},${colsCluesS},Grilla)`;
    pengine.query(queryGridWin, (success, response) => {
      if (success) {
        // console.log(response['Grilla']);
        // console.log(grid);
        setGridAuxiliar(response['Grilla']);
      }
    });
  }

  const checkHelp = () => {
    // inicialGridWinner(rowsClues, colsClues);
    // Cambia el estado para ver la ayuda
    setOpenHelp(prevState => !prevState)
    // Setea un delay y saca la ayuda
    setTimeout(() => {
      setOpenHelp(prevState => !prevState)
    }, 2500);
  }


  return (
    <div className="game">

      <Board
        grid={grid}
        rowsClues={rowsClues}
        colsClues={colsClues}
        onClick={(i, j) => handleClick(i, j)}
      // className={openHelp ? 'invi' : ''}
      />
      {
        openHelp ? (
          <div className='container-help'>
            <Board
              grid={gridAuxiliar} // gridAuxiliar
              rowsClues={null}
              colsClues={null}
              onClick={(i, j) => handleClick(i, j)}
              className='grid-auxiliar'
            />
            {/* <button className='pist-button cross'>X</button> */}
          </div>
        )
          : ''
      }

      <div className="buttons-container">
        <div className='slider'>
          <button className={`mode-boton ${isPaintingMode ? 'selected' : ''}`} onClick={togglePaintingMode}>
            {isPaintingMode ? '⬛' : 'X'}
          </button>
        </div>
        <button onClick={checkClue} className='pist-button pista'>💡</button>
        <button onClick={checkHelp} className='pist-button todo'> ✅ </button>
      </div>

      {!winner ? '' : <WinnerModal setWinner={setWinner} />}

    </div>
  );
}

export default Game;

