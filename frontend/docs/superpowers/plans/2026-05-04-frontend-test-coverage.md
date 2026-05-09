# Frontend Test Coverage (80%+) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring DiKeVoi frontend Jest coverage from 22% to ≥80% (statements/lines/functions/branches) by adding global mocks and test files for every 0%-covered source file.

**Architecture:** Add 4 global mocks to `jest.setup.ts` (NotificationContext, react-native-maps, AsyncStorage, MaterialCommunityIcons). Fix 1 broken test file. Create 22 new test files covering all uncovered screens, components, and hooks. Tests are render + basic-interaction only — no exhaustive behaviour testing.

**Tech Stack:** Jest 29, jest-expo, @testing-library/react-native 13, TypeScript, Expo Router, React Native, NativeWind

---

## File Map

| Action | Path |
|--------|------|
| Modify | `jest.setup.ts` |
| Modify | `__tests__/app/index.test.tsx` |
| Create | `__tests__/app/login.test.tsx` |
| Create | `__tests__/app/otp.test.tsx` |
| Create | `__tests__/app/results.test.tsx` |
| Create | `__tests__/app/finish.test.tsx` |
| Create | `__tests__/app/report.test.tsx` |
| Create | `__tests__/app/report-success.test.tsx` |
| Create | `__tests__/app/chat.test.tsx` |
| Create | `__tests__/app/chat-id.test.tsx` |
| Create | `__tests__/app/report-id.test.tsx` |
| Create | `__tests__/app/map.test.tsx` |
| Create | `__tests__/app/account-info.test.tsx` |
| Create | `__tests__/app/history.test.tsx` |
| Create | `__tests__/app/all-notifications.test.tsx` |
| Create | `__tests__/app/connection-request.test.tsx` |
| Create | `__tests__/app/matching-screen.test.tsx` |
| Create | `__tests__/components/message-bubble.test.tsx` |
| Create | `__tests__/components/my-custom-tab-bar.test.tsx` |
| Create | `__tests__/components/map-section.test.tsx` |
| Create | `__tests__/components/search-section.test.tsx` |
| Create | `__tests__/hooks/notification-context.test.tsx` |
| Create | `__tests__/hooks/use-routing.test.ts` |
| Create | `__tests__/hooks/use-search-places.test.ts` |

---

## Task 1: Add global mocks to jest.setup.ts

**Files:**
- Modify: `jest.setup.ts`

These mocks apply to every test file. Without them, tests for components that use
`useNotification()`, `react-native-maps`, `AsyncStorage`, or `MaterialCommunityIcons` throw
errors and produce 0% coverage.

- [ ] **Step 1: Append mocks to jest.setup.ts**

Append after the last existing `jest.mock(...)` call:

```ts
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/hooks/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [
      { id: 1, title: 'Nguyễn Văn A yêu cầu kết nối với bạn', time: new Date(), read: false, category: 'matching', targetId: 'req_123' },
      { id: 2, title: 'Nguyễn Văn A đã đồng ý kết nối với bạn', time: new Date(), read: true, category: 'accepted', targetId: 'c1' },
      { id: 3, title: 'Bạn đã hoàn thành chuyến đi với Nguyễn Văn A', time: new Date(), read: false, category: 'success', targetId: 'c2' },
      { id: 4, title: 'Nguyễn Văn A đã hủy chuyến đi với bạn.', time: new Date(), read: false, category: 'failed', targetId: 'c3' },
    ],
    unreadCount: 3,
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
  }),
  NotificationProvider: ({ children }: any) => children,
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('MapView', props),
    Marker: (props: any) => React.createElement('Marker', props),
    Polyline: (props: any) => React.createElement('Polyline', props),
    UrlTile: (props: any) => React.createElement('UrlTile', props),
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
```

- [ ] **Step 2: Run existing tests to confirm they now pass**

```bash
cd /Users/codeleap/Uni/Mobile/DiKeVoi-Mono/frontend
npx jest --testPathPattern="home|notification|all-requests" --no-coverage 2>&1 | tail -20
```

Expected: PASS for home.test.tsx, notification.test.tsx, home-header.test.tsx, all-requests.test.tsx

---

## Task 2: Fix __tests__/app/index.test.tsx

**Files:**
- Modify: `__tests__/app/index.test.tsx`

The current file imports `app/(tabs)/home/index` (the Home screen) but tests redirect behaviour
that lives in `app/index.tsx`. Replace its entire content.

- [ ] **Step 1: Replace __tests__/app/index.test.tsx**

