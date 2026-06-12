import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Inspiration, CollageGroup, FilterOptions } from '../types/inspiration';
import { mockInspirations } from '../data/mockInspirations';

interface InspirationContextType {
  inspirations: Inspiration[];
  collageGroups: CollageGroup[];
  filterOptions: FilterOptions;
  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInspiration: (id: string, updates: Partial<Inspiration>) => void;
  deleteInspiration: (id: string) => void;
  togglePrivate: (id: string) => void;
  setFilterOptions: (options: FilterOptions) => void;
  createCollageGroup: (group: Omit<CollageGroup, 'id' | 'createdAt'>) => void;
  updateCollageGroup: (id: string, updates: Partial<CollageGroup>) => void;
  deleteCollageGroup: (id: string) => void;
  getFilteredInspirations: () => Inspiration[];
  getRecentInspirations: (days: number) => Inspiration[];
  findDuplicates: () => Inspiration[][];
}

const InspirationContext = createContext<InspirationContextType | undefined>(undefined);

export const InspirationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inspirations, setInspirations] = useState<Inspiration[]>(mockInspirations);
  const [collageGroups, setCollageGroups] = useState<CollageGroup[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  const addInspiration = (inspiration: Omit<Inspiration, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInspiration: Inspiration = {
      ...inspiration,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setInspirations(prev => [newInspiration, ...prev]);
  };

  const updateInspiration = (id: string, updates: Partial<Inspiration>) => {
    setInspirations(prev =>
      prev.map(insp =>
        insp.id === id ? { ...insp, ...updates, updatedAt: new Date().toISOString() } : insp
      )
    );
  };

  const deleteInspiration = (id: string) => {
    setInspirations(prev => prev.filter(insp => insp.id !== id));
  };

  const togglePrivate = (id: string) => {
    setInspirations(prev =>
      prev.map(insp =>
        insp.id === id ? { ...insp, isPrivate: !insp.isPrivate, updatedAt: new Date().toISOString() } : insp
      )
    );
  };

  const createCollageGroup = (group: Omit<CollageGroup, 'id' | 'createdAt'>) => {
    const newGroup: CollageGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCollageGroups(prev => [...prev, newGroup]);
  };

  const updateCollageGroup = (id: string, updates: Partial<CollageGroup>) => {
    setCollageGroups(prev =>
      prev.map(group => (group.id === id ? { ...group, ...updates } : group))
    );
  };

  const deleteCollageGroup = (id: string) => {
    setCollageGroups(prev => prev.filter(group => group.id !== id));
  };

  const getFilteredInspirations = () => {
    return inspirations.filter(insp => {
      if (filterOptions.project && insp.project !== filterOptions.project) return false;
      if (filterOptions.mood && insp.mood !== filterOptions.mood) return false;
      if (filterOptions.color && insp.color !== filterOptions.color) return false;
      if (filterOptions.purpose && insp.purpose !== filterOptions.purpose) return false;
      return true;
    });
  };

  const getRecentInspirations = (days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return inspirations.filter(insp => new Date(insp.createdAt) >= cutoff);
  };

  const findDuplicates = () => {
    const groups: { [key: string]: Inspiration[] } = {};
    inspirations.forEach(insp => {
      const key = `${insp.type}-${insp.content}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(insp);
    });
    return Object.values(groups).filter(group => group.length > 1);
  };

  return (
    <InspirationContext.Provider
      value={{
        inspirations,
        collageGroups,
        filterOptions,
        addInspiration,
        updateInspiration,
        deleteInspiration,
        togglePrivate,
        setFilterOptions,
        createCollageGroup,
        updateCollageGroup,
        deleteCollageGroup,
        getFilteredInspirations,
        getRecentInspirations,
        findDuplicates
      }}
    >
      {children}
    </InspirationContext.Provider>
  );
};

export const useInspiration = () => {
  const context = useContext(InspirationContext);
  if (!context) {
    throw new Error('useInspiration must be used within InspirationProvider');
  }
  return context;
};
