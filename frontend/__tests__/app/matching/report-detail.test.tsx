import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  Redirect: () => null,
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({ id: 'r1' })),
  usePathname: () => '/',
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement('SafeAreaView', props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

import ReportDetailScreen from '../../../app/(matching)/report/[id]';
import * as ExpoRouter from 'expo-router';

beforeEach(() => {
  jest.clearAllMocks();
  (ExpoRouter.useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'r1' });
  // Reset router.back to fresh jest.fn()
  (ExpoRouter.router as any).back = jest.fn();
  (ExpoRouter.useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: (ExpoRouter.router as any).back,
  });
});

describe('ReportDetailScreen – pending report (r1)', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ReportDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays the page title', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Chi tiết báo cáo')).toBeTruthy();
  });

  it('shows "Đang chờ xử lý" status badge for a pending report', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Đang chờ xử lý')).toBeTruthy();
  });

  it('displays the report id and creation date in the badge', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText(/Mã BC: #R1/)).toBeTruthy();
    expect(getByText(/Hôm qua, 19:15/)).toBeTruthy();
  });

  it('shows the section label for the reported user', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Đối tượng bị báo cáo')).toBeTruthy();
  });

  it('displays the reported user name', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Nguyễn Văn An')).toBeTruthy();
  });

  it('displays the trip id', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText(/ID: t1/)).toBeTruthy();
  });

  it('shows the report content section label', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Nội dung báo cáo')).toBeTruthy();
  });

  it('displays the report reason', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Hành vi thiếu chuẩn mực')).toBeTruthy();
  });

  it('displays the report description', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText(/đến trễ 20 phút/)).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<ReportDetailScreen />);
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect((ExpoRouter.router as any).back).toHaveBeenCalled();
  });
});

describe('ReportDetailScreen – resolved report (r2)', () => {
  beforeEach(() => {
    (ExpoRouter.useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'r2' });
  });

  it('shows "Đã tiếp nhận xử lý" for a resolved report', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Đã tiếp nhận xử lý')).toBeTruthy();
  });

  it('shows the resolved user name', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Trần Hoàng Nam')).toBeTruthy();
  });

  it('displays the resolved report reason', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Hủy chuyến không lý do')).toBeTruthy();
  });

  it('displays the resolved report description', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText(/sát giờ đi/)).toBeTruthy();
  });

  it('displays the resolved trip id', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText(/ID: t3/)).toBeTruthy();
  });

  it('displays the resolved report id in the badge', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText(/Mã BC: #R2/)).toBeTruthy();
  });
});

describe('ReportDetailScreen – report not found', () => {
  beforeEach(() => {
    (ExpoRouter.useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'nonexistent' });
  });

  it('shows error state when the id does not match any report', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Không tìm thấy chi tiết báo cáo.')).toBeTruthy();
  });

  it('renders the "Quay lại" button in error state', () => {
    const { getByText } = render(<ReportDetailScreen />);
    expect(getByText('Quay lại')).toBeTruthy();
  });

  it('pressing "Quay lại" calls router.back', () => {
    const { getByText } = render(<ReportDetailScreen />);
    fireEvent.press(getByText('Quay lại'));
    expect((ExpoRouter.router as any).back).toHaveBeenCalled();
  });

  it('does not render full report detail sections', () => {
    const { queryByText } = render(<ReportDetailScreen />);
    expect(queryByText('Chi tiết báo cáo')).toBeNull();
    expect(queryByText('Đang chờ xử lý')).toBeNull();
    expect(queryByText('Đã tiếp nhận xử lý')).toBeNull();
  });
});
