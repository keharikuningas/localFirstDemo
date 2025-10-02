// src/board.jsx
import Square from "./square"
import { useColors } from "./useColors"
import { toggleSquare } from "./sync"

export default function Board() {
    const colors = useColors()

    const boardStyle = {
        display: "inline-grid",
        gridTemplateColumns: "repeat(8, 40px)",
        gridTemplateRows: "repeat(8, 40px)",
        border: "2px solid black",
    }

    return (
        <div style={boardStyle}>
        {colors.map((color, i) => (
            <Square
            key={i}
            color={color}
            onClick={() => toggleSquare(i)}
            />
        ))}
        </div>
    )
}
