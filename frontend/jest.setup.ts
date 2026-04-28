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
