import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import StarRating from '@/components/StarRating'
import { formatDuration, getDifficultyText } from '@/utils'
import type { PracticeTask } from '@/types'
import styles from './index.module.scss'

interface TaskCardProps {
  task: PracticeTask
  onStart?: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStart }) => {
  const handleStart = () => {
    if (onStart) {
      onStart()
    } else {
      Taro.navigateTo({
        url: '/pages/practice/index'
      })
    }
  }

  return (
    <View className={styles.card}>
      {task.isTeacherTask && (
        <View className={styles.teacherBadge}>
          <Text className={styles.teacherText}>📚 老师布置</Text>
        </View>
      )}

      <View className={styles.header}>
        <View className={styles.focusIcon}>
          <Text className={styles.icon}>{task.focus.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.title}>{task.title}</Text>
          <View className={styles.meta}>
            <Text className={styles.metaText}>
              ⏱ {formatDuration(task.duration)}
            </Text>
            <Text className={styles.metaText}>
              🎼 {task.barsCount}小节
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.focus}>
        <Text className={styles.focusLabel}>{task.focus.description}</Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.difficulty}>
          <Text className={styles.difficultyLabel}>难度：</Text>
          <Text className={styles.difficultyStars}>{getDifficultyText(task.difficulty)}</Text>
        </View>
        <View className={styles.startBtn} onClick={handleStart}>
          <Text className={styles.startText}>开始练习</Text>
        </View>
      </View>
    </View>
  )
}

export default TaskCard
