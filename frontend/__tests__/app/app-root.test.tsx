import { render, act } from '@testing-library/react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: jest.mock is hoisted above variable declarations.
// We must create mock functions inside the factory and retrieve them via require().
jest.mock('expo-router', () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
  return {
    Link: ({ children }: any) => children,
    Redirect: () => null,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    router: mockRouter,
  };
});

import Index from '../../app/index';

function getMockRouter() {
  return require('expo-router').router as { replace: jest.Mock; push: jest.Mock; back: jest.Mock };
}

// Helper that flushes all pending microtasks / resolved promises
const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('app/index.tsx (root Index)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing (initial loading state)', () => {
    (AsyncStorage.getItem as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { toJSON } = render(<Index />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders ActivityIndicator while async check is pending', () => {
    (AsyncStorage.getItem as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { toJSON } = render(<Index />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('ActivityIndicator');
  });

  it('redirects to onboarding when hasViewedOnboarding is null (first launch)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    render(<Index />);
    await act(async () => {
      await flushPromises();
    });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('hasViewedOnboarding');
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/onboarding');
  });

  it('redirects to login when hasViewedOnboarding is set and user is not logged in', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
    render(<Index />);
    await act(async () => {
      await flushPromises();
    });
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('redirects to login on AsyncStorage.getItem rejection (error branch)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    render(<Index />);
    await act(async () => {
      await flushPromises();
    });
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('calls AsyncStorage.getItem with the correct key exactly once', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    render(<Index />);
    await act(async () => {
      await flushPromises();
    });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('hasViewedOnboarding');
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it('does not redirect to home because isLoggedIn is always false', async () => {
    // Even when onboarding has been viewed, isLoggedIn is hardcoded false
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('viewed');
    render(<Index />);
    await act(async () => {
      await flushPromises();
    });
    expect(getMockRouter().replace).not.toHaveBeenCalledWith('/(tabs)/home');
    expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('only calls router.replace once per mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    render(<Index />);
    await act(async () => {
      await flushPromises();
    });
    expect(getMockRouter().replace).toHaveBeenCalledTimes(1);
  });
});
