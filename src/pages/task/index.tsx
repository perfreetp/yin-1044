import React, { useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import TaskCard from '@/components/TaskCard'
import { usePracticeStore } from '@/store/usePracticeStore'
import { formatDuration } from '@/utils'
import type { PracticeTask } from '@/types'
import styles from './index.module.scss'

const TaskPage: React.FC = () => {
  const {
    childInfo,
    todayTasks,
    streakDays,
    practiceResults,
    totalStars,
    dailyStats,
    generateTodayTasks,
    setCurrentTask
  } = usePracticeStore()

  useEffect(() => {
    console.log('[TaskPage] Initializing, generating tasks')
    generateTodayTasks()
  }, [generateTodayTasks])

  useEffect(() => {
    console.log('[TaskPage] childInfo changed, regenerating tasks:', childInfo)
    generateTodayTasks()
  }, [childInfo.age, childInfo.studyYears, childInfo.currentBook, generateTodayTasks])

  useDidShow(() => {
    console.log('[TaskPage] useDidShow, regenerating tasks')
    generateTodayTasks()
  })

  const handleStartPractice = useCallback((task: PracticeTask) => {
    setCurrentTask(task)
    console.log('[TaskPage] Starting practice for task:', task.title)
    Taro.navigateTo({
      url: '/pages/practice/index'
    })
  }, [setCurrentTask])

  const handleQuickAction = (action: string) => {
    Taro.showToast({
      title: `${action}功能`,
      icon: 'none'
    })
  }

  const totalPracticeTime = practiceResults.reduce((sum, r) => sum + r.duration, 0)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayStat = dailyStats.find(d => d.date === yesterdayStr)
  const yesterdayStars = yesterdayStat?.stars || 0

  const firstTask = todayTasks[0]

  const totalTaskDuration = todayTasks.reduce((sum, t) => sum + t.duration, 0)

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>👋 你好，{childInfo.name}！</Text>
        <Text className={styles.subGreeting}>
          {childInfo.age}岁 · 学琴{childInfo.studyYears}年 · {childInfo.currentBook}
        </Text>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{streakDays}</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatDuration(totalPracticeTime)}</Text>
            <Text className={styles.statLabel}>累计练习</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{yesterdayStars > 0 ? `${yesterdayStars}⭐` : '-'}</Text>
            <Text className={styles.statLabel}>昨日评价</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {firstTask && (
          <>
            <Text className={styles.sectionTitle}>🎯 今日重点</Text>
            <View className={styles.focusCard}>
              <View className={styles.focusIconWrap}>
                <Text className={styles.focusIcon}>{firstTask.focus.icon}</Text>
              </View>
              <View className={styles.focusInfo}>
                <Text className={styles.focusLabel}>{firstTask.focus.label}</Text>
                <Text className={styles.focusDesc}>{firstTask.focus.description}</Text>
              </View>
            </View>
          </>
        )}

        <Text className={styles.sectionTitle}>
          📋 今日任务
          <Text className={styles.taskCount}>
            {todayTasks.length}个 · 共{formatDuration(totalTaskDuration)}
          </Text>
        </Text>
        <View className={styles.taskSection}>
          <View className={styles.taskList}>
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => handleStartPractice(task)}
                />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyText}>暂无今日任务</Text>
                <Text className={styles.emptyDesc}>请先在家长页设置孩子信息</Text>
              </View>
            )}
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

        <View className={styles.footerStats}>
          <View className={styles.footerStat}>
            <Text className={styles.footerStatValue}>{totalStars}</Text>
            <Text className={styles.footerStatLabel}>累计星星</Text>
          </View>
          <View className={styles.footerStat}>
            <Text className={styles.footerStatValue}>{practiceResults.length}</Text>
            <Text className={styles.footerStatLabel}>完成次数</Text>
          </View>
          <View className={styles.footerStat}>
            <Text className={styles.footerStatValue}>{dailyStats.length}</Text>
            <Text className={styles.footerStatLabel}>练习天数</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default TaskPage
