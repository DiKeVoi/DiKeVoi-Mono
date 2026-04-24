import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import ParallaxScrollView from '../../components/parallax-scroll-view';

describe('ParallaxScrollView', () => {
  const headerColors = { dark: '#353636', light: '#D0D0D0' };

  it('renders without crashing', () => {
    const { toJSON } = render(
      <ParallaxScrollView
        headerImage={<View />}
        headerBackgroundColor={headerColors}
      >
        <Text>Content</Text>
      </ParallaxScrollView>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders children content', () => {
    const { getByText } = render(
      <ParallaxScrollView
        headerImage={<View />}
        headerBackgroundColor={headerColors}
      >
        <Text>Page content</Text>
      </ParallaxScrollView>
    );
    expect(getByText('Page content')).toBeTruthy();
  });

  it('renders the header image', () => {
    const { getByTestId } = render(
      <ParallaxScrollView
        headerImage={<View testID="header-img" />}
        headerBackgroundColor={headerColors}
      >
        <Text>Content</Text>
      </ParallaxScrollView>
    );
    expect(getByTestId('header-img')).toBeTruthy();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <ParallaxScrollView
        headerImage={<View />}
        headerBackgroundColor={headerColors}
      >
        <Text>First</Text>
        <Text>Second</Text>
      </ParallaxScrollView>
    );
    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });
});
