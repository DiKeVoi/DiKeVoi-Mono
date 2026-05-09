import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { HomeHeader } from '../../components/home-header';

describe('HomeHeader', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<HomeHeader />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays the brand name', () => {
    const { getByText } = render(<HomeHeader />);
    expect(getByText('Đi ké với!')).toBeTruthy();
  });

  it('displays the brand tagline', () => {
    const { getByText } = render(<HomeHeader />);
    expect(getByText('Cùng trường, cùng đường, cùng đi')).toBeTruthy();
  });

  it('notification panel is hidden by default', () => {
    const { queryByText } = render(<HomeHeader />);
    expect(queryByText('THÔNG BÁO')).toBeNull();
  });

  it('shows notification panel when bell is pressed', () => {
    const { getByTestId, queryByText } = render(<HomeHeader />);
    const bell = getByTestId('notification-bell');
    fireEvent.press(bell);
    expect(queryByText('THÔNG BÁO')).toBeTruthy();
  });

  it('hides notification panel when pressed again', () => {
    const { getByTestId, queryByText } = render(<HomeHeader />);
    const bell = getByTestId('notification-bell');
    fireEvent.press(bell);
    fireEvent.press(bell);
    expect(queryByText('THÔNG BÁO')).toBeNull();
  });
});
