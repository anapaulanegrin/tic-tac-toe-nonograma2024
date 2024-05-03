import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

import WinnerModal from './components/WinnerModal';

let pengine;

function Game() {

  // State
  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState(null);
  const [colsClues, setColsClues] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [isPaintingMode, setIsPaintingMode] = useState(false);
  const [elemento,setElemento]=useState('X');
  const [modo,setModo]=useState("Cross mode");

  const [winner, setWinner] = useState(false)
  const [total, setTotal] = useState('')


  const togglePaintingMode = () => {
    setIsPaintingMode(prevState => !prevState);
    if(modo==="Cross mode") {setModo("Paint mode"); setElemento('#');}
    if(modo==="Paint mode"){ setModo("Cross mode"); setElemento('X');}
  };

  

  useEffect(() => {
    // Creation of the pengine server instance.    
    // This is executed just once, after the first render.    
    // The callback will run when the server is ready, and it stores the pengine instance in the pengine variable. 
    PengineClient.init(handleServerReady);
  }, []);

  const handleWinner = () => {
    let a = document.getElementsByClassName('clue active')
    if ( winner === null ) throw new Error('Winner is null, state is broken')
    else if ( a.length === total) {
      setWinner(true)
    } 
  }

  function handleServerReady(instance) {
    pengine = instance;
    const queryS = 'init(RowClues, ColumClues, Grid)';
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
        setTotal(response['RowClues'].length + response['ColumClues'].length)
        InicialCheck(response['RowClues'],response['ColumClues'],response['Grid'])
      }
    }); 
  }

  function InicialCheck(row,col,grid){
    for(let i = 0; i < col.length; i++){
      for(let j = 0; j < row.length; j++){
          const squaresS = JSON.stringify(grid).replaceAll('"_"', '_');
          const rowsCluesS = JSON.stringify(row);
          const colsCluesS = JSON.stringify(col);
          const queryS = `put(${grid[i][j]}, [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`;
        
          pengine.query(queryS, (success, response) => {
            if (success) {
              setGrid(response['ResGrid']);
              const a = response['RowSat'];
              const b = response['ColSat'];
        
              var row = document.getElementsByClassName("rowClues");
              var col = document.getElementsByClassName("colClues");
        
              if (a === null) {
                throw new Error('The state rowSat is null, this is impossible');
              } else if (a === 1) row[0].children[i].classList.add('active');
              else row[0].children[i].classList.remove('active');
        
              if (b === null) {
                throw new Error('The state colSat is null, this is impossible');
              } else if (b === 1) col[0].children[j + 1].classList.add('active');
              else col[0].children[j + 1].classList.remove('active');
            }
          });
      }
    }
    console.log(total);
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
  
        var row = document.getElementsByClassName("rowClues");
        var col = document.getElementsByClassName("colClues");
  
        if (a === null) {
          throw new Error('The state rowSat is null, this is impossible');
        } else if (a === 1) row[0].children[i].classList.add('active');
        else row[0].children[i].classList.remove('active');
  
        if (b === null) {
          throw new Error('The state colSat is null, this is impossible');
        } else if (b === 1) col[0].children[j + 1].classList.add('active');
        else col[0].children[j + 1].classList.remove('active');
      }
      handleWinner();
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

      { !winner ? '' : <WinnerModal setWinner={setWinner} /> }
    </div>
  );
}

export default Game;