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

import ChatScreen from '../../../app/(matching)/chat';

describe('ChatScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ChatScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the partner name in the header', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('renders the partner online status', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Đang hoạt động')).toBeTruthy();
  });

  it('renders the negotiation timer', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('04:59')).toBeTruthy();
  });

  it('renders the negotiation card prompt text', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Cùng nhau xác nhận chuyến đi trong:')).toBeTruthy();
  });

  it('renders the confirm trip button', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Xác nhận chuyến đi')).toBeTruthy();
  });

  it('renders the cancel trip button', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Hủy chuyến đi')).toBeTruthy();
  });

  it('renders initial chat messages', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText(/KTX Khu B/)).toBeTruthy();
    expect(getByText(/Mình vẫn còn chỗ/)).toBeTruthy();
  });

  it('renders the system message about trip join request', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('An đã gửi đề nghị tham gia chuyến đi.')).toBeTruthy();
  });

  it('renders the "Hôm nay" date separator', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Hôm nay')).toBeTruthy();
  });

  it('renders the text input with placeholder', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    expect(getByPlaceholderText('Nhập tin nhắn...')).toBeTruthy();
  });

  it('does not send an empty message', () => {
    const { getByPlaceholderText, getAllByText } = render(<ChatScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');

    // Count messages before
    const messagesBefore = getAllByText(/14:2/).length;

    // Send without typing anything
    fireEvent(input, 'submitEditing');

    // Message count should not increase
    const messagesAfter = getAllByText(/14:2/).length;
    expect(messagesAfter).toBe(messagesBefore);
  });

  it('updates input text when typing', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Hello there');
    expect(input.props.value).toBe('Hello there');
  });

  it('sends a message when send button is pressed', async () => {
    const { getByPlaceholderText, getByText, queryByText, UNSAFE_getAllByType } =
      render(<ChatScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');

    await act(async () => {
      fireEvent.changeText(input, 'Button send test');
    });

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Last button is the send button
    const sendButton = buttons[buttons.length - 1];

    await act(async () => {
      fireEvent.press(sendButton);
    });

    expect(queryByText('Button send test')).toBeTruthy();
  });

  it('clears input after sending via send button', async () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<ChatScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');

    await act(async () => {
      fireEvent.changeText(input, 'Hello');
    });

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const sendButton = buttons[buttons.length - 1];

    await act(async () => {
      fireEvent.press(sendButton);
    });

    // Re-query the input to get the updated value
    const updatedInput = getByPlaceholderText('Nhập tin nhắn...');
    expect(updatedInput.props.value).toBe('');
  });

  it('does not send whitespace-only messages', async () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<ChatScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');

    await act(async () => {
      fireEvent.changeText(input, '   ');
    });

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const sendButton = buttons[buttons.length - 1];

    await act(async () => {
      fireEvent.press(sendButton);
    });

    // The whitespace text should not appear as a message bubble
    // Input should remain unchanged (empty string trim check)
    const updatedInput = getByPlaceholderText('Nhập tin nhắn...');
    expect(updatedInput.props.value).toBe('   ');
  });

  it('navigates back when back button is pressed', () => {
    const mockBack = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.back = mockBack;

    const { UNSAFE_getAllByType } = render(<ChatScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is the back button
    fireEvent.press(buttons[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates to finish screen when confirm button pressed', () => {
    const mockPush = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.push = mockPush;

    const { getByText } = render(<ChatScreen />);
    fireEvent.press(getByText('Xác nhận chuyến đi'));
    expect(mockPush).toHaveBeenCalledWith('/(matching)/finish');
  });

  it('navigates to results screen when cancel button pressed', () => {
    const mockReplace = jest.fn();
    const routerModule = require('expo-router');
    routerModule.router.replace = mockReplace;

    const { getByText } = render(<ChatScreen />);
    fireEvent.press(getByText('Hủy chuyến đi'));
    expect(mockReplace).toHaveBeenCalledWith('/(matching)/results');
  });
});
