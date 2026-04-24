import { render } from '@testing-library/react-native';
import React from 'react';
import { MyRequests } from '../../components/my-requests';

describe('MyRequests', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<MyRequests viewAll={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the section heading', () => {
    const { getByText } = render(<MyRequests viewAll={false} />);
    expect(getByText('Yêu cầu của tôi')).toBeTruthy();
  });

  it('shows "Xem tất cả" link when viewAll is false', () => {
    const { getByText } = render(<MyRequests viewAll={false} />);
    expect(getByText('Xem tất cả')).toBeTruthy();
  });

  it('hides "Xem tất cả" link when viewAll is true', () => {
    const { queryByText } = render(<MyRequests viewAll={true} />);
    expect(queryByText('Xem tất cả')).toBeNull();
  });

  it('renders "Đang tìm kiếm" status for finding requests', () => {
    const { getAllByText } = render(<MyRequests viewAll={true} />);
    expect(getAllByText('Đang tìm kiếm').length).toBeGreaterThan(0);
  });

  it('renders "Đã ghép cặp" status for matched requests', () => {
    const { getAllByText } = render(<MyRequests viewAll={true} />);
    expect(getAllByText('Đã ghép cặp').length).toBeGreaterThan(0);
  });

  it('renders 3 items when viewAll is false', () => {
    const { getAllByText } = render(<MyRequests viewAll={false} />);
    const findingItems = getAllByText(/Đang tìm kiếm|Đã ghép cặp/);
    expect(findingItems.length).toBe(3);
  });

  it('renders all 5 items when viewAll is true', () => {
    const { getAllByText } = render(<MyRequests viewAll={true} />);
    const allItems = getAllByText(/Đang tìm kiếm|Đã ghép cặp/);
    expect(allItems.length).toBe(5);
  });

  it('renders origin and destination for requests', () => {
    const { getAllByText } = render(<MyRequests viewAll={false} />);
    expect(getAllByText('KTX Khu B').length).toBeGreaterThan(0);
    expect(getAllByText('Nhà văn hóa sinh viên').length).toBeGreaterThan(0);
  });
});
