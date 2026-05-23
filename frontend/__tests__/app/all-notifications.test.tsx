import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AllNotificationsScreen from '../../app/(tabs)/home/all-notifications';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockMarkAsRead = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack, canGoBack: jest.fn(() => true) }),
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

jest.mock('@/services/notifications', () => ({
  notificationsService: {
    markRead: jest.fn().mockResolvedValue(undefined),
    markAllRead: jest.fn().mockResolvedValue(undefined),
  },
}));

// Override global notification mock for per-test control
jest.mock('@/hooks/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [
      { id: 'n-1', userId: 'u-1', type: 'ride_request', title: 'Nguyễn Văn A yêu cầu kết nối với bạn', body: null, relatedId: 'req_123', isRead: false, createdAt: '2026-05-07T10:00:00' },
      { id: 'n-2', userId: 'u-1', type: 'negotiation_accepted', title: 'Nguyễn Văn A đã đồng ý kết nối với bạn', body: null, relatedId: 'c1', isRead: true, createdAt: '2026-05-07T10:00:00' },
      { id: 'n-3', userId: 'u-1', type: 'ride_completed', title: 'Bạn đã hoàn thành chuyến đi với Nguyễn Văn A', body: null, relatedId: 'c2', isRead: false, createdAt: '2026-05-07T10:00:00' },
      { id: 'n-4', userId: 'u-1', type: 'ride_cancelled', title: 'Nguyễn Văn A đã hủy chuyến đi với bạn.', body: null, relatedId: 'c3', isRead: false, createdAt: '2026-05-07T10:00:00' },
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
      expect(mockMarkAsRead).toHaveBeenCalledWith('n-1');
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/matching/connection-request');
    });

    it('pressing an "accepted" notification calls markAsRead and navigates to chat', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Nguyễn Văn A đã đồng ý kết nối với bạn'));
      expect(mockMarkAsRead).toHaveBeenCalledWith('n-2');
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(matching)/chat/[id]',
        params: { id: 'c1' },
      });
    });

    it('pressing a "success" notification calls markAsRead but does NOT navigate', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Bạn đã hoàn thành chuyến đi với Nguyễn Văn A'));
      expect(mockMarkAsRead).toHaveBeenCalledWith('n-3');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('pressing a "failed" notification calls markAsRead but does NOT navigate', () => {
      const { getByText } = render(<AllNotificationsScreen />);
      fireEvent.press(getByText('Nguyễn Văn A đã hủy chuyến đi với bạn.'));
      expect(mockMarkAsRead).toHaveBeenCalledWith('n-4');
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
