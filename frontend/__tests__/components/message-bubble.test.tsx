import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: (props: any) => React.createElement('Image', props),
  };
});

import { MessageBubble } from '../../components/MessageBubble';

// Helper factory for message objects
const makeMsg = (overrides: Partial<{ id: string; type: 'self' | 'other' | 'system' | 'date'; text: string; time?: string }>) => ({
  id: 'msg-1',
  type: 'self' as const,
  text: 'Hello',
  time: '10:00',
  ...overrides,
});

describe('MessageBubble component', () => {
  // ---- date type ----

  describe('when type is "date"', () => {
    it('renders the date separator text', () => {
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'date', text: 'HÔM NAY' })} />
      );
      expect(getByText('HÔM NAY')).toBeTruthy();
    });

    it('does NOT render a time for date separators', () => {
      const { queryByText } = render(
        <MessageBubble msg={makeMsg({ type: 'date', text: 'HÔM NAY', time: '12:00' })} />
      );
      // time text should not appear in the date separator variant
      expect(queryByText('12:00')).toBeNull();
    });

    it('renders arbitrary date label text', () => {
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'date', text: 'HÔM QUA' })} />
      );
      expect(getByText('HÔM QUA')).toBeTruthy();
    });

    it('matches snapshot for date type', () => {
      const { toJSON } = render(
        <MessageBubble msg={makeMsg({ type: 'date', text: 'HÔM NAY' })} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // ---- system type ----

  describe('when type is "system"', () => {
    it('renders the system message text', () => {
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'system', text: 'Kết nối đã được xác nhận.' })} />
      );
      expect(getByText('Kết nối đã được xác nhận.')).toBeTruthy();
    });

    it('renders long system message text', () => {
      const longText = 'An đã gửi đề nghị tham gia chuyến đi của bạn.';
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'system', text: longText })} />
      );
      expect(getByText(longText)).toBeTruthy();
    });

    it('matches snapshot for system type', () => {
      const { toJSON } = render(
        <MessageBubble msg={makeMsg({ type: 'system', text: 'System event.' })} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // ---- self type ----

  describe('when type is "self"', () => {
    it('renders the message text', () => {
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'self', text: 'Mình đang trên đường.' })} />
      );
      expect(getByText('Mình đang trên đường.')).toBeTruthy();
    });

    it('renders the timestamp', () => {
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'self', text: 'Hey!', time: '14:30' })} />
      );
      expect(getByText('14:30')).toBeTruthy();
    });

    it('does NOT render partner avatar for self messages', () => {
      const { queryByRole, toJSON } = render(
        <MessageBubble
          msg={makeMsg({ type: 'self', text: 'No avatar' })}
          partnerAvatar="https://example.com/avatar.png"
        />
      );
      // The Image component should not appear for self messages
      const tree = JSON.stringify(toJSON());
      // Avatar is only rendered for "other" type
      expect(tree).not.toContain('https://example.com/avatar.png');
    });

    it('renders without partnerAvatar prop', () => {
      const { getByText } = render(
        <MessageBubble msg={makeMsg({ type: 'self', text: 'No partner avatar' })} />
      );
      expect(getByText('No partner avatar')).toBeTruthy();
    });

    it('renders with undefined time gracefully', () => {
      const msg = { id: 'x', type: 'self' as const, text: 'No time' };
      const { getByText } = render(<MessageBubble msg={msg} />);
      expect(getByText('No time')).toBeTruthy();
    });

    it('matches snapshot for self type', () => {
      const { toJSON } = render(
        <MessageBubble msg={makeMsg({ type: 'self', text: 'Hello!', time: '09:00' })} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // ---- other type ----

  describe('when type is "other"', () => {
    it('renders the message text', () => {
      const { getByText } = render(
        <MessageBubble
          msg={makeMsg({ type: 'other', text: 'Bạn ở đâu rồi?' })}
        />
      );
      expect(getByText('Bạn ở đâu rồi?')).toBeTruthy();
    });

    it('renders the timestamp for other messages', () => {
      const { getByText } = render(
        <MessageBubble
          msg={makeMsg({ type: 'other', text: 'Hi', time: '08:15' })}
        />
      );
      expect(getByText('08:15')).toBeTruthy();
    });

    it('renders partner avatar when partnerAvatar is provided', () => {
      const avatarUri = 'https://i.pravatar.cc/100';
      const { toJSON } = render(
        <MessageBubble
          msg={makeMsg({ type: 'other', text: 'With avatar' })}
          partnerAvatar={avatarUri}
        />
      );
      const tree = JSON.stringify(toJSON());
      expect(tree).toContain(avatarUri);
    });

    it('does NOT render avatar when partnerAvatar is omitted', () => {
      const { toJSON } = render(
        <MessageBubble msg={makeMsg({ type: 'other', text: 'No avatar other' })} />
      );
      // Tree should not contain any Image source URI
      const tree = JSON.stringify(toJSON());
      expect(tree).not.toContain('pravatar');
    });

    it('matches snapshot for other type with avatar', () => {
      const { toJSON } = render(
        <MessageBubble
          msg={makeMsg({ type: 'other', text: 'Hey!', time: '10:05' })}
          partnerAvatar="https://i.pravatar.cc/150"
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot for other type without avatar', () => {
      const { toJSON } = render(
        <MessageBubble msg={makeMsg({ type: 'other', text: 'No avatar other' })} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // ---- all four branches covered in a single coverage sweep ----

  it('covers all four message types in sequence', () => {
    const types: Array<'date' | 'system' | 'self' | 'other'> = ['date', 'system', 'self', 'other'];
    types.forEach((type) => {
      const { toJSON } = render(
        <MessageBubble
          msg={makeMsg({ type, text: `Message for ${type}`, time: '11:00' })}
          partnerAvatar="https://i.pravatar.cc/50"
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
