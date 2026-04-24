import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemedText } from '../../components/themed-text';

describe('ThemedText', () => {
  it('renders text content', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders with default type when no type provided', () => {
    const { getByText } = render(<ThemedText>Default</ThemedText>);
    expect(getByText('Default')).toBeTruthy();
  });

  it.each(['default', 'title', 'defaultSemiBold', 'subtitle', 'link'] as const)(
    'renders with type "%s"',
    (type) => {
      const { getByText } = render(<ThemedText type={type}>Text</ThemedText>);
      expect(getByText('Text')).toBeTruthy();
    }
  );

  it('passes through additional props', () => {
    const { getByTestId } = render(
      <ThemedText testID="themed-text">Content</ThemedText>
    );
    expect(getByTestId('themed-text')).toBeTruthy();
  });
});
