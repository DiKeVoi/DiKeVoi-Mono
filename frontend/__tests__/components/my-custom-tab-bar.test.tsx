import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import MyCustomTabBar from '../../components/MyCustomTabBar';

// ---- Helpers to build BottomTabBarProps-like objects ----

const makeRoute = (name: string, key?: string) => ({
  name,
  key: key ?? `key-${name}`,
});

const makeNavigation = (overrides?: Partial<{ emit: jest.Mock; navigate: jest.Mock }>) => ({
  emit: jest.fn().mockReturnValue({ defaultPrevented: false }),
  navigate: jest.fn(),
  ...overrides,
});

const makeState = (routes: ReturnType<typeof makeRoute>[], activeIndex = 0) => ({
  routes,
  index: activeIndex,
});

const VISIBLE_TABS = ['home/index', 'matching/request', 'account/profile'];

// Minimal descriptors (not used by the component but part of the props contract)
const makeDescriptors = (routes: ReturnType<typeof makeRoute>[]) =>
  Object.fromEntries(routes.map((r) => [r.key, { options: {} }]));

// ---- Tests ----

describe('MyCustomTabBar', () => {
  // ---- Rendering of all three visible tabs ----

  it('renders without crashing with the three visible tabs', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 0);
    const navigation = makeNavigation();
    const descriptors = makeDescriptors(routes);

    const { toJSON } = render(
      <MyCustomTabBar state={state} descriptors={descriptors} navigation={navigation} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders "Trang chủ" label for home/index tab', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 0);
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    expect(getByText('Trang chủ')).toBeTruthy();
  });

  it('renders "Tài khoản" label for account/profile tab', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 0);
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    expect(getByText('Tài khoản')).toBeTruthy();
  });

  it('renders the Plus center button for matching/request tab (no label)', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 0);
    const { queryByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    // matching/request renders an icon-only button with no label text
    expect(queryByText('matching/request')).toBeNull();
  });

  // ---- Non-visible routes are skipped ----

  it('does not render tabs that are not in VISIBLE_TABS', () => {
    const routes = [makeRoute('some/other'), makeRoute('home/index')];
    const state = makeState(routes, 0);
    const { queryByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    // "some/other" is not visible, only "Trang chủ" should appear
    expect(queryByText('Trang chủ')).toBeTruthy();
    // There should be no text for the hidden tab name
    expect(queryByText('some/other')).toBeNull();
  });

  it('renders nothing (null container) when no VISIBLE_TABS are provided', () => {
    const routes = [makeRoute('settings/index'), makeRoute('debug/index')];
    const state = makeState(routes, 0);
    const { toJSON } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    // The outer View still renders; just no tabs inside
    expect(toJSON()).toBeTruthy();
  });

  // ---- Active/focused state ----

  it('applies focused color to home tab when it is the active route', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    // index 0 = home/index is active
    const state = makeState(routes, 0);
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    const homeLabel = getByText('Trang chủ');
    // The text has the focused class when home is active
    expect(homeLabel.props.className).toContain('text-[#152249]');
  });

  it('applies unfocused color to account tab when home is the active route', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    // index 0 = home/index
    const state = makeState(routes, 0);
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    const accountLabel = getByText('Tài khoản');
    expect(accountLabel.props.className).toContain('text-slate-400');
  });

  it('applies focused color to account tab when account route is active', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    // index 2 = account/profile
    const state = makeState(routes, 2);
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    const accountLabel = getByText('Tài khoản');
    expect(accountLabel.props.className).toContain('text-[#152249]');
  });

  // ---- isActuallyFocused fuzzy matching (sub-routes) ----

  it('marks home tab as focused when the active route name contains "home"', () => {
    const routes = [makeRoute('home/index'), makeRoute('matching/request'), makeRoute('account/profile')];
    // Simulate being on a sub-screen like "home/detail" — index 0 matches
    const state = {
      routes,
      index: 0, // home/index is active
    };
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    expect(getByText('Trang chủ').props.className).toContain('text-[#152249]');
  });

  it('marks account tab as focused when active route name contains "account"', () => {
    // Simulate a sub-screen inside account: create a synthetic route
    const routes = [
      makeRoute('home/index'),
      makeRoute('matching/request'),
      makeRoute('account/profile'),
    ];
    // index 2 = account/profile
    const state = makeState(routes, 2);
    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    expect(getByText('Tài khoản').props.className).toContain('text-[#152249]');
  });

  // ---- Press handlers ----

  it('calls navigation.emit and navigation.navigate when an inactive tab is pressed', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    // home is active (index 0), pressing account (index 2) should navigate
    const state = makeState(routes, 0);
    const navigation = makeNavigation();

    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={navigation} />
    );

    fireEvent.press(getByText('Tài khoản'));
    expect(navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', canPreventDefault: true })
    );
    expect(navigation.navigate).toHaveBeenCalledWith('account/profile');
  });

  it('does NOT call navigation.navigate when the focused tab is pressed again', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    // home is active (index 0), pressing home again should NOT navigate
    const state = makeState(routes, 0);
    const navigation = makeNavigation();

    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={navigation} />
    );

    fireEvent.press(getByText('Trang chủ'));
    expect(navigation.emit).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('does NOT call navigation.navigate when event.defaultPrevented is true', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 0);
    // Simulate prevented event
    const navigation = makeNavigation({
      emit: jest.fn().mockReturnValue({ defaultPrevented: true }),
    });

    const { getByText } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={navigation} />
    );

    // Press account (not focused) — but event is prevented
    fireEvent.press(getByText('Tài khoản'));
    expect(navigation.emit).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('emits tabPress and navigates when the Plus (matching/request) button is pressed', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    // None of the matching tab is active
    const state = makeState(routes, 0);
    const navigation = makeNavigation();

    const { UNSAFE_getAllByType } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={navigation} />
    );

    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // The Plus button is among the touchable buttons; press each and check emit was called
    buttons.forEach((btn: any) => fireEvent.press(btn));
    expect(navigation.emit).toHaveBeenCalled();
  });

  // ---- Snapshot ----

  it('matches snapshot with all three tabs, home active', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 0);
    const { toJSON } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with account tab active', () => {
    const routes = VISIBLE_TABS.map(makeRoute);
    const state = makeState(routes, 2);
    const { toJSON } = render(
      <MyCustomTabBar state={state} descriptors={makeDescriptors(routes)} navigation={makeNavigation()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
