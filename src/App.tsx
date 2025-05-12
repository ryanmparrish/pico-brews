import React, { useState, useEffect } from 'react';
import './App.css';

interface Brewery {
  id: string;
  name: string;
  country: string;
  state: string;
  postal_code: string;
  brewery_type: string;
  website_url: string | null;
}

const itemsPerPage = 10;
const BreweryList = () => {
  const [breweries, setBreweries] = useState<Brewery[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Brewery; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchBreweries = async () => {
      if (breweries) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://api.openbrewerydb.org/v1/breweries?per_page=200');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Brewery[] = await response.json();
        setBreweries(data);
        setLoading(false);

        const types = Array.from(new Set(data.map((brewery) => brewery.brewery_type))).sort();
        setAvailableTypes(types);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchBreweries();
  }, [breweries]);

  const handleSort = (key: keyof Brewery) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedBreweries = (breweries: Brewery[]) => {
    if (!sortConfig || !sortConfig.key) return breweries;

    return [...breweries].sort((a, b) => {
      const aValue = a[sortConfig.key] as string;
      const bValue = b[sortConfig.key] as string;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredBreweries = filterType
    ? breweries?.filter((brewery) => brewery.brewery_type === filterType) ?? []
    : breweries ?? [];

  const sortedBreweries = getSortedBreweries(filteredBreweries);

  const totalPages = Math.ceil(sortedBreweries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBreweries = sortedBreweries.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(event.target.value);
    setCurrentPage(1);
  };

  const getSortIcon = (key: keyof Brewery) => {
    if (!sortConfig || sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <div>Loading breweries...</div>;
  }

  if (error) {
    return <div>Error fetching breweries: {error}</div>;
  }

  return (
    <div className='brewery-list'>

      <div className='filter-by-type'>
        <label htmlFor="filter">Filter by Type: </label>
        <select id="filter" value={filterType} onChange={handleFilterChange}>
          <option value="">All Types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <table data-testid="brew-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </th>
            <th onClick={() => handleSort('country')}>
              Country {getSortIcon('country')}
            </th>
            <th onClick={() => handleSort('state')}>
              State {getSortIcon('state')}
            </th>
            <th onClick={() => handleSort('postal_code')}>
              ZIP {getSortIcon('postal_code')}
            </th>
            <th>Website</th>
            <th>
              <select 
                value={filterType} 
                onChange={handleFilterChange}
                style={{ width: '100%', padding: '4px' }}
              >
                <option value="">Type</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentBreweries.map((brewery) => (
            <tr key={brewery.id}>
              <td>{brewery.name}</td>
              <td>{brewery.country}</td>
              <td>{brewery.state}</td>
              <td>{brewery.postal_code}</td>
              <td>
                {brewery.website_url ? (
                  <a 
                    href={brewery.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#0000cc', textDecoration: 'none' }}
                  >
                    Visit Site
                  </a>
                ) : (
                  <span style={{ color: '#ccc' }}>No website</span>
                )}
              </td>
              <td>{brewery.brewery_type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='pagination'>
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <div data-testid="brew-app" className="app">
      <header className="app-header">
        <h1>Breweries 🍺</h1>
      </header>
      <BreweryList /> 
    </div>
  );
}

export default App;
