//Actualizar variable local

export function activeClue(a, b, i, j) {
    var row = document.getElementsByClassName("rowClues");
    var col = document.getElementsByClassName("colClues");


    // console.log('en la fila: ', i, 'este elem: ', row[0].children[i].classList, ' y en la col: ', j, 'este elem: ', col[0].children[j + 1].classList);
   

    if (a !== null) {
        if (a === 1) {
            row[0].children[i].classList.add('active')
            row[0].children[i].classList.remove('clue')
        } else {
            row[0].children[i].classList.remove('active')
            row[0].children[i].classList.add('clue')
        }
    }

    if (b !== null) {
        if (b === 1) {
            col[0].children[j + 1].classList.add('active')
            col[0].children[j + 1].classList.remove('clue')
        } else {
            col[0].children[j + 1].classList.remove('active')
            col[0].children[j + 1].classList.add('clue')
        }
    }


}


export function activeClueInicial(a, b, i, j) {
    var row = document.getElementsByClassName("rowClues");
    var col = document.getElementsByClassName("colClues");

    if (a !== b) {

        if (a !== null) {
            if (a === 1) {
                row[0].children[i].classList.add('active')
                row[0].children[i].classList.remove('clue')
            } else {
                row[0].children[i].classList.remove('active')
                row[0].children[i].classList.add('clue')
            }
        }

        if (b !== null) {
            if (b === 1) {
                col[0].children[j + 1].classList.add('active')
                col[0].children[j + 1].classList.remove('clue')
            } else {
                col[0].children[j + 1].classList.remove('active')
                col[0].children[j + 1].classList.add('clue')
            }
        }

    } else {
        if (a === 1 && b === 1) {
            row[0].children[i].classList.add('active')
            row[0].children[i].classList.remove('clue')
            col[0].children[j + 1].classList.add('active')
            col[0].children[j + 1].classList.remove('clue')
        }
    }
}