import React from 'react'
import { View, Text } from '@tarojs/components'
import ProgressBar from '@/components/ProgressBar'
import type { Badge } from '@/types'
import styles from './index.module.scss'

interface BadgeCardProps {
  badge: Badge
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const percentage = Math.min(100, (badge.progress / badge.target) * 100)

  return (
    <View className={`${styles.card} ${badge.unlocked ? styles.unlocked : ''}`}>
      <View className={styles.header}>
        <View className={styles.iconWrap}>
          <Text className={styles.icon}>{badge.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{badge.name}</Text>
          <Text className={styles.description}>{badge.description}</Text>
        </View>
        {badge.unlocked && (
          <View className={styles.unlockedBadge}>
            <Text className={styles.unlockedText}>已获得</Text>
          </View>
        )}
      </View>
      <View className={styles.progressWrap}>
        <ProgressBar
          progress={badge.progress}
          total={badge.target}
          color={badge.unlocked ? 'success' : 'primary'}
        />
        <Text className={styles.progressText}>
          {badge.progress}/{badge.target}
        </Text>
      </View>
    </View>
  )
}

export default BadgeCard
