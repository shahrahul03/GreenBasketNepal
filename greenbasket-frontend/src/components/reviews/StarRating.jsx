import { useState } from 'react'

export function StarRating({ value = 0, onChange, size = 'md', interactive = true }) {
  const [hoveredStar, setHoveredStar] = useState(0)
  const [hoveredFraction, setHoveredFraction] = useState(0)

  const sizeMap = { sm: 14, md: 20, lg: 28 }
  const starSize = sizeMap[size] || 20
  const gap = size === 'sm' ? 'gap-px' : size === 'lg' ? 'gap-1' : 'gap-0.5'

  const displayValue = interactive && hoveredStar > 0 ? hoveredStar - 1 + hoveredFraction : value

  const getStarFill = (star) => {
    if (star <= displayValue) return 'full'
    if (star - 0.5 <= displayValue) return 'half'
    return 'empty'
  }

  const handleMove = (star, e) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setHoveredStar(star)
    setHoveredFraction(x < 0.5 ? 0.5 : 1)
  }

  const handleClick = (star, e) => {
    if (!interactive || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    onChange(star - 1 + (x < 0.5 ? 0.5 : 1))
  }

  const handleLeave = () => {
    if (!interactive) return
    setHoveredStar(0)
    setHoveredFraction(0)
  }

  return (
    <div className={`inline-flex items-center ${gap} ${!interactive ? 'pointer-events-none' : ''}`} onMouseLeave={handleLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = getStarFill(star)
        return (
          <span
            key={star}
            className={`relative inline-flex items-center justify-center ${
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
            } transition-transform duration-150`}
            style={{ width: starSize + 4, height: starSize + 4 }}
            onMouseMove={(e) => handleMove(star, e)}
            onClick={(e) => handleClick(star, e)}
          >
            <svg width={starSize} height={starSize} viewBox="0 0 24 24" className="text-surface-300">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {fill !== 'empty' && (
              <svg
                width={starSize}
                height={starSize}
                viewBox="0 0 24 24"
                className="absolute inset-0 text-amber-400"
                style={fill === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
              </svg>
            )}
          </span>
        )
      })}
    </div>
  )
}
