import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// --- Module-level mocks (must precede import of the component) ---

jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  Redirect: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement('SafeAreaView', props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: (props: any) => React.createElement('Image', props),
  };
});

import ConnectionRequest from '../../../app/(tabs)/matching/connection-request';

describe('ConnectionRequest screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- Basic rendering ----

  it('renders without crashing', () => {
    const { toJSON } = render(<ConnectionRequest />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the header title "Yêu cầu kết nối"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Yêu cầu kết nối')).toBeTruthy();
  });

  // ---- Requester profile section ----

  it('renders the requester section label', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Thông tin người gửi')).toBeTruthy();
  });

  it('renders the requester name', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Nguyễn Văn A')).toBeTruthy();
  });

  it('renders the requester role badge "Đi ké"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Đi ké')).toBeTruthy();
  });

  it('renders the requester gender badge "Nam"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Nam')).toBeTruthy();
  });

  it('renders the requester date', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('10/10/2026')).toBeTruthy();
  });

  it('renders the requester time', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('08:30 AM')).toBeTruthy();
  });

  it('renders the requester route', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('KTX Khu B → Trường Đại học KHTN')).toBeTruthy();
  });

  // ---- My trip section ----

  it('renders the my-trip section label', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Chi tiết chuyến đi của bạn')).toBeTruthy();
  });

  it('renders the pickup and destination in the trip card', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('KTX Khu B → ĐH Bách Khoa')).toBeTruthy();
  });

  it('renders the time section label "Thời gian"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Thời gian')).toBeTruthy();
  });

  it('renders the trip departure time', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('08:00 - 10/10/2026')).toBeTruthy();
  });

  // ---- Action buttons ----

  it('renders the confirm connection button "Xác nhận kết nối"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Xác nhận kết nối')).toBeTruthy();
  });

  it('renders the cancel connection button "Hủy kết nối"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Hủy kết nối')).toBeTruthy();
  });

  // ---- Navigation interactions ----

  it('calls router.back when the back arrow is pressed', () => {
    const routerModule = require('expo-router');
    const mockBack = jest.fn();
    routerModule.router.back = mockBack;

    const { UNSAFE_getAllByType } = render(<ConnectionRequest />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First touchable is the header back button
    fireEvent.press(buttons[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('calls router.replace with "/matching/chat" when confirm button is pressed', () => {
    const routerModule = require('expo-router');
    const mockReplace = jest.fn();
    routerModule.router.replace = mockReplace;

    const { getByText } = render(<ConnectionRequest />);
    fireEvent.press(getByText('Xác nhận kết nối'));
    expect(mockReplace).toHaveBeenCalledWith('/matching/chat');
  });

  it('calls router.push with "/matching/results" when cancel button is pressed', () => {
    const routerModule = require('expo-router');
    const mockPush = jest.fn();
    routerModule.router.push = mockPush;

    const { getByText } = render(<ConnectionRequest />);
    fireEvent.press(getByText('Hủy kết nối'));
    expect(mockPush).toHaveBeenCalledWith('/matching/results');
  });

  // ---- Snapshot ----

  it('matches snapshot', () => {
    const { toJSON } = render(<ConnectionRequest />);
    expect(toJSON()).toMatchSnapshot();
  });
});
