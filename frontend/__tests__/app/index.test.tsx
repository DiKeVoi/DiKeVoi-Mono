import { render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../../app/(tabs)/index';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">{href}</Text>;
  },
}));

describe('(tabs)/index', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('redirects to /onboarding', () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('redirect').props.children).toBe('/onboarding');
  });
});
