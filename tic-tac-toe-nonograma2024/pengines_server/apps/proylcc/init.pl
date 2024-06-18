:- module(init, [ init/3 ]).

/**
 * init(-RowsClues, -ColsClues, Grid).
 * Predicate specifying the initial grid, which will be shown at the beginning of the game,
 * including the rows and columns clues.
 */

init(
[[1], [1,1], [1], [2,1], [1,1,1]],	% RowsClues

[[2], [1, 1], [1,1], [1, 1], [1,1]], 	% ColsClues

[["#", _ , _ , _ , _ ], 		
 [ _ ,"#", _ , _ , _ ],
 [ _ , _ ,"#", _ , _ ],		% Grid
 [ _ , _ , _ ,"#", _ ],
 [ _ , _ , _ , _ ,"#"]
]
).