import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import Stock from "./Stock";

jest.mock("axios");

describe("Stock Component", () => {
  const mockSymbol = "AAPL";
  const mockPrice = 150.0;
  const mockToken = "mock-token";

  const mockSubscriptionsData = [
    { id: 1, target: 160, direction: "higher" },
    { id: 2, target: 140, direction: "lower" },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: mockSubscriptionsData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render stock information and buttons", () => {
    const { getByText, getByLabelText } = render(
      <Stock symbol={mockSymbol} price={mockPrice} token={mockToken} />
    );

    expect(getByText(`Price: ${mockPrice}`)).toBeInTheDocument();
    expect(getByText("Set Alert")).toBeInTheDocument();
    expect(getByText("View Subscriptions")).toBeInTheDocument();
  });

  it("should display and close the alert modal", async () => {
    const { getByText, queryByText } = render(
      <Stock symbol={mockSymbol} price={mockPrice} token={mockToken} />
    );

    const setAlertButton = getByText("Set Alert");
    fireEvent.click(setAlertButton);

    expect(getByText("Set Alert Price for AAPL")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(queryByText("Set Alert Price for AAPL")).not.toBeInTheDocument();
    });
  });

  it("should display and close the subscriptions modal", async () => {
    const { getByText, queryByText } = render(
      <Stock symbol={mockSymbol} price={mockPrice} token={mockToken} />
    );

    const viewSubscriptionsButton = getByText("View Subscriptions");
    fireEvent.click(viewSubscriptionsButton);

    expect(getByText("Subscriptions for AAPL")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(queryByText("Subscriptions for AAPL")).not.toBeInTheDocument();
    });
  });

  it("should fetch and display subscriptions", async () => {
    const { getByText } = render(
      <Stock symbol={mockSymbol} price={mockPrice} token={mockToken} />
    );

    const viewSubscriptionsButton = getByText("View Subscriptions");
    fireEvent.click(viewSubscriptionsButton);

    expect(getByText("Subscriptions for AAPL")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText("Price: 160, Direction: higher")).toBeInTheDocument();
      expect(getByText("Price: 140, Direction: lower")).toBeInTheDocument();
    });
  });
});
