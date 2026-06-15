import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockParentStats, mockChildInfo, encouragementList } from '@/data/mockData'
import { formatDuration, getRandomEncouragement } from '@/utils'
import styles from './index.module.scss'

const ParentPage: React.FC = () => {
  const [stats] = useState(mockParentStats)
  const [encouragement, setEncouragement] = useState(getRandomEncouragement())

  const errorTypes = useMemo(() => {
    return [
      { name: '错音', icon: '🎵', count: 12, percent: 60 },
      { name: '节拍不准', icon: '⏰', count: 5, percent: 25 },
      { name: '停顿', icon: '⏸️', count: 2, percent: 10 },
      { name: '换手不顺', icon: '🤲', count: 1, percent: 5 }
    ]
  }, [])

  const handleCopyEncourage = () => {
    const newText = encouragementList[Math.floor(Math.random() * encouragementList.length)]
    setEncouragement(newText)
    Taro.setClipboardData({
      data: newText,
      success: () => {
        Taro.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  }

  const handleSettingClick = (label: string) => {
    Taro.showToast({
      title: `${label}设置`,
      icon: 'none'
    })
  }

  const maxDuration = Math.max(...stats.weeklyData.map(d => d.duration), 1)

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>👨‍👩‍👧 家长中心</Text>
        <Text className={styles.subtitle}>了解孩子的练习情况</Text>

        <View className={styles.childInfo}>
          <View className={styles.childAvatar}>
            <Text>🎹</Text>
          </View>
          <View className={styles.childDetail}>
            <Text className={styles.childName}>{mockChildInfo.name}</Text>
            <Text className={styles.childDesc}>
              {mockChildInfo.age}岁 · 学琴{mockChildInfo.studyYears}年 · {mockChildInfo.currentBook}
            </Text>
          </View>
          <View className={styles.editBtn}>
            <Text>编辑</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.sectionTitle}>📊 练习概览</Text>
        <View className={styles.statsGrid}>
          <View className={`${styles.statCard} ${styles.primary}`}>
            <Text className={styles.statValue}>
              {stats.totalPracticeDays}
              <Text className={styles.statUnit}>天</Text>
            </Text>
            <Text className={styles.statLabel}>累计练习</Text>
          </View>
          <View className={`${styles.statCard} ${styles.success}`}>
            <Text className={styles.statValue}>
              {stats.streakDays}
              <Text className={styles.statUnit}>天</Text>
            </Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={`${styles.statCard} ${styles.reward}`}>
            <Text className={styles.statValue}>
              {formatDuration(stats.totalPracticeTime)}
            </Text>
            <Text className={styles.statLabel}>总练习时长</Text>
          </View>
          <View className={`${styles.statCard} ${styles.blue}`}>
            <Text className={styles.statValue}>
              {stats.avgStars}
              <Text className={styles.statUnit}>⭐</Text>
            </Text>
            <Text className={styles.statLabel}>平均星级</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>📈 本周练习</Text>
        <View className={styles.weeklyCard}>
          <View className={styles.weekDays}>
            {stats.weeklyData.map((day, index) => {
              const heightPercent = (day.duration / maxDuration) * 100
              const isToday = index === 6
              return (
                <View
                  key={day.date}
                  className={`${styles.weekDay} ${isToday ? styles.today : ''}`}
                >
                  <Text className={styles.weekDayLabel}>{day.date}</Text>
                  <View className={styles.weekDayBar}>
                    <View
                      className={styles.weekDayFill}
                      style={{ height: `${Math.max(10, heightPercent)}%` }}
                    />
                  </View>
                  <Text className={styles.weekDayValue}>
                    {day.duration > 0 ? `${day.duration}分` : '-'}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <Text className={styles.sectionTitle}>❌ 错误类型分布</Text>
        <View className={styles.errorCard}>
          <View className={styles.errorList}>
            {errorTypes.map((error) => (
              <View key={error.name} className={styles.errorItem}>
                <Text className={styles.errorIcon}>{error.icon}</Text>
                <View className={styles.errorInfo}>
                  <Text className={styles.errorName}>{error.name}</Text>
                  <View className={styles.errorBar}>
                    <View
                      className={styles.errorBarFill}
                      style={{ width: `${error.percent}%` }}
                    />
                  </View>
                </View>
                <Text className={styles.errorCount}>{error.count}次</Text>
              </View>
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>💬 鼓励话术</Text>
        <View className={styles.encourageCard}>
          <Text className={styles.encourageTitle}>今日推荐</Text>
          <Text className={styles.encourageText}>{encouragement}</Text>
          <View className={styles.copyBtn} onClick={handleCopyEncourage}>
            <Text>换一句 & 复制</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>⚙️ 设置</Text>
        <View className={styles.settingsList}>
          <View className={styles.settingItem} onClick={() => handleSettingClick('孩子信息')}>
            <Text className={styles.settingIcon}>👶</Text>
            <Text className={styles.settingLabel}>孩子信息</Text>
            <Text className={styles.settingValue}>{mockChildInfo.name}</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingItem} onClick={() => handleSettingClick('教材设置')}>
            <Text className={styles.settingIcon}>📚</Text>
            <Text className={styles.settingLabel}>教材设置</Text>
            <Text className={styles.settingValue}>{mockChildInfo.currentBook}</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingItem} onClick={() => handleSettingClick('每日目标')}>
            <Text className={styles.settingIcon}>🎯</Text>
            <Text className={styles.settingLabel}>每日练习目标</Text>
            <Text className={styles.settingValue}>5分钟</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingItem} onClick={() => handleSettingClick('老师布置')}>
            <Text className={styles.settingIcon}>📝</Text>
            <Text className={styles.settingLabel}>老师布置的谱子</Text>
            <Text className={styles.settingValue}>管理</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingItem} onClick={() => handleSettingClick('亲子模式')}>
            <Text className={styles.settingIcon}>👨‍👩‍👧</Text>
            <Text className={styles.settingLabel}>亲子双人模式</Text>
            <Text className={styles.settingValue}>开启</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingItem} onClick={() => handleSettingClick('防挫败')}>
            <Text className={styles.settingIcon}>🛡️</Text>
            <Text className={styles.settingLabel}>防挫败机制</Text>
            <Text className={styles.settingValue}>开启</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ParentPage
