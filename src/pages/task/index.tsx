import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import TaskCard from '@/components/TaskCard'
import { mockTaskList, mockDailyTask, mockChildInfo } from '@/data/mockData'
import { formatDuration } from '@/utils'
import styles from './index.module.scss'

const TaskPage: React.FC = () => {
  const [streakDays] = useState(5)
  const [totalTime] = useState(240)

  const handleStartPractice = () => {
    Taro.navigateTo({
      url: '/pages/practice/index'
    })
  }

  const handleQuickAction = (action: string) => {
    Taro.showToast({
      title: `${action}功能`,
      icon: 'none'
    })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>👋 你好，{mockChildInfo.name}！</Text>
        <Text className={styles.subGreeting}>今天是练习的第 12 天</Text>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{streakDays}</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatDuration(totalTime)}</Text>
            <Text className={styles.statLabel}>累计练习</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>3⭐</Text>
            <Text className={styles.statLabel}>昨日评价</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.sectionTitle}>🎯 今日重点</Text>
        <View className={styles.focusCard}>
          <View className={styles.focusIconWrap}>
            <Text className={styles.focusIcon}>{mockDailyTask.focus.icon}</Text>
          </View>
          <View className={styles.focusInfo}>
            <Text className={styles.focusLabel}>{mockDailyTask.focus.label}</Text>
            <Text className={styles.focusDesc}>{mockDailyTask.focus.description}</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>📋 今日任务</Text>
        <View className={styles.taskSection}>
          <View className={styles.taskList}>
            {mockTaskList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={handleStartPractice}
              />
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>💡 小提示</Text>
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>练琴小妙招</Text>
          <Text className={styles.tipText}>
            先深呼吸三次，放松肩膀。眼睛看谱，手指提前准备好下一个音的位置。弹错了没关系，慢慢跟上就好~
          </Text>
        </View>

        <Text className={styles.sectionTitle}>⚡ 快捷功能</Text>
        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={() => handleQuickAction('自由练习')}>
            <Text className={styles.actionIcon}>🎹</Text>
            <Text className={styles.actionLabel}>自由练习</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('亲子模式')}>
            <Text className={styles.actionIcon}>👨‍👩‍👧</Text>
            <Text className={styles.actionLabel}>亲子模式</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('设置')}>
            <Text className={styles.actionIcon}>⚙️</Text>
            <Text className={styles.actionLabel}>设置</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default TaskPage
