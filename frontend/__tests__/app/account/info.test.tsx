import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import PersonalInfoScreen from '../../../app/(tabs)/account/Info';

// router is used directly in the component (not useRouter)
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  Link: ({ children }: any) => children,
  Redirect: () => null,
}));

// Suppress console.log from handleSave
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('PersonalInfoScreen (Info.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<PersonalInfoScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the header title', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Thông tin cá nhân')).toBeTruthy();
  });

  it('renders the change avatar button', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Thay đổi ảnh đại diện')).toBeTruthy();
  });

  it('renders the full name field label', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Họ và tên')).toBeTruthy();
  });

  it('renders the email field label', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Email sinh viên')).toBeTruthy();
  });

  it('renders the email validation hint', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('* Email phải kết thúc bằng @student.edu.vn')).toBeTruthy();
  });

  it('renders the gender field label', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Giới tính')).toBeTruthy();
  });

  it('renders all three gender buttons', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Nam')).toBeTruthy();
    expect(getByText('Nữ')).toBeTruthy();
    expect(getByText('Khác')).toBeTruthy();
  });

  it('renders the save button', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Lưu thay đổi')).toBeTruthy();
  });

  it('renders full name input with mock data value', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    expect(getByDisplayValue('Nguyễn Văn An')).toBeTruthy();
  });

  it('renders email input with mock data value', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    expect(getByDisplayValue('an.nv20456@student.edu.vn')).toBeTruthy();
  });

  it('allows changing the full name', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    const input = getByDisplayValue('Nguyễn Văn An');
    fireEvent.changeText(input, 'Trần Thị Bình');
    expect(getByDisplayValue('Trần Thị Bình')).toBeTruthy();
  });

  it('allows changing the email', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    const input = getByDisplayValue('an.nv20456@student.edu.vn');
    fireEvent.changeText(input, 'test@student.edu.vn');
    expect(getByDisplayValue('test@student.edu.vn')).toBeTruthy();
  });

  it('pressing Nữ (female) changes gender selection', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    const femaleButton = getByText('Nữ');
    fireEvent.press(femaleButton);
    // After pressing female, the female button should now be rendered (still present)
    expect(getByText('Nữ')).toBeTruthy();
  });

  it('pressing Khác (other) changes gender selection', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    const otherButton = getByText('Khác');
    fireEvent.press(otherButton);
    expect(getByText('Khác')).toBeTruthy();
  });

  it('pressing Nam (male) re-selects male gender', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    // Switch to female first
    fireEvent.press(getByText('Nữ'));
    // Switch back to male
    fireEvent.press(getByText('Nam'));
    expect(getByText('Nam')).toBeTruthy();
  });

  it('pressing Lưu thay đổi calls console.log with updated values', () => {
    const { getByText, getByDisplayValue } = render(<PersonalInfoScreen />);
    const nameInput = getByDisplayValue('Nguyễn Văn An');
    fireEvent.changeText(nameInput, 'New Name');
    fireEvent.press(getByText('Lưu thay đổi'));
    expect(console.log).toHaveBeenCalledWith('Đã lưu thông tin:', {
      fullName: 'New Name',
      email: 'an.nv20456@student.edu.vn',
      gender: 'male',
    });
  });

  it('pressing back button does not throw', () => {
    const { UNSAFE_getAllByType } = render(<PersonalInfoScreen />);
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    // First touchable is the back arrow — pressing it should not throw
    expect(() => fireEvent.press(touchables[0])).not.toThrow();
  });

  it('pressing save with female gender passes correct gender', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    fireEvent.press(getByText('Nữ'));
    fireEvent.press(getByText('Lưu thay đổi'));
    expect(console.log).toHaveBeenCalledWith('Đã lưu thông tin:', expect.objectContaining({
      gender: 'female',
    }));
  });

  it('pressing save with other gender passes correct gender', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    fireEvent.press(getByText('Khác'));
    fireEvent.press(getByText('Lưu thay đổi'));
    expect(console.log).toHaveBeenCalledWith('Đã lưu thông tin:', expect.objectContaining({
      gender: 'other',
    }));
  });

  describe('Platform-specific behavior', () => {
    it('renders on non-ios platform without crashing', () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'android' });
      const { toJSON } = render(<PersonalInfoScreen />);
      expect(toJSON()).toBeTruthy();
      Object.defineProperty(Platform, 'OS', { get: () => originalOS });
    });
  });
});
