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


	nth0(RowN,NewGrid,Fila),
	verificarPistaLinea(RowN,RowsClues,Fila,RowSat),


	crearLineaColumna(ColN,NewGrid,Columna),
	verificarPistaLinea(ColN,ColsClues,Columna,ColSat).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

crearLineaColumna(ColN,NewGrid,Linea):-
	Contador is 0,
	proper_length(NewGrid,Longitud),
	agregarElemento(Contador,NewGrid,ColN,Longitud,[],Linea).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

agregarElemento(Contador,NewGrid,ColN,Longitud,ListaAux,Lista):-
	Contador<Longitud-1,
	nth0(Contador,NewGrid,Fila),
	nth0(ColN,Fila,Elemento),
	insertarAlFinal(Elemento,ListaAux,ListaNueva),
	NuevoContador is Contador +1,
	agregarElemento(NuevoContador,NewGrid,ColN,Longitud,ListaNueva,Lista).

agregarElemento(Contador,NewGrid,ColN,Longitud,ListaAux,Lista):-
	Contador is Longitud-1,
	nth0(Contador,NewGrid,Fila),
	nth0(ColN,Fila,Elemento),
	insertarAlFinal(Elemento,ListaAux,Lista).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
verificarPistaLinea(LineN,LineClues,Linea,LineSat):-
	recorrerFila(Linea,[],Lista,0),
	nth0(LineN,LineClues,PistaFila),
	satisfaceFila(LineSat,Lista,PistaFila).
	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
satisfaceFila(LineSat,Lista,PistaFila):-
	Lista==PistaFila, LineSat=1; 
	Lista\==PistaFila, LineSat=0.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Casos base de predicado recorrerFila
recorrerFila([X],ListaAux,Lista,Contador):-
	X=="#",
    NuevoContador is Contador+1,
	insertarAlFinal(NuevoContador,ListaAux,Lista).

recorrerFila([X],ListaAux,Lista,Contador):-
	X=="X",
    Contador>0,
	insertarAlFinal(Contador,ListaAux,Lista).
recorrerFila([_],ListaAux,Lista,Contador):-
    Contador>0,
	insertarAlFinal(Contador,ListaAux,Lista).

recorrerFila([_], ListaAux, Lista, Contador):-
	Contador is 0,
    Lista=ListaAux.

% Casos recursivos de predicado recorrerFila
recorrerFila([X|Xs],ListaAux,Lista,Contador):-
	X=="#",
	NuevoContador is Contador+1,
	recorrerFila(Xs,ListaAux,Lista,NuevoContador).

recorrerFila([X|Xs],ListaAux,Lista, Contador):-
	X=="X",
	Contador>0,
	insertarAlFinal(Contador,ListaAux,ListaNueva),
	recorrerFila(Xs,ListaNueva,Lista,0).

recorrerFila([X|Xs],ListaAux,Lista,Contador):-
	X=="X",
	Contador is 0,
	recorrerFila(Xs,ListaAux,Lista,Contador).

recorrerFila([_|Xs],ListaAux,Lista,Contador):-
	Contador>0,
	insertarAlFinal(Contador,ListaAux,ListaNueva),
	recorrerFila(Xs,ListaNueva,Lista,0).

recorrerFila([_|Xs],ListaAux,Lista,Contador):-
	Contador is 0,
	recorrerFila(Xs,ListaAux,Lista,Contador).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Caso base de predicado insertarAlFinal
insertarAlFinal(E,[],[E]).
% Caso recursivo de predicado insertarAlFinal
insertarAlFinal(E,[X|L1],[X|L2]):-insertarAlFinal(E,L1,L2).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% grillaGanadora es el predicado que se va a llamar desde React
grillaGanadora(RowsClues,ColsClues,GrillaRetorno):-
	proper_length(ColsClues,CantColumnas),
    proper_length(RowsClues,CantFilas),

	armarListaCombinaciones(RowsClues,CantColumnas,[], ListaCombinaciones),
    
	armarListaCeros(CantColumnas,0,[],ListaVerificacion),
	% ListaVerificacion tiene 0 en las posiciones que la ColClue no se cumple y 1 en las que si
	armarListaCeros(CantFilas,0,[],ListaIndices),
	 
	probarGrilla(ListaCombinaciones,ListaIndices,ListaVerificacion,ColsClues,GrillaRetorno).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% ListaCombinaciones es una lista que contiene Listas cuyos elementos son las posibles filas
% que cumplen con la RowClue que le corresponde.
% ListaIndices es una lista que contiene los indices a partir de los cuales se seleccionan las 
% filas desde la lista de combinaciones, inicialmente van a ser todos ceros.
% GrillaRetorno es la Grilla que se unifica al final del predicado.

