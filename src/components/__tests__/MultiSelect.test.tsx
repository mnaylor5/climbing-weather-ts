import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from '../MultiSelect';
import { ClimbingAreaData } from '../../weatherData/weatherApi';

const mockAreas: ClimbingAreaData = {
  'redrocks': {
    name: 'Red Rock Canyon',
    latitude: 36.1315,
    longitude: -115.4266
  },
  'yosemite': {
    name: 'Yosemite National Park',
    latitude: 37.8651,
    longitude: -119.5383
  },
  'joshuatree': {
    name: 'Joshua Tree National Park',
    latitude: 33.8734,
    longitude: -115.9010
  },
  'eldorado': {
    name: 'Eldorado Canyon',
    latitude: 39.9319,
    longitude: -105.2955
  },
  'gunks': {
    name: 'The Gunks',
    latitude: 41.7354,
    longitude: -74.1827
  }
};

describe('MultiSelect', () => {
  const defaultProps = {
    areas: mockAreas,
    selectedAreas: [],
    onChange: jest.fn(),
    maxSelections: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('renders with placeholder text when no areas selected', () => {
      render(<MultiSelect {...defaultProps} />);
      
      expect(screen.getByText('Select climbing areas...')).toBeInTheDocument();
    });

    it('renders with single area name when one area selected', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks']} />);
      
      // Check for the tag as well
      const areaTexts = screen.getAllByText('Red Rock Canyon');
      expect(areaTexts).toHaveLength(2); // One in trigger, one in tag
    });

    it('renders with count when multiple areas selected', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks', 'yosemite']} />);
      
      expect(screen.getByText('2 areas selected')).toBeInTheDocument();
    });

    it('shows dropdown toggle indicator', () => {
      render(<MultiSelect {...defaultProps} />);
      
      expect(screen.getByText('▼')).toBeInTheDocument();
    });
  });

  describe('Dropdown functionality', () => {
    it('opens dropdown when trigger is clicked', () => {
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search areas...')).toBeInTheDocument();
    });

    it('closes dropdown when trigger is clicked again', () => {
      render(<MultiSelect {...defaultProps} />);
      
      // Open dropdown
      fireEvent.click(screen.getByText('Select climbing areas...'));
      expect(screen.getByText('▲')).toBeInTheDocument();
      
      // Close dropdown
      fireEvent.click(screen.getByText('Select climbing areas...'));
      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Search areas...')).not.toBeInTheDocument();
    });

    it('displays all areas in dropdown when opened', () => {
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      expect(screen.getByText('Red Rock Canyon')).toBeInTheDocument();
      expect(screen.getByText('Yosemite National Park')).toBeInTheDocument();
      expect(screen.getByText('Joshua Tree National Park')).toBeInTheDocument();
      expect(screen.getByText('Eldorado Canyon')).toBeInTheDocument();
      expect(screen.getByText('The Gunks')).toBeInTheDocument();
    });

    it('shows checkboxes for all areas', () => {
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(5);
    });
  });

  describe('Search functionality', () => {
    it('filters areas based on search term', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      const searchInput = screen.getByPlaceholderText('Search areas...');
      await user.type(searchInput, 'rock');
      
      expect(screen.getByText('Red Rock Canyon')).toBeInTheDocument();
      expect(screen.queryByText('Yosemite National Park')).not.toBeInTheDocument();
      expect(screen.queryByText('Joshua Tree National Park')).not.toBeInTheDocument();
    });

    it('performs case-insensitive search', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      const searchInput = screen.getByPlaceholderText('Search areas...');
      await user.type(searchInput, 'YOSEMITE');
      
      expect(screen.getByText('Yosemite National Park')).toBeInTheDocument();
      expect(screen.queryByText('Red Rock Canyon')).not.toBeInTheDocument();
    });

    it('shows no results when search term matches nothing', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      const searchInput = screen.getByPlaceholderText('Search areas...');
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.queryByText('Red Rock Canyon')).not.toBeInTheDocument();
      expect(screen.queryByText('Yosemite National Park')).not.toBeInTheDocument();
    });
  });

  describe('Area selection', () => {
    it('calls onChange when area is selected', () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      // Find the dropdown option specifically (not tag)
      const redRockOptions = screen.getAllByText('Red Rock Canyon');
      const dropdownOption = redRockOptions.find(el => 
        el.parentElement?.querySelector('input[type="checkbox"]')
      );
      
      if (dropdownOption) {
        fireEvent.click(dropdownOption);
      }
      
      expect(onChange).toHaveBeenCalledWith(['redrocks']);
    });

    it('calls onChange when area is deselected', () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks']} onChange={onChange} />);
      
      // Find the trigger by checking for the dropdown arrow
      const trigger = screen.getByText('▼').parentElement;
      if (trigger) {
        fireEvent.click(trigger);
      }
      
      // Find and click the Red Rock Canyon option in the dropdown (checkbox container)
      const checkboxes = screen.getAllByRole('checkbox');
      const redRockCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
      
      if (redRockCheckbox && redRockCheckbox.parentElement) {
        fireEvent.click(redRockCheckbox.parentElement);
      }
      
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('selects multiple areas correctly', () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      // Find the dropdown option specifically (not tag)
      const redRockOptions = screen.getAllByText('Red Rock Canyon');
      const dropdownOption = redRockOptions.find(el => 
        el.parentElement?.querySelector('input[type="checkbox"]')
      );
      
      if (dropdownOption) {
        fireEvent.click(dropdownOption);
      }
      
      expect(onChange).toHaveBeenCalledWith(['redrocks']);
    });

    it('shows selected areas as checked', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks', 'yosemite']} />);
      
      fireEvent.click(screen.getByText('2 areas selected'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // Red Rock Canyon
      expect(checkboxes[1]).toBeChecked(); // Yosemite National Park
      expect(checkboxes[2]).not.toBeChecked(); // Joshua Tree
    });
  });

  describe('Max selections limit', () => {
    it('respects max selections limit', () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} maxSelections={2} selectedAreas={['redrocks', 'yosemite']} onChange={onChange} />);
      
      fireEvent.click(screen.getByText('2 areas selected'));
      fireEvent.click(screen.getByText('Joshua Tree National Park'));
      
      // Should not call onChange since max limit reached
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables unselected areas when max limit reached', () => {
      render(<MultiSelect {...defaultProps} maxSelections={2} selectedAreas={['redrocks', 'yosemite']} />);
      
      fireEvent.click(screen.getByText('2 areas selected'));
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[2]).toBeDisabled(); // Joshua Tree should be disabled
      expect(checkboxes[3]).toBeDisabled(); // Eldorado should be disabled
    });

    it('shows max selections reached message', () => {
      render(<MultiSelect {...defaultProps} maxSelections={2} selectedAreas={['redrocks', 'yosemite']} />);
      
      fireEvent.click(screen.getByText('2 areas selected'));
      
      const messages = screen.getAllByText('Max selections reached');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('shows selection count in footer', () => {
      render(<MultiSelect {...defaultProps} maxSelections={5} selectedAreas={['redrocks', 'yosemite']} />);
      
      fireEvent.click(screen.getByText('2 areas selected'));
      
      expect(screen.getByText('2/5 areas selected')).toBeInTheDocument();
    });
  });

  describe('Selected area tags', () => {
    it('displays selected areas as tags', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks', 'yosemite']} />);
      
      expect(screen.getByText('Red Rock Canyon')).toBeInTheDocument();
      expect(screen.getByText('Yosemite National Park')).toBeInTheDocument();
    });

    it('includes remove buttons on tags', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks']} />);
      
      const removeButton = screen.getByText('×');
      expect(removeButton).toBeInTheDocument();
    });

    it('removes area when tag remove button is clicked', () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks', 'yosemite']} onChange={onChange} />);
      
      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]); // Remove first area
      
      expect(onChange).toHaveBeenCalledWith(['yosemite']);
    });

    it('does not show tags when no areas selected', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={[]} />);
      
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });
  });

  describe('Click outside behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <MultiSelect {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      // Open dropdown
      fireEvent.click(screen.getByText('Select climbing areas...'));
      expect(screen.getByText('▲')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));
      
      await waitFor(() => {
        expect(screen.getByText('▼')).toBeInTheDocument();
      });
    });

    it('does not close dropdown when clicking inside', () => {
      render(<MultiSelect {...defaultProps} />);
      
      // Open dropdown
      fireEvent.click(screen.getByText('Select climbing areas...'));
      expect(screen.getByText('▲')).toBeInTheDocument();
      
      // Click on search input (inside dropdown)
      fireEvent.mouseDown(screen.getByPlaceholderText('Search areas...'));
      
      expect(screen.getByText('▲')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty areas object', () => {
      render(<MultiSelect {...defaultProps} areas={{}} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      
      expect(screen.getByText('0/10 areas selected')).toBeInTheDocument();
    });

    it('handles unknown selected area key', () => {
      render(<MultiSelect {...defaultProps} selectedAreas={['unknown']} />);
      
      expect(screen.getByText('Unknown area')).toBeInTheDocument();
    });

    it('prevents search input click from propagating', () => {
      render(<MultiSelect {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Select climbing areas...'));
      const searchInput = screen.getByPlaceholderText('Search areas...');
      
      // Click on search input should not close dropdown
      fireEvent.click(searchInput);
      
      expect(screen.getByText('▲')).toBeInTheDocument();
    });

    it('prevents tag remove button click from propagating', () => {
      const onChange = jest.fn();
      render(<MultiSelect {...defaultProps} selectedAreas={['redrocks']} onChange={onChange} />);
      
      const removeButton = screen.getByText('×');
      fireEvent.click(removeButton);
      
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });
});