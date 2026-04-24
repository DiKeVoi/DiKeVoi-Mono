import { render } from '@testing-library/react-native';
import React from 'react';
import { Notification } from '../../components/notification';

describe('Notification', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Notification />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the notification header', () => {
    const { getByText } = render(<Notification />);
    expect(getByText('THÔNG BÁO')).toBeTruthy();
  });

  it('shows the correct unread count', () => {
    const { getByText } = render(<Notification />);
    expect(getByText('3 MỚI')).toBeTruthy();
  });

  it('renders matching request notification', () => {
    const { getByText } = render(<Notification />);
    expect(getByText('Nguyễn Văn A yêu cầu kết nối với bạn')).toBeTruthy();
  });

  it('renders success notification', () => {
    const { getByText } = render(<Notification />);
    expect(getByText('Bạn đã hoàn thành chuyến đi với Nguyễn Văn A')).toBeTruthy();
  });

  it('renders failed notification', () => {
    const { getByText } = render(<Notification />);
    expect(getByText('Nguyễn Văn A đã hủy chuyến đi với bạn.')).toBeTruthy();
  });

  it('renders the mark-all-read button', () => {
    const { getByText } = render(<Notification />);
    expect(getByText('Đánh dấu đã đọc tất cả')).toBeTruthy();
  });
});
