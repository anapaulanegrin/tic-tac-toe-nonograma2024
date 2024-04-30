:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY is the result of replacing the occurrence of X in position XIndex of Xs by Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Content, +Pos, +RowsClues, +ColsClues, +Grid, -NewGrid, -RowSat, -ColSat).
%

put(Content, [RowN, ColN], RowsClues, ColsClues, Grid, NewGrid, RowSat, ColSat):-
	% NewGrid is the result of replacing the row Row in position RowN of Grid by a new row NewRow (not yet instantiated).
	replace(Row, RowN, NewRow, Grid, NewGrid),


	% NewRow is the result of replacing the cell Cell in position ColN of Row by _,
	% if Cell matches Content (Cell is instantiated in the call to replace/5).	
	% Otherwise (;)
	% NewRow is the result of replacing the cell in position ColN of Row by Content (no matter its content: _Cell).			
	(replace(Cell, ColN, _, Row, NewRow),
	Cell == Content
		;
	replace(_Cell, ColN, Content, Row, NewRow)),

	verificarPistaLinea(RowN,RowClues,NewGrid,RowSat),
	crearLineaColumna(ColN,NewGrid,Linea),
	verificarPistaLinea(ColN,ColClues,NewGrid,ColSat).


crearLineaColumna(ColN,NewGrid,Linea):-
	Contador is 0,
	proper_length(NewGrid,Longitud),
	agregarElemento(Contador,NewGrid,ColN,Longitud,[],Linea)
	

.


agregarElemento(Contador,NewGrid,ColN,Longitud,ListaAux,Lista):-
	Contador<Longitud-1,
	nth0(Contador,NewGrid,Fila),
	nth0(ColN,Fila,Elemento),
	insertarAlFinal(Elemento,ListaAux,ListaNueva),
	NuevoContador is Contador +1,
	agregarElemento(NuevoContador,NewGrid,ColN,Longitud,ListaNueva,Lista);
	Contador is Longitud-1,
	nth0(Contador,NewGrid,Fila),
	nth0(ColN,Fila,Elemento),
	insertarAlFinal(Elemento,ListaAux,Lista)
.

verificarPistaLinea(RowN,RowClues,NewGrid,RowSat):-
	nth0(RowN,NewGrid,Fila),
	recorrerFila(Fila,[],Lista,0),
	nth0(RowN,RowClues,PistaFila),
	satisfaceFila(RowSat,Lista,PistaFila).
	
satisfaceFila(RowSat,Lista,PistaFila):-
	Lista=PistaFila, RowSat=1; 
	Lista\=PistaFila, RowSat=0.

recorrerFila(['#'|[]],ListaAux,Lista,Contador):-
    NuevoContador is Contador+1,
	insertarAlFinal(NuevoContador,ListaAux,Lista).

recorrerFila(['X'|[]],ListaAux,Lista,Contador):-
    Contador>0,
	insertarAlFinal(Contador,ListaAux,Lista).

recorrerFila(['_'|[]],ListaAux,Lista,Contador):-
    Contador>0,
	insertarAlFinal(Contador,ListaAux,Lista).

recorrerFila(['X'|Xs],ListaAux,Lista, Contador):-
	Contador>0,
	insertarAlFinal(Contador,ListaAux,ListaNueva),
	recorrerFila(Xs,ListaNueva,Lista,0).

recorrerFila(['_'|Xs],ListaAux,Lista,Contador):-
	Contador>0,
	insertarAlFinal(Contador,ListaAux,ListaNueva),
	recorrerFila(Xs,ListaNueva,Lista,0).

recorrerFila(['#'|Xs],ListaAux,Lista,Contador):-
	NuevoContador is Contador+1,
	recorrerFila(Xs,ListaAux,Lista,NuevoContador).

insertarAlFinal(E,[],[E]).
insertarAlFinal(E,[X|L1],[X|L2]):-insertarAlFinal(E,L1,L2).	





