import { render } from '@testing-library/react-native';
import React from 'react';
import NotFoundScreen from '../../app/+not-found';

describe('NotFoundScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<NotFoundScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays "Not Found" title', () => {
    const { getByText } = render(<NotFoundScreen />);
    expect(getByText('Not Found')).toBeTruthy();
  });

  it('displays the guidance message', () => {
    const { getByText } = render(<NotFoundScreen />);
    expect(
      getByText('This screen could not be found. Try adding a new one?')
    ).toBeTruthy();
  });
});
