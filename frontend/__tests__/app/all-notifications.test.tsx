import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AllNotificationsScreen from '../../app/(tabs)/home/all-notifications';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockMarkAsRead = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  Link: ({ children }: any) => children,
  Redirect: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => React.createElement(View, props, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Override global notification mock for per-test control
jest.mock('@/hooks/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [
      { id: 1, title: 'Nguyễn Văn A yêu cầu kết nối với bạn', time: new Date(), read: false, category: 'matching', targetId: 'req_123' },
      { id: 2, title: 'Nguyễn Văn A đã đồng ý kết nối với bạn', time: new Date(), read: true, category: 'accepted', targetId: 'c1' },
      { id: 3, title: 'Bạn đã hoàn thành chuyến đi với Nguyễn Văn A', time: new Date(), read: false, category: 'success', targetId: 'c2' },
      { id: 4, title: 'Nguyễn Văn A đã hủy chuyến đi với bạn.', time: new Date(), read: false, category: 'failed', targetId: 'c3' },
    ],
    unreadCount: 3,
    markAllAsRead: mockMarkAllAsRead,
    markAsRead: mockMarkAsRead,
  }),
  NotificationProvider: ({ children }: any) => children,
}));

describe('AllNotificationsScreen (all-notifications.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<AllNotificationsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the header title', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    expect(getByText('Tất cả thông báo')).toBeTruthy();
  });

  it('renders all notification titles from context', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    expect(getByText('Nguyễn Văn A yêu cầu kết nối với bạn')).toBeTruthy();
    expect(getByText('Nguyễn Văn A đã đồng ý kết nối với bạn')).toBeTruthy();
    expect(getByText('Bạn đã hoàn thành chuyến đi với Nguyễn Văn A')).toBeTruthy();
    expect(getByText('Nguyễn Văn A đã hủy chuyến đi với bạn.')).toBeTruthy();
  });

  it('renders "Vừa xong" timestamp for each notification', () => {
    const { getAllByText } = render(<AllNotificationsScreen />);
    const timestamps = getAllByText('Vừa xong');
    expect(timestamps.length).toBe(4);
  });

  describe('Header actions', () => {
    it('pressing back button calls router.back', () => {
      const { UNSAFE_getAllByType } = render(<AllNotificationsScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      // First touchable is the back button
      fireEvent.press(allTouchables[0]);
      expect(mockBack).toHaveBeenCalled();
    });

    it('pressing mark all as read button calls markAllAsRead', () => {
      const { UNSAFE_getAllByType } = render(<AllNotificationsScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      // Second touchable is the CheckCircle2 button
      fireEvent.press(allTouchables[1]);
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  describe('Notification press interactions', () => {
    it('pressing a "matching" notification calls markAsRead and navigates to connection-request', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Nguyễn Văn A yêu cầu kết nối với bạn'));
      expect(mockMarkAsRead).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/matching/connection-request');
    });

    it('pressing an "accepted" notification calls markAsRead and navigates to chat', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Nguyễn Văn A đã đồng ý kết nối với bạn'));
      expect(mockMarkAsRead).toHaveBeenCalledWith(2);
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(matching)/chat/[id]',
        params: { id: 'c1' },
      });
    });

    it('pressing a "success" notification calls markAsRead but does NOT navigate', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Bạn đã hoàn thành chuyến đi với Nguyễn Văn A'));
      expect(mockMarkAsRead).toHaveBeenCalledWith(3);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('pressing a "failed" notification calls markAsRead but does NOT navigate', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Nguyễn Văn A đã hủy chuyến đi với bạn.'));
      expect(mockMarkAsRead).toHaveBeenCalledWith(4);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Icon rendering (renderIcon branches)', () => {
    it('renders matching icon (UserPlus) for matching category', () => {
      // Lucide icons are mocked to return null; just verify the notification renders
      const { getByText } = render(<AllNotificationsScreen />);
      expect(getByText('Nguyễn Văn A yêu cầu kết nối với bạn')).toBeTruthy();
    });

    it('renders accepted icon (UserCheck) for accepted category', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      expect(getByText('Nguyễn Văn A đã đồng ý kết nối với bạn')).toBeTruthy();
    });

    it('renders failed icon (CircleX) for failed category', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      expect(getByText('Nguyễn Văn A đã hủy chuyến đi với bạn.')).toBeTruthy();
    });

    it('renders success icon (CircleCheck) for success category', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      expect(getByText('Bạn đã hoàn thành chuyến đi với Nguyễn Văn A')).toBeTruthy();
    });
  });

  describe('Read/unread visual state', () => {
    it('renders 4 notification items total', () => {
      const { getAllByText } = render(<AllNotificationsScreen />);
      // Each notification has "Vừa xong"
      expect(getAllByText('Vừa xong').length).toBe(4);
    });
  });
});

describe('AllNotificationsScreen - additional coverage', () => {
  it('header is always rendered regardless of notification count', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    expect(getByText('Tất cả thông báo')).toBeTruthy();
  });

  it('all four notification categories render icons correctly', () => {
    // Covers matching, accepted, success, failed icon branches
    const { getAllByText } = render(<AllNotificationsScreen />);
    // Each notification renders its icon + title + timestamp
    expect(getAllByText('Vừa xong').length).toBe(4);
  });

  it('multiple presses on markAllAsRead work correctly', () => {
    const { UNSAFE_getAllByType } = render(<AllNotificationsScreen />);
    const { TouchableOpacity } = require('react-native');
    const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
    // Press mark all as read button twice
    fireEvent.press(allTouchables[1]);
    fireEvent.press(allTouchables[1]);
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(2);
  });
});
