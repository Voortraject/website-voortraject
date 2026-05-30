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
        gap: '8px',
        padding: '8px 18px',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'inherit',
        color: '#ffffff',
        background: 'transparent',
        border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'}`,
        borderRadius: '9999px',
        cursor: 'pointer',
        transform: isPressed ? 'translateY(1px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        boxShadow: isHovered
          ? '0 0 0 1px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(201, 162, 39, 0.15)'
          : 'none',
        outline: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '9999px',
          backgroundColor: '#E8B547',
          boxShadow: '0 0 8px rgba(232, 181, 71, 0.8)',
          animation: 'subtle-button-pulse 1.6s ease-in-out infinite',
        }}
      />
      {label}
      <style>{`
        @keyframes subtle-button-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </button>
  )
}
