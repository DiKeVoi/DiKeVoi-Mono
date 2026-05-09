import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { ThemedView } from '../../components/themed-view';

describe('ThemedView', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Child</Text>
      </ThemedView>
    );
    expect(getByText('Child')).toBeTruthy();
  });

  it('renders without crashing when empty', () => {
    const { toJSON } = render(<ThemedView />);
    expect(toJSON()).toBeTruthy();
  });

  it('applies lightColor as background in light theme', () => {
    const { getByTestId } = render(
      <ThemedView testID="view" lightColor="#ff0000" />
    );
    const view = getByTestId('view');
    const flatStyle = [view.props.style].flat();
    expect(flatStyle).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#ff0000' })])
    );
  });

  it('passes through extra props', () => {
    const { getByTestId } = render(<ThemedView testID="themed-view" />);
    expect(getByTestId('themed-view')).toBeTruthy();
  });
});
