import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockDailyTask } from '@/data/mockData'
import { formatTime, generateImprovedPoints, calculateStars, getRandomEncouragement } from '@/utils'
import styles from './index.module.scss'

type PracticeState = 'idle' | 'playing' | 'paused' | 'finished'

interface NotePosition {
  x: number
  y: number
  index: number
}

const PracticePage: React.FC = () => {
  const [practiceState, setPracticeState] = useState<PracticeState>('idle')
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showErrorTip, setShowErrorTip] = useState(false)
  const [errorTipText, setErrorTipText] = useState('')
  const [showComboTip, setShowComboTip] = useState(false)
  const [comboTipText, setComboTipText] = useState('')
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)
  const [parentMode, setParentMode] = useState(false)
  const [helpCount, setHelpCount] = useState(0)

  const [resultStars, setResultStars] = useState(0)
  const [resultAccuracy, setResultAccuracy] = useState(0)
  const [resultImproved, setResultImproved] = useState<string[]>([])
  const [resultEncouragement, setResultEncouragement] = useState('')

  const timerRef = useRef<number | null>(null)
  const totalNotes = 32

  const notes: NotePosition[] = []
  for (let i = 0; i < totalNotes; i++) {
    notes.push({
      x: 60 + i * 22,
      y: 40 + Math.sin(i * 0.8) * 30,
      index: i
    })
  }

  const currentBar = Math.floor(currentNoteIndex / 4) + 1
  const totalBars = mockDailyTask.barsCount
  const progress = (currentNoteIndex / totalNotes) * 100

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startPractice = useCallback(() => {
    setPracticeState('playing')
    setCurrentNoteIndex(0)
    setCombo(0)
    setMaxCombo(0)
    setErrorCount(0)
    setElapsedTime(0)
    setConsecutiveFailures(0)

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000) as unknown as number
  }, [])

  const handleNoteTap = (noteIndex: number) => {
    if (practiceState !== 'playing') return

    if (noteIndex === currentNoteIndex) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setMaxCombo(prev => Math.max(prev, newCombo))
      setConsecutiveFailures(0)

      if (newCombo > 0 && newCombo % 5 === 0) {
        setComboTipText(`${newCombo}连击!`)
        setShowComboTip(true)
        setTimeout(() => setShowComboTip(false), 800)
      }

      if (currentNoteIndex < totalNotes - 1) {
        setCurrentNoteIndex(prev => prev + 1)
      } else {
        finishPractice()
      }
    } else if (noteIndex > currentNoteIndex) {
      handleError('wrongNote', '弹错啦~')
    }
  }

  const handleError = (type: string, message: string) => {
    setErrorCount(prev => prev + 1)
    setCombo(0)
    setConsecutiveFailures(prev => prev + 1)
    setErrorTipText(message)
    setShowErrorTip(true)

    setTimeout(() => setShowErrorTip(false), 1500)

    if (consecutiveFailures >= 4 && speedMultiplier > 0.5) {
      setSpeedMultiplier(prev => Math.max(0.5, prev - 0.1))
      Taro.showToast({
        title: '已降速，慢慢来~',
        icon: 'none'
      })
      setConsecutiveFailures(0)
    }
  }

  const resetBar = () => {
    if (practiceState !== 'playing') return
    const newIndex = Math.max(0, Math.floor(currentNoteIndex / 4) * 4 - 4)
    setCurrentNoteIndex(newIndex)
    setCombo(0)
  }

  const requestHelp = () => {
    setHelpCount(prev => prev + 1)
    Taro.showToast({
      title: '提示：看清楚下一个音',
      icon: 'none',
      duration: 2000
    })
  }

  const toggleParentMode = () => {
    setParentMode(prev => !prev)
    if (!parentMode) {
      Taro.showToast({
        title: '亲子模式已开启',
        icon: 'success'
      })
    }
  }

  const finishPractice = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setPracticeState('finished')

    const accuracy = Math.round(((totalNotes - errorCount) / totalNotes) * 100)
    const rhythmAccuracy = Math.max(0, 100 - 2 * 5)
    const stars = calculateStars(accuracy, rhythmAccuracy, maxCombo)
    const improved = generateImprovedPoints(accuracy, maxCombo)
    const encouragement = getRandomEncouragement()

    setResultStars(stars)
    setResultAccuracy(accuracy)
    setResultImproved(improved)
    setResultEncouragement(encouragement)
  }

  const pausePractice = () => {
    if (practiceState === 'playing') {
      setPracticeState('paused')
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    } else if (practiceState === 'paused') {
      setPracticeState('playing')
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000) as unknown as number
    }
  }

  const restartPractice = () => {
    startPractice()
  }

  const goBack = () => {
    Taro.navigateBack()
  }

  const goToReward = () => {
    Taro.switchTab({
      url: '/pages/reward/index'
    })
  }

  if (practiceState === 'idle') {
    return (
      <View className={styles.page}>
        <View className={styles.idleSection}>
          <Text className={styles.bigIcon}>{mockDailyTask.focus.icon}</Text>
          <Text className={styles.idleTitle}>{mockDailyTask.title}</Text>
          <Text className={styles.idleDesc}>
            {mockDailyTask.focus.description}{'\n'}
            共 {totalBars} 小节，约 {Math.round(mockDailyTask.duration / 60)} 分钟
          </Text>

          {parentMode && (
            <View className={styles.parentModeBadge}>
              <Text>👨‍👩‍👧</Text>
              <Text>亲子模式</Text>
            </View>
          )}

          <View className={styles.startBigBtn} onClick={startPractice}>
            <Text className={styles.startText}>开始</Text>
          </View>

          <View className={styles.secondaryButtons} style={{ marginTop: 48, width: '100%' }}>
            <View className={styles.smallBtn} onClick={toggleParentMode}>
              <Text className={styles.btnIcon}>👨‍👩‍👧</Text>
              <Text>{parentMode ? '关闭亲子' : '亲子模式'}</Text>
            </View>
            <View className={styles.smallBtn} onClick={goBack}>
              <Text className={styles.btnIcon}>←</Text>
              <Text>返回</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  if (practiceState === 'finished') {
    return (
      <View className={styles.page}>
        <View className={styles.finishSection}>
          <View className={styles.resultCard}>
            <Text className={styles.resultTitle}>
              🎉 练习完成！
            </Text>

            <View className={styles.starsBig}>
              {[1, 2, 3].map(i => (
                <Text
                  key={i}
                  className={`${styles.star} ${i <= resultStars ? '' : styles.empty}`}
                >
                  ⭐
                </Text>
              ))}
            </View>

            <View className={styles.resultStats}>
              <View className={styles.resultStat}>
                <Text className={styles.statValue}>{resultAccuracy}%</Text>
                <Text className={styles.statLabel}>准确率</Text>
              </View>
              <View className={styles.resultStat}>
                <Text className={styles.statValue}>{maxCombo}</Text>
                <Text className={styles.statLabel}>最高连击</Text>
              </View>
              <View className={styles.resultStat}>
                <Text className={styles.statValue}>{formatTime(elapsedTime)}</Text>
                <Text className={styles.statLabel}>用时</Text>
              </View>
            </View>

            <View className={styles.improvedSection}>
              <Text className={styles.improvedTitle}>
                💪 比上次更棒的地方
              </Text>
              <View className={styles.improvedList}>
                {resultImproved.map((item, index) => (
                  <Text key={index} className={styles.improvedItem}>
                    {item}
                  </Text>
                ))}
              </View>
            </View>

            <View className={styles.encouragementBox}>
              <Text className={styles.encourageIcon}>💝</Text>
              <Text className={styles.encourageText}>{resultEncouragement}</Text>
            </View>
          </View>

          <View className={styles.mainButtons} style={{ width: '100%' }}>
            <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={restartPractice}>
              <Text>再来一次</Text>
            </View>
            <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={goToReward}>
              <Text>查看奖励</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.taskInfo}>
          <Text className={styles.taskTitle}>{mockDailyTask.title}</Text>
          <Text className={styles.taskMeta}>第 {currentBar} / {totalBars} 小节</Text>
        </View>
        <View className={styles.comboDisplay}>
          <Text className={styles.comboNum}>{combo}</Text>
          <Text className={styles.comboLabel}>连击</Text>
        </View>
        <View className={styles.timerDisplay}>
          <Text className={styles.timerNum}>{formatTime(elapsedTime)}</Text>
        </View>
      </View>

      <View className={styles.staffSection}>
        <View className={styles.focusTip}>
          <Text className={styles.focusIcon}>{mockDailyTask.focus.icon}</Text>
          <Text className={styles.focusText}>{mockDailyTask.focus.description}</Text>
        </View>

        {parentMode && (
          <View className={styles.parentModeBadge}>
            <Text>👋</Text>
            <Text>家长拍手打节拍，孩子弹奏</Text>
          </View>
        )}

        <View className={styles.staffContainer}>
          {speedMultiplier < 1 && (
            <View className={styles.speedBadge}>
              {Math.round(speedMultiplier * 100)}% 速度
            </View>
          )}

          {showErrorTip && (
            <View className={styles.errorTip}>
              <Text>{errorTipText}</Text>
            </View>
          )}

          {showComboTip && (
            <View className={styles.comboTip}>
              <Text>{comboTipText}</Text>
            </View>
          )}

          <View className={styles.staffLines}>
            <View className={styles.notesContainer}>
              {notes.map((note) => (
                <View
                  key={note.index}
                  className={`
                    ${styles.note}
                    ${note.index === currentNoteIndex ? styles.current : ''}
                    ${note.index < currentNoteIndex ? styles.correct : ''}
                  `}
                  style={{
                    left: `${note.x}rpx`,
                    top: `${note.y}rpx`
                  }}
                  onClick={() => handleNoteTap(note.index)}
                />
              ))}
            </View>
          </View>

          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>

          <View className={styles.barIndicator}>
            进度：{Math.round(progress)}%
          </View>
        </View>
      </View>

      <View className={styles.controls}>
        <View className={styles.mainButtons}>
          {practiceState === 'playing' ? (
            <>
              <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={pausePractice}>
                <Text>⏸ 暂停</Text>
              </View>
              <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={resetBar}>
                <Text>↩ 重来两小节</Text>
              </View>
            </>
          ) : (
            <>
              <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={goBack}>
                <Text>退出</Text>
              </View>
              <View className={`${styles.btn} ${styles.btnSuccess}`} onClick={pausePractice}>
                <Text>▶ 继续</Text>
              </View>
            </>
          )}
        </View>

        <View className={styles.secondaryButtons}>
          <View className={styles.smallBtn} onClick={requestHelp}>
            <Text className={styles.btnIcon}>💡</Text>
            <Text>求助提示</Text>
          </View>
          <View className={styles.smallBtn} onClick={toggleParentMode}>
            <Text className={styles.btnIcon}>👨‍👩‍👧</Text>
            <Text>{parentMode ? '关闭亲子' : '亲子模式'}</Text>
          </View>
          <View className={styles.smallBtn} onClick={restartPractice}>
            <Text className={styles.btnIcon}>🔄</Text>
            <Text>重新开始</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PracticePage
