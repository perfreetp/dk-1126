import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useInspiration } from '../../store/InspirationContext';
import TagInput from '../../components/TagInput';
import styles from './index.module.scss';

const CollectPage: React.FC = () => {
  const { addInspiration } = useInspiration();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [project, setProject] = useState('');
  const [mood, setMood] = useState('');
  const [color, setColor] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleImageUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setImageUrl(tempFilePath);
        setContent('图片灵感');
      }
    });
  };

  const handleVoiceRecord = () => {
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'm4a'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        setContent('语音记录已添加');
        Taro.showToast({
          title: '语音文件已选择（实际需上传服务器）',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '请选择音频文件',
          icon: 'none'
        });
      }
    });
  };

  const handleSaveWebpage = () => {
    Taro.getClipboardData({
      success: (res) => {
        if (res.data && res.data.includes('http')) {
          setContent(res.data);
          Taro.showToast({
            title: '已获取剪贴板链接',
            icon: 'success'
          });
        } else {
          Taro.showToast({
            title: '剪贴板无有效链接',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleSubmit = () => {
    if (!content && !imageUrl) {
      Taro.showToast({
        title: '请输入内容或上传图片',
        icon: 'none'
      });
      return;
    }

    addInspiration({
      type: imageUrl ? 'image' : 'text',
      content: content || '图片灵感',
      imageUrl: imageUrl || undefined,
      source: source || undefined,
      tags,
      project: project || undefined,
      mood: (mood as any) || undefined,
      color: color || undefined,
      purpose: purpose || undefined,
      isPrivate
    });

    Taro.showToast({
      title: '灵感已保存 ✨',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.switchTab({ url: '/pages/library/index' });
    }, 1500);
  };

  const colorOptions = ['#E0F2FE', '#FEF3C7', '#FCE7F3', '#D1FAE5', '#E0E7FF', '#FEE2E2'];

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>记录灵感</Text>
        <Text className={styles.subtitle}>捕捉每一个闪念 ✨</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>💡 灵感内容</Text>
        <Textarea
          className={styles.input}
          value={content}
          onInput={(e: any) => setContent(e.detail.value)}
          placeholder="写下你的灵感想法..."
          placeholderClass={styles.inputPlaceholder}
          maxlength={500}
        />
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>📎 添加方式</Text>
        <View className={styles.actionButtons}>
          <Button className={styles.actionBtn} onClick={handleImageUpload}>
            <Text className={styles.actionIcon}>🖼️</Text>
            <Text className={styles.actionLabel}>图片</Text>
          </Button>
          <Button className={styles.actionBtn} onClick={handleVoiceRecord}>
            <Text className={styles.actionIcon}>🎙️</Text>
            <Text className={styles.actionLabel}>语音</Text>
          </Button>
          <Button className={styles.actionBtn} onClick={handleSaveWebpage}>
            <Text className={styles.actionIcon}>🔗</Text>
            <Text className={styles.actionLabel}>网页</Text>
          </Button>
          <Button className={styles.actionBtn} onClick={() => setIsPrivate(!isPrivate)}>
            <Text className={styles.actionIcon}>{isPrivate ? '🔒' : '🔓'}</Text>
            <Text className={styles.actionLabel}>{isPrivate ? '私密' : '公开'}</Text>
          </Button>
        </View>
        {imageUrl && (
          <Text className={styles.imagePreview}>🖼️ 图片已选择</Text>
        )}
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>🏷️ 标签</Text>
        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="输入标签后回车添加"
        />
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>📋 分类信息</Text>
        
        <View className={styles.optionsRow}>
          <Text className={styles.optionLabel}>项目</Text>
          <Input
            className={styles.inputField}
            value={project}
            onInput={(e: any) => setProject(e.detail.value)}
            placeholder="输入项目名称"
            placeholderClass={styles.inputPlaceholder}
          />
        </View>

        <View className={styles.optionsRow}>
          <Text className={styles.optionLabel}>情绪</Text>
          <View className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={mood}
              onChange={(e: any) => setMood(e.target.value)}
            >
              <option value="">选择情绪</option>
              <option value="creative">🎨 创意</option>
              <option value="calm">🌊 平静</option>
              <option value="energetic">⚡ 活力</option>
              <option value="romantic">💕 浪漫</option>
              <option value="serious">📐 严谨</option>
            </select>
          </View>
        </View>

        <View className={styles.optionsRow}>
          <Text className={styles.optionLabel}>颜色</Text>
          <View className={styles.colorPicker}>
            {colorOptions.map((c, index) => (
              <View
                key={index}
                className={`${styles.colorOption} ${color === c ? styles.active : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(color === c ? '' : c)}
              />
            ))}
          </View>
        </View>

        <View className={styles.optionsRow}>
          <Text className={styles.optionLabel}>用途</Text>
          <View className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={purpose}
              onChange={(e: any) => setPurpose(e.target.value)}
            >
              <option value="">选择用途</option>
              <option value="视觉优化">🎨 视觉优化</option>
              <option value="空间设计">🏠 空间设计</option>
              <option value="文案创作">✏️ 文案创作</option>
              <option value="产品策划">📱 产品策划</option>
            </select>
          </View>
        </View>

        <View className={styles.optionsRow}>
          <Text className={styles.optionLabel}>来源</Text>
          <Input
            className={styles.inputField}
            value={source}
            onInput={(e: any) => setSource(e.detail.value)}
            placeholder="输入来源网站或平台"
            placeholderClass={styles.inputPlaceholder}
          />
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        保存灵感 ✨
      </Button>
    </View>
  );
};

export default CollectPage;
