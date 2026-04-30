import { render } from '@testing-library/react-native';
import React from 'react';
import AllRequests from '../../app/(tabs)/home/all-requests';

describe('AllRequests screen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<AllRequests />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the HomeHeader', () => {
    const { getByText } = render(<AllRequests />);
    expect(getByText('Đi ké với!')).toBeTruthy();
  });

  it('renders MyRequests in full view mode', () => {
    const { getByText, queryByText } = render(<AllRequests />);
    expect(getByText('Yêu cầu của tôi')).toBeTruthy();
    expect(queryByText('Xem tất cả')).toBeNull();
  });

  it('shows all 5 requests', () => {
    const { getAllByText } = render(<AllRequests />);
    const allItems = getAllByText(/Đang tìm kiếm|Đã ghép cặp/);
    expect(allItems.length).toBe(5);
  });
});
