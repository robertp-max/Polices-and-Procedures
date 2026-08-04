import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ComplianceHomeScreen } from './ComplianceHomeScreen';

describe('ComplianceHomeScreen registry discovery', () => {
  it('links to registry, vendor, and contractor management', () => {
    render(
      <MemoryRouter initialEntries={['/compliance']}>
        <ComplianceHomeScreen />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Open Registry Management' }).getAttribute('href')).toBe(
      '/compliance/master-controls',
    );
    expect(screen.getByRole('link', { name: 'Open Vendor Management' }).getAttribute('href')).toBe(
      '/compliance/vendors',
    );
    expect(screen.getByRole('link', { name: 'Open Contractor Management' }).getAttribute('href')).toBe(
      '/compliance/contractors',
    );
  });
});
