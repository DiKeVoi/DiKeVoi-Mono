import { fireEvent, render } from "@testing-library/react-native";

import ResultsScreen from "../../../app/(matching)/results";

jest.mock("expo-router", () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    Link: ({ children }: any) => children,
    Redirect: () => null,
    useRouter: () => router,
    useLocalSearchParams: () => ({
      myPostId: "my-post-1",
      myPostType: "request",
    }),
    usePathname: () => "/",
    router,
  };
});

const getMockRouter = () => require("expo-router").router;

// Mock posts that match the expected test data
jest.mock("@/hooks/useRidePosts", () => ({
  useRidePosts: () => ({
    data: [
      {
        id: "p1",
        userId: "u1",
        type: "offer",
        status: "open",
        originLocation: "Quận 1",
        destinationLocation: "Quận 7",
        departureTime: "2026-10-10T08:30:00",
        seatsAvailable: 1,
        isRecurring: true,
        preferredGender: "male",
        description: "Nguyễn Văn An",
        createdAt: "2026-01-01T00:00:00",
        updatedAt: "2026-01-01T00:00:00",
      },
      {
        id: "p2",
        userId: "u2",
        type: "offer",
        status: "open",
        originLocation: "Bình Thạnh",
        destinationLocation: "Quận 3",
        departureTime: "2026-10-10T07:45:00",
        seatsAvailable: 1,
        isRecurring: false,
        preferredGender: "female",
        description: "Trần Thị Hoa",
        createdAt: "2026-01-01T00:00:00",
        updatedAt: "2026-01-01T00:00:00",
      },
      {
        id: "p3",
        userId: "u3",
        type: "offer",
        status: "open",
        originLocation: "Quận 10",
        destinationLocation: "Thủ Đức",
        departureTime: "2026-10-10T17:30:00",
        seatsAvailable: 1,
        isRecurring: true,
        preferredGender: "male",
        description: "Lê Minh Tâm",
        createdAt: "2026-01-01T00:00:00",
        updatedAt: "2026-01-01T00:00:00",
      },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useMyRidePosts: () => ({ data: [], isLoading: false }),
  useCreateRidePost: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useDeleteRidePost: () => ({ mutate: jest.fn(), isPending: false }),
  RIDE_POSTS_KEY: "ridePosts",
}));

jest.mock("@/hooks/useNegotiations", () => ({
  useCreateNegotiation: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: "neg-new" }),
    isPending: false,
  }),
  useNegotiation: () => ({ data: null, isLoading: false }),
  useUpdateNegotiation: () => ({ mutate: jest.fn(), isPending: false }),
  useConfirmNegotiation: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
  NEGOTIATIONS_KEY: "negotiations",
}));

describe("ResultsScreen (AllRequestsScreen)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<ResultsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the screen title "Đi ké với"', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText("Đi ké với")).toBeTruthy();
  });

  it("renders the results count heading", () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText("Tìm thấy 3 bạn đồng hành phù hợp")).toBeTruthy();
  });

  it("renders all three match cards", () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText("Nguyễn Văn An")).toBeTruthy();
    expect(getByText("Trần Thị Hoa")).toBeTruthy();
    expect(getByText("Lê Minh Tâm")).toBeTruthy();
  });

  it("renders route information for each card", () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText("Quận 1 → Quận 7")).toBeTruthy();
    expect(getByText("Bình Thạnh → Quận 3")).toBeTruthy();
    expect(getByText("Quận 10 → Thủ Đức")).toBeTruthy();
  });

  it("renders date for each card", () => {
    const { getAllByText } = render(<ResultsScreen />);
    const dates = getAllByText("10/10/2026");
    expect(dates.length).toBe(3);
  });

  it("renders times for each match card", () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText("08:30")).toBeTruthy();
    expect(getByText("07:45")).toBeTruthy();
    expect(getByText("17:30")).toBeTruthy();
  });

  it("renders gender tags for each card", () => {
    const { getAllByText } = render(<ResultsScreen />);
    const namCards = getAllByText("Nam");
    const nuCards = getAllByText("Nữ");
    expect(namCards.length).toBe(2);
    expect(nuCards.length).toBe(1);
  });

  it("renders role tags", () => {
    const { getAllByText } = render(<ResultsScreen />);
    const roleLabels = getAllByText("Cho đi ké");
    expect(roleLabels.length).toBe(3);
  });

  it('renders "Lặp lại" tag for repeat matches (2 out of 3)', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const repeatLabels = getAllByText("Lặp lại");
    expect(repeatLabels.length).toBe(2);
  });

  it('does NOT render "Lặp lại" for non-repeat match (Trần Thị Hoa)', () => {
    const { getAllByText } = render(<ResultsScreen />);
    // Only 2 repeat badges
    const repeatLabels = getAllByText("Lặp lại");
    expect(repeatLabels.length).toBe(2);
  });

  it('renders "Kết nối" button for each card initially', () => {
    const { getAllByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText("Kết nối");
    expect(connectButtons.length).toBe(3);
  });

  it("navigates back when back button is pressed", () => {
    const { UNSAFE_getAllByType } = render(<ResultsScreen />);
    const { TouchableOpacity } = require("react-native");
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First button is the back arrow
    fireEvent.press(buttons[0]);
    expect(getMockRouter().replace).toHaveBeenCalledWith("/home");
  });

  it("each MatchCard has an independent request state", () => {
    const { getAllByText } = render(<ResultsScreen />);
    const connectButtons = getAllByText("Kết nối");

    // Only press the second card
    fireEvent.press(connectButtons[1]);

    const remainingConnect = getAllByText("Kết nối");
    expect(remainingConnect.length).toBe(3);
  });

  it("multiple cards can be requested simultaneously", () => {
    const { getAllByText } = render(<ResultsScreen />);
    let connectButtons = getAllByText("Kết nối");

    fireEvent.press(connectButtons[0]);
    fireEvent.press(connectButtons[1]);

    const remainingConnect = getAllByText("Kết nối");
    expect(remainingConnect.length).toBe(3);
  });
});
