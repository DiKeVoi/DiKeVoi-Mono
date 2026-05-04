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
