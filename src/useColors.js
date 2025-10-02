// src/useColors.js
import { useEffect, useState } from 'react'
import { colors } from './sync'

export function useColors() {
  const [arr, setArr] = useState(() => colors.toArray())

  useEffect(() => {
    const onChange = () => setArr(colors.toArray())
    colors.observe(onChange)
    return () => colors.unobserve(onChange)
  }, [])

  return arr
}
