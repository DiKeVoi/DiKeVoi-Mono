import { render, fireEvent, act } from '@testing-library/react-native';
import React from 'react';

// IMPORTANT: jest.mock is hoisted before variable declarations.
// Variables defined with const/let before jest.mock are in the temporal dead zone
// when the mock factory runs. Instead we create the mock fns inside the factory
// and retrieve them after import via require().

jest.mock('expo-router', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    Link: ({ children }: any) => children,
    Redirect: () => null,
    useRouter: () => mockRouter,
    useLocalSearchParams: jest.fn(() => ({})),
    usePathname: () => '/',
    router: mockRouter,
  };
});

jest.mock('@/hooks/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    login: jest.fn().mockImplementation((_email: string, otp: string) => {
      if (otp !== '123456') throw new Error('Invalid OTP');
    }),
    logout: jest.fn(),
    user: null,
    isLoading: false,
  })),
}));

jest.mock('@/services/auth', () => ({
  authService: {
    sendOtp: jest.fn().mockResolvedValue(undefined),
    verifyOtp: jest.fn().mockResolvedValue(undefined),
  },
}));

import OTPScreen from '../../app/(auth)/otp';

// Access the mocked router functions after module resolution
function getMockRouter() {
  return require('expo-router').router as {
    push: jest.Mock;
    replace: jest.Mock;
    back: jest.Mock;
    canGoBack: jest.Mock;
  };
}

function getMockSearchParams() {
  return require('expo-router').useLocalSearchParams as jest.Mock;
}

// Helper: get the TouchableOpacity instances from a rendered component
function getTouchables(component: ReturnType<typeof render>) {
  const { TouchableOpacity } = require('react-native');
  return component.UNSAFE_getAllByType(TouchableOpacity);
}

// Helper: get TextInput instances (the 6 OTP inputs)
function getOtpInputs(component: ReturnType<typeof render>) {
  const { TextInput } = require('react-native');
  return component.UNSAFE_getAllByType(TextInput);
}

