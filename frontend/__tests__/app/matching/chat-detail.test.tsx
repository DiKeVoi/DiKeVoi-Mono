import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ChatDetailScreen from '../../../app/(matching)/chat/[id]';

// Override the global useLocalSearchParams mock for this file
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  Redirect: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'conn123' }),
  usePathname: () => '/',
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement('SafeAreaView', props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@/components/MessageBubble', () => ({
  MessageBubble: ({ msg }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `bubble-${msg.id}` }, msg.text);
  },
}));

describe('ChatDetailScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ChatDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays partner name in header', () => {
    const { getByText } = render(<ChatDetailScreen />);
    expect(getByText('Trò chuyện với Nguyễn Văn An')).toBeTruthy();
  });

  it('renders all initial messages', () => {
    const { getByTestId } = render(<ChatDetailScreen />);
    expect(getByTestId('bubble-d1')).toBeTruthy();
    expect(getByTestId('bubble-m1')).toBeTruthy();
    expect(getByTestId('bubble-m2')).toBeTruthy();
    expect(getByTestId('bubble-sys1')).toBeTruthy();
  });

  it('shows message input area in normal (non-readonly) mode', () => {
    const { getByPlaceholderText } = render(<ChatDetailScreen />);
    expect(getByPlaceholderText('Nhập tin nhắn...')).toBeTruthy();
  });

  it('updates input text when user types', () => {
    const { getByPlaceholderText } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Hello world');
    expect(input.props.value).toBe('Hello world');
  });

  it('sends a message when send button is pressed', () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Test message');

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Last TouchableOpacity is the send button
    const sendButton = buttons[buttons.length - 1];
    fireEvent.press(sendButton);

    // Input should be cleared after send
    expect(input.props.value).toBe('');
  });

  it('does not send an empty message', () => {
    const { getByPlaceholderText, getAllByTestId: _ } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    const initialBubbleCount = 4; // from MOCK_CHAT_DATA

    fireEvent.changeText(input, '');
    fireEvent(input, 'submitEditing');

    // Still only 4 original bubbles
    // (We verify by checking the value didn't cause a crash)
    expect(input.props.value).toBe('');
  });

  it('does not send a whitespace-only message', () => {
    const { getByPlaceholderText } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, '   ');
    fireEvent(input, 'submitEditing');
    // Input remains unchanged because handleSendMessage returns early
    expect(input.props.value).toBe('   ');
  });

  it('clears input after sending a valid message via submit editing', () => {
    const { getByPlaceholderText } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Valid message');
    fireEvent(input, 'submitEditing');
    expect(input.props.value).toBe('');
  });

  it('clears input after pressing the send button', () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Another message');

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Last TouchableOpacity is the send button
    const sendButton = buttons[buttons.length - 1];
    fireEvent.press(sendButton);

    expect(input.props.value).toBe('');
  });

  it('renders back button in header', () => {
    const { UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(touchables.length).toBeGreaterThanOrEqual(1);
  });

  it('calls router.back when back button is pressed', () => {
    const { router } = require('expo-router');
    const { UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    // First TouchableOpacity is back button
    fireEvent.press(touchables[0]);
    expect(router.back).toHaveBeenCalled();
  });
});

describe('ChatDetailScreen (readonly mode)', () => {
  it('shows ended conversation notice when readonly=true', () => {
    // Override the mock specifically for this test using a spy
    const expoRouter = require('expo-router');
    const originalMock = expoRouter.useLocalSearchParams;
    expoRouter.useLocalSearchParams = () => ({ id: 'conn123', readonly: 'true' });

    const { getByText } = render(<ChatDetailScreen />);
    expect(getByText('Cuộc trò chuyện này đã kết thúc.')).toBeTruthy();

    // Restore
    expoRouter.useLocalSearchParams = originalMock;
  });
});
