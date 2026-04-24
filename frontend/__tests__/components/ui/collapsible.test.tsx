import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Collapsible } from '../../../components/ui/collapsible';

describe('Collapsible', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Collapsible title="Section" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the title', () => {
    const { getByText } = render(<Collapsible title="My Section" />);
    expect(getByText('My Section')).toBeTruthy();
  });

  it('hides children by default', () => {
    const { queryByText } = render(
      <Collapsible title="Section">
        <Text>Hidden content</Text>
      </Collapsible>
    );
    expect(queryByText('Hidden content')).toBeNull();
  });

  it('shows children when header is pressed', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Section">
        <Text>Revealed content</Text>
      </Collapsible>
    );
    fireEvent.press(getByText('Section'));
    expect(queryByText('Revealed content')).toBeTruthy();
  });

  it('hides children again when header is pressed twice', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Section">
        <Text>Content</Text>
      </Collapsible>
    );
    fireEvent.press(getByText('Section'));
    fireEvent.press(getByText('Section'));
    expect(queryByText('Content')).toBeNull();
  });
});
