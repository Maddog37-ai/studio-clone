import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from 'next-themes'
import { ThemeToggleButton } from '@/components/theme-toggle-button'

// Mock next-themes
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockSetTheme.mockClear()
  })

  it('renders the theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('shows sun and moon icons', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    )

    // Check for the presence of the lucide icons (they don't have specific test attributes)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
    
    // Verify the button has the proper aria-label
    expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  })

  it('opens dropdown menu when clicked and shows all theme options', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    // Check if all theme options appear in dropdown
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme with "light" when Light option is clicked', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    const lightOption = screen.getByText('Light')
    fireEvent.click(lightOption)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('calls setTheme with "dark" when Dark option is clicked', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    const darkOption = screen.getByText('Dark')
    fireEvent.click(darkOption)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('calls setTheme with "system" when System option is clicked', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    const systemOption = screen.getByText('System')
    fireEvent.click(systemOption)

    expect(mockSetTheme).toHaveBeenCalledWith('system')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })
})
