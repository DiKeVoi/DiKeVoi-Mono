import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';

describe('useColorScheme', () => {
  it('returns "light"', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe('light');
  });

  it('return value is a string', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(typeof result.current).toBe('string');
  });
});
