import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { CollageGroup as CollageGroupType, Inspiration } from '../../types/inspiration';
import styles from './index.module.scss';

interface CollageGroupProps {
  group: CollageGroupType;
  inspirations: Inspiration[];
  onEdit?: () => void;
  onDelete?: () => void;
}

const CollageGroup: React.FC<CollageGroupProps> = ({
  group,
  inspirations,
  onEdit,
  onDelete
}) => {
  const groupInspirations = inspirations.filter(insp => group.inspirationIds.includes(insp.id));

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>{group.name}</Text>
        <View className={styles.actions}>
          {onEdit && (
            <Text className={styles.editBtn} onClick={onEdit}>✏️</Text>
          )}
          {onDelete && (
            <Text className={styles.deleteBtn} onClick={onDelete}>🗑️</Text>
          )}
        </View>
      </View>

      <View className={styles.inspirations}>
        {groupInspirations.map(insp => (
          <View key={insp.id} className={styles.inspirationItem}>
            {insp.type === 'image' && insp.imageUrl ? (
              <Image className={styles.inspirationImage} src={insp.imageUrl} mode="aspectFill" />
            ) : (
              <View className={styles.textPreview}>
                <Text>{insp.content.substring(0, 50)}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {group.description && (
        <Text className={styles.description}>{group.description}</Text>
      )}

      <View className={styles.footer}>
        <Text className={styles.count}>{groupInspirations.length} 条素材</Text>
      </View>
    </View>
  );
};

export default CollageGroup;
