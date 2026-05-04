import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

// IMPORTANT: jest.mock is hoisted above variable declarations.
// Create mock fns inside the factory and retrieve them via require().
jest.mock('expo-router', () => {
  const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
  return {
    Link: ({ children }: any) => children,
    Redirect: () => null,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    router: mockRouter,
  };
});

// Mock image assets used via require()
jest.mock('@/assets/images/dikevoi-logo.png', () => 'dikevoi-logo', { virtual: true });
jest.mock('@/assets/images/google-logo.png', () => 'google-logo', { virtual: true });

import LoginScreen from '../../app/(auth)/login';

function getMockRouter() {
  return require('expo-router').router as { push: jest.Mock; replace: jest.Mock; back: jest.Mock };
}

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // Rendering
  // -------------------------

  it('renders without crashing', () => {
    const { toJSON } = render(<LoginScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the welcome heading', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Chào mừng bạn đến với Đi ké với!')).toBeTruthy();
  });

  it('renders the tagline text', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Cùng trường, cùng đường, cùng đi')).toBeTruthy();
  });

  it('renders email input label', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Email sinh viên')).toBeTruthy();
  });

  it('renders the OTP continue button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Tiếp tục với mã OTP')).toBeTruthy();
  });

  it('renders the Google login button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Đăng nhập với Google')).toBeTruthy();
  });

  it('renders the divider "Hoặc" text', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Hoặc')).toBeTruthy();
  });

  it('renders the hint text for email format when no error', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('* Vui lòng sử dụng email do trường cung cấp để xác thực.')).toBeTruthy();
  });

  it('renders Terms and Privacy policy links', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Điều khoản')).toBeTruthy();
    expect(getByText('Chính sách bảo mật')).toBeTruthy();
  });

  it('renders the email TextInput with correct placeholder', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('yourname@student.edu.vn')).toBeTruthy();
  });

  // -------------------------
  // Email input behavior
  // -------------------------

  it('allows typing in the email input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'test@student.edu.vn');
    expect(input.props.value).toBe('test@student.edu.vn');
  });

  it('input starts empty', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    expect(input.props.value).toBe('');
  });

  // -------------------------
  // Validation errors
  // -------------------------

  it('shows error when submitting with empty email', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng nhập địa chỉ email.')).toBeTruthy();
  });

  it('shows error when submitting whitespace-only email (treated as empty)', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, '   ');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng nhập địa chỉ email.')).toBeTruthy();
  });

  it('shows error when email does not end with .edu.vn', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'user@gmail.com');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn)')).toBeTruthy();
  });

  it('shows error for a partially correct domain (no .edu.vn suffix)', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'user@edu.com');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn)')).toBeTruthy();
  });

  it('hides hint text when there is an error message', () => {
    const { getByText, queryByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng nhập địa chỉ email.')).toBeTruthy();
    expect(queryByText('* Vui lòng sử dụng email do trường cung cấp để xác thực.')).toBeNull();
  });

  it('clears error message when user types after an error', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng nhập địa chỉ email.')).toBeTruthy();
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'a');
    expect(queryByText('Vui lòng nhập địa chỉ email.')).toBeNull();
  });

  it('restores hint text after error is cleared by typing', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    // Trigger error
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    // Type to clear error
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'a');
    // Hint text should be back
    expect(getByText('* Vui lòng sử dụng email do trường cung cấp để xác thực.')).toBeTruthy();
  });

  // -------------------------
  // Successful navigation
  // -------------------------

  it('navigates to OTP screen with trimmed lowercase email on valid .edu.vn email', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, '  User@STUDENT.EDU.VN  ');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(auth)/otp',
      params: { email: 'user@student.edu.vn' },
    });
  });

  it('navigates to OTP screen on a valid email without extra spaces', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'myname@university.edu.vn');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(auth)/otp',
      params: { email: 'myname@university.edu.vn' },
    });
  });

  it('clears error and navigates when valid email submitted after a prior error', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    // First trigger error
    fireEvent.changeText(input, 'bad@gmail.com');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn)')).toBeTruthy();
    // Fix the email
    fireEvent.changeText(input, 'good@school.edu.vn');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(queryByText('Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn)')).toBeNull();
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(auth)/otp',
      params: { email: 'good@school.edu.vn' },
    });
  });

  it('does not call router.push when validation fails', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getMockRouter().push).not.toHaveBeenCalled();
  });

  it('router.push is called exactly once on valid submission', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    fireEvent.changeText(input, 'valid@test.edu.vn');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getMockRouter().push).toHaveBeenCalledTimes(1);
  });

  // -------------------------
  // TextInput styling (error branch)
  // -------------------------

  it('input has default border style when no error', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const input = getByPlaceholderText('yourname@student.edu.vn');
    expect(input.props.className).toContain('border-slate-200');
  });

  it('input has error border style when there is an error', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    const input = getByPlaceholderText('yourname@student.edu.vn');
    expect(input.props.className).toContain('border-red-500');
  });
});
