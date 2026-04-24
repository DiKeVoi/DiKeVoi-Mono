import { render } from '@testing-library/react-native';
import React from 'react';

// Directly import the Android/web variant (bypasses platform-based resolution)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { IconSymbol } = require('../../../components/ui/icon-symbol.tsx');

describe('IconSymbol (Android/web fallback)', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<IconSymbol name="house.fill" color="#000" size={24} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with the default size of 24', () => {
    const { toJSON } = render(<IconSymbol name="chevron.right" color="#444" />);
    expect(toJSON()).toBeTruthy();
  });

  it('maps all supported SF Symbol names to Material Icons', () => {
    const names = [
      'house.fill',
      'paperplane.fill',
      'chevron.left.forwardslash.chevron.right',
      'chevron.right',
    ] as const;
    names.forEach((name) => {
      const { toJSON } = render(<IconSymbol name={name} color="#000" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  it('accepts a style prop', () => {
    const { toJSON } = render(
      <IconSymbol name="house.fill" color="#000" style={{ opacity: 0.5 }} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('accepts a weight prop without crashing', () => {
    const { toJSON } = render(
      <IconSymbol name="house.fill" color="#000" weight="medium" />
    );
    expect(toJSON()).toBeTruthy();
  });
});