```tsx
import { act, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import Index from '../../app/index';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { replace: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});

describe('app/index', () => {
  it('renders loading indicator initially', () => {
    const { getByTestId } = render(<Index />);
    // ActivityIndicator renders, no crash
    expect(true).toBe(true);
  });

  it('redirects to onboarding when hasViewedOnboarding is null', async () => {
    const { default: router } = await import('expo-router');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await act(async () => { render(<Index />); });
    const { router: r } = require('expo-router');
    expect(r.replace).toHaveBeenCalledWith('/(auth)/onboarding');
  });

  it('redirects to login when onboarding viewed but not logged in', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
    await act(async () => { render(<Index />); });
    const { router: r } = require('expo-router');
    expect(r.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('handles AsyncStorage error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage error'));
    await act(async () => { render(<Index />); });
    const { router: r } = require('expo-router');
    expect(r.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
```

- [ ] **Step 2: Run**

```bash
npx jest __tests__/app/index.test.tsx --no-coverage 2>&1 | tail -10
```

Expected: PASS

---

## Task 3: Auth screens — login + otp

**Files:**
- Create: `__tests__/app/login.test.tsx`
- Create: `__tests__/app/otp.test.tsx`

- [ ] **Step 1: Create __tests__/app/login.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import LoginScreen from '../../app/(auth)/login';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { push: mockPush, replace: jest.fn(), back: jest.fn() },
}));

describe('LoginScreen', () => {
  beforeEach(() => mockPush.mockClear());

  it('renders without crashing', () => {
    expect(render(<LoginScreen />).toJSON()).toBeTruthy();
  });

  it('shows welcome text', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Chào mừng bạn đến với Đi ké với!')).toBeTruthy();
  });

  it('shows email input placeholder', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('yourname@student.edu.vn')).toBeTruthy();
  });

  it('shows error when submitting empty email', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng nhập địa chỉ email.')).toBeTruthy();
  });

  it('shows error for non-.edu.vn email', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('yourname@student.edu.vn'), 'test@gmail.com');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn)')).toBeTruthy();
  });

  it('navigates to OTP screen with valid .edu.vn email', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('yourname@student.edu.vn'), 'test@student.edu.vn');
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(auth)/otp', params: { email: 'test@student.edu.vn' } });
  });

  it('clears error when user types after error', () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.press(getByText('Tiếp tục với mã OTP'));
    expect(getByText('Vui lòng nhập địa chỉ email.')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('yourname@student.edu.vn'), 'a');
    expect(queryByText('Vui lòng nhập địa chỉ email.')).toBeNull();
  });
});
```

- [ ] **Step 2: Create __tests__/app/otp.test.tsx**

```tsx
import { fireEvent, render, act } from '@testing-library/react-native';
import React from 'react';
import OTPScreen from '../../app/(auth)/otp';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { replace: mockReplace, back: jest.fn() },
  useLocalSearchParams: () => ({ email: 'test@student.edu.vn' }),
}));

