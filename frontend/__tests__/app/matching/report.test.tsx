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
    useLocalSearchParams: () => ({ rideId: 'ride-1', reportedUserId: 'user-other' }),
    usePathname: () => '/',
    router,
  };
});

const getMockRouter = () => require('expo-router').router;

jest.mock('@/hooks/useRides', () => ({
  useRide: () => ({
    data: {
      id: 'ride-1',
      originLocation: 'KTX Khu B',
      destinationLocation: 'Trường Đại học Bách Khoa',
      departureTime: null,
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

jest.mock('@/hooks/useReports', () => ({
  useCreateReport: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useReports: () => ({ data: [], isLoading: false }),
  useReport: () => ({ data: null, isLoading: false, error: null }),
  REPORTS_KEY: 'reports',
}));

import ReportScreen from '../../../app/(matching)/report';

describe('ReportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<ReportScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the top bar title "Báo cáo sự cố"', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Báo cáo sự cố')).toBeTruthy();
  });

  it('renders the route section label', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Lộ trình liên quan')).toBeTruthy();
  });

  it('renders the pickup location', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('KTX Khu B')).toBeTruthy();
  });

  it('renders the pickup location description', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Điểm đón')).toBeTruthy();
  });

  it('renders the destination', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Trường Đại học Bách Khoa')).toBeTruthy();
  });

  it('renders the destination description', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Điểm đến')).toBeTruthy();
  });

  it('renders the incident detail section title', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Chi tiết sự cố')).toBeTruthy();
  });

  it('renders the incident description instruction', () => {
    const { getByText } = render(<ReportScreen />);
    expect(
      getByText(
        'Vui lòng mô tả vấn đề bạn gặp phải để chúng tôi có thể hỗ trợ tốt nhất.'
      )
    ).toBeTruthy();
  });

  it('renders the description text input label', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Mô tả chi tiết')).toBeTruthy();
  });

  it('renders the description text input with placeholder', () => {
    const { getByPlaceholderText } = render(<ReportScreen />);
    expect(
      getByPlaceholderText(
        'Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,...'
      )
    ).toBeTruthy();
  });

  it('renders the send report button', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Gửi báo cáo')).toBeTruthy();
  });

  it('updates the description text input when typed into', () => {
    const { getByPlaceholderText } = render(<ReportScreen />);
    const input = getByPlaceholderText(
      'Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,...'
    );
    fireEvent.changeText(input, 'Xe bị hỏng trên đường');
    expect(input.props.value).toBe('Xe bị hỏng trên đường');
  });

  it('accepts multiline input', () => {
    const { getByPlaceholderText } = render(<ReportScreen />);
    const input = getByPlaceholderText(
      'Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,...'
    );
    fireEvent.changeText(input, 'Line 1\nLine 2\nLine 3');
    expect(input.props.value).toBe('Line 1\nLine 2\nLine 3');
  });

  it('navigates back when back button is pressed (via safeBack)', () => {
    const { UNSAFE_getAllByType } = render(<ReportScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is the back arrow
    fireEvent.press(buttons[0]);
    expect(getMockRouter().back).toHaveBeenCalled();
  });

  it('navigates to report-success when send button is pressed with description', async () => {
    const { getByPlaceholderText, getByText } = render(<ReportScreen />);
    const input = getByPlaceholderText(
      'Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,...'
    );
    fireEvent.changeText(input, 'Tài xế không đến điểm đón');

    await act(async () => {
      fireEvent.press(getByText('Gửi báo cáo'));
    });
    expect(getMockRouter().push).toHaveBeenCalledWith('/(matching)/report-success');
  });
});
