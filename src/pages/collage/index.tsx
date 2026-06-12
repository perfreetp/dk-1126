import React, { useState } from 'react';
import { View, Text, Image, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useInspiration } from '../../store/InspirationContext';
import InspirationCard from '../../components/InspirationCard';
import styles from './index.module.scss';

const CollagePage: React.FC = () => {
  const {
    inspirations,
    collageGroups,
    createCollageGroup,
    updateCollageGroup,
    deleteCollageGroup,
    togglePrivate
  } = useInspiration();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedInspirationId, setSelectedInspirationId] = useState<string | null>(null);
  const [showInspirationDetail, setShowInspirationDetail] = useState<string | null>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleLongPress = (id: string) => {
    setSelectedInspirationId(id);
    setShowMoveModal(true);
  };

  const handleInspirationClick = (id: string) => {
    setShowInspirationDetail(id);
  };

  const handleMoveToGroup = (groupId: string) => {
    if (!selectedInspirationId) return;

    const group = collageGroups.find(g => g.id === groupId);
    if (group && !group.inspirationIds.includes(selectedInspirationId)) {
      updateCollageGroup(groupId, {
        inspirationIds: [...group.inspirationIds, selectedInspirationId]
      });
      Taro.showToast({ title: '已添加到拼贴组 ✨', icon: 'success' });
    }

    setShowMoveModal(false);
    setSelectedInspirationId(null);
  };

  const handleCreateNewGroup = () => {
    if (!selectedInspirationId) return;

    const newGroupId = Date.now().toString();
    createCollageGroup({
      name: '新拼贴组',
      description: '',
      inspirationIds: [selectedInspirationId]
    });

    Taro.showToast({ title: '已创建新拼贴组 ✨', icon: 'success' });
    setShowMoveModal(false);
    setSelectedInspirationId(null);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Taro.showToast({ title: '请输入组名称', icon: 'none' });
      return;
    }

    if (editingGroupId) {
      updateCollageGroup(editingGroupId, {
        name: groupName,
        description: groupDescription
      });
      Taro.showToast({ title: '拼贴组已更新 ✨', icon: 'success' });
    } else {
      createCollageGroup({
        name: groupName,
        description: groupDescription,
        inspirationIds: selectedIds
      });
      Taro.showToast({ title: '拼贴组创建成功 ✨', icon: 'success' });
    }

    setGroupName('');
    setGroupDescription('');
    setSelectedIds([]);
    setShowForm(false);
    setEditingGroupId(null);
  };

  const handleEditGroup = (groupId: string) => {
    const group = collageGroups.find(g => g.id === groupId);
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description || '');
      setEditingGroupId(groupId);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setGroupName('');
    setGroupDescription('');
    setEditingGroupId(null);
  };

  const getUngroupedInspirations = () => {
    const groupedIds = new Set<string>();
    collageGroups.forEach(group => {
      group.inspirationIds.forEach(id => groupedIds.add(id));
    });
    return inspirations.filter(insp => !groupedIds.has(insp.id));
  };

  const ungroupedInspirations = getUngroupedInspirations();

  const selectedInspiration = showInspirationDetail 
    ? inspirations.find(i => i.id === showInspirationDetail) 
    : null;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>拼贴板</Text>
        <Text className={styles.subtitle}>组合灵感，激发创意 🎨</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📌 未分组素材</Text>
        <Text className={styles.sectionHint}>点击查看详情 | 长按添加到拼贴组</Text>
        <View className={styles.inspirationsGrid}>
          {ungroupedInspirations.map(insp => (
            <View
              key={insp.id}
              className={`${styles.inspirationItem} ${selectedIds.includes(insp.id) ? styles.selected : ''}`}
              onClick={() => handleInspirationClick(insp.id)}
              onLongPress={() => handleLongPress(insp.id)}
            >
              {insp.type === 'image' && insp.imageUrl ? (
                <Image className={styles.inspirationImage} src={insp.imageUrl} mode="aspectFill" />
              ) : (
                <View className={styles.inspirationText}>
                  <Text>{insp.content.substring(0, 30)}</Text>
                </View>
              )}
              {selectedIds.includes(insp.id) && (
                <View className={styles.checkOverlay}>
                  <Text className={styles.checkIcon}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {ungroupedInspirations.length === 0 && (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>✨</Text>
            <Text className={styles.emptyText}>所有素材都已分组</Text>
          </View>
        )}

        {selectedIds.length > 0 && (
          <View className={styles.selectedInfo}>
            <Text className={styles.selectedText}>已选择 {selectedIds.length} 条素材</Text>
          </View>
        )}

        {!showForm ? (
          <Button
            className={styles.createGroupBtn}
            onClick={() => setShowForm(true)}
            disabled={selectedIds.length === 0}
          >
            + 创建拼贴组
          </Button>
        ) : (
          <View className={styles.groupForm}>
            <Input
              className={styles.input}
              value={groupName}
              onInput={(e: any) => setGroupName(e.detail.value)}
              placeholder="输入拼贴组名称"
              placeholderClass={styles.placeholder}
            />
            <Textarea
              className={styles.textarea}
              value={groupDescription}
              onInput={(e: any) => setGroupDescription(e.detail.value)}
              placeholder="写下这个拼贴组的创意说明..."
              placeholderClass={styles.placeholder}
              maxlength={300}
            />
            <View className={styles.formActions}>
              <Button className={styles.cancelBtn} onClick={handleCancelForm}>
                取消
              </Button>
              <Button className={styles.confirmBtn} onClick={handleCreateGroup}>
                {editingGroupId ? '更新' : '创建'}
              </Button>
            </View>
          </View>
        )}
      </View>

      <View className={styles.groupsSection}>
        <Text className={styles.sectionTitle}>📁 我的拼贴组</Text>
        {collageGroups.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🖼️</Text>
            <Text className={styles.emptyText}>
              还没有拼贴组\n长按素材或选择后创建拼贴组吧
            </Text>
          </View>
        ) : (
          <View className={styles.groupsList}>
            {collageGroups.map(group => (
              <View key={group.id} className={styles.groupContainer}>
                <View className={styles.groupHeader}>
                  <Text className={styles.groupName}>{group.name}</Text>
                  <View className={styles.groupActions}>
                    <Text className={styles.editBtn} onClick={() => handleEditGroup(group.id)}>✏️</Text>
                    <Text className={styles.deleteBtn} onClick={() => {
                      deleteCollageGroup(group.id);
                      Taro.showToast({ title: '已删除', icon: 'success' });
                    }}>🗑️</Text>
                  </View>
                </View>
                <View className={styles.groupInspirations}>
                  {group.inspirationIds.map(inspId => {
                    const insp = inspirations.find(i => i.id === inspId);
                    if (!insp) return null;
                    return (
                      <View
                        key={insp.id}
                        className={styles.groupInspirationItem}
                        onClick={() => handleInspirationClick(insp.id)}
                      >
                        {insp.type === 'image' && insp.imageUrl ? (
                          <Image className={styles.groupInspirationImage} src={insp.imageUrl} mode="aspectFill" />
                        ) : (
                          <View className={styles.groupInspirationText}>
                            <Text>{insp.content.substring(0, 20)}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
                {group.description && (
                  <Text className={styles.groupDescription}>{group.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {showMoveModal && (
        <View className={styles.modal} onClick={() => setShowMoveModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加到拼贴组</Text>
              <Text className={styles.closeBtn} onClick={() => setShowMoveModal(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.groupList}>
                {collageGroups.map(group => (
                  <View
                    key={group.id}
                    className={styles.groupItem}
                    onClick={() => handleMoveToGroup(group.id)}
                  >
                    <Text className={styles.groupItemName}>{group.name}</Text>
                    <Text className={styles.groupCount}>{group.inspirationIds.length} 条</Text>
                  </View>
                ))}
              </View>
              <Button className={styles.newGroupBtn} onClick={handleCreateNewGroup}>
                + 创建新拼贴组
              </Button>
            </View>
          </View>
        </View>
      )}

      {showInspirationDetail && selectedInspiration && (
        <View className={styles.modal} onClick={() => setShowInspirationDetail(null)}>
          <View className={styles.detailModalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>灵感详情</Text>
              <Text className={styles.closeBtn} onClick={() => setShowInspirationDetail(null)}>✕</Text>
            </View>
            <InspirationCard
              inspiration={selectedInspiration}
              onDelete={() => {
                Taro.showModal({
                  title: '确认删除',
                  content: '确定要删除这条灵感吗？',
                  success: (res) => {
                    if (res.confirm) {
                      deleteInspiration(selectedInspiration.id);
                      Taro.showToast({ title: '已删除', icon: 'success' });
                      setShowInspirationDetail(null);
                    }
                  }
                });
              }}
              onTogglePrivate={() => {
                togglePrivate(selectedInspiration.id);
                Taro.showToast({ 
                  title: selectedInspiration.isPrivate ? '已公开' : '已私密', 
                  icon: 'success' 
                });
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default CollagePage;
