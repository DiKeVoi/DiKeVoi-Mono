import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
  useQuery: jest.fn().mockReturnValue({ data: [], isLoading: false, error: null }),
  useMutation: jest.fn().mockReturnValue({ mutate: jest.fn(), isPending: false }),

}));
jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    Link: ({ children }: any) => children,
    Redirect: () => null,
  };
});

// Provide test ride data matching what the tests expect
jest.mock('@/hooks/useRides', () => ({
  useRides: () => ({
    data: [
      {
        id: 'c1',
        offerUserId: 'u1',
        requestUserId: 'u2',
        originLocation: 'KTX Khu A',
        destinationLocation: 'Trường Đại học Bách khoa',
        departureTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
        status: 'completed',
        negotiatedCost: null,
        seatsAvailable: 1,
        isRecurring: false,
        createdAt: new Date(Date.now() - 90000000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'c2',
        offerUserId: 'u1',
        requestUserId: 'u3',
        originLocation: 'KTX Khu A',
        destinationLocation: 'Nhà văn hóa sinh viên',
        departureTime: new Date('2026-05-15T07:15:00').toISOString(),
        status: 'completed',
        negotiatedCost: null,
        seatsAvailable: 1,
        isRecurring: false,
        createdAt: new Date('2026-05-15T06:00:00').toISOString(),
        updatedAt: new Date('2026-05-15T08:00:00').toISOString(),
      },
      {
        id: 'c3',
        offerUserId: 'u1',
        requestUserId: 'u4',
        originLocation: 'KTX Khu A',
        destinationLocation: 'Trung tâm Giáo dục Quốc phòng',
        departureTime: new Date('2026-05-12T14:00:00').toISOString(),
        status: 'cancelled',
        negotiatedCost: null,
        seatsAvailable: 1,
        isRecurring: false,
        createdAt: new Date('2026-05-12T13:00:00').toISOString(),
        updatedAt: new Date('2026-05-12T15:00:00').toISOString(),
      },
    ],
    isLoading: false,
    error: null,
  }),
  useRide: () => ({ data: null, isLoading: false }),
  useActiveRides: () => ({ data: [], isLoading: false }),
  useUpdateRideStatus: () => ({ mutate: jest.fn(), isPending: false }),
  useStartRide: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useFinishRide: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useConfirmPayment: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  RIDES_KEY: 'rides',
}));

jest.mock('@/hooks/useNegotiations', () => ({
  useNegotiations: () => ({ data: [], isLoading: false }),
  useNegotiation: () => ({ data: null, isLoading: false }),
  useNegotiationUsers: () => ({ data: null, isLoading: false }),
  useGetNegotiationByRide: () => ({ data: null, isLoading: false }),
  useCreateNegotiation: () => ({ mutateAsync: jest.fn().mockResolvedValue({ id: 'neg-1' }), isPending: false }),
  useUpdateNegotiation: () => ({ mutate: jest.fn(), isPending: false }),
  useConfirmNegotiation: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  NEGOTIATIONS_KEY: 'negotiations',
}));

jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1', email: 'user1@example.com' },
  }),
}));

import TripHistoryScreen from '../../../app/(tabs)/account/history';
import { useQuery } from '@tanstack/react-query';

const getMockedRouter = () => require('expo-router').router;

