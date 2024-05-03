import './WinnerModal.css'

const WinnerModal = ({setWinner}) => {

    const handleClick = () => {
        // el _ es para indicar la ausencia de parametros
        window.location.reload();
    };

    return(
        <div className="modal">
            <p className="message">Congratulations, you have won!!</p>
            <p className="message">Would you like to play again?</p>
            <div className="options">
                <button onClick={() => handleClick()} class="btn">Yes</button>
                <button onClick={() => setWinner(false)} class="btn">No</button>
            </div>
        </div>
    )
}

export default WinnerModal;