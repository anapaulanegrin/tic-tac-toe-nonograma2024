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
  const [modo,setModo]=useState("Modo cruz");

  const [ rowSat, setRowSat] = useState('')
  const [ colSat, setColSat] = useState('')

  const [ winner, setWinner] = useState(false)


  const togglePaintingMode = () => {
    setIsPaintingMode(prevState => !prevState);
    if(modo==="Modo cruz") {setModo("Modo pintar"); setElemento('#');}
    if(modo==="Modo pintar"){ setModo("Modo cruz"); setElemento('X');}
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
    else if ( a.length === 9) {
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
      }
      //agregar chequeo inicial de ganar o no
    });
  }

  function handleClick(i, j) {
    // No action on click if we are waiting.
    if (waiting) {
      return;
    }

    // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_'); // Remove quotes for variables. squares = [["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]]
  
    
    
    
    const rowsCluesS = JSON.stringify(rowsClues);
    const colsCluesS = JSON.stringify(colsClues);
    const queryS = `put("${elemento}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`; // queryS = put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    setWaiting(true);
    handleWinner();

    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['ResGrid']);
        // eslint-disable-next-line
        const a = response['RowSat']
        setRowSat(a)
        const b = response['ColSat']
        setColSat(b)
        // setRowSat(response['RowSat'])
        // console.log(rowSat);
      }
      setWaiting(false);
    });
    
    console.log("fila: "+rowSat);
    console.log("col: "+colSat);
    
    var row = document.getElementsByClassName("rowClues");
    var col = document.getElementsByClassName("colClues");

    if (rowSat === null) {
      throw new Error('The state rowSat is null, this is impossible')
    } else if (rowSat === 1) row[0].children[i].classList.add('active');
    else row[0].children[i].classList.remove('active');

    if (colSat === null) {
      throw new Error('The state colSat is null, this is impossible')
    } else if (colSat === 1) col[0].children[j+1].classList.add('active');
    else col[0].children[j+1].classList.remove('active');
 
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

      { !winner ? '' : <WinnerModal/> }
    </div>
  );
}

export default Game;