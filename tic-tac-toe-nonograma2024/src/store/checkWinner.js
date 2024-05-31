export function checkWinner({setWinner}) {
    const allActive = document.getElementsByClassName('clue active');
    const allClue = document.getElementsByClassName('clue');
    if (allActive.length === allClue.length) {
        setWinner(true);
    }
};