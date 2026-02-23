import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })
})

describe('Component rendering', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container).toBeTruthy()
  })
})
