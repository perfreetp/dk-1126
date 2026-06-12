import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { Inspiration } from '../../types/inspiration';
import styles from './index.module.scss';

interface InspirationCardProps {
  inspiration: Inspiration;
  onClick?: () => void;
  onDelete?: () => void;
  onTogglePrivate?: () => void;
}

const InspirationCard: React.FC<InspirationCardProps> = ({
  inspiration,
  onClick,
  onDelete,
  onTogglePrivate
}) => {
  const getTypeIcon = () => {
    switch (inspiration.type) {
      case 'text':
        return '✏️';
      case 'image':
        return '🖼️';
      case 'voice':
        return '🎙️';
      case 'webpage':
        return '🔗';
      default:
        return '💡';
    }
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.typeTag}>
          <Text>{getTypeIcon()}</Text>
          <Text className={styles.typeText}>{inspiration.type === 'webpage' ? '网页' : inspiration.type === 'voice' ? '语音' : inspiration.type === 'image' ? '图片' : '文字'}</Text>
        </View>
        <View className={styles.actions}>
          {inspiration.isPrivate && (
            <Text className={styles.lockIcon} onClick={(e) => { e.stopPropagation(); onTogglePrivate?.(); }}>🔒</Text>
          )}
          {onDelete && (
            <Text className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</Text>
          )}
        </View>
      </View>

      {inspiration.type === 'image' && inspiration.imageUrl ? (
        <Image className={styles.image} src={inspiration.imageUrl} mode="aspectFill" />
      ) : null}

      <Text className={styles.content}>{inspiration.content}</Text>

      {inspiration.source && (
        <Text className={styles.source}>来源: {inspiration.source}</Text>
      )}

      {inspiration.tags.length > 0 && (
        <View className={styles.tags}>
          {inspiration.tags.map((tag, index) => (
            <View key={index} className={styles.tag}>
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View className={styles.footer}>
        {inspiration.project && (
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>项目:</Text>
            <Text className={styles.metaValue}>{inspiration.project}</Text>
          </View>
        )}
        {inspiration.mood && (
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>情绪:</Text>
            <Text className={styles.metaValue}>{inspiration.mood}</Text>
          </View>
        )}
        {inspiration.color && (
          <View className={styles.colorDot} style={{ backgroundColor: inspiration.color }} />
        )}
      </View>
    </View>
  );
};

export default InspirationCard;
