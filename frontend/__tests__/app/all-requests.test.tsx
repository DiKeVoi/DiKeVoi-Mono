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
    const { getAllByText, queryByText } = render(<AllRequests />);
    const items = getAllByText(/Đang tìm kiếm|Đã ghép cặp|Đang chờ xác nhận/);
    expect(items.length).toBeGreaterThan(0);
    expect(queryByText('Yêu cầu của tôi')).toBeNull();
  });

  it('shows all 5 requests', () => {
    const { getAllByText } = render(<AllRequests />);
    const allItems = getAllByText(/Đang tìm kiếm|Đã ghép cặp/);
    expect(allItems.length).toBe(5);
  });
});
