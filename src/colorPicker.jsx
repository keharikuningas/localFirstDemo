// src/ColorPicker.jsx
export const PALETTE = [
  '#ffffff', // 0 empty
  '#222222', // 1 black
  '#ff6666', // 2 red
  '#66ccff', // 3 blue
  '#66ff99', // 4 green
  '#ffd166', // 5 yellow
  '#a78bfa', // 6 violet
  '#f472b6'  // 7 pink
]

export default function ColorPicker({ size = 36, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, minmax(28px, 1fr))',
          gap: 8, padding: 10,
          border: '1px solid #e2e8f0',
          borderRadius: 12, background: '#f8fafc',
          width: 'fit-content'
        }}
      >
        {PALETTE.map((hex, i) => {
          const isSelected = selected === hex
          return (
            <button
              key={i}
              onClick={() => onSelect?.(hex)}
              title={hex}
              style={{
                width: size, height: size, background: hex, cursor: 'pointer',
                borderRadius: 8, padding: 0,
                border: hex === '#ffffff' ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.06)',
                outline: isSelected ? '3px solid #0ea5e9' : 'none',
              }}
              aria-pressed={isSelected}
            />
          )
        })}
      </div>
    </div>
  )
}
