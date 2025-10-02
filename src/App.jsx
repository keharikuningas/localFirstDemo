// src/App.jsx
import { useState, useEffect } from 'react'
import ColorPicker from './colorPicker'
import { colors as yColors, toggleSquare, setSquareColor } from './sync'

export default function App() {
  const [selectedColor, setSelectedColor] = useState(null) // null = toggle mode
  const [cells, setCells] = useState([])

  // ---- Sync local state with Yjs ----
  useEffect(() => {
    function update() {
      setCells(yColors.toArray())
    }
    update()
    yColors.observe(update)
    return () => yColors.unobserve(update)
  }, [])

  // ---- Handle clicks ----
  function handleSquareClick(index) {
    if (selectedColor) {
      setSquareColor(index, selectedColor)
    } else {
      toggleSquare(index)
    }
  }

  // ---- Board style (from board.jsx) ----
  const boardStyle = {
    display: "inline-grid",
    gridTemplateColumns: "repeat(8, 40px)",
    gridTemplateRows: "repeat(8, 40px)",
    border: "2px solid black",
  }

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h2>Local-First CRDT Chessboard</h2>
      <p>Pick a color below, then click any square. No color = toggle black/white.</p>

      <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />

      {/* Board */}
      <div style={{ marginTop: 24 }}>
        <div style={boardStyle}>
          {cells.map((val, i) => (
            <button
                key={i}
                onClick={() => handleSquareClick(i)}
                style={{
                  width: 40,
                  height: 40,
                  background: Array.isArray(val) ? val[0] : val,
                  //border: '1px solid rgba(0,0,0,0.15)',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',

                  // reset browser defaults
                  borderRadius: 0,
                  outline: 'none',
                  appearance: 'none',
                }}
                aria-label={`cell ${i}`}
              />
          ))}
        </div>
      </div>
    </div>
  )
}
