import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

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
    useLocalSearchParams: () => ({ negotiationId: 'neg-1' }),
    usePathname: () => '/',
    router,
  };
});

// Helper to get fresh router mock reference
const getMockRouter = () => require('expo-router').router;

jest.mock('@/hooks/useNegotiations', () => ({
  useNegotiation: () => ({
    data: {
      id: 'neg-1',
      offererUid: 'user-other',
      status: 'pending',
      fare: null,
      note: null,
      departureTime: null,
      pickupLocation: 'KTX Khu B',
      dropoffLocation: 'Trường Đại học Bách Khoa',
      confirmedByOfferer: false,
      confirmedByRequester: false,
      lastEditedBy: null,
    },
    isLoading: false,
  }),
  useUpdateNegotiation: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useConfirmNegotiation: () => ({ mutateAsync: jest.fn().mockResolvedValue({ rideId: null }), isPending: false }),
}));

jest.mock('@/hooks/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: { id: 'user-1' }, logout: jest.fn(), login: jest.fn(), isLoading: false }),
}));

jest.mock('@/lib/confirm', () => ({
  confirmAction: jest.fn((title: string, msg: string, cb: () => void) => cb()),
}));

import ChatScreen from '../../../app/(matching)/chat';

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<ChatScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the negotiation screen', () => {
    const { toJSON } = render(<ChatScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the route locations', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('KTX Khu B')).toBeTruthy();
    expect(getByText('Trường Đại học Bách Khoa')).toBeTruthy();
  });

  it('renders the confirm status header', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Xác nhận chuyến đi')).toBeTruthy();
  });

  it('renders the role label for requester', () => {
    const { getByText } = render(<ChatScreen />);
    // user-1 is the requester (offererUid is user-other), isOfferer=false => shows partner as "Người cho đi ké"
    expect(getByText('Người cho đi ké')).toBeTruthy();
  });

  it('renders the negotiating status', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Đang thương lượng')).toBeTruthy();
  });

  it('renders the propose price button when no fare set', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Đề xuất giá')).toBeTruthy();
  });

  it('renders the confirm action button', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Đồng ý & Xác nhận chuyến')).toBeTruthy();
  });

  it('renders the cancel button', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Hủy thương lượng')).toBeTruthy();
  });

  it('renders no-fare placeholder', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Chưa có đề xuất giá — hãy bắt đầu thương lượng')).toBeTruthy();
  });

  it('shows propose form when Đề xuất giá is pressed', () => {
    const { getByText } = render(<ChatScreen />);
    fireEvent.press(getByText('Đề xuất giá'));
    expect(getByText('Đề xuất điều kiện')).toBeTruthy();
  });

  it('renders back navigation on press', () => {
    const { UNSAFE_getAllByType } = render(<ChatScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is back/home navigation
    fireEvent.press(buttons[0]);
    expect(getMockRouter().replace).toHaveBeenCalledWith('/home');
  });

  it('navigates to negotiations when cancel is pressed', async () => {
    const { getByText } = render(<ChatScreen />);
    await act(async () => {
      fireEvent.press(getByText('Hủy thương lượng'));
    });
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(matching)/negotiations');
  });
});
