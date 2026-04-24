import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ExploreScreen from '../../app/(tabs)/explore';

describe('ExploreScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ExploreScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Explore title', () => {
    const { getByText } = render(<ExploreScreen />);
    expect(getByText('Explore')).toBeTruthy();
  });

  it('renders introductory text', () => {
    const { getByText } = render(<ExploreScreen />);
    expect(
      getByText('This app includes example code to help you get started.')
    ).toBeTruthy();
  });

  it('renders all collapsible section titles', () => {
    const { getByText } = render(<ExploreScreen />);
    expect(getByText('File-based routing')).toBeTruthy();
    expect(getByText('Android, iOS, and web support')).toBeTruthy();
    expect(getByText('Images')).toBeTruthy();
    expect(getByText('Light and dark mode components')).toBeTruthy();
    expect(getByText('Animations')).toBeTruthy();
  });

  it('expands a collapsible section on press', () => {
    const { getByText, queryByText } = render(<ExploreScreen />);
    expect(queryByText(/This app has two screens/)).toBeNull();
    fireEvent.press(getByText('File-based routing'));
    expect(queryByText(/This app has two screens/)).toBeTruthy();
  });

  it('renders external links inside expanded sections', () => {
    const { getByText, queryByText } = render(<ExploreScreen />);
    fireEvent.press(getByText('File-based routing'));
    expect(queryByText('Learn more')).toBeTruthy();
  });
});
