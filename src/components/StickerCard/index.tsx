import React from 'react'
import { View, Text } from '@tarojs/components'
import type { Sticker } from '@/types'
import styles from './index.module.scss'

interface StickerCardProps {
  sticker: Sticker
  size?: 'sm' | 'md'
}

const StickerCard: React.FC<StickerCardProps> = ({ sticker, size = 'md' }) => {
  return (
    <View className={`${styles.card} ${sticker.unlocked ? styles.unlocked : styles.locked} ${styles[size]}`}>
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>{sticker.icon}</Text>
      </View>
      <Text className={styles.name}>{sticker.name}</Text>
      {!sticker.unlocked && (
        <Text className={styles.require}>需要{sticker.requiredStars}⭐</Text>
      )}
    </View>
  )
}

export default StickerCard
