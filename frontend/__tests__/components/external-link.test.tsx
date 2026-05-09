import { fireEvent, render } from '@testing-library/react-native';
import { openBrowserAsync } from 'expo-web-browser';
import React from 'react';
import { Text } from 'react-native';
import { ExternalLink } from '../../components/external-link';

describe('ExternalLink', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders children', () => {
    const { getByText } = render(
      <ExternalLink href="https://example.com">
        <Text>Click me</Text>
      </ExternalLink>
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('opens in-app browser on native platforms', async () => {
    const originalEnv = process.env.EXPO_OS;
    process.env.EXPO_OS = 'ios';

    const { getByText } = render(
      <ExternalLink href="https://example.com">
        <Text>Link</Text>
      </ExternalLink>
    );

    const mockEvent = { preventDefault: jest.fn() };
    await fireEvent(getByText('Link'), 'press', mockEvent);

    expect(openBrowserAsync).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object)
    );

    process.env.EXPO_OS = originalEnv;
  });

  it('renders with a given href', () => {
    const { getByText } = render(
      <ExternalLink href="https://docs.expo.dev">
        <Text>Docs</Text>
      </ExternalLink>
    );
    expect(getByText('Docs')).toBeTruthy();
  });
});
