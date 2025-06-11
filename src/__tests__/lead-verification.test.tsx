import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeadVerificationButton from '@/components/dashboard/lead-verification-button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock the hooks
jest.mock('@/hooks/use-auth');
jest.mock('@/hooks/use-toast');

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => ({ type: 'server_timestamp' })),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('LeadVerificationButton', () => {
  const mockToast = jest.fn();
  
  beforeEach(() => {
    mockUseToast.mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  const createMockLead = (overrides: Partial<Lead> = {}): Lead => ({
    id: 'test-lead-id',
    customerName: 'Test Customer',
    customerPhone: '123-456-7890',
    address: '123 Test St',
    status: 'scheduled',
    teamId: 'test-team',
    dispatchType: 'immediate',
    assignedCloserId: 'test-closer-id',
    assignedCloserName: 'Test Closer',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    scheduledAppointmentTime: Timestamp.now(),
    setterId: 'test-setter-id',
    setterName: 'Test Setter',
    setterVerified: false,
    ...overrides,
  });

  describe('checkbox state synchronization', () => {
    it('should show verified image when lead.setterVerified is true', () => {
      const mockLead = createMockLead({ setterVerified: true });
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-setter-id',
          role: 'setter',
          teamId: 'test-team',
        },
        loading: false,
      });

      render(<LeadVerificationButton lead={mockLead} />);
      
      // Should show the Facebook verified checkmark image instead of checkbox
      const verifiedImage = screen.getByAltText('Verified');
      expect(verifiedImage).toBeInTheDocument();
      expect(verifiedImage).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Facebook_verified_account_checkmark.jpg/250px-Facebook_verified_account_checkmark.jpg');
      
      // Should not have a checkbox when verified
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should show checkbox as unchecked when lead.setterVerified is false', () => {
      const mockLead = createMockLead({ setterVerified: false });
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-setter-id',
          role: 'setter',
          teamId: 'test-team',
        },
        loading: false,
      });

      render(<LeadVerificationButton lead={mockLead} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      // Should not show verified image when not verified
      expect(screen.queryByAltText('Verified')).not.toBeInTheDocument();
    });

    it('should call onVerificationChange callback when verification is toggled', async () => {
      const mockOnVerificationChange = jest.fn();
      const mockLead = createMockLead({ setterVerified: false });
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-setter-id',
          role: 'setter',
          teamId: 'test-team',
        },
        loading: false,
      });

      render(
        <LeadVerificationButton 
          lead={mockLead} 
          onVerificationChange={mockOnVerificationChange}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(mockOnVerificationChange).toHaveBeenCalled();
      });
    });

    it('should show "Verified" text when checkbox is checked', () => {
      const mockLead = createMockLead({ setterVerified: true });
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-setter-id',
          role: 'setter',
          teamId: 'test-team',
        },
        loading: false,
      });

      render(<LeadVerificationButton lead={mockLead} />);
      
      expect(screen.getByText('Verified')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('role-based visibility', () => {
    it('should not render for non-setter/non-manager users', () => {
      const mockLead = createMockLead();
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-closer-id',
          role: 'closer',
          teamId: 'test-team',
        },
        loading: false,
      });

      const { container } = render(<LeadVerificationButton lead={mockLead} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render for setters on scheduled leads', () => {
      const mockLead = createMockLead({ status: 'scheduled' });
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-setter-id',
          role: 'setter',
          teamId: 'test-team',
        },
        loading: false,
      });

      render(<LeadVerificationButton lead={mockLead} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render for managers on scheduled leads', () => {
      const mockLead = createMockLead({ status: 'scheduled' });
      
      mockUseAuth.mockReturnValue({
        user: {
          uid: 'test-manager-id',
          role: 'manager',
          teamId: 'test-team',
        },
        loading: false,
      });

      render(<LeadVerificationButton lead={mockLead} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });
});