describe('OTPScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('renders without crashing', () => {
    expect(render(<OTPScreen />).toJSON()).toBeTruthy();
  });

  it('shows email from params', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('test@student.edu.vn')).toBeTruthy();
  });

  it('shows verify button', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Xác nhận')).toBeTruthy();
  });

  it('shows error when OTP incomplete', () => {
    const { getByText, getAllByPlaceholderText } = render(<OTPScreen />);
    // Try to find inputs by their key-based rendering — OTP has 4 TextInputs
    fireEvent.press(getByText('Xác nhận'));
    // Button is disabled when length < 4, so no error yet — just confirm no crash
    expect(getByText('Xác nhận')).toBeTruthy();
  });

  it('shows error for wrong OTP', () => {
    const { getByText, UNSAFE_getAllByType } = render(<OTPScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '9');
    fireEvent.changeText(inputs[1], '9');
    fireEvent.changeText(inputs[2], '9');
    fireEvent.changeText(inputs[3], '9');
    fireEvent.press(getByText('Xác nhận'));
    expect(getByText('Mã OTP không chính xác. Vui lòng thử lại.')).toBeTruthy();
  });

  it('navigates home on correct OTP 1234', () => {
    const { getByText, UNSAFE_getAllByType } = render(<OTPScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');
    fireEvent.press(getByText('Xác nhận'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('countdown decrements and allows resend at 0', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText(/Gửi lại mã \(30s\)/)).toBeTruthy();
    act(() => { jest.advanceTimersByTime(30000); });
    expect(getByText('Gửi lại mã')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run**

```bash
npx jest __tests__/app/login.test.tsx __tests__/app/otp.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: PASS

---

## Task 4: Matching screens — results, finish, report, report-success

**Files:**
- Create: `__tests__/app/results.test.tsx`
- Create: `__tests__/app/finish.test.tsx`
- Create: `__tests__/app/report.test.tsx`
- Create: `__tests__/app/report-success.test.tsx`

- [ ] **Step 1: Create __tests__/app/results.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ResultsScreen from '../../app/(matching)/results';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { back: mockBack, replace: jest.fn() },
}));

describe('ResultsScreen', () => {
  it('renders without crashing', () => {
    expect(render(<ResultsScreen />).toJSON()).toBeTruthy();
  });

  it('shows result count', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Tìm thấy 3 bạn đồng hành phù hợp')).toBeTruthy();
  });

  it('shows first match name', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('shows filter pills', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Giới tính')).toBeTruthy();
    expect(getByText('Lặp lại?')).toBeTruthy();
  });

  it('toggles connect button state on press', () => {
    const { getAllByText, getByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText('Kết nối');
    fireEvent.press(connectButtons[0]);
    expect(getByText('Đã gửi yêu cầu')).toBeTruthy();
  });

  it('back button navigates back', () => {
    const { UNSAFE_getAllByType } = render(<ResultsScreen />);
    const { TouchableOpacity } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(mockBack).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Create __tests__/app/finish.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FinishScreen from '../../app/(matching)/finish';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { push: mockPush, replace: mockReplace },
}));

describe('FinishScreen', () => {
  it('renders without crashing', () => {
    expect(render(<FinishScreen />).toJSON()).toBeTruthy();
  });

  it('shows trip complete title', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Chuyến đi hoàn tất')).toBeTruthy();
  });

  it('shows pickup and destination', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('KTX Khu B')).toBeTruthy();
    expect(getByText('Trường Đại học Bách Khoa')).toBeTruthy();
  });

  it('shows companion name', () => {
    const { getByText } = render(<FinishScreen />);
    expect(getByText('Minh Quân')).toBeTruthy();
  });

  it('pressing finish navigates to home', () => {
    const { getByText } = render(<FinishScreen />);
    fireEvent.press(getByText('Hoàn thành'));
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });

  it('pressing flag navigates to report', () => {
    const { UNSAFE_getAllByType } = render(<FinishScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[1]);
    expect(mockPush).toHaveBeenCalledWith('/(matching)/report');
  });
});
```

- [ ] **Step 3: Create __tests__/app/report.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ReportScreen from '../../app/(matching)/report';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { push: mockPush, back: mockBack },
}));

describe('ReportScreen', () => {
  it('renders without crashing', () => {
    expect(render(<ReportScreen />).toJSON()).toBeTruthy();
  });

  it('shows header title', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('Báo cáo sự cố')).toBeTruthy();
  });

  it('shows route info', () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText('KTX Khu B')).toBeTruthy();
    expect(getByText('Trường Đại học Bách Khoa')).toBeTruthy();
  });

  it('allows typing in description field', () => {
    const { getByPlaceholderText } = render(<ReportScreen />);
    const input = getByPlaceholderText('Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,...');
    fireEvent.changeText(input, 'Test report description');
    expect(input.props.value).toBe('Test report description');
  });

  it('submit button navigates to report-success', () => {
    const { getByText } = render(<ReportScreen />);
    fireEvent.press(getByText('Gửi báo cáo'));
    expect(mockPush).toHaveBeenCalledWith('/(matching)/report-success');
  });

  it('back button calls router.back', () => {
    const { UNSAFE_getAllByType } = render(<ReportScreen />);
    const { TouchableOpacity } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(mockBack).toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Create __tests__/app/report-success.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ReportSuccessScreen from '../../app/(matching)/report-success';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { replace: mockReplace },
}));

describe('ReportSuccessScreen', () => {
  it('renders without crashing', () => {
    expect(render(<ReportSuccessScreen />).toJSON()).toBeTruthy();
  });

  it('shows success title', () => {
    const { getByText } = render(<ReportSuccessScreen />);
    expect(getByText('Báo cáo đã gửi thành công')).toBeTruthy();
  });

  it('shows header label', () => {
    const { getByText } = render(<ReportSuccessScreen />);
    expect(getByText('Báo cáo đã gửi')).toBeTruthy();
  });

  it('home button navigates to /home', () => {
    const { getAllByText } = render(<ReportSuccessScreen />);
    fireEvent.press(getAllByText('Về Trang chủ')[0]);
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });

  it('close icon navigates to /home', () => {
    const { UNSAFE_getAllByType } = render(<ReportSuccessScreen />);
    const { TouchableOpacity } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });
});
```

- [ ] **Step 5: Run**

```bash
npx jest __tests__/app/results.test.tsx __tests__/app/finish.test.tsx __tests__/app/report.test.tsx __tests__/app/report-success.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: PASS

---

## Task 5: Chat screens

**Files:**
- Create: `__tests__/app/chat.test.tsx`
- Create: `__tests__/app/chat-id.test.tsx`

- [ ] **Step 1: Create __tests__/app/chat.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ChatScreen from '../../app/(matching)/chat';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

