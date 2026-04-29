export default function KeywordFilter({ 
  searchCategories, 
  selectedKeywords, 
  onFilterChange 
}) {
  
  const handleKeywordClick = (category, keyword) => {
    let newSelected = { ...selectedKeywords };
    
    // If this keyword is already selected in this category, deselect it
    if (newSelected[category] === keyword) {
      delete newSelected[category];
    } else {
      // Otherwise, select it (replacing any other selection in this category)
      newSelected[category] = keyword;
    }
    
    onFilterChange(newSelected);
  };

  const handleClearAll = () => {
    onFilterChange({});
  };

  const activeFilters = Object.values(selectedKeywords);
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#1e40af',
                marginRight: '0.5rem'
              }}>
                Filtered by:
              </span>
              {activeFilters.map((keyword, index) => (
                <span key={index} style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#111827',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {keyword}
                </span>
              ))}
            </div>
            <button
              onClick={handleClearAll}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                color: '#111827',
                border: '1px solid #111827',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#111827';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#111827';
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Keyword Categories */}
        <div>
          <p style={{ 
            fontSize: '0.9rem',
            color: '#6b7280',
            marginBottom: '1.5rem',
            fontWeight: '500'
          }}>
            {hasActiveFilters ? 'Refine your filters:' : 'Browse by keywords:'} (Select one from each category)
          </p>
          
          {Object.keys(searchCategories).map((category) => (
            <div key={category} style={{ marginBottom: '1.5rem' }}>
              <p style={{ 
                fontSize: '0.85rem',
                color: '#4b5563',
                marginBottom: '0.75rem',
                fontWeight: '600'
              }}>
                {category}:
              </p>
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {searchCategories[category].map((keyword) => {
                  const isSelected = selectedKeywords[category] === keyword;
                  return (
                    <button
                      key={keyword}
                      onClick={() => handleKeywordClick(category, keyword)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: isSelected ? '#111827' : '#eff6ff',
                        color: isSelected ? 'white' : '#111827',
                        border: isSelected ? '1px solid #111827' : '1px solid #bfdbfe',
                        borderRadius: '9999px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: isSelected ? '600' : '500'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = '#dbeafe';
                        }
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = '#eff6ff';
                        }
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}