// src/square.jsx
export default function Square({ color, onClick }) {
    const style = {
        backgroundColor: color,
        width: "40px",
        height: "40px",
        borderRadius: 0,
        outline: "none",
    }

    return <button style={style} onClick={onClick} aria-label={`Square ${color}`} />
}
