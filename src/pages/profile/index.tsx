import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useInspiration } from '../../store/InspirationContext';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const {
    inspirations,
    getRecentInspirations,
    findDuplicates,
    deleteInspiration,
    togglePrivate
  } = useInspiration();

  const [showModal, setShowModal] = useState<string | null>(null);
  const [randomInspiration, setRandomInspiration] = useState<any>(null);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    const total = inspirations.length;
    const privateCount = inspirations.filter(i => i.isPrivate).length;
    const todayInspirs = getRecentInspirations(1);
    return { total, privateCount, todayCount: todayInspirs.length };
  }, [inspirations, getRecentInspirations]);

  const handleDailyReview = () => {
    const todayInspirs = getRecentInspirations(1);
    if (todayInspirs.length === 0) {
      Taro.showToast({ title: '今天还没有收集灵感', icon: 'none' });
    } else {
      setRandomInspiration(todayInspirs[0]);
      setShowModal('daily');
    }
  };

  const handleRandomDraw = () => {
    if (inspirations.length === 0) {
      Taro.showToast({ title: '还没有灵感可抽', icon: 'none' });
      return;
    }
    const randomIndex = Math.floor(Math.random() * inspirations.length);
    setRandomInspiration(inspirations[randomIndex]);
    setShowModal('random');
  };

  const handleDuplicateMerge = () => {
    const duplicates = findDuplicates();
    if (duplicates.length === 0) {
      Taro.showToast({ title: '没有发现重复素材', icon: 'success' });
    } else {
      setShowModal('duplicates');
    }
  };

  const handlePrivateLock = () => {
    const publicInspirs = inspirations.filter(i => !i.isPrivate);
    if (publicInspirs.length === 0) {
      Taro.showToast({ title: '所有灵感都已锁定', icon: 'success' });
    } else {
      Taro.showModal({
        title: '私密锁定',
        content: `确定要将所有 ${publicInspirs.length} 条灵感设为私密吗？`,
        success: (res) => {
          if (res.confirm) {
            publicInspirs.forEach(i => togglePrivate(i.id));
            Taro.showToast({ title: '已全部设为私密 🔒', icon: 'success' });
          }
        }
      });
    }
  };

  const generateShareImage = async () => {
    if (inspirations.length === 0) {
      Taro.showToast({ title: '没有灵感可分享', icon: 'none' });
      return;
    }

    setIsGenerating(true);
    Taro.showLoading({ title: '正在生成...' });

    try {
      const ctx = Taro.createCanvasContext('shareCanvas');
      const systemInfo = Taro.getSystemInfoSync();
      const canvasWidth = systemInfo.windowWidth * 2;
      
      const lineHeight = 80;
      const headerHeight = 300;
      const itemHeight = 120;
      const padding = 40;
      const content = inspirations.slice(0, 10);
      
      const totalHeight = headerHeight + content.length * itemHeight + padding * 2;
      setCanvasHeight(totalHeight);

      await new Promise(resolve => setTimeout(resolve, 100));

      ctx.setFillStyle('#F8FAFC');
      ctx.fillRect(0, 0, canvasWidth, totalHeight);

      const gradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
      gradient.addColorStop(0, '#6366F1');
      gradient.addColorStop(1, '#818CF8');
      ctx.setFillStyle(gradient);
      ctx.fillRect(0, 0, canvasWidth, headerHeight);

      ctx.setFillStyle('#FFFFFF');
      ctx.setFontSize(56);
      ctx.fillText('灵感口袋', padding, 100);

      ctx.setFontSize(32);
      ctx.fillText(`已收集 ${stats.total} 条灵感 ✨`, padding, 160);

      ctx.setFontSize(28);
      ctx.fillText(`私密 ${stats.privateCount} 条 | 今日 ${stats.todayCount} 条`, padding, 200);

      ctx.setFillStyle('#F8FAFC');
      ctx.fillRect(0, headerHeight, canvasWidth, 2);

      ctx.setFillStyle('#1E293B');
      ctx.setFontSize(28);
      ctx.fillText('灵感摘要', padding, headerHeight + 60);

      content.forEach((insp, index) => {
        const y = headerHeight + 100 + index * itemHeight;
        
        ctx.setFillStyle('#FFFFFF');
        ctx.fillRect(padding, y, canvasWidth - padding * 2, itemHeight - 20);

        ctx.setFillStyle('#64748B');
        ctx.setFontSize(20);
        const typeIcon = {
          'text': '✏️',
          'image': '🖼️',
          'voice': '🎙️',
          'webpage': '🔗'
        }[insp.type] || '💡';
        ctx.fillText(typeIcon, padding + 20, y + 40);

        if (insp.isPrivate) {
          ctx.fillText('🔒', padding + canvasWidth - 60, y + 40);
        }

        ctx.setFillStyle('#1E293B');
        ctx.setFontSize(24);
        const text = insp.content.length > 25 ? insp.content.substring(0, 25) + '...' : insp.content;
        ctx.fillText(text, padding + 60, y + 40);

        if (insp.tags.length > 0) {
          ctx.setFillStyle('#6366F1');
          ctx.setFontSize(18);
          const tagsText = insp.tags.slice(0, 2).map(t => `#${t}`).join(' ');
          ctx.fillText(tagsText, padding + 60, y + 70);
        }

        if (insp.source) {
          ctx.setFillStyle('#94A3B8');
          ctx.setFontSize(18);
          ctx.fillText(`📍 ${insp.source}`, padding + 60, y + 95);
        }
      });

      ctx.setFillStyle('#94A3B8');
      ctx.setFontSize(20);
      ctx.fillText('由灵感口袋生成', padding, totalHeight - 30);

      ctx.draw(true, () => {
        Taro.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: (res) => {
            Taro.hideLoading();
            setIsGenerating(false);
            
            Taro.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                Taro.showToast({ title: '图片已保存到相册 ✨', icon: 'success' });
                setShowModal(null);
              },
              fail: () => {
                Taro.showToast({ title: '保存失败，请授权', icon: 'none' });
              }
            });
          },
          fail: (err) => {
            console.error('[Profile] Canvas to temp file error:', err);
            Taro.hideLoading();
            setIsGenerating(false);
            Taro.showToast({ title: '生成失败', icon: 'none' });
          }
        });
      });
    } catch (error) {
      console.error('[Profile] Generate image error:', error);
      Taro.hideLoading();
      setIsGenerating(false);
      Taro.showToast({ title: '生成失败', icon: 'none' });
    }
  };

  const handleShareLongImage = () => {
    if (inspirations.length === 0) {
      Taro.showToast({ title: '没有灵感可分享', icon: 'none' });
      return;
    }
    setShowModal('share');
  };

  const duplicates = useMemo(() => findDuplicates(), [inspirations]);

  return (
    <View className={styles.container}>
      <View class={styles.canvasContainer}>
        <Canvas
          canvasId="shareCanvas"
          style={`width: 750rpx; height: ${canvasHeight}rpx`}
          type="2d"
        />
      </View>

      <View className={styles.header}>
        <Text className={styles.title}>我的</Text>
        <Text className={styles.subtitle}>管理你的创意资产 👤</Text>
      </View>

      <View className={styles.stats}>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>💡</Text>
          <Text className={styles.statValue}>{stats.total}</Text>
          <Text className={styles.statLabel}>总灵感</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>🔒</Text>
          <Text className={styles.statValue}>{stats.privateCount}</Text>
          <Text className={styles.statLabel}>私密</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>📅</Text>
          <Text className={styles.statValue}>{stats.todayCount}</Text>
          <Text className={styles.statLabel}>今日</Text>
        </View>
      </View>

      <View className={styles.actions}>
        <View className={styles.actionCard} onClick={handleDailyReview}>
          <View className={styles.actionHeader}>
            <Text className={styles.actionIcon}>📅</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>每日回顾</Text>
              <Text className={styles.actionDesc}>回顾今天收集的灵感</Text>
            </View>
            <Text className={styles.actionArrow}>→</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={handleRandomDraw}>
          <View className={styles.actionHeader}>
            <Text className={styles.actionIcon}>🎲</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>随机抽卡</Text>
              <Text className={styles.actionDesc}>随机抽取一条灵感获得惊喜</Text>
            </View>
            <Text className={styles.actionArrow}>→</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={handleDuplicateMerge}>
          <View className={styles.actionHeader}>
            <Text className={styles.actionIcon}>🔄</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>重复合并</Text>
              <Text className={styles.actionDesc}>发现并处理重复的灵感素材</Text>
            </View>
            <Text className={styles.actionArrow}>→</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={handlePrivateLock}>
          <View className={styles.actionHeader}>
            <Text className={styles.actionIcon}>🔐</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>私密锁定</Text>
              <Text className={styles.actionDesc}>一键将所有灵感设为私密</Text>
            </View>
            <Text className={styles.actionArrow}>→</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={handleShareLongImage}>
          <View className={styles.actionHeader}>
            <Text className={styles.actionIcon}>📱</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>一键分享长图</Text>
              <Text className={styles.actionDesc}>生成精美长图分享给朋友</Text>
            </View>
            <Text className={styles.actionArrow}>→</Text>
          </View>
        </View>
      </View>

      {showModal === 'daily' && randomInspiration && (
        <View className={styles.modal} onClick={() => setShowModal(null)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>📅 每日回顾</Text>
              <Text className={styles.closeBtn} onClick={() => setShowModal(null)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.randomInspiration}>
                <Text className={styles.randomContent}>{randomInspiration.content}</Text>
                <View className={styles.randomTags}>
                  {randomInspiration.tags.map((tag: string, i: number) => (
                    <Text key={i} className={styles.randomTag}>{tag}</Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {showModal === 'random' && randomInspiration && (
        <View className={styles.modal} onClick={() => setShowModal(null)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>🎲 随机灵感</Text>
              <Text className={styles.closeBtn} onClick={() => setShowModal(null)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.randomInspiration}>
                <Text className={styles.randomContent}>{randomInspiration.content}</Text>
                <View className={styles.randomTags}>
                  {randomInspiration.tags.map((tag: string, i: number) => (
                    <Text key={i} className={styles.randomTag}>{tag}</Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {showModal === 'duplicates' && (
        <View className={styles.modal} onClick={() => setShowModal(null)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>🔄 重复素材</Text>
              <Text className={styles.closeBtn} onClick={() => setShowModal(null)}>✕</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {duplicates.length === 0 ? (
                <View className={styles.empty}>
                  <Text className={styles.emptyIcon}>✅</Text>
                  <Text className={styles.emptyText}>没有发现重复素材</Text>
                </View>
              ) : (
                duplicates.map((group, index) => (
                  <View key={index} className={styles.duplicateItem}>
                    <Text className={styles.duplicateHeader}>
                      发现 {group.length} 条相似灵感
                    </Text>
                    <View className={styles.duplicateActions}>
                      <Text
                        className={styles.deduplicateBtn}
                        onClick={() => {
                          group.slice(1).forEach(i => deleteInspiration(i.id));
                          Taro.showToast({ title: '已保留第一条，删除其余', icon: 'success' });
                          setShowModal(null);
                        }}
                      >
                        保留一条
                      </Text>
                      <Text
                        className={styles.skipBtn}
                        onClick={() => setShowModal(null)}
                      >
                        稍后处理
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {showModal === 'share' && (
        <View className={styles.modal} onClick={() => setShowModal(null)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>📱 生成长图</Text>
              <Text className={styles.closeBtn} onClick={() => setShowModal(null)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.sharePreview}>
                <Text className={styles.shareTitle}>灵感口袋</Text>
                <Text className={styles.shareContent}>
                  已收集 {stats.total} 条灵感 ✨
                  {'\n\n'}
                  {inspirations.slice(0, 5).map((insp, i) => (
                    `• ${insp.content.substring(0, 30)}...\n`
                  ))}
                </Text>
              </View>
              <View
                className={styles.shareBtn}
                onClick={generateShareImage}
              >
                {isGenerating ? (
                  <Text>生成中...</Text>
                ) : (
                  <Text>保存图片到相册</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfilePage;
