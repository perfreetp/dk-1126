import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useInspiration } from '../../store/InspirationContext';
import InspirationCard from '../../components/InspirationCard';
import styles from './index.module.scss';

const SearchPage: React.FC = () => {
  const { inspirations, deleteInspiration, togglePrivate } = useInspiration();
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(true);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    inspirations.forEach(insp => {
      insp.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [inspirations]);

  const recentInspirations = useMemo(() => {
    return inspirations
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [inspirations]);

  const searchResults = useMemo(() => {
    if (!keyword && selectedTags.length === 0) return [];

    return inspirations.filter(insp => {
      const matchKeyword = !keyword ||
        insp.content.toLowerCase().includes(keyword.toLowerCase()) ||
        insp.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())) ||
        (insp.project && insp.project.toLowerCase().includes(keyword.toLowerCase())) ||
        (insp.source && insp.source.toLowerCase().includes(keyword.toLowerCase()));

      const matchTags = selectedTags.length === 0 ||
        selectedTags.every(tag => insp.tags.includes(tag));

      return matchKeyword && matchTags;
    });
  }, [inspirations, keyword, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setShowRecent(false);
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setShowRecent(false);
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedTags([]);
    setShowRecent(true);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>搜索灵感</Text>
        <Text className={styles.subtitle}>快速找到你的创意 💫</Text>
      </View>

      <View className={styles.searchBox}>
        <View className={styles.searchInputWrapper}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            value={keyword}
            onInput={(e: any) => handleSearch(e.detail.value)}
            placeholder="搜索关键词、项目或标签..."
            placeholderClass={styles.placeholder}
          />
          {(keyword || selectedTags.length > 0) && (
            <Text className={styles.clearBtn} onClick={handleClear}>✕</Text>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🏷️ 标签筛选</Text>
          <View className={styles.tagList}>
            {allTags.map(tag => (
              <View
                key={tag}
                className={`${styles.tag} ${selectedTags.includes(tag) ? styles.active : ''}`}
                onClick={() => toggleTag(tag)}
              >
                <Text>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {showRecent && !keyword && selectedTags.length === 0 ? (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🕐 最近使用</Text>
          {recentInspirations.length === 0 ? (
            <View className={styles.empty}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>还没有使用记录</Text>
            </View>
          ) : (
            <View className={styles.recentList}>
              {recentInspirations.map(insp => (
                <View key={insp.id} className={styles.recentItem}>
                  <Text className={styles.recentIcon}>💡</Text>
                  <View className={styles.recentContent}>
                    <Text className={styles.recentText}>{insp.content.substring(0, 50)}</Text>
                    <Text className={styles.recentTime}>{formatTime(insp.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <ScrollView scrollY className={styles.results}>
          <Text className={styles.resultsTitle}>
            找到 {searchResults.length} 条结果
          </Text>
          {searchResults.length === 0 ? (
            <View className={styles.empty}>
              <Text className={styles.emptyIcon}>🔍</Text>
              <Text className={styles.emptyText}>
                没有找到匹配的灵感\n尝试其他关键词或标签组合
              </Text>
            </View>
          ) : (
            <View className={styles.inspirationList}>
              {searchResults.map(inspiration => (
                <InspirationCard
                  key={inspiration.id}
                  inspiration={inspiration}
                  onDelete={() => deleteInspiration(inspiration.id)}
                  onTogglePrivate={() => togglePrivate(inspiration.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchPage;
