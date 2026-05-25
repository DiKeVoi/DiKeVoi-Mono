jest.mock('expo-router', () => ({
  Link: ({ children, asChild }: any) => (children),
  Redirect: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

jest.mock('expo-image', () => ({ Image: 'Image' }));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({}),
  WebBrowserPresentationStyle: { AUTOMATIC: 'AUTOMATIC' },
}));

jest.mock('expo-symbols', () => ({ SymbolView: 'SymbolView' }));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('lucide-react-native', () => {
  const MockIcon = () => null;
  return new Proxy({}, { get: () => MockIcon });
});

jest.mock('@react-navigation/elements', () => ({
  PlatformPressable: ({ children, onPress, onPressIn, ...rest }: any) => {
    const { TouchableOpacity } = require('react-native');
    const React = require('react');
    return React.createElement(TouchableOpacity, { onPress, onPressIn, ...rest }, children);
  },
}));

jest.mock('expo-router/build/global-state/routing', () => ({
  navigate: jest.fn(),
}));

jest.mock('react-native-worklets', () => ({
  createSerializable: jest.fn((val: any) => val),
  isWorkletFunction: jest.fn(() => false),
  RuntimeKind: { UI: 0, JS: 1 },
  scheduleOnUI: jest.fn((fn: any) => fn),
  serializableMappingCache: new Map(),
  makeShareable: jest.fn((val: any) => val),
  makeShareableCloneOnUIRecursive: jest.fn((val: any) => val),
  makeShareableCloneRecursive: jest.fn((val: any) => val),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/hooks/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [
      { id: 'n-1', userId: 'u-1', type: 'ride_request', title: 'Nguyễn Văn A yêu cầu kết nối với bạn', body: null, relatedId: 'req_123', isRead: false, createdAt: '2026-05-07T10:00:00' },
      { id: 'n-2', userId: 'u-1', type: 'negotiation_accepted', title: 'Nguyễn Văn A đã đồng ý kết nối với bạn', body: null, relatedId: 'c1', isRead: true, createdAt: '2026-05-07T10:00:00' },
      { id: 'n-3', userId: 'u-1', type: 'ride_completed', title: 'Bạn đã hoàn thành chuyến đi với Nguyễn Văn A', body: null, relatedId: 'c2', isRead: false, createdAt: '2026-05-07T10:00:00' },
      { id: 'n-4', userId: 'u-1', type: 'ride_cancelled', title: 'Nguyễn Văn A đã hủy chuyến đi với bạn.', body: null, relatedId: 'c3', isRead: false, createdAt: '2026-05-07T10:00:00' },
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

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => React.createElement(View, props, children),
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    })),
    removeChannel: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

jest.mock('@/hooks/useRides', () => ({
  useRides: () => ({ data: [], isLoading: false }),
  useActiveRides: () => ({ data: [], isLoading: false }),
  useRide: () => ({ data: null, isLoading: false }),
  useUpdateRideStatus: () => ({ mutate: jest.fn(), isPending: false }),
  useStartRide: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useFinishRide: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useConfirmPayment: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  RIDES_KEY: 'rides',
}));

jest.mock('@/hooks/useNegotiations', () => ({
  useNegotiations: () => ({ data: [], isLoading: false }),
  useNegotiation: () => ({ data: null, isLoading: false }),
  useNegotiationUsers: () => ({ data: null, isLoading: false }),
  useCreateNegotiation: () => ({ mutateAsync: jest.fn().mockResolvedValue({ id: 'neg-1' }), isPending: false }),
  useUpdateNegotiation: () => ({ mutate: jest.fn(), isPending: false }),
  useConfirmNegotiation: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  NEGOTIATIONS_KEY: 'negotiations',
}));

jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1', email: 'user@student.edu.vn', displayName: 'Nguyễn Văn A', gender: 'male', photoUrl: null, isVerified: true, createdAt: '2023-01-01' },
    isLoading: false,
    updateUser: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

jest.mock('@/hooks/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
    login: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

jest.mock('@/hooks/useRidePosts', () => ({
  useMyRidePosts: () => ({
    data: [
      { id: 'rp-1', userId: 'u-1', type: 'request', status: 'open', originLocation: 'KTX Khu B', destinationLocation: 'Nhà văn hóa sinh viên', departureTime: '2026-05-15T07:30:00', seatsAvailable: 1, isRecurring: false, preferredGender: null, description: null, createdAt: '2026-05-07T09:00:00', updatedAt: '2026-05-07T09:00:00' },
      { id: 'rp-2', userId: 'u-1', type: 'request', status: 'open', originLocation: 'KTX Khu B', destinationLocation: 'Nhà văn hóa sinh viên', departureTime: '2026-05-16T07:30:00', seatsAvailable: 1, isRecurring: false, preferredGender: null, description: null, createdAt: '2026-05-07T09:00:00', updatedAt: '2026-05-07T09:00:00' },
      { id: 'rp-3', userId: 'u-1', type: 'request', status: 'open', originLocation: 'KTX Khu B', destinationLocation: 'Nhà văn hóa sinh viên', departureTime: '2026-05-17T07:30:00', seatsAvailable: 1, isRecurring: false, preferredGender: null, description: null, createdAt: '2026-05-07T09:00:00', updatedAt: '2026-05-07T09:00:00' },
      { id: 'rp-4', userId: 'u-1', type: 'offer', status: 'matched', originLocation: 'KTX Khu B', destinationLocation: 'Nhà văn hóa sinh viên', departureTime: '2026-05-18T07:30:00', seatsAvailable: 1, isRecurring: false, preferredGender: null, description: null, createdAt: '2026-05-07T09:00:00', updatedAt: '2026-05-07T09:00:00' },
      { id: 'rp-5', userId: 'u-1', type: 'request', status: 'open', originLocation: 'KTX Khu B', destinationLocation: 'Nhà văn hóa sinh viên', departureTime: '2026-05-19T07:30:00', seatsAvailable: 1, isRecurring: false, preferredGender: null, description: null, createdAt: '2026-05-07T09:00:00', updatedAt: '2026-05-07T09:00:00' },
    ],
    isLoading: false,
    isSuccess: true,
  }),
  useRidePosts: () => ({ data: [], isLoading: false }),
  useCreateRidePost: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
  useDeleteRidePost: () => ({ mutate: jest.fn(), isPending: false }),
  RIDE_POSTS_KEY: 'ridePosts',
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotificationList: () => ({ data: [], isLoading: false }),
  useUnreadCount: () => ({ data: 0, isLoading: false }),
  useMarkRead: () => ({ mutate: jest.fn() }),
  useMarkAllRead: () => ({ mutate: jest.fn() }),
  NOTIFICATIONS_KEY: 'notifications',
}));
