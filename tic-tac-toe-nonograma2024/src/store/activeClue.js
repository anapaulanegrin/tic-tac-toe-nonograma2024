//Actualizar variable local
export function activeClue(a, b, i, j) {
    var row = document.getElementsByClassName("rowClues");
    var col = document.getElementsByClassName("colClues");

    if (a !== null) {
        a === 1
            ? row[0].children[i].classList.add('active')
            : row[0].children[i].classList.remove('active')

        if (b !== null) {
            b === 1
                ? col[0].children[j+1].classList.add('active')
                : col[0].children[j+1].classList.remove('active')
        }
    }

}
