import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchSection from '../../../components/request/SearchSection';

const mockStyles = {
  searchContainer: { backgroundColor: 'white', padding: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8 },
  resultItem: { padding: 10 },
  resultText: { fontWeight: 'bold' },
  subText: { color: 'grey' },
  resultsList: { maxHeight: 200 },
};

const defaultProps = {
  pickup: { coords: null, address: '' },
  destination: { coords: null, address: '' },
  activeInput: null,
  setActiveInput: jest.fn(),
  searchPlaces: jest.fn(),
  searchResults: [],
  handleSelectPlace: jest.fn(),
  styles: mockStyles,
  onConfirm: jest.fn(),
  confirmDisabled: false,
};

const mockSearchResults = [
  { id: '1', title: 'Trường Đại học Bách Khoa', vicinity: 'Quận 10, TP.HCM', position: { lat: 10.7725, lng: 106.6580 } },
  { id: '2', title: 'Trường Đại học Khoa học Tự nhiên', vicinity: 'Quận 5, TP.HCM', position: { lat: 10.7627, lng: 106.6822 } },
  { id: '3', title: 'Bến Thành Market', vicinity: 'Quận 1, TP.HCM', position: { lat: 10.7724, lng: 106.6980 } },
];

describe('SearchSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<SearchSection {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders pickup and destination TextInputs', () => {
    const { getAllByPlaceholderText } = render(<SearchSection {...defaultProps} />);
    expect(getAllByPlaceholderText('Nhập điểm đón...')).toHaveLength(1);
    expect(getAllByPlaceholderText('Bạn muốn đi đâu?')).toHaveLength(1);
  });

  it('renders confirm button', () => {
    const { getByText } = render(<SearchSection {...defaultProps} />);
    expect(getByText('Xác nhận')).toBeTruthy();
  });

  it('does not render FlatList when searchResults is empty', () => {
    const { queryByText } = render(<SearchSection {...defaultProps} searchResults={[]} />);
    // No result items should be shown
    expect(queryByText('Trường Đại học Bách Khoa')).toBeNull();
  });

  it('renders search results in FlatList when searchResults is non-empty', () => {
    const { getByText } = render(<SearchSection {...defaultProps} searchResults={mockSearchResults} />);
    expect(getByText('Trường Đại học Bách Khoa')).toBeTruthy();
    expect(getByText('Quận 10, TP.HCM')).toBeTruthy();
    expect(getByText('Trường Đại học Khoa học Tự nhiên')).toBeTruthy();
    expect(getByText('Bến Thành Market')).toBeTruthy();
  });

  it('calls setActiveInput with "pickup" when pickup input is focused', () => {
    const setActiveInput = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchSection {...defaultProps} setActiveInput={setActiveInput} />
    );
    fireEvent(getByPlaceholderText('Nhập điểm đón...'), 'focus');
    expect(setActiveInput).toHaveBeenCalledWith('pickup');
  });

  it('calls setActiveInput with "destination" when destination input is focused', () => {
    const setActiveInput = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchSection {...defaultProps} setActiveInput={setActiveInput} />
    );
    fireEvent(getByPlaceholderText('Bạn muốn đi đâu?'), 'focus');
    expect(setActiveInput).toHaveBeenCalledWith('destination');
  });

  it('calls searchPlaces when pickup input text changes', () => {
    const searchPlaces = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchSection {...defaultProps} searchPlaces={searchPlaces} />
    );
    fireEvent.changeText(getByPlaceholderText('Nhập điểm đón...'), 'Bách Khoa');
    expect(searchPlaces).toHaveBeenCalledWith('Bách Khoa');
  });

  it('calls searchPlaces when destination input text changes', () => {
    const searchPlaces = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchSection {...defaultProps} searchPlaces={searchPlaces} />
    );
    fireEvent.changeText(getByPlaceholderText('Bạn muốn đi đâu?'), 'Quận 1');
    expect(searchPlaces).toHaveBeenCalledWith('Quận 1');
  });

  it('calls handleSelectPlace when a search result is pressed', () => {
    const handleSelectPlace = jest.fn();
    const { getByText } = render(
      <SearchSection
        {...defaultProps}
        searchResults={mockSearchResults}
        handleSelectPlace={handleSelectPlace}
      />
    );
    fireEvent.press(getByText('Trường Đại học Bách Khoa'));
    expect(handleSelectPlace).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('calls handleSelectPlace with correct item when second result is pressed', () => {
    const handleSelectPlace = jest.fn();
    const { getByText } = render(
      <SearchSection
        {...defaultProps}
        searchResults={mockSearchResults}
        handleSelectPlace={handleSelectPlace}
      />
    );
    fireEvent.press(getByText('Trường Đại học Khoa học Tự nhiên'));
    expect(handleSelectPlace).toHaveBeenCalledWith(mockSearchResults[1]);
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <SearchSection {...defaultProps} onConfirm={onConfirm} />
    );
    fireEvent.press(getByText('Xác nhận'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows pickup address as value when activeInput is not "pickup"', () => {
    const pickupWithAddress = { coords: { latitude: 10.76, longitude: 106.66 }, address: 'Số 1 Đại Cồ Việt' };
    const { getByDisplayValue } = render(
      <SearchSection
        {...defaultProps}
        pickup={pickupWithAddress}
        activeInput={null}
      />
    );
    expect(getByDisplayValue('Số 1 Đại Cồ Việt')).toBeTruthy();
  });

  it('shows undefined value for pickup input when activeInput is "pickup" (allows free typing)', () => {
    const pickupWithAddress = { coords: { latitude: 10.76, longitude: 106.66 }, address: 'Số 1 Đại Cồ Việt' };
    const { queryByDisplayValue } = render(
      <SearchSection
        {...defaultProps}
        pickup={pickupWithAddress}
        activeInput="pickup"
      />
    );
    // When activeInput === 'pickup', value is undefined so the saved address is not shown
    expect(queryByDisplayValue('Số 1 Đại Cồ Việt')).toBeNull();
  });

  it('shows destination address as value when activeInput is not "destination"', () => {
    const destinationWithAddress = { coords: { latitude: 10.77, longitude: 106.67 }, address: 'Chợ Bến Thành' };
    const { getByDisplayValue } = render(
      <SearchSection
        {...defaultProps}
        destination={destinationWithAddress}
        activeInput={null}
      />
    );
    expect(getByDisplayValue('Chợ Bến Thành')).toBeTruthy();
  });

  it('shows undefined value for destination input when activeInput is "destination"', () => {
    const destinationWithAddress = { coords: { latitude: 10.77, longitude: 106.67 }, address: 'Chợ Bến Thành' };
    const { queryByDisplayValue } = render(
      <SearchSection
        {...defaultProps}
        destination={destinationWithAddress}
        activeInput="destination"
      />
    );
    expect(queryByDisplayValue('Chợ Bến Thành')).toBeNull();
  });

  it('renders result vicinity text for each search result', () => {
    const { getByText } = render(
      <SearchSection {...defaultProps} searchResults={mockSearchResults} />
    );
    expect(getByText('Quận 5, TP.HCM')).toBeTruthy();
    expect(getByText('Quận 1, TP.HCM')).toBeTruthy();
  });
});
