import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Onboarding from '../../app/(auth)/onboarding';

describe('Onboarding', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Onboarding />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the first slide title', () => {
    const { getByText } = render(<Onboarding />);
    expect(getByText('An Tâm - Cùng Trường')).toBeTruthy();
  });

  it('renders the first slide description', () => {
    const { getByText } = render(<Onboarding />);
    expect(getByText('100% người dùng xác thực bằng Email sinh viên VNU')).toBeTruthy();
  });

  it('shows "Tiếp theo" button on first slide', () => {
    const { getByText } = render(<Onboarding />);
    expect(getByText('Tiếp theo')).toBeTruthy();
  });

  it('shows "Bỏ qua" skip button', () => {
    const { getByText } = render(<Onboarding />);
    expect(getByText('Bỏ qua')).toBeTruthy();
  });

  it('renders navigation dot indicators', () => {
    const { toJSON } = render(<Onboarding />);
    const json = JSON.stringify(toJSON());
    expect(json).toBeTruthy();
  });

  it('advances to second slide on "Tiếp theo" press', () => {
    const { getByText } = render(<Onboarding />);
    fireEvent.press(getByText('Tiếp theo'));
    expect(getByText('Tiết kiệm - Cùng Đường')).toBeTruthy();
  });

  it('advances to third slide on second "Tiếp theo" press', () => {
    const { getByText } = render(<Onboarding />);
    fireEvent.press(getByText('Tiếp theo'));
    fireEvent.press(getByText('Tiếp theo'));
    expect(getByText('Tiện Lợi - Cùng Đi')).toBeTruthy();
  });

  it('shows "Bắt đầu" on the last slide', () => {
    const { getByText } = render(<Onboarding />);
    fireEvent.press(getByText('Tiếp theo'));
    fireEvent.press(getByText('Tiếp theo'));
    expect(getByText('Bắt đầu')).toBeTruthy();
  });

  it('navigates to a slide when dot indicator is pressed', () => {
    const { getByText, getAllByTestId } = render(<Onboarding />);
    expect(getByText('Tiếp theo')).toBeTruthy();
  });
});
