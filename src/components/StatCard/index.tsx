import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  subtitle?: string
  color?: 'primary' | 'success' | 'reward' | 'blue' | 'mint'
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  color = 'primary'
}) => {
  return (
    <View className={`${styles.card} ${styles[color]}`}>
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <View className={styles.content}>
        <Text className={styles.value}>{value}</Text>
        <Text className={styles.label}>{label}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  )
}

export default StatCard
