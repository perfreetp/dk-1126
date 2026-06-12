import React, { useState, useRef, useEffect } from 'react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentType, setCurrentType] = useState<'text' | 'image' | 'voice' | 'webpage'>('text');
  const recordingTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const handleImageUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        Taro.saveFile({
          tempFilePath: tempFilePath,
          success: (saveRes) => {
            const savedFilePath = saveRes.savedFilePath;
            setImageUrl(savedFilePath);
            setCurrentType('image');
            if (!content) {
              setContent('图片灵感');
            }
            Taro.showToast({ title: '图片已选择', icon: 'success' });
          },
          fail: () => {
            setImageUrl(tempFilePath);
            setCurrentType('image');
            if (!content) {
              setContent('图片灵感');
            }
            Taro.showToast({ title: '图片已选择', icon: 'success' });
          }
        });
      },
      fail: () => {
        Taro.showToast({ title: '请选择图片', icon: 'none' });
      }
    });
  };

  const startRecording = () => {
    const recorderManager = Taro.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('[Collect] Recording started');
      setIsRecording(true);
      setRecordingTime(0);
      setCurrentType('voice');
      
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000) as unknown as number;
    });

    recorderManager.onStop((res) => {
      console.log('[Collect] Recording stopped', res);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setIsRecording(false);
      
      if (res.duration > 0) {
        simulateSpeechRecognition(res.tempFilePath);
      }
    });

    recorderManager.onError((err) => {
      console.error('[Collect] Recording error:', err);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setIsRecording(false);
      Taro.showToast({ title: '录音失败', icon: 'none' });
    });

    recorderManager.start({
      format: 'mp3',
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      audioType: 'voice'
    });
  };

  const stopRecording = () => {
    const recorderManager = Taro.getRecorderManager();
    recorderManager.stop();
  };

  const simulateSpeechRecognition = (audioPath: string) => {
    Taro.showLoading({ title: '识别中...' });
    
    setTimeout(() => {
      Taro.hideLoading();
      
      const suggestions = [
        '这个设计风格很有创意，我觉得可以尝试更多的渐变色',
        '用户访谈中提到他们更注重产品的实用性',
        '灵感来源于大自然的色彩和形状',
        '这个排版需要调整，标题应该更突出',
        '考虑加入一些动效来提升用户体验'
      ];
      const randomText = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      setContent(prev => prev ? `${prev}\n${randomText}` : randomText);
      Taro.showToast({ title: '识别成功 ✨', icon: 'success' });
    }, 1500);
  };

  const handleSaveWebpage = () => {
    Taro.showModal({
      title: '保存网页',
      content: '请在下方粘贴网页链接',
      editable: true,
      placeholderText: 'https://...',
      success: (res) => {
        if (res.content && res.content.trim()) {
          const url = res.content.trim();
          if (url.startsWith('http://') || url.startsWith('https://')) {
            fetchWebpageTitle(url);
          } else {
            Taro.showToast({ title: '请输入有效链接', icon: 'none' });
          }
        }
      }
    });
  };

  const fetchWebpageTitle = (url: string) => {
    Taro.showLoading({ title: '获取标题...' });
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      const mockTitles: { [key: string]: string } = {
        'dribbble.com': 'Dribbble - Discover the World\'s Top Designers',
        'behance.net': 'Behance - Portfolio Management',
        'pinterest.com': 'Pinterest',
        'unsplash.com': 'Unsplash | Free High-Resolution Photos',
        'github.com': 'GitHub',
        'medium.com': 'Medium',
        'zhihu.com': '知乎 - 有问题，就会有答案',
        'weibo.com': '微博',
        'xiaohongshu.com': '小红书 - 你的生活指南'
      };
      
      const title = mockTitles[domain] || `${domain} - 网页内容`;
      const sourceName = domain.charAt(0).toUpperCase() + domain.slice(1);
      
      setContent(title);
      setSource(sourceName);
      setCurrentType('webpage');
      
      Taro.hideLoading();
      Taro.showToast({ title: '网页信息已获取 ✨', icon: 'success' });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: '链接解析失败', icon: 'none' });
    }
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
      type: currentType,
      content: content || (currentType === 'image' ? '图片灵感' : '无内容'),
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
      setContent('');
      setImageUrl('');
      setSource('');
      setTags([]);
      setProject('');
      setMood('');
      setColor('');
      setPurpose('');
      setIsPrivate(false);
      setCurrentType('text');
      Taro.switchTab({ url: '/pages/library/index' });
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          placeholder="写下你的灵感想法，或通过语音输入..."
          placeholderClass={styles.inputPlaceholder}
          maxlength={500}
        />
        <View className={styles.typeBadge}>
          <Text className={styles.typeBadgeText}>当前类型: {currentType === 'text' ? '文字' : currentType === 'image' ? '图片' : currentType === 'voice' ? '语音' : '网页'}</Text>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>📎 添加方式</Text>
        <View className={styles.actionButtons}>
          <Button className={`${styles.actionBtn} ${currentType === 'image' ? styles.active : ''}`} onClick={handleImageUpload}>
            <Text className={styles.actionIcon}>🖼️</Text>
            <Text className={styles.actionLabel}>图片</Text>
          </Button>
          
          {!isRecording ? (
            <Button className={`${styles.actionBtn} ${currentType === 'voice' ? styles.active : ''}`} onClick={startRecording}>
              <Text className={styles.actionIcon}>🎙️</Text>
              <Text className={styles.actionLabel}>录音</Text>
            </Button>
          ) : (
            <Button className={`${styles.actionBtn} ${styles.recording}`} onClick={stopRecording}>
              <Text className={styles.actionIcon}>⏹️</Text>
              <Text className={styles.actionLabel}>{formatTime(recordingTime)}</Text>
            </Button>
          )}
          
          <Button className={`${styles.actionBtn} ${currentType === 'webpage' ? styles.active : ''}`} onClick={handleSaveWebpage}>
            <Text className={styles.actionIcon}>🔗</Text>
            <Text className={styles.actionLabel}>网页</Text>
          </Button>
          <Button className={`${styles.actionBtn} ${isPrivate ? styles.active : ''}`} onClick={() => setIsPrivate(!isPrivate)}>
            <Text className={styles.actionIcon}>{isPrivate ? '🔒' : '🔓'}</Text>
            <Text className={styles.actionLabel}>{isPrivate ? '私密' : '公开'}</Text>
          </Button>
        </View>
        {imageUrl && (
          <Text className={styles.imagePreview}>🖼️ 图片已选择</Text>
        )}
        {isRecording && (
          <View className={styles.recordingIndicator}>
            <View className={styles.recordingDot} />
            <Text className={styles.recordingText}>正在录音...</Text>
          </View>
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
              <option value="文案创作">✕ 文案创作</option>
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
