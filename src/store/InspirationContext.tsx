import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { Inspiration, CollageGroup, FilterOptions } from '../types/inspiration';
import { mockInspirations } from '../data/mockInspirations';

const STORAGE_KEY_INSPIRATIONS = 'inspirations';
const STORAGE_KEY_COLLAGE_GROUPS = 'collage_groups';

interface InspirationContextType {
  inspirations: Inspiration[];
  collageGroups: CollageGroup[];
  filterOptions: FilterOptions;
  isLoading: boolean;
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
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [collageGroups, setCollageGroups] = useState<CollageGroup[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedInspirations = Taro.getStorageSync(STORAGE_KEY_INSPIRATIONS);
      const savedCollageGroups = Taro.getStorageSync(STORAGE_KEY_COLLAGE_GROUPS);
      
      if (savedInspirations && Array.isArray(savedInspirations) && savedInspirations.length > 0) {
        setInspirations(savedInspirations);
      } else {
        setInspirations(mockInspirations);
        Taro.setStorageSync(STORAGE_KEY_INSPIRATIONS, mockInspirations);
      }
      
      if (savedCollageGroups && Array.isArray(savedCollageGroups)) {
        setCollageGroups(savedCollageGroups);
      }
    } catch (error) {
      console.error('[InspirationContext] Load data error:', error);
      setInspirations(mockInspirations);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInspirations = (data: Inspiration[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY_INSPIRATIONS, data);
    } catch (error) {
      console.error('[InspirationContext] Save inspirations error:', error);
    }
  };

  const saveCollageGroups = (data: CollageGroup[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY_COLLAGE_GROUPS, data);
    } catch (error) {
      console.error('[InspirationContext] Save collage groups error:', error);
    }
  };

  const addInspiration = (inspiration: Omit<Inspiration, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInspiration: Inspiration = {
      ...inspiration,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedList = [newInspiration, ...inspirations];
    setInspirations(updatedList);
    saveInspirations(updatedList);
  };

  const updateInspiration = (id: string, updates: Partial<Inspiration>) => {
    const updatedList = inspirations.map(insp =>
      insp.id === id ? { ...insp, ...updates, updatedAt: new Date().toISOString() } : insp
    );
    setInspirations(updatedList);
    saveInspirations(updatedList);
  };

  const deleteInspiration = (id: string) => {
    const updatedList = inspirations.filter(insp => insp.id !== id);
    setInspirations(updatedList);
    saveInspirations(updatedList);
    
    const updatedGroups = collageGroups.map(group => ({
      ...group,
      inspirationIds: group.inspirationIds.filter(inspId => inspId !== id)
    }));
    setCollageGroups(updatedGroups);
    saveCollageGroups(updatedGroups);
  };

  const togglePrivate = (id: string) => {
    const updatedList = inspirations.map(insp =>
      insp.id === id ? { ...insp, isPrivate: !insp.isPrivate, updatedAt: new Date().toISOString() } : insp
    );
    setInspirations(updatedList);
    saveInspirations(updatedList);
  };

  const createCollageGroup = (group: Omit<CollageGroup, 'id' | 'createdAt'>) => {
    const newGroup: CollageGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedList = [...collageGroups, newGroup];
    setCollageGroups(updatedList);
    saveCollageGroups(updatedList);
  };

  const updateCollageGroup = (id: string, updates: Partial<CollageGroup>) => {
    const updatedList = collageGroups.map(group => 
      group.id === id ? { ...group, ...updates } : group
    );
    setCollageGroups(updatedList);
    saveCollageGroups(updatedList);
  };

  const deleteCollageGroup = (id: string) => {
    const updatedList = collageGroups.filter(group => group.id !== id);
    setCollageGroups(updatedList);
    saveCollageGroups(updatedList);
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
        isLoading,
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
