import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';


let pengine;

function Game() {

  // State
  const [grid, setGrid] = useState(null);
  const [rowsClues, setRowsClues] = useState(null);
  const [colsClues, setColsClues] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [isPaintingMode, setIsPaintingMode] = useState(false);
  const [elemento,setElemento]=useState('X');
  const [modo,setModo]=useState("Modo cruz");


  const togglePaintingMode = () => {
    setIsPaintingMode(prevState => !prevState);
    if(modo==="Modo cruz") setModo("Modo pintar");
    if(modo==="Modo pintar") setModo("Modo cruz");
  };

  const cambiarElementoX = () => {
    setElemento('X');
  }

  const cambiarElemento_ = () => {
    setElemento('_');
  }

  const cambiarElementoPintado = () => {
    setElemento('#');
  }

  useEffect(() => {
    // Creation of the pengine server instance.    
    // This is executed just once, after the first render.    
    // The callback will run when the server is ready, and it stores the pengine instance in the pengine variable. 
    PengineClient.init(handleServerReady);
  }, []);

  function handleServerReady(instance) {
    pengine = instance;
    const queryS = 'init(RowClues, ColumClues, Grid)';
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
      }
    });
  }

  function handleClick(i, j) {
    // No action on click if we are waiting.
    if (waiting) {
      return;
    }
    // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_'); // Remove quotes for variables. squares = [["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]]
    if(grid[i][j]==='X') setElemento('X');
    if(grid[i][j]==='#') setElemento('#');
    if(grid[i][j]==='_') setElemento('_');
    
    if(isPaintingMode){
      if(elemento=== 'X' || elemento==='_'){
        cambiarElementoPintado();
      }
      else{
        cambiarElemento_();
      }
    }
    else{
      if(elemento=== '#' || elemento=== '_'){
        cambiarElementoX();
      }
      else{
        cambiarElemento_();
      }
    }
    const rowsCluesS = JSON.stringify(rowsClues);
    const colsCluesS = JSON.stringify(colsClues);
    const queryS = `put("${elemento}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`; // queryS = put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    setWaiting(true);
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['ResGrid']);
      }
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
          {isPaintingMode ? 'Activar modo cruz' : 'Activar modo Pintar'}
        </button>
      </div>
    </div>
  );
}

export default Game;