import { render } from '@testing-library/react-native';
import React from 'react';
import Request from '../../app/(tabs)/matching/request';

describe('Request screen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Request />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the create request title', () => {
    const { getByText } = render(<Request />);
    expect(getByText('Tạo yêu cầu')).toBeTruthy();
  });
});
