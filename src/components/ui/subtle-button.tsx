'use client'
import React, { useState } from 'react'

interface SubtleButtonProps {
  label?: string
  onClick?: () => void
}

export default function SubtleButton({ label = 'Contact', onClick }: SubtleButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 18px',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'inherit',
        color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
        background: isHovered
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isHovered ? 'rgba(201, 162, 39, 0.6)' : 'rgba(255, 255, 255, 0.15)'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transform: isPressed ? 'translateY(1px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        boxShadow: isHovered
          ? '0 0 0 1px rgba(201, 162, 39, 0.2), 0 4px 12px rgba(201, 162, 39, 0.1)'
          : 'none',
        outline: 'none',
      }}
    >
      {label}
    </button>
  )
}
