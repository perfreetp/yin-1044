import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { usePracticeStore } from '@/store/usePracticeStore'
import { encouragementList } from '@/data/mockData'
import { formatDuration, getRandomEncouragement, getErrorTypeName } from '@/utils'
import EditProfileModal from '@/components/EditProfileModal'
import TeacherTaskModal from '@/components/TeacherTaskModal'
import type { ChildInfo } from '@/types'
import styles from './index.module.scss'

const ParentPage: React.FC = () => {
  const {
    childInfo,
    practiceResults,
    teacherTasks,
    updateChildInfo,
    getParentStats,
    totalStars
  } = usePracticeStore()

  const [encouragement, setEncouragement] = useState(getRandomEncouragement())
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [teacherModalVisible, setTeacherModalVisible] = useState(false)
  const [editType, setEditType] = useState<'childInfo' | 'textbook'>('childInfo')
  const [, forceUpdate] = useState({})

  useDidShow(() => {
    console.log('[ParentPage] useDidShow, results count:', practiceResults.length)
    forceUpdate({})
  })

  const stats = useMemo(() => {
    return getParentStats()
  }, [practiceResults, getParentStats])

  const errorTypes = useMemo(() => {
    const allErrors = practiceResults.reduce((acc, r) => {
      Object.entries(r.errorTypes).forEach(([type, count]) => {
        acc[type] = (acc[type] || 0) + count
      })
      return acc
    }, {} as Record<string, number>)

    const totalErrors = Object.values(allErrors).reduce((sum, count) => sum + count, 0)

    return [
      { name: '错音', type: 'wrongNote', icon: '🎵' },
      { name: '节拍不准', type: 'wrongRhythm', icon: '⏰' },
      { name: '停顿', type: 'pause', icon: '⏸️' },
      { name: '换手不顺', type: 'handSwitch', icon: '🤲' }
    ].map(item => ({
      ...item,
      count: allErrors[item.type] || 0,
      percent: totalErrors > 0 ? Math.round(((allErrors[item.type] || 0) / totalErrors) * 100) : 0
    })).sort((a, b) => b.count - a.count)
  }, [practiceResults])

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

  const openEditModal = useCallback((type: 'childInfo' | 'textbook') => {
    setEditType(type)
    setEditModalVisible(true)
  }, [])

  const handleSaveChildInfo = useCallback((data: Partial<ChildInfo>) => {
    updateChildInfo(data)
    console.log('[ParentPage] Child info updated, will regenerate tasks')
  }, [updateChildInfo])

  const handleSettingClick = (label: string) => {
    if (label === '孩子信息') {
      openEditModal('childInfo')
    } else if (label === '教材设置') {
      openEditModal('textbook')
    } else if (label === '老师布置') {
      setTeacherModalVisible(true)
    } else {
      Taro.showToast({
        title: `${label}设置`,
        icon: 'none'
      })
    }
  }

  const maxDuration = Math.max(...stats.weeklyData.map(d => d.duration), 1)
  const latestResult = practiceResults.length > 0
    ? practiceResults[practiceResults.length - 1]
    : null

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
            <Text className={styles.childName}>{childInfo.name}</Text>
            <Text className={styles.childDesc}>
              {childInfo.age}岁 · 学琴{childInfo.studyYears}年 · {childInfo.currentBook}
            </Text>
          </View>
          <View className={styles.editBtn} onClick={() => openEditModal('childInfo')}>
            <Text>编辑</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {latestResult && (
          <View className={styles.latestRecord}>
            <View className={styles.latestTitle}>
              <Text>📝 最近一次练习</Text>
              <Text className={styles.latestDate}>{latestResult.date}</Text>
            </View>
            <View className={styles.latestStats}>
              <View className={styles.latestStat}>
                <Text className={styles.latestStatValue}>{latestResult.stars}⭐</Text>
                <Text className={styles.latestStatLabel}>星级</Text>
              </View>
              <View className={styles.latestStat}>
                <Text className={styles.latestStatValue}>{latestResult.maxCombo}</Text>
                <Text className={styles.latestStatLabel}>最高连击</Text>
              </View>
              <View className={styles.latestStat}>
                <Text className={styles.latestStatValue}>{latestResult.accuracy}%</Text>
                <Text className={styles.latestStatLabel}>准确率</Text>
              </View>
              <View className={styles.latestStat}>
                <Text className={styles.latestStatValue}>
                  {latestResult.isIndependent ? '✓' : latestResult.helpCount + '次'}
                </Text>
                <Text className={styles.latestStatLabel}>
                  {latestResult.isIndependent ? '独立完成' : '求助次数'}
                </Text>
              </View>
            </View>
          </View>
        )}

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

        <View className={styles.statsGrid}>
          <View className={`${styles.statCard} ${styles.primary}`}>
            <Text className={styles.statValue}>
              {totalStars}
              <Text className={styles.statUnit}>颗</Text>
            </Text>
            <Text className={styles.statLabel}>累计星星</Text>
          </View>
          <View className={`${styles.statCard} ${styles.success}`}>
            <Text className={styles.statValue}>
              {stats.independentRate}
              <Text className={styles.statUnit}>%</Text>
            </Text>
            <Text className={styles.statLabel}>独立完成率</Text>
          </View>
          <View className={`${styles.statCard} ${styles.reward}`}>
            <Text className={styles.statValue}>
              {stats.avgHelpCount}
              <Text className={styles.statUnit}>次</Text>
            </Text>
            <Text className={styles.statLabel}>平均求助</Text>
          </View>
          <View className={`${styles.statCard} ${styles.blue}`}>
            <Text className={styles.statValue}>
              {stats.mostErrorType || '-'}
            </Text>
            <Text className={styles.statLabel}>最多错误</Text>
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
                      style={{ height: `${day.duration > 0 ? Math.max(10, heightPercent) : 5}%` }}
                    />
                  </View>
                  <Text className={styles.weekDayValue}>
                    {day.duration > 0 ? `${day.duration}分` : '-'}
                  </Text>
                  {day.stars > 0 && (
                    <Text className={styles.weekDayStars}>{'⭐'.repeat(day.stars)}</Text>
                  )}
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
          {latestResult && (
            <Text className={styles.encourageHint}>
              💡 结合今天的表现："{latestResult.encouragement}"
            </Text>
          )}
          <View className={styles.copyBtn} onClick={handleCopyEncourage}>
            <Text>换一句 & 复制</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>⚙️ 设置</Text>
        <View className={styles.settingsList}>
          <View className={styles.settingItem} onClick={() => handleSettingClick('孩子信息')}>
            <Text className={styles.settingIcon}>👶</Text>
            <Text className={styles.settingLabel}>孩子信息</Text>
            <Text className={styles.settingValue}>{childInfo.name}</Text>
            <Text className={styles.settingArrow}>›</Text>
          </View>
          <View className={styles.settingItem} onClick={() => handleSettingClick('教材设置')}>
            <Text className={styles.settingIcon}>📚</Text>
            <Text className={styles.settingLabel}>教材设置</Text>
            <Text className={styles.settingValue}>{childInfo.currentBook}</Text>
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
            <Text className={styles.settingValue}>
              {teacherTasks.length > 0 ? `${teacherTasks.length}个` : '暂无'}
            </Text>
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

      <EditProfileModal
        visible={editModalVisible}
        title={editType === 'childInfo' ? '编辑孩子信息' : '选择教材'}
        editType={editType}
        initialData={childInfo}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveChildInfo}
      />

      <TeacherTaskModal
        visible={teacherModalVisible}
        onClose={() => setTeacherModalVisible(false)}
      />
    </ScrollView>
  )
}

export default ParentPage
