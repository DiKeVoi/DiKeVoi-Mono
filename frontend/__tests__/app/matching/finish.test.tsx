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

// Mock the logo asset
jest.mock('@/assets/images/dikevoi-logo.png', () => 1, { virtual: true });

import FinishScreen from '../../../app/(matching)/finish';

describe('FinishScreen', () => {
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

  it('renders the companion name', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Minh Quân')).toBeTruthy();
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
    const mockReplace = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.replace = mockReplace;

    const { getByText } = render(<FinishScreen />);
    fireEvent.press(getByText('Hoàn thành'));
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });

  it('navigates to report screen when flag button is pressed', () => {
    const mockPush = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.push = mockPush;

    const { UNSAFE_getAllByType } = render(<FinishScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // The report/flag button is the first touchable in the header
    fireEvent.press(buttons[0]);
    expect(mockPush).toHaveBeenCalledWith('/(matching)/report');
  });

  it('renders route details card with proper structure', () => {
    const { getAllByText } = render(<FinishScreen />);
    // Both pickup and destination labels should exist
    expect(getAllByText(/Điểm/).length).toBeGreaterThanOrEqual(2);
  });
});
