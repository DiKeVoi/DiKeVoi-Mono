import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    Link: ({ children }: any) => children,
    Redirect: () => null,
    useRouter: () => router,
    useLocalSearchParams: () => ({ rideId: 'ride-1' }),
    usePathname: () => '/',
    router,
  };
});

const getMockRouter = () => require('expo-router').router;

jest.mock('@/hooks/useRides', () => ({
  useRide: () => ({
    data: {
      id: 'ride-1',
      offerUserId: 'user-other',
      requestUserId: 'user-1',
      originLocation: 'KTX Khu B',
      destinationLocation: 'Trường Đại học Bách Khoa',
      departureTime: null,
      negotiatedCost: null,
      status: 'completed',
    },
    isLoading: false,
  }),
  useRides: () => ({ data: [], isLoading: false }),
  useActiveRides: () => ({ data: [], isLoading: false }),
  useUpdateRideStatus: () => ({ mutate: jest.fn(), isPending: false }),
  useStartRide: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useFinishRide: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useConfirmPayment: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  RIDES_KEY: 'rides',
}));

jest.mock('@/hooks/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: { id: 'user-1' }, logout: jest.fn(), login: jest.fn(), isLoading: false }),
}));

// Mock the logo asset
jest.mock('@/assets/images/dikevoi-logo.png', () => 1, { virtual: true });

import FinishScreen from '../../../app/(matching)/finish';

describe('FinishScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<FinishScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the trip completion title', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Chuyến đi hoàn tất')).toBeTruthy();
  });

  it('renders the thank you message', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Cảm ơn bạn đã sử dụng Đi ké với!')).toBeTruthy();
  });

  it('renders the pickup location label', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Điểm đi')).toBeTruthy();
  });

  it('renders the pickup location value', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('KTX Khu B')).toBeTruthy();
  });

  it('renders the destination label', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Điểm đến')).toBeTruthy();
  });

  it('renders the destination value', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Trường Đại học Bách Khoa')).toBeTruthy();
  });

  it('renders the companion section header', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Người đồng hành')).toBeTruthy();
  });

  it('renders the companion description', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Bạn đường của bạn')).toBeTruthy();
  });

  it('renders the finish button', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Hoàn thành')).toBeTruthy();
  });

  it('renders the confirmation disclaimer text', () => {
    const { getByText } = render(<FinishScreen />);
    expect(
      getByText(
        'Bằng cách nhấn hoàn thành, bạn xác nhận chuyến đi đã kết thúc an toàn.'
      )
    ).toBeTruthy();
  });

  it('navigates to home when Hoàn thành button is pressed', () => {
    const { getByText } = render(<FinishScreen />);
    fireEvent.press(getByText('Hoàn thành'));
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('navigates to report screen when flag button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<FinishScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // The report/flag button is the first touchable in the header
    fireEvent.press(buttons[0]);
    expect(getMockRouter().push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/(matching)/report' })
    );
  });

  it('renders route details card with proper structure', () => {
    const { getAllByText } = render(<FinishScreen />);
    // Both pickup and destination labels should exist
    expect(getAllByText(/Điểm/).length).toBeGreaterThanOrEqual(2);
  });

  it('renders companion role label (user-1 is requester, ride offerUserId is user-other)', () => {
    const { getByText } = render(<FinishScreen />);
    // user-1 is not the offer user, so isOfferUser=false => shows 'Người cho đi ké'
    expect(getByText('Người cho đi ké')).toBeTruthy();
  });
});
