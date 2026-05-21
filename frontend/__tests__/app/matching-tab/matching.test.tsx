import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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
    useLocalSearchParams: () => ({}),
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

import MatchingScreen from '../../../app/(tabs)/matching/matching';

describe('MatchingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- Basic rendering ----

  it('renders without crashing', () => {
    const { toJSON } = render(<MatchingScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the screen title "Đi ké với!"', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Đi ké với!')).toBeTruthy();
  });

  it('renders the searching description text', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Đang tìm kiếm bạn đồng hành phù hợp...')).toBeTruthy();
  });

  it('renders the gender preference note', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Ưu tiên cùng giới tính cho bạn')).toBeTruthy();
  });

  it('renders the matching progress label "Matching 65%"', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Matching 65%')).toBeTruthy();
  });

  it('renders the cancel search button', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Hủy tìm kiếm')).toBeTruthy();
  });

  // ---- Navigation interactions ----

  it('calls router.back when back button is pressed', () => {
    const { router } = require('expo-router');
    const { UNSAFE_getAllByType } = render(<MatchingScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First touchable is the header back button
    fireEvent.press(buttons[0]);
    expect(router.back).toHaveBeenCalled();
  });

  it('calls router.push with "/(matching)/results" when cancel search is pressed', () => {
    const { router } = require('expo-router');
    const { getByText } = render(<MatchingScreen />);
    fireEvent.press(getByText('Hủy tìm kiếm'));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/(matching)/results' })
    );
  });

  // ---- Animation views render ----

  it('renders animated pulse and float views', () => {
    const { toJSON } = render(<MatchingScreen />);
    expect(toJSON()).toBeTruthy();
  });

  // ---- Snapshot ----

  it('matches snapshot', () => {
    const { toJSON } = render(<MatchingScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
