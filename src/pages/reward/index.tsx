import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import StickerCard from '@/components/StickerCard'
import BadgeCard from '@/components/BadgeCard'
import { usePracticeStore } from '@/store/usePracticeStore'
import { mockStickers, mockBadges } from '@/data/mockData'
import { getRandomEncouragement } from '@/utils'
import type { Sticker, Badge } from '@/types'
import styles from './index.module.scss'

const RewardPage: React.FC = () => {
  const {
    childInfo,
    streakDays,
    totalStars,
    practiceResults,
    dailyStats
  } = usePracticeStore()

  const [encouragement, setEncouragement] = useState(getRandomEncouragement())
  const [, forceUpdate] = useState({})

  const latestResult = useMemo(() => {
    if (practiceResults.length === 0) return null
    return practiceResults[practiceResults.length - 1]
  }, [practiceResults])

  useDidShow(() => {
    console.log('[RewardPage] useDidShow, results count:', practiceResults.length, 'latest:', latestResult?.taskTitle)
    forceUpdate({})
  })

  const stickersWithStatus = useMemo((): Sticker[] => {
    return mockStickers.map(sticker => ({
      ...sticker,
      unlocked: totalStars >= sticker.requiredStars,
      unlockedDate: totalStars >= sticker.requiredStars
        ? (sticker.unlockedDate || new Date().toISOString().split('T')[0])
        : undefined
    }))
  }, [totalStars])

  const badgesWithProgress = useMemo((): Badge[] => {
    const totalPracticeTime = practiceResults.reduce((sum, r) => sum + r.duration, 0)
    const avgAccuracy = practiceResults.length > 0
      ? Math.round(practiceResults.reduce((sum, r) => sum + r.accuracy, 0) / practiceResults.length)
      : 0
    const threeStarCount = practiceResults.filter(r => r.stars === 3).length
    const practiceDays = [...new Set(practiceResults.map(r => r.date))].length
    const historicalMaxCombo = practiceResults.length > 0
      ? Math.max(...practiceResults.map(r => r.maxCombo))
      : 0

    return mockBadges.map(badge => {
      let progress = 0
      let target = badge.target
      let unlocked = badge.unlocked

      switch (badge.type) {
        case 'combo':
          if (badge.id === 'b1') {
            progress = historicalMaxCombo
          } else if (badge.id === 'b6') {
            progress = threeStarCount
            target = 5
          }
          break
        case 'streak':
          if (badge.id === 'b2') {
            progress = streakDays
            target = 7
          } else if (badge.id === 'b5') {
            progress = practiceDays
            target = 30
          }
          break
        case 'accuracy':
          progress = avgAccuracy
          target = 95
          break
        case 'duration':
          progress = Math.round(totalPracticeTime / 60)
          target = 30
          break
      }

      unlocked = progress >= target

      return {
        ...badge,
        progress: Math.min(progress, target),
        target,
        unlocked
      }
    })
  }, [practiceResults, streakDays])

  const unlockedCount = useMemo(() => {
    return stickersWithStatus.filter(s => s.unlocked).length
  }, [stickersWithStatus])

  const badgeUnlockedCount = useMemo(() => {
    return badgesWithProgress.filter(b => b.unlocked).length
  }, [badgesWithProgress])

  const calendarDays = useMemo(() => {
    const days: Array<{ type: string; text: string; icon?: string }> = []
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
      const date = new Date(today.getFullYear(), today.getMonth(), i)
      const dateStr = date.toISOString().split('T')[0]
      const isToday = i === today.getDate()
      const dayStat = dailyStats.find(d => d.date === dateStr)
      const isCompleted = dayStat?.isCompleted || false

      days.push({
        type: isToday ? 'today' : (isCompleted ? 'completed' : 'day'),
        text: i.toString(),
        icon: isCompleted ? '⭐' : ''
      })
    }

    return days
  }, [dailyStats])

  useEffect(() => {
    if (latestResult) {
      setEncouragement(latestResult.encouragement)
    }
  }, [latestResult])

  const handleRefreshEncouragement = () => {
    setEncouragement(getRandomEncouragement())
  }

  const totalPracticeTime = practiceResults.reduce((sum, r) => sum + r.duration, 0)
  const completedTasks = practiceResults.length

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>🎁 {childInfo.name}的奖励</Text>
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
            <Text className={styles.statValue}>{streakDays}天</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {latestResult && (
          <View className={styles.latestRecordCard}>
            <View className={styles.latestRecordHeader}>
              <Text className={styles.latestRecordTitle}>🎉 最新练习成果</Text>
              <Text className={styles.latestRecordDate}>{latestResult.date}</Text>
            </View>
            <View className={styles.latestRecordStats}>
              <View className={styles.latestRecordStat}>
                <Text className={styles.latestRecordStatValue}>{latestResult.stars}⭐</Text>
                <Text className={styles.latestRecordStatLabel}>星级</Text>
              </View>
              <View className={styles.latestRecordStat}>
                <Text className={styles.latestRecordStatValue}>{latestResult.maxCombo}</Text>
                <Text className={styles.latestRecordStatLabel}>最高连击</Text>
              </View>
              <View className={styles.latestRecordStat}>
                <Text className={styles.latestRecordStatValue}>{latestResult.accuracy}%</Text>
                <Text className={styles.latestRecordStatLabel}>准确率</Text>
              </View>
              <View className={styles.latestRecordStat}>
                <Text className={styles.latestRecordStatValue}>
                  {latestResult.isIndependent ? '✓' : latestResult.helpCount}
                </Text>
                <Text className={styles.latestRecordStatLabel}>
                  {latestResult.isIndependent ? '独立' : '求助'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.encouragementCard} onClick={handleRefreshEncouragement}>
          <Text className={styles.encouragementIcon}>💝</Text>
          <Text className={styles.encouragementText}>{encouragement}</Text>
          <Text className={styles.encouragementHint}>点击换一句</Text>
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

        <Text className={styles.sectionTitle}>📊 累计成就</Text>
        <View className={styles.achievementGrid}>
          <View className={styles.achievementItem}>
            <Text className={styles.achievementIcon}>⭐</Text>
            <Text className={styles.achievementValue}>{totalStars}</Text>
            <Text className={styles.achievementLabel}>累计星星</Text>
          </View>
          <View className={styles.achievementItem}>
            <Text className={styles.achievementIcon}>🏆</Text>
            <Text className={styles.achievementValue}>{completedTasks}</Text>
            <Text className={styles.achievementLabel}>完成次数</Text>
          </View>
          <View className={styles.achievementItem}>
            <Text className={styles.achievementIcon}>⏰</Text>
            <Text className={styles.achievementValue}>{Math.round(totalPracticeTime / 60)}分</Text>
            <Text className={styles.achievementLabel}>练习时长</Text>
          </View>
          <View className={styles.achievementItem}>
            <Text className={styles.achievementIcon}>🔥</Text>
            <Text className={styles.achievementValue}>{latestResult?.maxCombo || 0}</Text>
            <Text className={styles.achievementLabel}>本次连击</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>🏆 我的贴纸</Text>
        <View className={styles.section}>
          <View className={styles.stickerGrid}>
            {stickersWithStatus.map((sticker) => (
              <StickerCard key={sticker.id} sticker={sticker} size="sm" />
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>🎖 徽章挑战</Text>
        <View className={styles.section}>
          <View className={styles.badgeList}>
            {badgesWithProgress.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default RewardPage
