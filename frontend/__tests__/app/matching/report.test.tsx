import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

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

import ReportScreen from '../../../app/(matching)/report';

describe('ReportScreen', () => {
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
    expect(getByText('Điểm đón sinh viên')).toBeTruthy();
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

  it('navigates back when back button is pressed', () => {
    const mockBack = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.back = mockBack;

    const { UNSAFE_getAllByType } = render(<ReportScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is the back arrow
    fireEvent.press(buttons[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates to report-success when send button is pressed', () => {
    const mockPush = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.push = mockPush;

    const { getByText } = render(<ReportScreen />);
    fireEvent.press(getByText('Gửi báo cáo'));
    expect(mockPush).toHaveBeenCalledWith('/(matching)/report-success');
  });

  it('still navigates to report-success even with empty description', () => {
    const mockPush = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.push = mockPush;

    const { getByText } = render(<ReportScreen />);
    // Without entering any text, pressing send still navigates
    fireEvent.press(getByText('Gửi báo cáo'));
    expect(mockPush).toHaveBeenCalledWith('/(matching)/report-success');
  });

  it('navigates to report-success after typing a description', () => {
    const mockPush = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.push = mockPush;

    const { getByPlaceholderText, getByText } = render(<ReportScreen />);
    const input = getByPlaceholderText(
      'Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,...'
    );

    act(() => {
      fireEvent.changeText(input, 'Tài xế không đến điểm đón');
    });

    fireEvent.press(getByText('Gửi báo cáo'));
    expect(mockPush).toHaveBeenCalledWith('/(matching)/report-success');
  });
});
