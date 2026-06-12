import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { FilterOptions } from '../../types/inspiration';
import styles from './index.module.scss';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filterOptions, onFilterChange }) => {
  const projects = ['品牌重塑', '商业空间', '文案库', '作品集', '用户调研'];
  const moods = [
    { value: 'creative', label: '创意' },
    { value: 'calm', label: '平静' },
    { value: 'energetic', label: '活力' },
    { value: 'romantic', label: '浪漫' },
    { value: 'serious', label: '严谨' }
  ];
  const colors = ['#E0F2FE', '#FEF3C7', '#FCE7F3', '#D1FAE5', '#E0E7FF'];
  const purposes = ['视觉优化', '空间设计', '文案创作', '产品策划'];

  const handleSelect = (type: string, value: string) => {
    const currentValue = (filterOptions as any)[type];
    if (currentValue === value) {
      onFilterChange({ ...filterOptions, [type]: undefined });
    } else {
      onFilterChange({ ...filterOptions, [type]: value });
    }
  };

  const renderFilterSection = (title: string, items: any[], type: string, showColor = false) => (
    <View className={styles.section}>
      <Text className={styles.sectionTitle}>{title}</Text>
      <ScrollView scrollX className={styles.scrollContainer}>
        <View className={styles.items}>
          {items.map((item, index) => {
            const value = typeof item === 'string' ? item : item.value;
            const label = typeof item === 'string' ? item : item.label;
            const isActive = (filterOptions as any)[type] === value;
            return (
              <View
                key={index}
                className={`${styles.filterItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleSelect(type, value)}
              >
                {showColor ? (
                  <View className={styles.colorItem}>
                    <View className={styles.colorDot} style={{ backgroundColor: value }} />
                    {isActive && <Text className={styles.checkMark}>✓</Text>}
                  </View>
                ) : (
                  <Text>{label}</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View className={styles.container}>
      {renderFilterSection('项目', projects, 'project')}
      {renderFilterSection('情绪', moods, 'mood')}
      {renderFilterSection('颜色', colors, 'color', true)}
      {renderFilterSection('用途', purposes, 'purpose')}
    </View>
  );
};

export default FilterBar;
