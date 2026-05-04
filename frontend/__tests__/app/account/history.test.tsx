import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TripHistoryScreen from '../../../app/(tabs)/account/history';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
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

// Helper to get the mocked router after module resolution
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
    it('shows completed trip partner names', () => {
      const { getByText } = render(<TripHistoryScreen />);
      expect(getByText('Nguyễn Văn An')).toBeTruthy();
      expect(getByText('Lê Thị Bình')).toBeTruthy();
    });

    it('shows completed trip times', () => {
      const { getByText } = render(<TripHistoryScreen />);
      expect(getByText('Hôm qua, 18:30')).toBeTruthy();
      expect(getByText('15 Th05, 07:15')).toBeTruthy();
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

    it('does NOT show cancelled trip partner (Trần Hoàng Nam) on completed tab', () => {
      const { queryByText } = render(<TripHistoryScreen />);
      expect(queryByText('Trần Hoàng Nam')).toBeNull();
    });
  });

  describe('Cancelled trips tab', () => {
    it('shows cancelled trips after switching tab', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(getByText('Trần Hoàng Nam')).toBeTruthy();
    });

    it('shows Đã hủy status badge for cancelled trips', () => {
      const { getByText, getAllByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      // "Đã hủy" appears both as tab text and as status badge
      const cancelledTexts = getAllByText('Đã hủy');
      expect(cancelledTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('shows cancelled trip time', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(getByText('12 Th05, 14:00')).toBeTruthy();
    });

    it('shows cancelled trip destination', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(getByText('Trung tâm Giáo dục Quốc phòng')).toBeTruthy();
    });

    it('does NOT show completed trip partners on cancelled tab', () => {
      const { getByText, queryByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      expect(queryByText('Nguyễn Văn An')).toBeNull();
      expect(queryByText('Lê Thị Bình')).toBeNull();
    });

    it('switching back to Hoàn thành tab shows completed trips again', () => {
      const { getByText } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      fireEvent.press(getByText('Hoàn thành'));
      expect(getByText('Nguyễn Văn An')).toBeTruthy();
    });
  });

  describe('Chat button navigation', () => {
    it('pressing chat button on first completed trip navigates to chat', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      // Layout: back=0, Hoàn thành=1, Đã hủy=2, chat_t1=3, flag_t1=4, chat_t2=5, flag_t2=6
      const chatButton = allTouchables[3];
      fireEvent.press(chatButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/chat/[id]',
        params: { id: 'c1', readonly: 'true' },
      });
    });

    it('pressing report button on first completed trip navigates to report', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const flagButton = allTouchables[4];
      fireEvent.press(flagButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/report/[id]',
        params: { id: 'r1' },
      });
    });

    it('pressing chat button on second completed trip navigates with correct id', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const chatButton2 = allTouchables[5];
      fireEvent.press(chatButton2);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/chat/[id]',
        params: { id: 'c2', readonly: 'true' },
      });
    });

    it('pressing report button on second completed trip navigates with correct id', () => {
      const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      const flagButton2 = allTouchables[6];
      fireEvent.press(flagButton2);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/report/[id]',
        params: { id: 'r2' },
      });
    });
  });

  describe('Cancelled trip chat/report navigation', () => {
    it('pressing chat button on cancelled trip navigates with correct id', () => {
      const { getByText, UNSAFE_getAllByType } = render(<TripHistoryScreen />);
      fireEvent.press(getByText('Đã hủy'));
      const { TouchableOpacity } = require('react-native');
      const allTouchables = UNSAFE_getAllByType(TouchableOpacity);
      // After switching to cancelled tab: back=0, Hoàn thành=1, Đã hủy=2, chat_t3=3, flag_t3=4
      const chatButton = allTouchables[3];
      fireEvent.press(chatButton);
      expect(getMockedRouter().push).toHaveBeenCalledWith({
        pathname: '/(matching)/chat/[id]',
        params: { id: 'c3', readonly: 'true' },
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
        pathname: '/(matching)/report/[id]',
        params: { id: 'r3' },
      });
    });
  });

  describe('Back navigation', () => {
    it('pressing back button calls router.back', () => {
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
