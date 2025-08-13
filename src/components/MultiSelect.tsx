import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { ClimbingAreaData } from '../weatherData/weatherApi';

interface MultiSelectProps {
  areas: ClimbingAreaData;
  selectedAreas: string[];
  onChange: (selectedAreas: string[]) => void;
  maxSelections?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = memo(({ 
  areas, 
  selectedAreas, 
  onChange, 
  maxSelections = 10 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredAreas = useMemo(() => 
    Object.entries(areas).filter(([, area]) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [areas, searchTerm]
  );

  const handleAreaToggle = useCallback((areaKey: string) => {
    const isSelected = selectedAreas.includes(areaKey);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedAreas.filter(key => key !== areaKey);
    } else {
      if (selectedAreas.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      newSelection = [...selectedAreas, areaKey];
    }

    onChange(newSelection);
  }, [selectedAreas, maxSelections, onChange]);

  const removeArea = useCallback((areaKey: string) => {
    const newSelection = selectedAreas.filter(key => key !== areaKey);
    onChange(newSelection);
  }, [selectedAreas, onChange]);

  const getDisplayText = useCallback(() => {
    if (selectedAreas.length === 0) {
      return 'Select climbing areas...';
    }
    if (selectedAreas.length === 1) {
      return areas[selectedAreas[0]]?.name || 'Unknown area';
    }
    return `${selectedAreas.length} areas selected`;
  }, [selectedAreas, areas]);

  const handleToggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="multi-select" ref={containerRef}>
      <div
        className="multi-select-trigger"
        onClick={handleToggleOpen}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: 'white',
          cursor: 'pointer',
          minHeight: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ color: selectedAreas.length === 0 ? '#9ca3af' : '#374151' }}>
          {getDisplayText()}
        </span>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Selected areas tags */}
      {selectedAreas.length > 0 && (
        <div style={{ 
          marginTop: '8px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '4px' 
        }}>
          {selectedAreas.map(areaKey => (
            <span
              key={areaKey}
              style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {areas[areaKey]?.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeArea(areaKey);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1e40af',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '1',
                  padding: '0'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {/* Search input */}
          <div style={{ padding: '8px' }}>
            <input
              type="text"
              placeholder="Search areas..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Area options */}
          <div>
            {filteredAreas.map(([areaKey, area]) => {
              const isSelected = selectedAreas.includes(areaKey);
              const isDisabled = !isSelected && selectedAreas.length >= maxSelections;
              
              return (
                <div
                  key={areaKey}
                  onClick={() => !isDisabled && handleAreaToggle(areaKey)}
                  style={{
                    padding: '8px 12px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isSelected ? '#dbeafe' : 'white',
                    color: isDisabled ? '#9ca3af' : '#374151',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      e.currentTarget.style.backgroundColor = isSelected ? '#bfdbfe' : '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : 'white';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    readOnly
                    style={{ margin: 0 }}
                  />
                  <span>{area.name}</span>
                  {isDisabled && (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>
                      Max selections reached
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer info */}
          <div style={{ 
            padding: '8px 12px', 
            borderTop: '1px solid #f3f4f6',
            fontSize: '0.75rem',
            color: '#6b7280',
            backgroundColor: '#f9fafb'
          }}>
            {selectedAreas.length}/{maxSelections} areas selected
          </div>
        </div>
      )}
    </div>
  );
});

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;