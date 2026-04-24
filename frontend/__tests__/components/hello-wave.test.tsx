import { render } from '@testing-library/react-native';
import React from 'react';
import { HelloWave } from '../../components/hello-wave';

describe('HelloWave', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<HelloWave />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays the wave emoji', () => {
    const { getByText } = render(<HelloWave />);
    expect(getByText('👋')).toBeTruthy();
  });
});
