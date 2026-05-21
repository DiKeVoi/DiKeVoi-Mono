import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// --- Module-level mocks (must precede import of the component) ---

jest.mock('expo-router', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockReplace = jest.fn();
  const mockCanGoBack = jest.fn(() => true);
  return {
    Link: ({ children }: any) => children,
    Redirect: () => null,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      canGoBack: mockCanGoBack,
    }),
    useLocalSearchParams: () => ({ negotiationId: 'neg-123' }),
    usePathname: () => '/',
    router: {
      back: mockBack,
      push: mockPush,
      replace: mockReplace,
      canGoBack: mockCanGoBack,
    },
  };
});

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

const mockMutateAsync = jest.fn();

jest.mock('@/hooks/useNegotiations', () => ({
  useNegotiation: () => ({
    data: {
      id: 'neg-123',
      offererUid: 'user-offerer',
      status: 'pending',
      departureTime: '2026-10-10T01:30:00.000Z',
      pickupLocation: 'KTX Khu B',
      dropoffLocation: 'Trường Đại học KHTN',
      fare: null,
      note: null,
    },
    isLoading: false,
    error: null,
  }),
  useUpdateNegotiation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

jest.mock('@/hooks/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-offerer' },
    isLoading: false,
  }),
}));

import ConnectionRequest from '../../../app/(tabs)/matching/connection-request';

describe('ConnectionRequest screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
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

  // ---- Sections ----

  it('renders the requester section label', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Thông tin người gửi')).toBeTruthy();
  });

  it('renders the negotiation details section label', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Chi tiết thương lượng')).toBeTruthy();
  });

  it('renders the route in the requester card', () => {
    const { getAllByText } = render(<ConnectionRequest />);
    // Route appears in both the header card and the detail card
    const routeTexts = getAllByText('KTX Khu B → Trường Đại học KHTN');
    expect(routeTexts.length).toBeGreaterThan(0);
  });

  // ---- Action buttons (offerer + pending) ----

  it('renders the confirm connection button "Xác nhận kết nối"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Xác nhận kết nối')).toBeTruthy();
  });

  it('renders the reject button "Từ chối"', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Từ chối')).toBeTruthy();
  });

  // ---- Navigation interactions ----

  it('calls router.back when the back arrow is pressed', () => {
    const { router } = require('expo-router');
    const { UNSAFE_getAllByType } = render(<ConnectionRequest />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First touchable is the header back button
    fireEvent.press(buttons[0]);
    expect(router.back).toHaveBeenCalled();
  });

  it('calls router.replace with "/(matching)/chat" when confirm button is pressed', async () => {
    const { router } = require('expo-router');
    const { getByText } = render(<ConnectionRequest />);
    await act(async () => {
      fireEvent.press(getByText('Xác nhận kết nối'));
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'neg-123',
      payload: { status: 'accepted' },
    });
    expect(router.replace).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/(matching)/chat' })
    );
  });

  it('calls router.replace with "/(matching)/negotiations" when reject button is pressed', async () => {
    const { router } = require('expo-router');
    const { getByText } = render(<ConnectionRequest />);
    await act(async () => {
      fireEvent.press(getByText('Từ chối'));
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'neg-123',
      payload: { status: 'rejected' },
    });
    expect(router.replace).toHaveBeenCalledWith('/(matching)/negotiations');
  });

  // ---- Snapshot ----

  it('matches snapshot', () => {
    const { toJSON } = render(<ConnectionRequest />);
    expect(toJSON()).toMatchSnapshot();
  });
});