describe('TripHistoryScreen (history.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<TripHistoryScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the screen title', () => {
    const { getByText } = render(<TripHistoryScreen />);
    expect(getByText('Lịch sử chuyến đi')).toBeTruthy();
  });

  it('renders the Hoàn thành tab', () => {
    const { getByText } = render(<TripHistoryScreen />);
    expect(getByText('Hoàn thành')).toBeTruthy();
  });

  it('renders the Đã hủy tab', () => {
    const { getByText } = render(<TripHistoryScreen />);
    expect(getByText('Đã hủy')).toBeTruthy();
  });

  describe('Completed trips tab (default)', () => {
    it('shows completed trip destinations', () => {
      const { getByText } = render(<TripHistoryScreen />);
      expect(getByText('Trường Đại học Bách khoa')).toBeTruthy();
      expect(getByText('Nhà văn hóa sinh viên')).toBeTruthy();
    });

    it('shows Thành công status badges for completed trips', () => {
      const { getAllByText } = render(<TripHistoryScreen />);
      const badges = getAllByText('Thành công');
      expect(badges.length).toBe(2);
    });

    it('shows start and end location labels', () => {
      const { getAllByText } = render(<TripHistoryScreen />);
      expect(getAllByText('Điểm đi').length).toBeGreaterThan(0);
      expect(getAllByText('Điểm đến').length).toBeGreaterThan(0);
    });

    it('shows KTX Khu A as start location', () => {
      const { getAllByText } = render(<TripHistoryScreen />);
      expect(getAllByText('KTX Khu A').length).toBeGreaterThan(0);
    });

    it('shows destination locations', () => {
      const { getByText } = render(<TripHistoryScreen />);
      expect(getByText('Trường Đại học Bách khoa')).toBeTruthy();
      expect(getByText('Nhà văn hóa sinh viên')).toBeTruthy();
    });

    it('does NOT show cancelled trip destination on completed tab', () => {
      const { queryByText } = render(<TripHistoryScreen />);
      expect(queryByText('Trung tâm Giáo dục Quốc phòng')).toBeNull();
    });
  });

  describe('Cancelled trips tab', () => {
    it('shows cancelled trips after switching tab', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(getByText('Trung tâm Giáo dục Quốc phòng')).toBeTruthy();
    });

    it('shows Đã hủy status badge for cancelled trips', () => {
      const { getByText, getAllByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      const cancelledTexts = getAllByText('Đã hủy');
      expect(cancelledTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('shows cancelled trip destination', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(getByText('Trung tâm Giáo dục Quốc phòng')).toBeTruthy();
    });

    it('does NOT show completed trip destinations on cancelled tab', () => {
      const { getByText, queryByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(queryByText('Trường Đại học Bách khoa')).toBeNull();
      expect(queryByText('Nhà văn hóa sinh viên')).toBeNull();
    });

    it('switching back to Hoàn thành tab shows completed trips again', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      fireEvent.press(getByText('Hoàn thành'));
      expect(getByText('Trường Đại học Bách khoa')).toBeTruthy();
    });
  });

  describe('Chat button navigation', () => {
    it('pressing chat button on first completed trip navigates to chat', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      // Layout: back=0, Hoàn thành=1, Đã hủy=2, chat_c1=3, flag_c1=4, chat_c2=5, flag_c2=6
      const chatButton = allTouchables[3];
      fireEvent.press(chatButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/chat',
        params: { negotiationId: undefined },
      });
    });

    it('pressing report button on first completed trip navigates to report', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const flagButton = allTouchables[4];
      fireEvent.press(flagButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/report',
        params: { rideId: 'c1', reportedUserId: 'u1' },
      });
    });

    it('pressing chat button on second completed trip navigates with correct id', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const chatButton2 = allTouchables[5];
      fireEvent.press(chatButton2);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/chat',
        params: { negotiationId: undefined },
      });
    });

    it('pressing report button on second completed trip navigates with correct id', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const flagButton2 = allTouchables[6];
      fireEvent.press(flagButton2);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/report',
        params: { rideId: 'c2', reportedUserId: 'u1' },
      });
    });
  });

  describe('Cancelled trip chat/report navigation', () => {
    it('pressing chat button on cancelled trip navigates with correct id', () => {
      const { getByText, UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      // After switching to cancelled tab: back=0, Hoàn thành=1, Đã hủy=2, chat_c3=3, flag_c3=4
      const chatButton = allTouchables[3];
      fireEvent.press(chatButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/chat',
        params: { negotiationId: undefined },
      });
    });

    it('pressing report button on cancelled trip navigates with correct id', () => {
      const { getByText, UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const flagButton = allTouchables[4];
      fireEvent.press(flagButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/report',
        params: { rideId: 'c3', reportedUserId: 'u1' },
      });
    });
  });

  describe('Back navigation', () => {
    it('pressing back button calls router.back (via safeBack)', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      fireEvent.press(allTouchables[0]);
      expect(getMockedRouter().back).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('does not render the empty state message on completed tab (has trips)', () => {
      const { queryByText } = render(<TripHistoryScreen />);
      expect(queryByText('Chưa có chuyến đi nào.')).toBeNull();
    });
  });
});
