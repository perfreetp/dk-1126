import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import { useInspiration } from '../../store/InspirationContext';
import InspirationCard from '../../components/InspirationCard';
import FilterBar from '../../components/FilterBar';
import styles from './index.module.scss';

const LibraryPage: React.FC = () => {
  const {
    inspirations,
    filterOptions,
    setFilterOptions,
    getFilteredInspirations,
    deleteInspiration,
    togglePrivate
  } = useInspiration();
  const [showFilter, setShowFilter] = useState(false);

  const filteredInspirations = getFilteredInspirations();
  const privateCount = inspirations.filter(i => i.isPrivate).length;
  const publicCount = inspirations.length - privateCount;

  const handleCardClick = (id: string) => {
    console.log('[Library] Card clicked:', id);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>灵感库</Text>
        <Text className={styles.subtitle}>整理你的创意资产 📚</Text>
      </View>

      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{inspirations.length}</Text>
          <Text className={styles.statLabel}>全部灵感</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{publicCount}</Text>
          <Text className={styles.statLabel}>公开</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{privateCount}</Text>
          <Text className={styles.statLabel}>私密</Text>
        </View>
      </View>

      <Button
        className={`${styles.toggleFilter} ${showFilter ? styles.active : ''}`}
        onClick={() => setShowFilter(!showFilter)}
      >
        {showFilter ? '🔽 收起筛选' : '🔼 展开筛选'}
      </Button>

      {showFilter && (
        <FilterBar
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
        />
      )}

      <ScrollView scrollY className={styles.content}>
        {filteredInspirations.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>💭</Text>
            <Text className={styles.emptyText}>
              {inspirations.length === 0
                ? '还没有灵感，快去收集吧！\n点击底部「收集」开始记录'
                : '没有符合条件的灵感\n尝试调整筛选条件'}
            </Text>
          </View>
        ) : (
          <View className={styles.inspirationList}>
            {filteredInspirations.map(inspiration => (
              <InspirationCard
                key={inspiration.id}
                inspiration={inspiration}
                onClick={() => handleCardClick(inspiration.id)}
                onDelete={() => deleteInspiration(inspiration.id)}
                onTogglePrivate={() => togglePrivate(inspiration.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LibraryPage;
