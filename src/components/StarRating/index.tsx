import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface StarRatingProps {
  stars: number
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const StarRating: React.FC<StarRatingProps> = ({ stars, size = 'md', showText = false }) => {
  const starIcons = []
  for (let i = 0; i < 3; i++) {
    starIcons.push(
      <Text
        key={i}
        className={`${styles.star} ${i < stars ? styles.filled : styles.empty} ${styles[size]}`}
      >
        ⭐
      </Text>
    )
  }

  return (
    <View className={styles.container}>
      {starIcons}
      {showText && <Text className={styles.text}>{stars}星</Text>}
    </View>
  )
}

export default StarRating
