import { render } from '@testing-library/react-native';
import React from 'react';
import Profile from '../../app/(tabs)/account/profile';

jest.mock('@/hooks/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u-1', email: 'test@example.com', displayName: 'Test User', photoUrl: null, isVerified: true, authProvider: 'email', gender: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    logout: jest.fn(),
    login: jest.fn(),
    isLoading: false,
  }),
}));

describe('Profile screen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Profile />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the profile title', () => {
    const { getByText } = render(<Profile />);
    expect(getByText('Tài khoản')).toBeTruthy();
  });
});
