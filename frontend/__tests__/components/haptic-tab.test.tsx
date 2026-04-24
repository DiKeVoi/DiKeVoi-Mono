import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text } from 'react-native';
import { HapticTab } from '../../components/haptic-tab';

describe('HapticTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = render(
      <HapticTab>
        <Text>Tab</Text>
      </HapticTab>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('triggers haptic feedback when pressed on iOS', () => {
    const originalEnv = process.env.EXPO_OS;
    process.env.EXPO_OS = 'ios';

    const { getByText } = render(
      <HapticTab onPressIn={jest.fn()}>
        <Text>Tab</Text>
      </HapticTab>
    );
    fireEvent(getByText('Tab'), 'pressIn');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

    process.env.EXPO_OS = originalEnv;
  });

  it('calls onPressIn without crashing on any platform', () => {
    const onPressIn = jest.fn();
    const { getByText } = render(
      <HapticTab onPressIn={onPressIn}>
        <Text>Tab</Text>
      </HapticTab>
    );
    fireEvent(getByText('Tab'), 'pressIn');
    expect(onPressIn).toHaveBeenCalled();
  });

  it('calls the provided onPressIn callback', () => {
    const onPressIn = jest.fn();
    const { getByText } = render(
      <HapticTab onPressIn={onPressIn}>
        <Text>Tab</Text>
      </HapticTab>
    );
    fireEvent(getByText('Tab'), 'pressIn');
    expect(onPressIn).toHaveBeenCalled();
  });
});
