import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ChatDetailScreen from '../../../app/(matching)/chat/[id]';

// Override the global useLocalSearchParams mock for this file
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
    useLocalSearchParams: () => ({ id: 'conn123' }),
    usePathname: () => '/',
    router,
  };
});

const getMockRouter = () => require('expo-router').router;

jest.mock('@/hooks/useNegotiations', () => ({
  useNegotiation: () => ({
    data: {
      id: 'conn123',
      offererUid: 'user-other',
      status: 'pending',
      fare: null,
      note: null,
      departureTime: null,
      pickupLocation: 'điểm đón',
      dropoffLocation: 'điểm đến',
      confirmedByOfferer: false,
      confirmedByRequester: false,
      lastEditedBy: null,
    },
    isLoading: false,
  }),
  useNegotiationUsers: () => ({
    data: {
      offerer: { id: 'user-other', displayName: 'Nguyễn Văn An', photoUrl: null },
      requester: { id: 'user-1', displayName: 'Người dùng', photoUrl: null },
    },
    isLoading: false,
  }),
}));

jest.mock('@/hooks/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: { id: 'user-1' }, logout: jest.fn(), login: jest.fn(), isLoading: false }),
}));

jest.mock('@/components/MessageBubble', () => ({
  MessageBubble: ({ msg }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `bubble-${msg.id}` }, msg.text);
  },
}));

describe('ChatDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<ChatDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays partner name in header (offerer side sees requester name, user-1 is requester so partner is offerer)', () => {
    const { getByText } = render(<ChatDetailScreen />);
    // user-1 is requester, so partner is offerer: Nguyễn Văn An
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('shows "Đang hoạt động" status', () => {
    const { getByText } = render(<ChatDetailScreen />);
    expect(getByText('Đang hoạt động')).toBeTruthy();
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
    const { getByPlaceholderText } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');

    fireEvent.changeText(input, '');
    fireEvent(input, 'submitEditing');

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

  it('clears input after sending a valid message via send button', () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Valid message');

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const sendButton = buttons[buttons.length - 1];
    fireEvent.press(sendButton);

    expect(input.props.value).toBe('');
  });

  it('clears input after pressing the send button', () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.changeText(input, 'Another message');

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
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

  it('calls safeBack when back button is pressed (safeBack calls router.back when canGoBack)', () => {
    const { UNSAFE_getAllByType } = render(<ChatDetailScreen />);
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    // First TouchableOpacity is back button
    fireEvent.press(touchables[0]);
    expect(getMockRouter().back).toHaveBeenCalled();
  });
});

describe('ChatDetailScreen (closed negotiation)', () => {
  it('shows ended conversation notice when negotiation is cancelled', () => {
    const expoRouter = require('expo-router');
    const negotiationsHook = require('@/hooks/useNegotiations');
    const originalMock = negotiationsHook.useNegotiation;
    negotiationsHook.useNegotiation = () => ({
      data: {
        id: 'conn123',
        offererUid: 'user-other',
        status: 'cancelled',
        fare: null,
        note: null,
        departureTime: null,
        pickupLocation: 'A',
        dropoffLocation: 'B',
        confirmedByOfferer: false,
        confirmedByRequester: false,
        lastEditedBy: null,
      },
      isLoading: false,
    });

    const { getByText } = render(<ChatDetailScreen />);
    expect(getByText('Cuộc trò chuyện này đã kết thúc.')).toBeTruthy();

    // Restore
    negotiationsHook.useNegotiation = originalMock;
  });
});
