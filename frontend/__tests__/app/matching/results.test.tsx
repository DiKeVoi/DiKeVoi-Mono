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

import ResultsScreen from '../../../app/(matching)/results';

describe('ResultsScreen (AllRequestsScreen)', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ResultsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the screen title "Đi ké với"', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Đi ké với')).toBeTruthy();
  });

  it('renders the results count heading', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Tìm thấy 3 bạn đồng hành phù hợp')).toBeTruthy();
  });

  it('renders all three match cards', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
    expect(getByText('Trần Thị Hoa')).toBeTruthy();
    expect(getByText('Lê Minh Tâm')).toBeTruthy();
  });

  it('renders filter pills', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Giới tính')).toBeTruthy();
    expect(getByText('Lặp lại?')).toBeTruthy();
    expect(getByText('Thời gian')).toBeTruthy();
  });

  it('renders route information for each card', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Quận 1 → Quận 7')).toBeTruthy();
    expect(getByText('Bình Thạnh → Quận 3')).toBeTruthy();
    expect(getByText('Quận 10 → Thủ Đức')).toBeTruthy();
  });

  it('renders date and time for each card', () => {
    const { getAllByText } = render(<ResultsScreen />);
    // All cards share the same date
    const dates = getAllByText('10/10/2026');
    expect(dates.length).toBe(3);
  });

  it('renders times for each match card', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('08:30 AM')).toBeTruthy();
    expect(getByText('07:45 AM')).toBeTruthy();
    expect(getByText('05:30 PM')).toBeTruthy();
  });

  it('renders gender tags for each card', () => {
    const { getAllByText } = render(<ResultsScreen />);
    // The source data uses "Nam" and "Nữ" — CSS uppercase is visual only
    const namCards = getAllByText('Nam');
    const nuCards = getAllByText('Nữ');
    expect(namCards.length).toBe(2);
    expect(nuCards.length).toBe(1);
  });

  it('renders role tags', () => {
    const { getAllByText } = render(<ResultsScreen />);
    // The source data uses "Cho đi ké" — CSS uppercase is visual only
    const roleLabels = getAllByText('Cho đi ké');
    expect(roleLabels.length).toBe(3);
  });

  it('renders "Lặp lại" tag for repeat matches (2 out of 3)', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const repeatLabels = getAllByText('Lặp lại');
    expect(repeatLabels.length).toBe(2);
  });

  it('does NOT render "Lặp lại" for non-repeat match (Trần Thị Hoa)', () => {
    const { getAllByText } = render(<ResultsScreen />);
    // Only 2 repeat badges (Nguyễn Văn An and Lê Minh Tâm)
    const repeatLabels = getAllByText('Lặp lại');
    expect(repeatLabels.length).toBe(2);
  });

  it('renders "Kết nối" button for each card initially', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText('Kết nối');
    expect(connectButtons.length).toBe(3);
  });

  it('toggles card request state when Kết nối button is pressed', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText('Kết nối');

    // Press the first card's connect button
    fireEvent.press(connectButtons[0]);

    // Should now show "Đã gửi yêu cầu" for that card
    const { getAllByText: getAllAfter } = render(<ResultsScreen />);
    // Re-render to verify initial state; the toggled card is in state
    // Use the same rendered component
    const sentButtons = getAllByText('Đã gửi yêu cầu');
    expect(sentButtons.length).toBe(1);
  });

  it('can toggle a card back to "Kết nối" after pressing again', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText('Kết nối');

    // Press once to request
    fireEvent.press(connectButtons[0]);
    // Press again to un-request
    const sentButtons = getAllByText('Đã gửi yêu cầu');
    fireEvent.press(sentButtons[0]);

    // Should be back to "Kết nối"
    const reconnectButtons = getAllByText('Kết nối');
    expect(reconnectButtons.length).toBe(3);
  });

  it('navigates back when back button is pressed', () => {
    const mockBack = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.back = mockBack;

    const { UNSAFE_getAllByType } = render(<ResultsScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is the back arrow
    fireEvent.press(buttons[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('each MatchCard has an independent request state', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText('Kết nối');

    // Only press the second card
    fireEvent.press(connectButtons[1]);

    const sentButtons = getAllByText('Đã gửi yêu cầu');
    expect(sentButtons.length).toBe(1);

    // The other two should still show "Kết nối"
    const remainingConnect = getAllByText('Kết nối');
    expect(remainingConnect.length).toBe(2);
  });

  it('multiple cards can be requested simultaneously', () => {
    const { getAllByText } = render(<ResultsScreen />);
    let connectButtons = getAllByText('Kết nối');

    fireEvent.press(connectButtons[0]);
    fireEvent.press(connectButtons[1]);

    const sentButtons = getAllByText('Đã gửi yêu cầu');
    expect(sentButtons.length).toBe(2);

    const remainingConnect = getAllByText('Kết nối');
    expect(remainingConnect.length).toBe(1);
  });
});
