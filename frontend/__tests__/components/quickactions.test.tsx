import { render } from '@testing-library/react-native';
import React from 'react';
import { QuickActions } from '../../components/quickactions';

describe('QuickActions', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<QuickActions />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the "Đi ké" action card', () => {
    const { getByText } = render(<QuickActions />);
    expect(getByText('Đi ké')).toBeTruthy();
  });

  it('renders the "Chia sẻ chỗ" action card', () => {
    const { getByText } = render(<QuickActions />);
    expect(getByText('Chia sẻ chỗ')).toBeTruthy();
  });

  it('renders cost-saving subtitle', () => {
    const { getByText } = render(<QuickActions />);
    expect(getByText('Tiết kiệm chi phí')).toBeTruthy();
  });

  it('renders help subtitle', () => {
    const { getByText } = render(<QuickActions />);
    expect(getByText('Giúp đỡ bạn học')).toBeTruthy();
  });
});
