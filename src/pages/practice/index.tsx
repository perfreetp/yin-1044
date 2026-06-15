import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { usePracticeStore } from '@/store/usePracticeStore'
import { formatTime, getMostErrorType, getErrorTypeName } from '@/utils'
import type { BarDetail, ErrorLocation, PracticeResult } from '@/types'
import styles from './index.module.scss'

type PracticeState = 'idle' | 'playing' | 'paused' | 'finished'

interface NotePosition {
  x: number
  y: number
  index: number
  expectedTiming: number
}

const PracticePage: React.FC = () => {
  const {
    currentTask,
    practiceStatus: storeStatus,
    currentBar: storeCurrentBar,
    currentNote: storeCurrentNote,
    combo: storeCombo,
    maxCombo: storeMaxCombo,
    errorTypes: storeErrorTypes,
    isIndependent: storeIsIndependent,
    helpCount: storeHelpCount,
    speedMultiplier,
    consecutiveFailures,
    isReducedSection,
    reducedStartBar,
    reducedEndBar,
    noteTimings,
    startPractice,
    nextNote,
    recordError,
    addCombo,
    resetBar,
    requestHelp,
    finishPractice,
    decreaseSpeed,
    reduceSection,
    resetPractice
  } = usePracticeStore()

  const [practiceState, setPracticeState] = useState<PracticeState>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showErrorTip, setShowErrorTip] = useState(false)
  const [errorTipText, setErrorTipText] = useState('')
  const [errorTipType, setErrorTipType] = useState<'wrongNote' | 'wrongRhythm' | null>(null)
  const [showComboTip, setShowComboTip] = useState(false)
  const [comboTipText, setComboTipText] = useState('')
  const [parentMode, setParentMode] = useState(false)
  const [lastErrorNoteIndex, setLastErrorNoteIndex] = useState(-1)

  const [resultStars, setResultStars] = useState(0)
  const [resultAccuracy, setResultAccuracy] = useState(0)
  const [resultRhythmAccuracy, setResultRhythmAccuracy] = useState(0)
  const [resultImproved, setResultImproved] = useState<string[]>([])
  const [resultEncouragement, setResultEncouragement] = useState('')
  const [resultMostError, setResultMostError] = useState('')
  const [resultIsIndependent, setResultIsIndependent] = useState(true)
  const [resultHelpCount, setResultHelpCount] = useState(0)
  const [resultBarDetails, setResultBarDetails] = useState<BarDetail[]>([])
  const [resultNextSuggestion, setResultNextSuggestion] = useState('')
  const [resultPracticedBars, setResultPracticedBars] = useState('')
  const [resultFinalSpeed, setResultFinalSpeed] = useState(1)
  const [resultWasReduced, setResultWasReduced] = useState(false)

  const timerRef = useRef<number | null>(null)

  const task = currentTask

  const effectiveBarsCount = useMemo(() => {
    if (!task) return 8
    if (isReducedSection) {
      return reducedEndBar - reducedStartBar + 1
    }
    return task.barsCount
  }, [task, isReducedSection, reducedStartBar, reducedEndBar])

  const displayStartBar = useMemo(() => {
    if (!task) return 1
    if (isReducedSection) return reducedStartBar
    return task.startBar
  }, [task, isReducedSection, reducedStartBar])

  const displayEndBar = useMemo(() => {
    if (!task) return 8
    if (isReducedSection) return reducedEndBar
    return task.endBar
  }, [task, isReducedSection, reducedEndBar])

  const totalNotes = effectiveBarsCount * 4

  const notes: NotePosition[] = useMemo(() => {
    const result: NotePosition[] = []
    const timings = noteTimings.length > 0 ? noteTimings : Array.from({ length: totalNotes }, (_, i) => i * (600 / speedMultiplier))
    for (let i = 0; i < Math.min(totalNotes, timings.length); i++) {
      result.push({
        x: 60 + i * 22,
        y: 40 + Math.sin(i * 0.8) * 30,
        index: i,
        expectedTiming: timings[i]
      })
    }
    return result
  }, [totalNotes, noteTimings, speedMultiplier])

  const currentNoteIndex = storeCurrentNote
  const currentBar = displayStartBar + Math.floor(currentNoteIndex / 4)
  const totalBars = effectiveBarsCount
  const progress = (currentNoteIndex / totalNotes) * 100
  const combo = storeCombo
  const maxCombo = storeMaxCombo
  const errorTypes = storeErrorTypes
  const isIndependent = storeIsIndependent
  const helpCount = storeHelpCount

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const doStartPractice = useCallback(() => {
    startPractice()
    setPracticeState('playing')
    setElapsedTime(0)
    setLastErrorNoteIndex(-1)

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000) as unknown as number

    console.log('[Practice] Started:', task?.title)
  }, [startPractice, task])

  const handleNoteTap = (noteIndex: number) => {
    if (practiceState !== 'playing') return

    if (noteIndex === currentNoteIndex) {
      const newCombo = combo + 1
      addCombo()

      if (newCombo > 0 && newCombo % 5 === 0) {
        setComboTipText(`${newCombo}连击!`)
        setShowComboTip(true)
        setTimeout(() => setShowComboTip(false), 800)
      }

      if (currentNoteIndex < totalNotes - 1) {
        nextNote()
      } else {
        doFinishPractice()
      }
    } else if (noteIndex > currentNoteIndex) {
      handleError('wrongNote', '弹错啦~')
    } else {
      handleError('wrongRhythm', '节奏快了~')
    }
  }

  const handleError = (type: 'wrongNote' | 'wrongRhythm', message: string) => {
    const newConsecutiveFailures = consecutiveFailures + 1
    const newSpeed = Math.max(0.5, speedMultiplier - 0.1)
    const barIndex = Math.floor(currentNoteIndex / 4)

    recordError(type, currentNoteIndex, barIndex)
    setLastErrorNoteIndex(currentNoteIndex)
    setErrorTipType(type)
    setErrorTipText(message)
    setShowErrorTip(true)

    setTimeout(() => {
      setShowErrorTip(false)
      setErrorTipType(null)
    }, 1500)

    console.log('[Practice] Error:', {
      type,
      message,
      noteIndex: currentNoteIndex,
      barIndex,
      consecutiveFailures: newConsecutiveFailures,
      currentSpeed: speedMultiplier
    })

    if (newConsecutiveFailures >= 3 && speedMultiplier > 0.5) {
      decreaseSpeed()
      Taro.showToast({
        title: `已降速到${Math.round(newSpeed * 100)}%，慢慢来~`,
        icon: 'none',
        duration: 2000
      })
    }

    if (newConsecutiveFailures >= 5 && !isReducedSection) {
      reduceSection()
      Taro.showToast({
        title: '已缩短练习段落',
        icon: 'none',
        duration: 2000
      })
    }
  }

  const doResetBar = () => {
    if (practiceState !== 'playing') return

    const resetFrom = lastErrorNoteIndex >= 0 ? lastErrorNoteIndex : currentNoteIndex
    resetBar(resetFrom)
    console.log('[Practice] Reset bar from:', resetFrom)

    Taro.showToast({
      title: '重新开始这两小节',
      icon: 'none'
    })
  }

  const doRequestHelp = () => {
    requestHelp(currentNoteIndex)
    Taro.showToast({
      title: '提示：看清楚下一个音的位置',
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

  const doFinishPractice = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const result = finishPractice(elapsedTime)
    setPracticeState('finished')

    setResultStars(result.stars)
    setResultAccuracy(result.accuracy)
    setResultRhythmAccuracy(result.rhythmAccuracy)
    setResultImproved(result.improvedPoints)
    setResultEncouragement(result.encouragement)
    setResultMostError(getMostErrorType(result.errorTypes))
    setResultIsIndependent(result.isIndependent)
    setResultHelpCount(result.helpCount)
    setResultBarDetails(result.barDetails || [])
    setResultNextSuggestion(result.nextPracticeSuggestion || '')
    setResultPracticedBars(result.practicedBars || '')
    setResultFinalSpeed(result.finalSpeed || 1)
    setResultWasReduced(result.wasReducedSection || false)

    console.log('[Practice] Finished with real data:', {
      accuracy: result.accuracy,
      rhythmAccuracy: result.rhythmAccuracy,
      stars: result.stars,
      maxCombo: result.maxCombo,
      errorTypes: result.errorTypes,
      isIndependent: result.isIndependent,
      helpCount: result.helpCount,
      mostError: getMostErrorType(result.errorTypes),
      barDetails: result.barDetails,
      nextSuggestion: result.nextPracticeSuggestion
    })
  }

  const doPausePractice = () => {
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

  const doRestartPractice = () => {
    doStartPractice()
  }

  const goBack = () => {
    resetPractice()
    Taro.navigateBack()
  }

  const goToReward = () => {
    resetPractice()
    Taro.switchTab({
      url: '/pages/reward/index'
    })
  }

  if (practiceState === 'idle' || !task) {
    return (
      <View className={styles.page}>
        <View className={styles.idleSection}>
          <Text className={styles.bigIcon}>{task?.focus.icon || '🎹'}</Text>
          <Text className={styles.idleTitle}>{task?.title || '准备开始练习'}</Text>
          <Text className={styles.idleDesc}>
            {task?.focus.description || '准备好了吗？'}{'\n'}
            共 {totalBars} 小节，约 {Math.round((task?.duration || 180) / 60)} 分钟
          </Text>

          {parentMode && (
            <View className={styles.parentModeBadge}>
              <Text>👨‍👩‍👧</Text>
              <Text>亲子模式</Text>
            </View>
          )}

          <View className={styles.startBigBtn} onClick={doStartPractice}>
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
      <ScrollView scrollY className={styles.page}>
        <View className={styles.finishSection}>
          <View className={styles.resultCard}>
            <View className={styles.resultTitle}>
              🎉 练习完成！
            </View>

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

            <View className={styles.practiceInfoBar}>
              <View className={styles.practiceInfoItem}>
                <Text className={styles.practiceInfoLabel}>练习段落</Text>
                <Text className={styles.practiceInfoValue}>{resultPracticedBars || `${displayStartBar}-${displayEndBar}小节`}</Text>
              </View>
              {resultFinalSpeed < 1 && (
                <View className={styles.practiceInfoItem}>
                  <Text className={styles.practiceInfoLabel}>最终速度</Text>
                  <Text className={styles.practiceInfoValue}>🔽 {Math.round(resultFinalSpeed * 100)}%</Text>
                </View>
              )}
              {resultWasReduced && (
                <View className={styles.practiceInfoItem}>
                  <Text className={styles.practiceInfoLabel}>段落调整</Text>
                  <Text className={styles.practiceInfoValue}>✂️ 已缩短</Text>
                </View>
              )}
            </View>

            <View className={styles.resultStats}>
              <View className={styles.resultStat}>
                <Text className={styles.statValue}>{resultAccuracy}%</Text>
                <Text className={styles.statLabel}>准确率</Text>
              </View>
              <View className={styles.resultStat}>
                <Text className={styles.statValue}>{resultRhythmAccuracy}%</Text>
                <Text className={styles.statLabel}>节奏准确率</Text>
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

            <View className={styles.errorSummary}>
              <View className={styles.errorSummaryTitle}>
                <Text className={styles.errorSummaryLabel}>错误统计</Text>
              </View>
              <View className={styles.errorSummaryList}>
                <View className={styles.errorSummaryItem}>
                  <Text className={styles.errorSummaryIcon}>🎵</Text>
                  <Text className={styles.errorSummaryName}>错音</Text>
                  <Text className={styles.errorSummaryCount}>{errorTypes.wrongNote}次</Text>
                </View>
                <View className={styles.errorSummaryItem}>
                  <Text className={styles.errorSummaryIcon}>⏰</Text>
                  <Text className={styles.errorSummaryName}>节拍不准</Text>
                  <Text className={styles.errorSummaryCount}>{errorTypes.wrongRhythm}次</Text>
                </View>
                <View className={styles.errorSummaryItem}>
                  <Text className={styles.errorSummaryIcon}>⏸️</Text>
                  <Text className={styles.errorSummaryName}>停顿</Text>
                  <Text className={styles.errorSummaryCount}>{errorTypes.pause}次</Text>
                </View>
                <View className={styles.errorSummaryItem}>
                  <Text className={styles.errorSummaryIcon}>🤲</Text>
                  <Text className={styles.errorSummaryName}>换手不顺</Text>
                  <Text className={styles.errorSummaryCount}>{errorTypes.handSwitch}次</Text>
                </View>
              </View>
              <View className={styles.mostError}>
                <Text className={styles.mostErrorLabel}>最多错误：</Text>
                <Text className={styles.mostErrorValue}>{resultMostError}</Text>
              </View>
            </View>

            {resultBarDetails.length > 0 && (
              <View className={styles.barReviewSection}>
                <View className={styles.sectionTitle}>
                  <Text>📊 小节复盘</Text>
                </View>
                <View className={styles.barReviewGrid}>
                  {resultBarDetails.map((bar) => {
                    const barNumber = displayStartBar + bar.barIndex
                    const hasErrors = bar.errors.length > 0
                    const hasHelp = bar.helpRequested
                    const errorTypes = [...new Set(bar.errors.map(e => e.type))]

                    return (
                      <View
                        key={bar.barIndex}
                        className={`${styles.barReviewItem} ${hasErrors ? styles.hasErrors : ''} ${hasHelp ? styles.hasHelp : ''}`}
                      >
                        <Text className={styles.barNumber}>第{barNumber}小节</Text>
                        {hasErrors ? (
                          <View className={styles.barErrors}>
                            {errorTypes.map((type, idx) => (
                              <Text key={idx} className={`${styles.barErrorTag} ${styles[type]}`}>
                                {type === 'wrongNote' ? '🎵' : type === 'wrongRhythm' ? '⏰' : type === 'pause' ? '⏸️' : '🤲'}
                                {bar.errors.filter(e => e.type === type).length}
                              </Text>
                            ))}
                            {hasHelp && (
                              <Text className={styles.barHelpTag}>💡求助</Text>
                            )}
                          </View>
                        ) : hasHelp ? (
                          <Text className={styles.barHelpTag}>💡求助过</Text>
                        ) : (
                          <Text className={styles.barPerfect}>✓ 完美</Text>
                        )}
                      </View>
                    )
                  })}
                </View>
              </View>
            )}

            {resultNextSuggestion && (
              <View className={styles.suggestionSection}>
                <View className={styles.suggestionIcon}>🎯</View>
                <View className={styles.suggestionContent}>
                  <Text className={styles.suggestionLabel}>下次练习建议</Text>
                  <Text className={styles.suggestionText}>{resultNextSuggestion}</Text>
                </View>
              </View>
            )}

            <View className={styles.independentSection}>
              {resultIsIndependent ? (
                <View className={styles.independentBadgeSuccess}>
                  <Text>✓ 独立完成！太棒了！</Text>
                </View>
              ) : (
                <View className={styles.independentBadge}>
                  <Text>求助了 {resultHelpCount} 次，下次加油！</Text>
                </View>
              )}
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
            <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={doRestartPractice}>
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
          <Text className={styles.taskTitle}>{task.title}</Text>
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
          <Text className={styles.focusIcon}>{task.focus.icon}</Text>
          <Text className={styles.focusText}>{task.focus.description}</Text>
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
              🔽 已降速 {Math.round(speedMultiplier * 100)}%
            </View>
          )}

          {isReducedSection && (
            <View className={styles.reducedBadge}>
              ✂️ 已缩短段落
            </View>
          )}

          {showErrorTip && (
            <View className={`${styles.errorTip} ${errorTipType === 'wrongRhythm' ? styles.rhythmError : styles.noteError}`}>
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
                    ${note.index === lastErrorNoteIndex ? styles.wrong : ''}
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
            {consecutiveFailures > 0 && (
              <Text className={styles.failIndicator}> · 连续{consecutiveFailures}次失误</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.controls}>
        <View className={styles.mainButtons}>
          {practiceState === 'playing' ? (
            <>
              <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={doPausePractice}>
                <Text>⏸ 暂停</Text>
              </View>
              <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={doResetBar}>
                <Text>↩ 重来两小节</Text>
              </View>
            </>
          ) : (
            <>
              <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={goBack}>
                <Text>退出</Text>
              </View>
              <View className={`${styles.btn} ${styles.btnSuccess}`} onClick={doPausePractice}>
                <Text>▶ 继续</Text>
              </View>
            </>
          )}
        </View>

        <View className={styles.secondaryButtons}>
          <View className={styles.smallBtn} onClick={doRequestHelp}>
            <Text className={styles.btnIcon}>💡</Text>
            <Text>求助提示</Text>
            {helpCount > 0 && <Text className={styles.helpCount}>({helpCount})</Text>}
          </View>
          <View className={styles.smallBtn} onClick={toggleParentMode}>
            <Text className={styles.btnIcon}>👨‍👩‍👧</Text>
            <Text>{parentMode ? '关闭亲子' : '亲子模式'}</Text>
          </View>
          <View className={styles.smallBtn} onClick={doRestartPractice}>
            <Text className={styles.btnIcon}>🔄</Text>
            <Text>重新开始</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PracticePage
