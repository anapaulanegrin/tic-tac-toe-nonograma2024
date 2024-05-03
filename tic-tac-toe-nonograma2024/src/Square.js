import React from 'react';

function Square({ value, onClick }) {
    const className = value === '#' ? 'paintedCell' : ''; // Clase condicional basada en el valor de 'elemento'
    return (
        <button className={`square ${className}`} onClick={onClick}>
            {value !== '_' ? value : ' '}
        </button>
    );
}
    
export default Square;
