import { render } from '@testing-library/react-native';
import React from 'react';
import Home from '../../app/(main)/home';

describe('Home screen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Home />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the welcome greeting', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Chào buổi sáng!')).toBeTruthy();
  });

  it('renders the destination prompt', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Bạn muốn đi đâu hôm nay?')).toBeTruthy();
  });

  it('renders the HomeHeader with brand name', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Đi ké với!')).toBeTruthy();
  });

  it('renders QuickActions', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Đi ké')).toBeTruthy();
    expect(getByText('Chia sẻ chỗ')).toBeTruthy();
  });

  it('renders MyRequests with limited view', () => {
    const { getByText } = render(<Home />);
    expect(getByText('Yêu cầu của tôi')).toBeTruthy();
    expect(getByText('Xem tất cả')).toBeTruthy();
  });
});
