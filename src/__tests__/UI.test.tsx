// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard, DataContext, ToastContext } from '../App';

const mockDataContextValue: any = {
  exams: [],
  appointments: [],
  processedExams: [],
  pathologiesData: [],
  allSources: [],
  addExam: vi.fn(),
  addAppointment: vi.fn(),
  deleteAppointment: vi.fn(),
  user: { uid: '123', displayName: 'Test User' },
  signOut: vi.fn()
};

const renderWithProvider = (ui: React.ReactElement, providerProps: any) => {
  return render(
    <ToastContext.Provider value={{ addToast: vi.fn() } as any}>
      <DataContext.Provider value={{ ...mockDataContextValue, ...providerProps }}>
        {ui}
      </DataContext.Provider>
    </ToastContext.Provider>
  );
};

describe('Dashboard Component', () => {
  it('renders zero state metrics when no exams exist', () => {
    renderWithProvider(<Dashboard />, { processedExams: [], allSources: [] });
    // Title is present
    expect(screen.getByText('Visão Geral da Saúde')).toBeDefined();
    // Parâmetros Normais element exists
    expect(screen.getByText('Parâmetros Normais')).toBeDefined();
    
    // Check if 0% exists
    const zeroes = screen.getAllByText('0');
    expect(zeroes.length).toBeGreaterThan(0);
  });

  it('calculates metrics correctly for mock exams', () => {
    const processedExams = [
       { id: '1', nomeExame: 'Glicemia', dateObject: new Date('2024-01-01'), categoria: 'LAB', resultado: '90', dataExame: '01/01/2024', interpretacao: 'Normal' },
       { id: '2', nomeExame: 'Glicemia', dateObject: new Date('2024-02-01'), categoria: 'LAB', resultado: '85', dataExame: '01/02/2024', interpretacao: 'Normal' },
    ];
    
    // Update pathologiesData for mock
    const pathologiesData = [
        { 
            name: "Glicemia", 
            history: [{ dataExame: '01/01/2024', resultado: '90' }, { dataExame: '01/02/2024', resultado: '85' }], 
            category: "LAB", 
            timelineCategories: ["Normal"] 
        }
    ];

    renderWithProvider(<Dashboard />, { processedExams, pathologiesData, allSources: ['1','2'] });
    
    // There are 2 normal parameters, so the number '2' should be rendered. Wait, the specific counts might be 2.
    // Let's check for '100' % health score since all are Normal.
    expect(screen.getByText('100')).toBeDefined(); 

    // Exames Cadastrados should be defined
    expect(screen.getAllByText('Exames Cadastrados').length).toBeGreaterThan(0);
    
    // Since both are 'Normal', normal parameters count should be 2, but 2 might appear multiple times.
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThan(0);
  });
});

