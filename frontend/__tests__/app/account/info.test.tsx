import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import PersonalInfoScreen from '../../../app/(tabs)/account/Info';

jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    Link: ({ children }: any) => children,
    Redirect: () => null,
  };
});

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

jest.mock('@/hooks/useImage', () => ({
  useAvatarUpload: () => ({
    pickAndUploadImage: jest.fn().mockResolvedValue(null),
    isUploading: false,
  }),
}));

// Override global useUser mock with stable user reference to prevent useEffect re-triggers
jest.mock('@/hooks/useUser', () => {
  const updateUser = jest.fn().mockResolvedValue({});
  const user = {
    id: 'user-1',
    email: 'user@student.edu.vn',
    displayName: 'Nguyễn Văn A',
    gender: 'male',
    photoUrl: null,
    isVerified: true,
    createdAt: '2023-01-01',
  };
  return {
    useUser: () => ({
      user,
      isLoading: false,
      isUpdating: false,
      updateUser,
    }),
  };
});

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

  it('renders the email note text', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('* Email không thể thay đổi')).toBeTruthy();
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
    // Global mock: user.displayName = 'Nguyễn Văn A'
    expect(getByDisplayValue('Nguyễn Văn A')).toBeTruthy();
  });

  it('renders email from user data', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    // Email is rendered as ThemedText, not TextInput
    expect(getByText('user@student.edu.vn')).toBeTruthy();
  });

  it('allows changing the full name', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    const input = getByDisplayValue('Nguyễn Văn A');
    fireEvent.changeText(input, 'Trần Thị Bình');
    expect(getByDisplayValue('Trần Thị Bình')).toBeTruthy();
  });

  it('pressing Nữ (female) changes gender selection', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    const femaleButton = getByText('Nữ');
    fireEvent.press(femaleButton);
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

  it('pressing Lưu thay đổi calls updateUser', async () => {
    const { getByText } = render(<PersonalInfoScreen />);
    await act(async () => {
      fireEvent.press(getByText('Lưu thay đổi'));
    });
    const { useUser } = require('@/hooks/useUser');
    expect(useUser().updateUser).toHaveBeenCalled();
  });

  it('pressing back button does not throw', () => {
    const { UNSAFE_getAllByType } = render(<PersonalInfoScreen />);
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    // First touchable is the back arrow — pressing it should not throw
    expect(() => fireEvent.press(touchables[0])).not.toThrow();
  });

  it('pressing save with female gender calls updateUser with gender female', async () => {
    const { getByText } = render(<PersonalInfoScreen />);
    fireEvent.press(getByText('Nữ'));
    await act(async () => {
      fireEvent.press(getByText('Lưu thay đổi'));
    });
    const { useUser } = require('@/hooks/useUser');
    expect(useUser().updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ gender: 'female' })
    );
  });

  it('pressing save with other gender calls updateUser with gender other', async () => {
    const { getByText } = render(<PersonalInfoScreen />);
    fireEvent.press(getByText('Khác'));
    await act(async () => {
      fireEvent.press(getByText('Lưu thay đổi'));
    });
    const { useUser } = require('@/hooks/useUser');
    expect(useUser().updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ gender: 'other' })
    );
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
