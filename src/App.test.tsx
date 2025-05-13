import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

const mockBreweries = [
  {
    id: '1',
    name: 'Parrish Brewing Company',
    country: 'USA',
    state: 'Utah',
    postal_code: '84109',
    brewery_type: 'micro',
    website_url: 'https://ryanmparrish.com',
  }
];

beforeEach(() => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => mockBreweries
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders brewery app', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByTestId('brew-app')).toBeInTheDocument();
  });
});

test('renders brewery table after data is fetched', async () => {
  render(<App />);

  await waitFor(() => {
    const brewTable = screen.getByTestId('brew-table');
    expect(brewTable).toBeInTheDocument();
  });
});
