import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import StickerCard from '@/components/StickerCard'
import BadgeCard from '@/components/BadgeCard'
import { mockStickers, mockBadges, mockChildInfo } from '@/data/mockData'
import { getRandomEncouragement } from '@/utils'
import styles from './index.module.scss'

const RewardPage: React.FC = () => {
  const [encouragement] = useState(getRandomEncouragement())

  const unlockedCount = useMemo(() => {
    return mockStickers.filter(s => s.unlocked).length
  }, [])

  const badgeUnlockedCount = useMemo(() => {
    return mockBadges.filter(b => b.unlocked).length
  }, [])

  const calendarDays = useMemo(() => {
    const days = []
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const startDay = firstDay.getDay()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    weekdays.forEach(day => {
      days.push({ type: 'weekday', text: day })
    })

    for (let i = 0; i < startDay; i++) {
      days.push({ type: 'empty', text: '' })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate()
      const isCompleted = i < today.getDate() && i % 2 === 0
      days.push({
        type: isToday ? 'today' : (isCompleted ? 'completed' : 'day'),
        text: i.toString(),
        icon: isCompleted ? '⭐' : ''
      })
    }

    return days
  }, [])

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>🎁 {mockChildInfo.name}的奖励</Text>
        <Text className={styles.subtitle}>坚持练习，收集更多奖励！</Text>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{unlockedCount}/{mockStickers.length}</Text>
            <Text className={styles.statLabel}>贴纸收集</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{badgeUnlockedCount}/{mockBadges.length}</Text>
            <Text className={styles.statLabel}>徽章获得</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>5天</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.encouragementCard}>
          <Text className={styles.encouragementIcon}>💝</Text>
          <Text className={styles.encouragementText}>{encouragement}</Text>
        </View>

        <Text className={styles.sectionTitle}>📅 本月打卡</Text>
        <View className={styles.calendarSection}>
          <View className={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <View
                key={index}
                className={`${styles.calendarDay} ${styles[day.type]}`}
              >
                <Text className={styles.dayNum}>{day.text}</Text>
                {day.icon && <Text className={styles.dayIcon}>{day.icon}</Text>}
              </View>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>🏆 我的贴纸</Text>
        <View className={styles.section}>
          <View className={styles.stickerGrid}>
            {mockStickers.map((sticker) => (
              <StickerCard key={sticker.id} sticker={sticker} size="sm" />
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>🎖 徽章挑战</Text>
        <View className={styles.section}>
          <View className={styles.badgeList}>
            {mockBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default RewardPage