probarGrilla(ListaCombinaciones,ListaIndices,ListaVerificacion,ColsClues,GrillaRetorno):-
	armarGrilla(ListaCombinaciones,ListaIndices,[],Grilla),

    proper_length(ColsClues,CantColumnas),
	verificarGrilla(Grilla,0,CantColumnas,ListaVerificacion,ColsClues,GrillaSat),

	chequearGrillaSatisfecha(ListaCombinaciones,ListaIndices,ListaVerificacion,ColsClues,Grilla,GrillaRetorno,GrillaSat).
	% a partir de aca es donde tengo que chequear si grillaSat es==1 unificar grilla con grilla retorno
	% si grillaSat es 0 tengo que actualizar los indices y hacer llamado recursivo



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Predicado chequearGrillaSatisfecha: toma la grilla y evalua si es correcta o hay que seguir considerando mas opciones
% Este predicado solo es una parte del predicado probarGrilla.
chequearGrillaSatisfecha(ListaCombinaciones,ListaIndices,ListaVerificacion,ColsClues,Grilla,GrillaRetorno,GrillaSat):-
	% Caso: La grilla es la correcta
    GrillaSat==1,
	GrillaRetorno=Grilla;

	% Caso: La grilla no es correcta
    % Hace llamado recursivo con los índices actualizados
	GrillaSat==0,
	proper_length(ListaIndices,CantIndices),
	Pos is CantIndices-1, % Pos va a ir al ultimo elemento de la lista de indices
	actualizarIndices(ListaIndices,ListaCombinaciones,Pos,ListaIndicesAct),
    
	probarGrilla(ListaCombinaciones,ListaIndicesAct,ListaVerificacion,ColsClues,GrillaRetorno).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Predicado actualizarIndices: agarra la lista de indices original y aumenta el valor de un índice, según corresponda
% Actualiza siempre el índice indicado por Pos y si no es posible hace un llamado recursivo para que se actualice el anterior a Pos

% Caso base: puedo aumentar el índice Pos
actualizarIndices(ListaIndices,ListaCombinaciones,Pos,ListaIndicesAct):-
	nth0(Pos,ListaIndices,Indice), 
	nth0(Pos,ListaCombinaciones,Combinacion), % Combinacion es una lista con todas las posibles filas que cumplen la pista que le corresponde
	proper_length(Combinacion,CantCombinacionesFila),
	
	(Indice+1)<CantCombinacionesFila,
	NuevoIndice is Indice+1,
	replace(_,Pos,NuevoIndice,ListaIndices,ListaIndicesAct).

% Caso recursivo: no puedo aumentar el índice de Pos
actualizarIndices(ListaIndices,ListaCombinaciones,Pos,ListaIndicesAct):-
	nth0(Pos,ListaIndices,Indice), 
	nth0(Pos,ListaCombinaciones,Combinacion), % Combinacion es una lista con todas las posibles filas que cumplen la pista que le corresponde
	proper_length(Combinacion,CantCombinacionesFila),

	CantCombinacionesFila is Indice+1,
	replace(_,Pos,0,ListaIndices,ListaIndicesNueva),
	NuevaPos is Pos-1,
	actualizarIndices(ListaIndicesNueva,ListaCombinaciones,NuevaPos,ListaIndicesAct).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Predicado armarGrilla: arma una grilla según la lista de combinaciones y la lista de índices pasadas por parámetro

% Caso base
armarGrilla([],[],GrillaRetorno,GrillaRetorno).
	% Se unifica Grilla con GrillaRetorno

% Caso recursivo
% X|Xs es la lista de combinaciones
% Y|Ys es la lista de indices
armarGrilla([X|Xs],[Y|Ys],Grilla,GrillaRetorno):-
	nth0(Y,X,Fila),
	insertarAlFinal(Fila,Grilla,GrillaNueva),
	armarGrilla(Xs,Ys,GrillaNueva,GrillaRetorno).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Predicado verificarGrilla: dada una grilla la recorre y devuelve un 1 en GrillaSat si 
% todas las columnas tienen sus pistas satisfechas y un 0 en caso contrario.

% Caso base: Ya recorri todas las columnas y guarde el resultado de la verififacion en ListaVerificacion
verificarGrilla(Grilla,NumColumna,CantColumnas,ListaVerificacion,_,GrillaSat):-
	NumColumna==CantColumnas,
	verificarColumnas(ListaVerificacion,GrillaSat).

% Caso recursivo: Quedan columnas por recorrer
% En NumColumna va a venir un 0 inicialmente
verificarGrilla(Grilla,NumColumna,CantColumnas,ListaVerificacion,ColsClues,GrillaSat):-
	NumColumna<CantColumnas,
	crearLineaColumna(NumColumna,Grilla,Columna),
	verificarPistaLinea(NumColumna,ColsClues,Columna,ColSat),
	replace(_,NumColumna,ColSat,ListaVerificacion,ListaVerificacionAct),
	NuevoNumColumna is NumColumna+1,
	verificarGrilla(Grilla,NuevoNumColumna,CantColumnas,ListaVerificacionAct,ColsClues,GrillaSat).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

