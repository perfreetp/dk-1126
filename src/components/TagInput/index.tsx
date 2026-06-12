import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import styles from './index.module.scss';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = '添加标签' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.detail.value);
  };

  const handleKeyPress = (e: any) => {
    if (e.detail.keyCode === 13 || e.detail.keyCode === '13') {
      handleAddTag();
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.tagsWrapper}>
        {tags.map((tag, index) => (
          <View key={index} className={styles.tag}>
            <Text>{tag}</Text>
            <Text className={styles.removeBtn} onClick={() => handleRemoveTag(index)}>×</Text>
          </View>
        ))}
        <Input
          className={styles.input}
          value={inputValue}
          onInput={handleInputChange}
          onConfirm={handleAddTag}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
        />
      </View>
    </View>
  );
};

export default TagInput;
