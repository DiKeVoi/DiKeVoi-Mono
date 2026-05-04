import { render } from '@testing-library/react-native';
import React from 'react';
import Profile from '../../app/(tabs)/account/profile';

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