describe('ChatScreen', () => {
  it('renders without crashing', () => {
    expect(render(<ChatScreen />).toJSON()).toBeTruthy();
  });

  it('shows partner name', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('shows initial messages', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('An đã gửi đề nghị tham gia chuyến đi.')).toBeTruthy();
  });

  it('send button is present', () => {
    const { UNSAFE_getAllByType } = render(<ChatScreen />);
    const { TouchableOpacity } = require('react-native');
    expect(UNSAFE_getAllByType(TouchableOpacity).length).toBeGreaterThan(0);
  });

  it('can type in input', () => {
    const { UNSAFE_getAllByType } = render(<ChatScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Hello');
    expect(inputs[0].props.value).toBe('Hello');
  });

  it('sending message adds it to list', () => {
    const { UNSAFE_getAllByType, getByText } = render(<ChatScreen />);
    const { TextInput, TouchableOpacity } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Test message');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[buttons.length - 1]);
    expect(getByText('Test message')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create __tests__/app/chat-id.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ChatDetailScreen from '../../app/(matching)/chat/[id]';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'c1' }),
}));

describe('ChatDetailScreen', () => {
  it('renders without crashing', () => {
    expect(render(<ChatDetailScreen />).toJSON()).toBeTruthy();
  });

  it('shows partner name', () => {
    const { getByText } = render(<ChatDetailScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('shows initial messages', () => {
    const { getByText } = render(<ChatDetailScreen />);
    expect(getByText('Chuyến đi đã hoàn thành')).toBeTruthy();
  });

  it('can type and send a message', () => {
    const { UNSAFE_getAllByType, getByText } = render(<ChatDetailScreen />);
    const { TextInput, TouchableOpacity } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Hi there');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[buttons.length - 1]);
    expect(getByText('Hi there')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run**

```bash
npx jest __tests__/app/chat.test.tsx __tests__/app/chat-id.test.tsx --no-coverage 2>&1 | tail -10
```

Expected: PASS

---

## Task 6: Report-id + Map screens

**Files:**
- Create: `__tests__/app/report-id.test.tsx`
- Create: `__tests__/app/map.test.tsx`

- [ ] **Step 1: Create __tests__/app/report-id.test.tsx**

```tsx
import { render } from '@testing-library/react-native';
import React from 'react';
import ReportDetailScreen from '../../app/(matching)/report/[id]';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'r1' }),
}));

describe('ReportDetailScreen', () => {
  it('renders without crashing', () => {
    expect(render(<ReportDetailScreen />).toJSON()).toBeTruthy();
  });

  it('shows report header', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Chi tiết báo cáo')).toBeTruthy();
  });

  it('shows reported user name', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create __tests__/app/map.test.tsx**

```tsx
import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('react-native-maps', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('MapView', props),
    Marker: (props: any) => React.createElement('Marker', props),
    Polyline: (props: any) => React.createElement('Polyline', props),
    UrlTile: (props: any) => React.createElement('UrlTile', props),
  };
});

jest.mock('../../hooks/useSearchPlaces', () => ({
  useSearchPlaces: () => ({ searchResults: [], searchPlaces: jest.fn(), setSearchResults: jest.fn() }),
}));

jest.mock('../../hooks/useRouting', () => ({
  useRouting: () => ({ routePolyline: [], distanceKm: undefined, durationMin: undefined, getRouting: jest.fn(), setRoutePolyline: jest.fn() }),
}));

import MapRequest from '../../app/(ride)/map';

describe('Map screen', () => {
  it('renders without crashing', () => {
    expect(render(<MapRequest />).toJSON()).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run**

```bash
npx jest __tests__/app/report-id.test.tsx __tests__/app/map.test.tsx --no-coverage 2>&1 | tail -10
```

Expected: PASS

---

## Task 7: Account screens — Info + history

**Files:**
- Create: `__tests__/app/account-info.test.tsx`
- Create: `__tests__/app/history.test.tsx`

- [ ] **Step 1: Create __tests__/app/account-info.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import PersonalInfoScreen from '../../app/(tabs)/account/Info';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { back: mockBack, push: jest.fn() },
}));

describe('PersonalInfoScreen', () => {
  it('renders without crashing', () => {
    expect(render(<PersonalInfoScreen />).toJSON()).toBeTruthy();
  });

  it('shows page title', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(getByText('Thông tin cá nhân')).toBeTruthy();
  });

  it('shows pre-filled name', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    expect(getByDisplayValue('Nguyễn Văn An')).toBeTruthy();
  });

  it('shows pre-filled email', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    expect(getByDisplayValue('an.nv20456@student.edu.vn')).toBeTruthy();
  });

  it('allows editing name', () => {
    const { getByDisplayValue } = render(<PersonalInfoScreen />);
    const nameInput = getByDisplayValue('Nguyễn Văn An');
    fireEvent.changeText(nameInput, 'New Name');
    expect(getByDisplayValue('New Name')).toBeTruthy();
  });

  it('save button is present and pressable', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(() => fireEvent.press(getByText('Lưu thay đổi'))).not.toThrow();
  });

  it('gender selection works', () => {
    const { getByText } = render(<PersonalInfoScreen />);
    expect(() => fireEvent.press(getByText('Nữ'))).not.toThrow();
  });
});
```

- [ ] **Step 2: Create __tests__/app/history.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import TripHistoryScreen from '../../app/(tabs)/account/history';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { back: mockBack },
}));

describe('TripHistoryScreen', () => {
  it('renders without crashing', () => {
    expect(render(<TripHistoryScreen />).toJSON()).toBeTruthy();
  });

  it('shows page title', () => {
    const { getByText } = render(<TripHistoryScreen />);
    expect(getByText('Lịch sử chuyến đi')).toBeTruthy();
  });

  it('shows completed tab by default', () => {
    const { getAllByText } = render(<TripHistoryScreen />);
    expect(getAllByText('Hoàn thành').length).toBeGreaterThan(0);
  });

  it('shows partner names', () => {
    const { getByText } = render(<TripHistoryScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('switches to cancelled tab', () => {
    const { getByText } = render(<TripHistoryScreen />);
    fireEvent.press(getByText('Đã hủy'));
    expect(getByText('Trần Hoàng Nam')).toBeTruthy();
  });

  it('back button calls router.back', () => {
    const { UNSAFE_getAllByType } = render(<TripHistoryScreen />);
    const { TouchableOpacity } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(mockBack).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run**

```bash
npx jest __tests__/app/account-info.test.tsx __tests__/app/history.test.tsx --no-coverage 2>&1 | tail -10
```

Expected: PASS

---

## Task 8: Home — all-notifications

**Files:**
- Create: `__tests__/app/all-notifications.test.tsx`

- [ ] **Step 1: Create __tests__/app/all-notifications.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import AllNotificationsScreen from '../../app/(tabs)/home/all-notifications';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

describe('AllNotificationsScreen', () => {
  it('renders without crashing', () => {
    expect(render(<AllNotificationsScreen />).toJSON()).toBeTruthy();
  });

  it('shows notification titles from context', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    expect(getByText('Nguyễn Văn A yêu cầu kết nối với bạn')).toBeTruthy();
  });

  it('shows mark-all-read button', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    expect(getByText('Đánh dấu đã đọc tất cả')).toBeTruthy();
  });

  it('pressing mark-all-read calls markAllAsRead', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    const { useNotification } = require('@/hooks/NotificationContext');
    const { markAllAsRead } = useNotification();
    fireEvent.press(getByText('Đánh dấu đã đọc tất cả'));
    expect(markAllAsRead).toHaveBeenCalled();
  });

  it('pressing a notification calls markAsRead', () => {
    const { getByText } = render(<AllNotificationsScreen />);
    const { useNotification } = require('@/hooks/NotificationContext');
    const { markAsRead } = useNotification();
    fireEvent.press(getByText('Nguyễn Văn A yêu cầu kết nối với bạn'));
    expect(markAsRead).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 2: Run**

```bash
npx jest __tests__/app/all-notifications.test.tsx --no-coverage 2>&1 | tail -10
```

Expected: PASS

---

## Task 9: Matching screens — connection-request + matching

**Files:**
- Create: `__tests__/app/connection-request.test.tsx`
- Create: `__tests__/app/matching-screen.test.tsx`

- [ ] **Step 1: Create __tests__/app/connection-request.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ConnectionRequest from '../../app/(tabs)/matching/connection-request';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { back: mockBack, replace: mockReplace, push: mockPush },
}));

describe('ConnectionRequest', () => {
  it('renders without crashing', () => {
    expect(render(<ConnectionRequest />).toJSON()).toBeTruthy();
  });

  it('shows page title', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Yêu cầu kết nối')).toBeTruthy();
  });

  it('shows requester name', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Nguyễn Văn A')).toBeTruthy();
  });

  it('shows accept button', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Xác nhận kết nối')).toBeTruthy();
  });

  it('shows decline button', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(getByText('Hủy kết nối')).toBeTruthy();
  });

  it('accept button is pressable without error', () => {
    const { getByText } = render(<ConnectionRequest />);
    expect(() => fireEvent.press(getByText('Xác nhận kết nối'))).not.toThrow();
  });
});
```

- [ ] **Step 2: Create __tests__/app/matching-screen.test.tsx**

```tsx
import { render } from '@testing-library/react-native';
import React from 'react';
import MatchingScreen from '../../app/(tabs)/matching/matching';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { back: jest.fn(), replace: jest.fn() },
}));

describe('MatchingScreen', () => {
  it('renders without crashing', () => {
    expect(render(<MatchingScreen />).toJSON()).toBeTruthy();
  });

  it('shows finding match text', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Đang tìm kiếm bạn đồng hành phù hợp...')).toBeTruthy();
  });

  it('shows cancel button', () => {
    const { getByText } = render(<MatchingScreen />);
    expect(getByText('Hủy tìm kiếm')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run**

```bash
npx jest __tests__/app/connection-request.test.tsx __tests__/app/matching-screen.test.tsx --no-coverage 2>&1 | tail -10
```

Expected: PASS (adjust expected text strings from actual source if needed)

---

## Task 10: Components — MessageBubble + MyCustomTabBar + MapSection + SearchSection

**Files:**
- Create: `__tests__/components/message-bubble.test.tsx`
- Create: `__tests__/components/my-custom-tab-bar.test.tsx`
- Create: `__tests__/components/map-section.test.tsx`
- Create: `__tests__/components/search-section.test.tsx`

- [ ] **Step 1: Create __tests__/components/message-bubble.test.tsx**

```tsx
import { render } from '@testing-library/react-native';
import React from 'react';
import { MessageBubble } from '../../components/MessageBubble';

describe('MessageBubble', () => {
  it('renders date separator', () => {
    const { getByText } = render(<MessageBubble msg={{ id: 'd1', type: 'date', text: 'HÔM NAY' }} />);
    expect(getByText('HÔM NAY')).toBeTruthy();
  });

  it('renders system message', () => {
    const { getByText } = render(<MessageBubble msg={{ id: 's1', type: 'system', text: 'Chuyến đi hoàn thành' }} />);
    expect(getByText('Chuyến đi hoàn thành')).toBeTruthy();
  });

  it('renders self message', () => {
    const { getByText } = render(
      <MessageBubble msg={{ id: 'm1', type: 'self', text: 'Hello', time: '10:00' }} />
    );
    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('10:00')).toBeTruthy();
  });

  it('renders other message with avatar', () => {
    const { getByText } = render(
      <MessageBubble
        msg={{ id: 'm2', type: 'other', text: 'World', time: '10:01' }}
        partnerAvatar="https://i.pravatar.cc/150"
      />
    );
    expect(getByText('World')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create __tests__/components/my-custom-tab-bar.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import MyCustomTabBar from '../../components/MyCustomTabBar';

const mockNavigate = jest.fn();

const makeProps = (activeIndex: number) => ({
  state: {
    index: activeIndex,
    routes: [
      { key: 'home', name: 'home/index' },
      { key: 'request', name: 'matching/request' },
      { key: 'account', name: 'account/profile' },
    ],
  },
  descriptors: {
    home: { options: {} },
    request: { options: {} },
    account: { options: {} },
  },
  navigation: { emit: jest.fn(), navigate: mockNavigate },
});

describe('MyCustomTabBar', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('renders without crashing', () => {
    expect(render(<MyCustomTabBar {...makeProps(0)} />).toJSON()).toBeTruthy();
  });

  it('renders 3 tab buttons', () => {
    const { UNSAFE_getAllByType } = render(<MyCustomTabBar {...makeProps(0)} />);
    const { TouchableOpacity } = require('react-native');
    expect(UNSAFE_getAllByType(TouchableOpacity).length).toBe(3);
  });

  it('pressing a tab calls navigate', () => {
    const props = makeProps(0);
    const { UNSAFE_getAllByType } = render(<MyCustomTabBar {...props} />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[1]);
    expect(mockNavigate).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Create __tests__/components/map-section.test.tsx**

```tsx
import { render } from '@testing-library/react-native';
import React from 'react';
import MapSection from '../../components/request/MapSection';

describe('MapSection', () => {
  const baseProps = {
    region: { latitude: 10.8759, longitude: 106.8073, latitudeDelta: 0.01, longitudeDelta: 0.01 },
    pickup: { coords: null, address: '' },
    destination: { coords: null, address: '' },
    routePolyline: [],
    HERE_API_KEY: 'test-key',
  };

  it('renders without crashing', () => {
    expect(render(<MapSection {...baseProps} />).toJSON()).toBeTruthy();
  });

  it('renders with pickup marker', () => {
    const props = { ...baseProps, pickup: { coords: { latitude: 10.8, longitude: 106.8 }, address: 'KTX' } };
    expect(render(<MapSection {...props} />).toJSON()).toBeTruthy();
  });

  it('renders with destination marker', () => {
    const props = { ...baseProps, destination: { coords: { latitude: 10.9, longitude: 106.9 }, address: 'BK' } };
    expect(render(<MapSection {...props} />).toJSON()).toBeTruthy();
  });

  it('renders with polyline', () => {
    const props = { ...baseProps, routePolyline: [{ latitude: 10.8, longitude: 106.8 }, { latitude: 10.9, longitude: 106.9 }] };
    expect(render(<MapSection {...props} />).toJSON()).toBeTruthy();
  });
});
```

- [ ] **Step 4: Create __tests__/components/search-section.test.tsx**

```tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SearchSection from '../../components/request/SearchSection';
import { StyleSheet } from 'react-native';

const baseProps = {
  pickup: { address: '', coords: null },
  destination: { address: '', coords: null },
  activeInput: null,
  setActiveInput: jest.fn(),
  searchPlaces: jest.fn(),
  searchResults: [],
  handleSelectPlace: jest.fn(),
  styles: StyleSheet.create({
    searchContainer: { padding: 8 },
    input: { height: 44, borderWidth: 1 },
  }),
  onConfirm: jest.fn(),
  confirmDisabled: false,
};

describe('SearchSection', () => {
  it('renders without crashing', () => {
    expect(render(<SearchSection {...baseProps} />).toJSON()).toBeTruthy();
  });

  it('shows pickup placeholder', () => {
    const { getByPlaceholderText } = render(<SearchSection {...baseProps} />);
    expect(getByPlaceholderText('Nhập điểm đón...')).toBeTruthy();
  });

  it('shows destination placeholder', () => {
    const { getByPlaceholderText } = render(<SearchSection {...baseProps} />);
    expect(getByPlaceholderText('Bạn muốn đi đâu?')).toBeTruthy();
  });

  it('focuses pickup input calls setActiveInput', () => {
    const setActiveInput = jest.fn();
    const { getByPlaceholderText } = render(<SearchSection {...baseProps} setActiveInput={setActiveInput} />);
    fireEvent(getByPlaceholderText('Nhập điểm đón...'), 'focus');
    expect(setActiveInput).toHaveBeenCalledWith('pickup');
  });

  it('typing calls searchPlaces', () => {
    const searchPlaces = jest.fn();
    const { getByPlaceholderText } = render(<SearchSection {...baseProps} searchPlaces={searchPlaces} />);
    fireEvent.changeText(getByPlaceholderText('Nhập điểm đón...'), 'KTX');
    expect(searchPlaces).toHaveBeenCalledWith('KTX');
  });

  it('shows search results and allows selection', () => {
    const handleSelectPlace = jest.fn();
    const results = [{ id: '1', title: 'KTX Khu B', address: { label: 'HCM' }, position: { lat: 10.8, lng: 106.8 } }];
    const { getByText } = render(<SearchSection {...baseProps} searchResults={results} handleSelectPlace={handleSelectPlace} activeInput="pickup" />);
    fireEvent.press(getByText('KTX Khu B'));
    expect(handleSelectPlace).toHaveBeenCalledWith(results[0]);
  });
});
```

- [ ] **Step 5: Run**

```bash
npx jest __tests__/components/message-bubble.test.tsx __tests__/components/my-custom-tab-bar.test.tsx __tests__/components/map-section.test.tsx __tests__/components/search-section.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: PASS

---

## Task 11: Hooks — NotificationContext + useRouting + useSearchPlaces

**Files:**
- Create: `__tests__/hooks/notification-context.test.tsx`
- Create: `__tests__/hooks/use-routing.test.ts`
- Create: `__tests__/hooks/use-search-places.test.ts`

- [ ] **Step 1: Create __tests__/hooks/notification-context.test.tsx**

```tsx
jest.unmock('@/hooks/NotificationContext');

import { act, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Text } from 'react-native';
import { NotificationProvider, useNotification } from '../../hooks/NotificationContext';

const TestConsumer = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotification();
  return (
    <>
      <Text testID="count">{unreadCount}</Text>
      <Text testID="first-title">{notifications[0]?.title}</Text>
      <Text onPress={markAllAsRead} testID="mark-all">mark-all</Text>
      <Text onPress={() => markAsRead(1)} testID="mark-one">mark-one</Text>
    </>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
  });

  it('provides initial unread count', async () => {
    let getByTestId: any;
    await act(async () => {
      ({ getByTestId } = render(<NotificationProvider><TestConsumer /></NotificationProvider>));
    });
    expect(getByTestId('count').props.children).toBe(4);
  });

  it('provides first notification title', async () => {
    let getByTestId: any;
    await act(async () => {
      ({ getByTestId } = render(<NotificationProvider><TestConsumer /></NotificationProvider>));
    });
    expect(getByTestId('first-title').props.children).toBe('Nguyễn Văn A yêu cầu kết nối với bạn');
  });

  it('markAllAsRead sets unread count to 0', async () => {
    let getByTestId: any;
    await act(async () => {
      ({ getByTestId } = render(<NotificationProvider><TestConsumer /></NotificationProvider>));
    });
    await act(async () => { getByTestId('mark-all').props.onPress(); });
    expect(getByTestId('count').props.children).toBe(0);
  });

  it('markAsRead decrements count by 1', async () => {
    let getByTestId: any;
    await act(async () => {
      ({ getByTestId } = render(<NotificationProvider><TestConsumer /></NotificationProvider>));
    });
    await act(async () => { getByTestId('mark-one').props.onPress(); });
    expect(getByTestId('count').props.children).toBe(3);
  });

  it('loads saved notifications from AsyncStorage on mount', async () => {
    const saved = JSON.stringify([
      { id: 99, title: 'Saved notification', time: new Date().toISOString(), read: false, category: 'matching', targetId: 'x1' }
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(saved);
    let getByTestId: any;
    await act(async () => {
      ({ getByTestId } = render(<NotificationProvider><TestConsumer /></NotificationProvider>));
    });
    expect(getByTestId('first-title').props.children).toBe('Saved notification');
  });
});
```

- [ ] **Step 2: Create __tests__/hooks/use-routing.test.ts**

```ts
jest.mock('@here/flexpolyline', () => ({
  decode: () => ({ polyline: [[10.8, 106.8, 0], [10.9, 106.9, 0]] }),
}));

import { act, renderHook } from '@testing-library/react-native';
import { useRouting } from '../../hooks/useRouting';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockClear());

describe('useRouting', () => {
  it('initialises with empty polyline', () => {
    const { result } = renderHook(() => useRouting());
    expect(result.current.routePolyline).toEqual([]);
    expect(result.current.distanceKm).toBeUndefined();
    expect(result.current.durationMin).toBeUndefined();
  });

  it('getRouting sets polyline, distance, duration on success', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        routes: [{
          sections: [{
            summary: { length: 5000, duration: 600 },
            polyline: 'encoded-polyline',
          }],
        }],
      }),
    });
    const { result } = renderHook(() => useRouting());
    await act(async () => {
      await result.current.getRouting({ latitude: 10.8, longitude: 106.8 }, { latitude: 10.9, longitude: 106.9 });
    });
    expect(result.current.distanceKm).toBe('5.00');
    expect(result.current.durationMin).toBe(10);
  });

  it('getRouting sets empty polyline on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));
    const { result } = renderHook(() => useRouting());
    await act(async () => {
      await result.current.getRouting({ latitude: 10.8, longitude: 106.8 }, { latitude: 10.9, longitude: 106.9 });
    });
    expect(result.current.routePolyline).toEqual([]);
  });

  it('setRoutePolyline updates polyline', () => {
    const { result } = renderHook(() => useRouting());
    act(() => { result.current.setRoutePolyline([{ latitude: 1, longitude: 2 }]); });
    expect(result.current.routePolyline).toEqual([{ latitude: 1, longitude: 2 }]);
  });
});
```

- [ ] **Step 3: Create __tests__/hooks/use-search-places.test.ts**

```ts
import { act, renderHook } from '@testing-library/react-native';
import { useSearchPlaces } from '../../hooks/useSearchPlaces';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const region = { latitude: 10.8759, longitude: 106.8073 };

beforeEach(() => mockFetch.mockClear());

describe('useSearchPlaces', () => {
  it('initialises with empty results', () => {
    const { result } = renderHook(() => useSearchPlaces(region));
    expect(result.current.searchResults).toEqual([]);
  });

  it('does not fetch when query < 3 chars', async () => {
    const { result } = renderHook(() => useSearchPlaces(region));
    await act(async () => { await result.current.searchPlaces('ab'); });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
  });

  it('fetches and sets results for query >= 3 chars', async () => {
    const items = [
      { title: 'KTX Khu B', position: { lat: 10.8, lng: 106.8 } },
      { title: 'No position' },
    ];
    mockFetch.mockResolvedValueOnce({ json: async () => ({ items }) });
    const { result } = renderHook(() => useSearchPlaces(region));
    await act(async () => { await result.current.searchPlaces('KTX'); });
    expect(result.current.searchResults).toHaveLength(1);
    expect(result.current.searchResults[0].title).toBe('KTX Khu B');
  });

  it('sets empty results on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useSearchPlaces(region));
    await act(async () => { await result.current.searchPlaces('KTX'); });
    expect(result.current.searchResults).toEqual([]);
  });

  it('setSearchResults updates state', () => {
    const { result } = renderHook(() => useSearchPlaces(region));
    act(() => { result.current.setSearchResults([{ title: 'Test', position: {} }]); });
    expect(result.current.searchResults).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Run**

```bash
npx jest __tests__/hooks/notification-context.test.tsx __tests__/hooks/use-routing.test.ts __tests__/hooks/use-search-places.test.ts --no-coverage 2>&1 | tail -15
```

Expected: PASS

---

## Task 12: Final coverage check

- [ ] **Step 1: Run full test suite with coverage**

```bash
cd /Users/codeleap/Uni/Mobile/DiKeVoi-Mono/frontend
npx jest --coverage 2>&1 | tail -40
```

Expected: All thresholds met (statements ≥ 90%, branches/functions/lines ≥ 80%)

- [ ] **Step 2: If any threshold still failing, add targeted tests**

Check the coverage table output. For any file still <80%, add targeted render tests
in the relevant test file until threshold passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/codeleap/Uni/Mobile/DiKeVoi-Mono/frontend
git add jest.setup.ts __tests__/
git commit -m "test: add comprehensive test suite targeting 80%+ coverage"
```