describe('OTPScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMockSearchParams().mockReturnValue({});
    // Re-apply canGoBack default after clearAllMocks
    getMockRouter().canGoBack.mockReturnValue(true);
    // Re-apply auth mock after clearAllMocks
    const { useAuth } = require('@/hooks/AuthContext');
    useAuth.mockReturnValue({
      login: jest.fn().mockImplementation((_email: string, otp: string) => {
        if (otp !== '123456') throw new Error('Invalid OTP');
      }),
      logout: jest.fn(),
      user: null,
      isLoading: false,
    });
    // Re-apply authService mock after clearAllMocks
    require('@/services/auth').authService.sendOtp.mockResolvedValue(undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // -------------------------
  // Rendering
  // -------------------------

  it('renders without crashing', () => {
    const { toJSON } = render(<OTPScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the OTP title', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Xác thực OTP')).toBeTruthy();
  });

  it('renders the instruction text', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Vui lòng nhập mã gồm 6 chữ số đã được gửi đến email:')).toBeTruthy();
  });

  it('renders fallback email when no param is passed', () => {
    getMockSearchParams().mockReturnValue({});
    const { getByText } = render(<OTPScreen />);
    expect(getByText('sinhvien@student.edu.vn')).toBeTruthy();
  });

  it('renders the email from search params when provided', () => {
    getMockSearchParams().mockReturnValue({ email: 'test@student.edu.vn' });
    const { getByText } = render(<OTPScreen />);
    expect(getByText('test@student.edu.vn')).toBeTruthy();
  });

  it('renders 6 OTP TextInput fields', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    expect(inputs.length).toBe(6);
  });

  it('renders the confirm button', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Xác nhận')).toBeTruthy();
  });

  it('renders the resend text prompt', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Chưa nhận được mã?')).toBeTruthy();
  });

  it('renders the resend button with countdown text initially', () => {
    const { getByText } = render(<OTPScreen />);
    // Text contains ["Gửi lại mã ", "(30s)"] as array children
    expect(getByText(/Gửi lại mã/)).toBeTruthy();
    expect(getByText(/30s/)).toBeTruthy();
  });

  it('renders the back button (first touchable in the header)', () => {
    const comp = render(<OTPScreen />);
    const touchables = getTouchables(comp);
    expect(touchables.length).toBeGreaterThanOrEqual(3);
    expect(touchables[0]).toBeTruthy();
  });

  // -------------------------
  // Back navigation
  // -------------------------

  it('calls router.back() when back button is pressed (canGoBack returns true)', () => {
    getMockRouter().canGoBack.mockReturnValue(true);
    const comp = render(<OTPScreen />);
    const touchables = getTouchables(comp);
    act(() => {
      touchables[0].props.onPress();
    });
    expect(getMockRouter().back).toHaveBeenCalled();
  });

  // -------------------------
  // OTP input behavior
  // -------------------------

  it('allows entering a digit in the first OTP input', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '1');
    expect(inputs[0].props.value).toBe('1');
  });

  it('strips non-numeric characters from OTP input', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], 'a');
    // Non-numeric stripped → value stays empty string
    expect(inputs[0].props.value).toBe('');
  });

  it('strips mixed content leaving only the numeric part', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    // "a2b" → only "2" remains
    fireEvent.changeText(inputs[0], 'a2b');
    expect(inputs[0].props.value).toBe('2');
  });

  it('clears errorMessage when user starts typing after an error', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    const touchables = getTouchables(comp);

    // Fill all 6 inputs with wrong OTP to enable button, then trigger wrong-OTP error
    fireEvent.changeText(inputs[0], '9');
    fireEvent.changeText(inputs[1], '9');
    fireEvent.changeText(inputs[2], '9');
    fireEvent.changeText(inputs[3], '9');
    fireEvent.changeText(inputs[4], '9');
    fireEvent.changeText(inputs[5], '9');
    act(() => { touchables[1].props.onPress(); });
    expect(comp.getByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeTruthy();

    // Type in any input → error should clear
    fireEvent.changeText(inputs[0], '1');
    expect(comp.queryByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeNull();
  });

  // -------------------------
  // handleVerify – incomplete OTP
  // -------------------------

  it('shows error when verify is called with zero digits entered', () => {
    const comp = render(<OTPScreen />);
    const touchables = getTouchables(comp);
    act(() => { touchables[1].props.onPress(); });
    expect(comp.getByText('Vui lòng nhập đủ 6 số OTP.')).toBeTruthy();
  });

  it('shows error when verify is called with fewer than 6 digits', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    const touchables = getTouchables(comp);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    act(() => { touchables[1].props.onPress(); });
    expect(comp.getByText('Vui lòng nhập đủ 6 số OTP.')).toBeTruthy();
  });

  // -------------------------
  // handleVerify – wrong OTP
  // -------------------------

  it('shows error when incorrect OTP "999999" is entered', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    const touchables = getTouchables(comp);
    fireEvent.changeText(inputs[0], '9');
    fireEvent.changeText(inputs[1], '9');
    fireEvent.changeText(inputs[2], '9');
    fireEvent.changeText(inputs[3], '9');
    fireEvent.changeText(inputs[4], '9');
    fireEvent.changeText(inputs[5], '9');
    act(() => { touchables[1].props.onPress(); });
    expect(comp.getByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeTruthy();
  });

  // -------------------------
  // handleVerify – correct OTP
  // -------------------------

  it('navigates to /(tabs)/home on correct OTP "123456"', async () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');
    fireEvent.changeText(inputs[4], '5');
    fireEvent.changeText(inputs[5], '6');
    const touchables = getTouchables(comp);
    await act(async () => { touchables[1].props.onPress(); });
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('navigates to home via fireEvent.press when button is enabled', async () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');
    fireEvent.changeText(inputs[4], '5');
    fireEvent.changeText(inputs[5], '6');
    await act(async () => { fireEvent.press(comp.getByText('Xác nhận')); });
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  // -------------------------
  // Confirm button disabled state
  // -------------------------

  it('confirm button is disabled when OTP is incomplete', () => {
    const comp = render(<OTPScreen />);
    const touchables = getTouchables(comp);
    // Button at index 1 (after back button), before resend
    expect(touchables[1].props.disabled).toBe(true);
  });

  it('confirm button is enabled when all 6 digits are entered', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');
    fireEvent.changeText(inputs[4], '5');
    fireEvent.changeText(inputs[5], '6');
    const touchables = getTouchables(comp);
    expect(touchables[1].props.disabled).toBe(false);
  });

  // -------------------------
  // Resend button / countdown
  // -------------------------

  it('resend button is disabled while countdown > 0', () => {
    const comp = render(<OTPScreen />);
    const touchables = getTouchables(comp);
    const resend = touchables[touchables.length - 1];
    expect(resend.props.disabled).toBe(true);
  });

  it('countdown decrements by 1 after 1 second', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText(/30s/)).toBeTruthy();
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByText(/29s/)).toBeTruthy();
  });

  it('countdown decrements by 2 after 2 seconds', () => {
    const { getByText } = render(<OTPScreen />);
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByText(/28s/)).toBeTruthy();
  });

  it('resend button becomes enabled after countdown reaches 0', () => {
    const comp = render(<OTPScreen />);
    // Advance timers 1 second at a time in separate act() calls to properly chain
    // each useEffect → setTimeout → setState → re-render → new useEffect → new setTimeout
    for (let i = 0; i < 30; i++) {
      act(() => { jest.advanceTimersByTime(1000); });
    }
    // Re-query after all re-renders settle
    const touchables = getTouchables(comp);
    const resend = touchables[touchables.length - 1];
    expect(resend.props.disabled).toBe(false);
  });

  it('resend button text shows no countdown seconds when timer is at 0', () => {
    const comp = render(<OTPScreen />);
    for (let i = 0; i < 30; i++) {
      act(() => { jest.advanceTimersByTime(1000); });
    }
    // No seconds pattern (like "30s", "5s") should remain in the text
    expect(comp.queryByText(/\d+s/)).toBeNull();
  });

  it('resend resets OTP fields and countdown when triggered at 0', async () => {
    const comp = render(<OTPScreen />);

    // Fill in some digits
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '5');
    fireEvent.changeText(inputs[1], '6');

    // Advance countdown to 0 one second at a time
    for (let i = 0; i < 30; i++) {
      act(() => { jest.advanceTimersByTime(1000); });
    }

    // Press resend (re-query touchables after re-renders)
    // handleResendOtp is async (calls authService.sendOtp), so use async act
    const touchables = getTouchables(comp);
    await act(async () => { touchables[touchables.length - 1].props.onPress(); });

    // OTP inputs should be cleared (re-query after state update)
    const resetInputs = getOtpInputs(comp);
    expect(resetInputs[0].props.value).toBe('');
    expect(resetInputs[1].props.value).toBe('');

    // Countdown should restart
    expect(comp.getByText(/30s/)).toBeTruthy();
  });

  it('resend does nothing when countdown is still active', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '5');

    // Countdown still active (30s)
    expect(inputs[0].props.value).toBe('5');
    expect(comp.getByText(/30s/)).toBeTruthy();
  });

  // -------------------------
  // handleKeyPress (backspace navigation)
  // -------------------------

  it('handles Backspace on non-empty input at index > 0 without navigating back', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[1], '2');
    fireEvent(inputs[1], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    // Value unchanged, no crash
    expect(inputs[1].props.value).toBe('2');
  });

  it('handles Backspace on empty input at index 0 without crashing', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[0], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(inputs[0].props.value).toBe('');
  });

  it('handles Backspace on empty input at index 1 (attempts to focus index 0)', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[1], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    // No crash expected; focus attempted
    expect(inputs[0].props.value).toBe('');
  });

  it('handles Backspace on empty input at index 2 (attempts to focus index 1)', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[2], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(inputs[1].props.value).toBe('');
  });

  it('handles Backspace on empty input at index 3 (attempts to focus index 2)', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[3], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(inputs[2].props.value).toBe('');
  });

  it('handles Backspace on empty input at index 4 (attempts to focus index 3)', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[4], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(inputs[3].props.value).toBe('');
  });

  it('handles Backspace on empty input at index 5 (attempts to focus index 4)', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[5], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(inputs[4].props.value).toBe('');
  });

  it('handles non-Backspace key event without side effects', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent(inputs[0], 'keyPress', { nativeEvent: { key: 'Enter' } });
    expect(inputs[0].props.value).toBe('');
  });

  // -------------------------
  // Error display
  // -------------------------

  it('does not render error text initially', () => {
    const { queryByText } = render(<OTPScreen />);
    expect(queryByText('Vui lòng nhập đủ 6 số OTP.')).toBeNull();
    expect(queryByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeNull();
  });

  it('clears error message when user types after a wrong-OTP error', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    const touchables = getTouchables(comp);

    fireEvent.changeText(inputs[0], '9');
    fireEvent.changeText(inputs[1], '9');
    fireEvent.changeText(inputs[2], '9');
    fireEvent.changeText(inputs[3], '9');
    fireEvent.changeText(inputs[4], '9');
    fireEvent.changeText(inputs[5], '9');
    act(() => { touchables[1].props.onPress(); });
    expect(comp.getByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeTruthy();

    fireEvent.changeText(inputs[0], '1');
    expect(comp.queryByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeNull();
  });

  // -------------------------
  // OTP input styling branches
  // -------------------------

  it('applies error border style to inputs when there is an error', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    const touchables = getTouchables(comp);

    fireEvent.changeText(inputs[0], '9');
    fireEvent.changeText(inputs[1], '9');
    fireEvent.changeText(inputs[2], '9');
    fireEvent.changeText(inputs[3], '9');
    fireEvent.changeText(inputs[4], '9');
    fireEvent.changeText(inputs[5], '9');
    act(() => { touchables[1].props.onPress(); });

    // After error, inputs should have error styling (border-red-500)
    expect(inputs[0].props.className).toContain('border-red-500');
  });

  it('applies filled (active) border style when digit entered and no error', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    fireEvent.changeText(inputs[0], '1');
    expect(inputs[0].props.className).toContain('border-[#152249]');
  });

  it('applies default border style to empty inputs with no error', () => {
    const comp = render(<OTPScreen />);
    const inputs = getOtpInputs(comp);
    expect(inputs[0].props.className).toContain('border-slate-200');
  });

  // -------------------------
  // Confirm button styling
  // -------------------------

  it('confirm button text has disabled color when OTP is incomplete', () => {
    const { getByText } = render(<OTPScreen />);
    const btnText = getByText('Xác nhận');
    expect(btnText.props.className).toContain('text-slate-500');
  });

  it('confirm button text has active (white) color when 6 digits entered', () => {
    const { getByText, UNSAFE_getAllByType } = render(<OTPScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');
    fireEvent.changeText(inputs[4], '5');
    fireEvent.changeText(inputs[5], '6');
    const btnText = getByText('Xác nhận');
    expect(btnText.props.className).toContain('text-white');
  });
});
