import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import HomePage from '@/app/page'
import { useAuth } from '@/hooks/use-auth'
import type { AppUser } from '@/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockReplace,
  })
})

describe('HomePage', () => {
  it('renders loading spinner', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signOut: jest.fn(),
      signIn: jest.fn(),
    })

    render(<HomePage />)

    // Check for loading spinner
    const loader = screen.getByRole('status', { hidden: true }) || 
                  document.querySelector('.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('redirects to dashboard when user is authenticated', () => {
    const mockUser: AppUser = { 
      uid: '123', 
      email: 'test@example.com',
      role: 'setter',
      teamId: 'test-team',
      displayName: 'Test User'
    }
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
    })

    render(<HomePage />)

    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
    })

    render(<HomePage />)

    expect(mockReplace).toHaveBeenCalledWith('/login')
  })
})
