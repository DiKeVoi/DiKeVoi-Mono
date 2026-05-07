jest.unmock('@/hooks/NotificationContext');

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { NotificationProvider, useNotification } from '../../hooks/NotificationContext';

const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();

jest.mock('@/hooks/useNotifications', () => ({
  useNotificationList: () => ({
    data: [
      { id: 'n-1', userId: 'u-1', type: 'system', title: 'Test', body: null, relatedId: null, isRead: false, createdAt: '2026-05-07' },
      { id: 'n-2', userId: 'u-1', type: 'ride_request', title: 'Ride', body: null, relatedId: null, isRead: true, createdAt: '2026-05-07' },
    ],
  }),
  useUnreadCount: () => ({ data: 1 }),
  useMarkRead: () => ({ mutate: mockMarkRead }),
  useMarkAllRead: () => ({ mutate: mockMarkAllRead }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes notifications from API', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(Array.isArray(result.current.notifications)).toBe(true);
    expect(result.current.notifications).toHaveLength(2);
  });

  it('exposes unreadCount from API', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(result.current.unreadCount).toBe(1);
  });

  it('exposes markAsRead function', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(typeof result.current.markAsRead).toBe('function');
  });

  it('exposes markAllAsRead function', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('markAsRead calls useMarkRead mutation with the given id', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    result.current.markAsRead('n-1');
    expect(mockMarkRead).toHaveBeenCalledWith('n-1');
  });

  it('markAllAsRead calls useMarkAllRead mutation', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    result.current.markAllAsRead();
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('notifications have isRead field (API format)', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(result.current.notifications[0]).toHaveProperty('isRead');
  });

  it('throws when useNotification is used outside provider', () => {
    expect(() => renderHook(() => useNotification())).toThrow(
      'useNotification must be inside NotificationProvider'
    );
  });
});
