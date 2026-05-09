import { render } from '@testing-library/react-native';
import React from 'react';
import { IconSymbol } from '../../../components/ui/icon-symbol';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { IconSymbol: IconSymbolAndroid } = require('../../../components/ui/icon-symbol.tsx');

const MAPPED_NAMES = [
  'house.fill',
  'paperplane.fill',
  'chevron.left.forwardslash.chevron.right',
  'chevron.right',
] as const;

describe('IconSymbol', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <IconSymbol name="house.fill" color="#000" size={24} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with default size', () => {
    const { toJSON } = render(
      <IconSymbol name="chevron.right" color="#333" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders all mapped icon names', () => {
    MAPPED_NAMES.forEach((name) => {
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
});

describe('IconSymbol (Android/web fallback)', () => {
  it('maps all supported SF Symbol names to Material Icons', () => {
    MAPPED_NAMES.forEach((name) => {
      const { toJSON } = render(<IconSymbolAndroid name={name} color="#000" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  it('accepts a weight prop without crashing', () => {
    const { toJSON } = render(
      <IconSymbolAndroid name="house.fill" color="#000" weight="medium" />
    );
    expect(toJSON()).toBeTruthy();
  });
});
