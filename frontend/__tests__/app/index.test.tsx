import { render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../../app/(tabs)/home/index';

describe('(tabs)/index', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders greeting text', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Chào buổi sáng!')).toBeTruthy();
  });
});
