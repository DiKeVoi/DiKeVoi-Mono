import { renderHook } from '@testing-library/react-native';
import { Colors } from '../../constants/theme';
import { useThemeColor } from '../../hooks/use-theme-color';

describe('useThemeColor', () => {
  it('returns the default light theme color when no props provided', () => {
    const { result } = renderHook(() => useThemeColor({}, 'background'));
    expect(result.current).toBe(Colors.light.background);
  });

  it('returns lightColor prop when provided and theme is light', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#custom' }, 'background')
    );
    expect(result.current).toBe('#custom');
  });

  it('falls back to Colors when lightColor prop is not provided', () => {
    const { result } = renderHook(() =>
      useThemeColor({ dark: '#darkonly' }, 'background')
    );
    expect(result.current).toBe(Colors.light.background);
  });

  it('returns correct tint color', () => {
    const { result } = renderHook(() => useThemeColor({}, 'tint'));
    expect(result.current).toBe(Colors.light.tint);
  });

  it('returns correct icon color', () => {
    const { result } = renderHook(() => useThemeColor({}, 'icon'));
    expect(result.current).toBe(Colors.light.icon);
  });

  it('returns correct text color', () => {
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.light.text);
  });
});
