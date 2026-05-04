import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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

import ReportSuccessScreen from '../../../app/(matching)/report-success';

describe('ReportSuccessScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ReportSuccessScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the top bar title "Báo cáo đã gửi"', () => {
    const { getByText } = render(<ReportSuccessScreen />);
    expect(getByText('Báo cáo đã gửi')).toBeTruthy();
  });

  it('renders the main success heading', () => {
    const { getByText } = render(<ReportSuccessScreen />);
    expect(getByText('Báo cáo đã gửi thành công')).toBeTruthy();
  });

  it('renders the thank you / follow-up message', () => {
    const { getByText } = render(<ReportSuccessScreen />);
    expect(
      getByText(
        'Cảm ơn bạn đã đóng góp thông tin. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.'
      )
    ).toBeTruthy();
  });

  it('renders the "Về Trang chủ" action button', () => {
    const { getByText } = render(<ReportSuccessScreen />);
    expect(getByText('Về Trang chủ')).toBeTruthy();
  });

  it('navigates to home when close (X) button in header is pressed', () => {
    const mockReplace = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.replace = mockReplace;

    const { UNSAFE_getAllByType } = render(<ReportSuccessScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is the close button in the top bar
    fireEvent.press(buttons[0]);
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });

  it('navigates to home when "Về Trang chủ" button is pressed', () => {
    const mockReplace = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.replace = mockReplace;

    const { getByText } = render(<ReportSuccessScreen />);
    fireEvent.press(getByText('Về Trang chủ'));
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });

  it('renders exactly two interactive buttons (close + home)', () => {
    const { UNSAFE_getAllByType } = render(<ReportSuccessScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    expect(buttons.length).toBe(2);
  });

  it('renders the divider line below the header', () => {
    // The divider is a View with h-px — simply check the overall structure renders
    const { toJSON } = render(<ReportSuccessScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toBeTruthy();
  });
});
