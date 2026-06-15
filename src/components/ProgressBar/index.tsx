import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface ProgressBarProps {
  progress: number
  total?: number
  color?: 'primary' | 'success' | 'reward' | 'blue' | 'mint'
  showText?: boolean
  height?: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total = 100,
  color = 'primary',
  showText = false,
  height = 12
}) => {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100))

  return (
    <View className={styles.container}>
      <View className={`${styles.bar} ${styles[color]}`} style={{ height: `${height}rpx` }}>
        <View className={styles.fill} style={{ width: `${percentage}%` }} />
      </View>
      {showText && (
        <Text className={styles.text}>{Math.round(percentage)}%</Text>
      )}
    </View>
  )
}

export default ProgressBar