verificarColumnas([X|Xs], GrillaSat):-
	X==1,
	verificarColumnas(Xs,GrillaSat).


verificarColumnas([X|_],GrillaSat):-
	X==0,
	GrillaSat=0.


verificarColumnas([],GrillaSat):-
	GrillaSat=1.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

armarListaCombinaciones([],_,ListaAux,Lista):-
	Lista=ListaAux.

% Esto tiene que completar Lista con todas las opciones de armar fila
armarListaCombinaciones([X|Xs], CantColumnas, ListaAux, Lista):-
	armarFila(X,0,CantColumnas,[],[],Fila),
	insertarAlFinal(Fila,ListaAux,ListaNueva),
	armarListaCombinaciones(Xs,CantColumnas, ListaNueva, Lista).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% armarListaVerificacion va a armar una lista con elementos 0 y cantidad de elementos=cantidad de columnas

armarListaCeros(CantColumnas,CantColumnas,ListaAux,ListaVerificacion):-
	ListaVerificacion=ListaAux.

armarListaCeros(CantColumnas,Contador,ListaAux, ListaVerificacion):-
	Contador<CantColumnas,
	insertarAlFinal(0,ListaAux,ListaNueva),
	NuevoContador is Contador+1,
	armarListaCeros(CantColumnas,NuevoContador,ListaNueva,ListaVerificacion).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Testeado
% Caso base de agregarVacios
agregarVacios(0, _, Lista, Lista).

% Caso recursivo de agregarVacios
agregarVacios(Cant, LongFila, ListaAux, Lista) :-
    Cant > 0,
    proper_length(ListaAux, LongListaAux),
    LongListaAux < LongFila,
    insertarAlFinal("_", ListaAux, ListaNueva),
    CantActualizada is Cant - 1,
    agregarVacios(CantActualizada, LongFila, ListaNueva, Lista).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Testeado
% Caso base: todos los numerales agregados y lista completa
agregarNumerales(CantNumerales, CantNumerales, LongFila, FilaAux, FilaAux) :-
    proper_length(FilaAux, LongFilaActual),
    LongFilaActual == LongFila.

% Caso base: todos los numerales agregados pero lista no completa
agregarNumerales(CantNumerales, CantNumerales, LongFila, FilaAux, FilaRetorno) :-
    proper_length(FilaAux, LongFilaActual),
    LongFilaActual < LongFila,
    agregarVacios(1, LongFila, FilaAux, FilaRetorno).

% Caso recursivo: se pueden agregar más numerales
agregarNumerales(CantNumerales, Contador, LongFila, FilaAux, FilaRetorno) :-
    Contador < CantNumerales,
    proper_length(FilaAux, LongFilaActual),
    LongFilaActual < LongFila,
    insertarAlFinal("#", FilaAux, FilaNueva),
    NuevoContador is Contador + 1,
    agregarNumerales(CantNumerales, NuevoContador, LongFila, FilaNueva, FilaRetorno).

% Caso: no hay espacio suficiente para más numerales
agregarNumerales(CantNumerales, Contador, LongFila, FilaAux, []) :-
    Contador < CantNumerales,
    proper_length(FilaAux, LongFilaActual),
    LongFilaActual == LongFila.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Caso base: Sin más pistas, llena con vacíos hasta alcanzar la longitud de la fila
armarFila([], _, LongFila, FilaAux, ListaAux, Lista) :-
    proper_length(FilaAux, LongFilaAux),
    VaciosFaltantes is LongFila - LongFilaAux,
    agregarVacios(VaciosFaltantes, LongFila, FilaAux, Fila),
    insertarAlFinal(Fila, ListaAux, Lista).

% Caso recursivo: Procesa cada pista y genera combinaciones
armarFila([X|Xs], Pos, LongFila, FilaAux, ListaAux, Lista) :-
    Pos < LongFila,
    agregarVacios(Pos, LongFila, FilaAux, FilaAux1),
    agregarNumerales(X, 0, LongFila, FilaAux1, FilaAux2),
    FilaAux2 \= [],
    armarFila(Xs, 0, LongFila, FilaAux2, [], ListaRecursiva),
    append(ListaAux, ListaRecursiva, ListaIntermedia),
    NuevaPos is Pos + 1,
    armarFila([X|Xs], NuevaPos, LongFila, FilaAux, ListaIntermedia, Lista).

% Caso recursivo: Manejo de posiciones igual a LongFila
armarFila([X|Xs], LongFila, LongFila, FilaAux, ListaAux, Lista) :-
    Lista=ListaAux.

% Manejo del caso donde FilaAux2 está vacía
armarFila([X|_], Pos, LongFila, FilaAux, ListaAux, Lista) :-
    Pos < LongFila,
    agregarVacios(Pos, LongFila, FilaAux, FilaAux1),
    agregarNumerales(X, 0, LongFila, FilaAux1, []),
    Lista = ListaAux.
