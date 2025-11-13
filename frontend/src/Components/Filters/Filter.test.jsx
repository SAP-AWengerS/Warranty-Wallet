import { render, screen, fireEvent } from "@testing-library/react";
import Filters from "./Filters";

// Mock WarrantyDetailsModal
jest.mock("../WarrantyDetailsModal/WarrantyDetailsModal", () => {
  const React = require("react");
  return React.forwardRef(() => (
    <div data-testid="warranty-modal">WarrantyDetailsModal</div>
  ));
});

// Mock icons to avoid SVG parsing issues
jest.mock("@primer/octicons-react", () => ({
  FilterIcon: () => <svg data-testid="filter-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

describe("Filters Component", () => {
  const mockSetSearchValue = jest.fn();
  const mockSetSelectedCategories = jest.fn();
  const mockSetWarranty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders input and icons", () => {
    render(
      <Filters
        setSearchValue={mockSetSearchValue}
        setSelectedCategories={mockSetSelectedCategories}
        selectedCategories={[]}
        setWarranty={mockSetWarranty}
        warranty={{}}
      />
    );

    expect(screen.getByPlaceholderText("Search your warranty")).toBeInTheDocument();
    expect(screen.getByTestId("filter-icon")).toBeInTheDocument();
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  test("calls setSearchValue when typing", () => {
    render(
      <Filters
        setSearchValue={mockSetSearchValue}
        setSelectedCategories={mockSetSelectedCategories}
        selectedCategories={[]}
        setWarranty={mockSetWarranty}
        warranty={{}}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search your warranty"), { target: { value: "phone" } });
    expect(mockSetSearchValue).toHaveBeenCalledWith("phone");
  });

  test("renders category buttons", () => {
    render(
      <Filters
        setSearchValue={mockSetSearchValue}
        setSelectedCategories={mockSetSelectedCategories}
        selectedCategories={[]}
        setWarranty={mockSetWarranty}
        warranty={{}}
      />
    );

    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });
});
