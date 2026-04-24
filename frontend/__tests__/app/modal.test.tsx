import { render } from '@testing-library/react-native';
import React from 'react';
import ModalScreen from '../../app/modal';

describe('ModalScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ModalScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays modal title', () => {
    const { getByText } = render(<ModalScreen />);
    expect(getByText('This is a modal')).toBeTruthy();
  });

  it('renders a link to the home screen', () => {
    const { getByText } = render(<ModalScreen />);
    expect(getByText('Go to home screen')).toBeTruthy();
  });
});
