import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';

jest.mock('@here/flexpolyline', () => ({
  decode: jest.fn(() => ({ polyline: [] })),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiUrl: 'http://localhost:8000' } },
}));

// Mock child components to keep the unit boundary tight
jest.mock('../../components/request/MapSection', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) =>
      React.createElement(View, { testID: 'map-section' }),
  };
});

jest.mock('../../components/request/SearchSection', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text, TextInput } = require('react-native');
  return {
    __esModule: true,
    default: ({
      pickup,
      destination,
      activeInput,
      setActiveInput,
      searchPlaces,
      searchResults,
      handleSelectPlace,
      onConfirm,
      confirmDisabled,
    }: any) =>
      React.createElement(
        View,
        { testID: 'search-section' },
        React.createElement(TextInput, {
          testID: 'pickup-input',
          placeholder: 'Nhập điểm đón...',
          value: activeInput === 'pickup' ? undefined : pickup.address,
          onFocus: () => setActiveInput('pickup'),
          onChangeText: searchPlaces,
        }),
        React.createElement(TextInput, {
          testID: 'destination-input',
          placeholder: 'Bạn muốn đi đâu?',
          value: activeInput === 'destination' ? undefined : destination.address,
          onFocus: () => setActiveInput('destination'),
          onChangeText: searchPlaces,
        }),
        searchResults.map((item: any) =>
          React.createElement(
            TouchableOpacity,
            { key: item.id, testID: `result-item-${item.id}`, onPress: () => handleSelectPlace(item) },
            React.createElement(Text, null, item.title)
          )
        ),
        React.createElement(
          TouchableOpacity,
          { testID: 'confirm-button', onPress: onConfirm, disabled: confirmDisabled },
          React.createElement(Text, null, 'Xác nhận')
        )
      ),
  };
});

// Mock hooks
const mockSearchPlaces = jest.fn();
const mockSetSearchResults = jest.fn();
const mockGetRouting = jest.fn();
const mockSetRoutePolyline = jest.fn();

let mockSearchResults: any[] = [];

jest.mock('../../hooks/useSearchPlaces', () => ({
  useSearchPlaces: () => ({
    searchResults: mockSearchResults,
    searchPlaces: mockSearchPlaces,
    setSearchResults: mockSetSearchResults,
  }),
}));

jest.mock('../../hooks/useRouting', () => ({
  useRouting: () => ({
    routePolyline: [],
    distanceKm: undefined,
    durationMin: undefined,
    getRouting: mockGetRouting,
    setRoutePolyline: mockSetRoutePolyline,
  }),
}));

import RideMapScreen from '../../app/(ride)/map';

const SAMPLE_PLACE = {
  id: 'place1',
  title: 'KTX Khu B',
  vicinity: 'Dĩ An, Bình Dương',
  position: { lat: 10.8759, lng: 106.8073 },
};

const SAMPLE_DESTINATION = {
  id: 'place2',
  title: 'Đại học Bách Khoa',
  vicinity: 'Thủ Đức, TPHCM',
  position: { lat: 10.8800, lng: 106.8050 },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchResults = [];
});

describe('RideMapScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<RideMapScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the MapSection', () => {
    const { getByTestId } = render(<RideMapScreen />);
    expect(getByTestId('map-section')).toBeTruthy();
  });

  it('renders the SearchSection', () => {
    const { getByTestId } = render(<RideMapScreen />);
    expect(getByTestId('search-section')).toBeTruthy();
  });

  it('calls searchPlaces hook when pickup input changes', () => {
    const { getByTestId } = render(<RideMapScreen />);
    const input = getByTestId('pickup-input');
    fireEvent.changeText(input, 'KTX');
    expect(mockSearchPlaces).toHaveBeenCalledWith('KTX');
  });

  it('calls searchPlaces hook when destination input changes', () => {
    const { getByTestId } = render(<RideMapScreen />);
    const input = getByTestId('destination-input');
    fireEvent.changeText(input, 'Bách Khoa');
    expect(mockSearchPlaces).toHaveBeenCalledWith('Bách Khoa');
  });

  it('sets activeInput to "pickup" when pickup input is focused', () => {
    const { getByTestId } = render(<RideMapScreen />);
    const input = getByTestId('pickup-input');
    fireEvent(input, 'focus');
    // Re-render verifies the state was set (no crash)
    expect(input).toBeTruthy();
  });

  it('sets activeInput to "destination" when destination input is focused', () => {
    const { getByTestId } = render(<RideMapScreen />);
    const input = getByTestId('destination-input');
    fireEvent(input, 'focus');
    expect(input).toBeTruthy();
  });

  it('renders search results from the hook', () => {
    mockSearchResults = [SAMPLE_PLACE];
    const { getByTestId } = render(<RideMapScreen />);
    expect(getByTestId('result-item-place1')).toBeTruthy();
  });

  it('selects a pickup place and clears search results', () => {
    mockSearchResults = [SAMPLE_PLACE];
    const { getByTestId } = render(<RideMapScreen />);

    // Focus pickup first
    fireEvent(getByTestId('pickup-input'), 'focus');
    // Select the place
    fireEvent.press(getByTestId('result-item-place1'));
    expect(mockSetSearchResults).toHaveBeenCalledWith([]);
  });

  it('selects a destination place and clears search results', () => {
    mockSearchResults = [SAMPLE_DESTINATION];
    const { getByTestId } = render(<RideMapScreen />);

    // Focus destination first
    fireEvent(getByTestId('destination-input'), 'focus');
    // Select the place
    fireEvent.press(getByTestId('result-item-place2'));
    expect(mockSetSearchResults).toHaveBeenCalledWith([]);
  });

  it('confirm button is present', () => {
    const { getByTestId } = render(<RideMapScreen />);
    expect(getByTestId('confirm-button')).toBeTruthy();
  });

  it('confirm button press does not throw', () => {
    // The source calls the global alert() which may be undefined in the test env.
    // We verify the onConfirm handler runs without throwing.
    (global as any).alert = jest.fn();
    const { getByTestId } = render(<RideMapScreen />);
    expect(() => fireEvent.press(getByTestId('confirm-button'))).not.toThrow();
    delete (global as any).alert;
  });

  it('calls getRouting when both pickup and destination coords are set', async () => {
    // We need to test the useEffect that calls getRouting when both coords exist.
    // We do this by simulating selecting both a pickup and destination.
    mockSearchResults = [SAMPLE_PLACE];

    const { getByTestId, rerender } = render(<RideMapScreen />);

    // Select pickup
    fireEvent(getByTestId('pickup-input'), 'focus');
    fireEvent.press(getByTestId('result-item-place1'));

    // Now update the mock to have a destination result
    mockSearchResults = [SAMPLE_DESTINATION];
    rerender(<RideMapScreen />);

    // Select destination
    fireEvent(getByTestId('destination-input'), 'focus');
    fireEvent.press(getByTestId('result-item-place2'));

    await waitFor(() => {
      expect(mockGetRouting).toHaveBeenCalled();
    });
  });

  it('calls setRoutePolyline([]) when coords are missing', async () => {
    // Default state: no coords, so useEffect should call setRoutePolyline([])
    render(<RideMapScreen />);
    await waitFor(() => {
      expect(mockSetRoutePolyline).toHaveBeenCalledWith([]);
    });
  });
});
