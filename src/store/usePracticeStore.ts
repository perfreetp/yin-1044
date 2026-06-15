import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type { ChildInfo, PracticeTask, PracticeResult, PracticeStatus, ErrorTypeStats, DailyStats } from '@/types'
import { mockChildInfo, mockFocusList, textbookOptions } from '@/data/mockData'
import { calculateStars, generateImprovedPoints, getRandomEncouragement, getMostErrorType } from '@/utils'

interface PracticeState {
  childInfo: ChildInfo
  currentTask: PracticeTask | null
  todayTasks: PracticeTask[]
  practiceStatus: PracticeStatus
  currentBar: number
  currentNote: number
  combo: number
  maxCombo: number
  errorCount: number
  errorTypes: ErrorTypeStats
  isIndependent: boolean
  helpCount: number
  speedMultiplier: number
  consecutiveFailures: number
  practiceResults: PracticeResult[]
  teacherTasks: PracticeTask[]
  totalStars: number
  streakDays: number
  lastPracticeDate: string | null
  dailyStats: DailyStats[]
  isReducedSection: boolean

  setCurrentTask: (task: PracticeTask) => void
  setPracticeStatus: (status: PracticeStatus) => void
  startPractice: () => void
  nextNote: () => void
  recordError: (type: keyof ErrorTypeStats) => void
  addCombo: () => void
  resetBar: (fromNoteIndex: number) => void
  requestHelp: () => void
  finishPractice: (duration: number) => PracticeResult
  decreaseSpeed: () => void
  reduceSection: () => void
  resetPractice: () => void
  updateChildInfo: (info: Partial<ChildInfo>) => void
  generateTodayTasks: () => void
  addTeacherTask: (task: PracticeTask) => void
  removeTeacherTask: (taskId: string) => void
  getParentStats: () => {
    totalPracticeDays: number
    streakDays: number
    totalPracticeTime: number
    avgStars: number
    independentRate: number
    avgHelpCount: number
    mostErrorType: string
    weeklyData: DailyStats[]
  }
}

const generateTaskForChild = (child: ChildInfo, index: number, isTeacher: boolean): PracticeTask => {
  const ageFactor = Math.min(2, Math.max(1, child.age / 6))
  const yearFactor = Math.min(3, Math.max(1, child.studyYears + 1))
  const difficulty = Math.round((ageFactor + yearFactor) / 2)

  const baseDurations = [90, 120, 150, 180]
  const duration = baseDurations[Math.min(index, 3)]

  const bookSongs: Record<string, string[]> = {
    '小汤第一册': ['欢乐颂', '小星星', '两只老虎', '生日快乐'],
    '小汤第二册': ['欢乐颂', '小白船', '铃儿响叮当', '送别'],
    '小汤第三册': ['致爱丽丝', '童年', '雪绒花', '茉莉花'],
    '大汤第一册': ['致爱丽丝', '蓝色多瑙河', '春天在哪里', '让我们荡起双桨'],
    '拜厄钢琴基本教程': ['练习曲1', '练习曲2', '练习曲3', '练习曲4'],
    '哈农钢琴练指法': ['练指法1', '练指法2', '练指法3', '练指法4'],
    '车尔尼599': ['练习曲10', '练习曲20', '练习曲30', '练习曲40'],
    '布格缪勒': ['安慰曲', '叙事曲', '摇篮曲', '圆舞曲']
  }

  const songs = bookSongs[child.currentBook] || bookSongs['小汤第一册']
  const songName = songs[index % songs.length]
  const barsCount = 4 + Math.min(4, Math.floor(difficulty * 2))
  const startBar = 1 + (index * 4)
  const endBar = startBar + barsCount - 1

  const focus = mockFocusList[index % mockFocusList.length]

  return {
    id: `task_${Date.now()}_${index}`,
    title: `${songName} 第${startBar}-${endBar}小节`,
    duration: Math.min(300, duration),
    difficulty,
    barsCount,
    focus,
    isTeacherTask: isTeacher,
    description: getTaskDescription(focus.type, difficulty)
  }
}

const getTaskDescription = (focusType: string, difficulty: number): string => {
  const descriptions: Record<string, string[]> = {
    rhythm: ['四分音符为主，保持平稳节奏', '注意附点音符的时值', '切分节奏练习'],
    handSwitch: ['左右手交替练习', '注意双手衔接', '换手时保持连贯'],
    continuous: ['练习连贯弹奏', '尽量不要停顿', '保持音乐流畅性']
  }
  const list = descriptions[focusType] || descriptions.rhythm
  return list[Math.min(difficulty - 1, list.length - 1)]
}

const storage = {
  getItem: (name: string) => {
    try {
      return Taro.getStorageSync(name)
    } catch (e) {
      console.error('[Storage] getItem error:', e)
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value)
    } catch (e) {
      console.error('[Storage] setItem error:', e)
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name)
    } catch (e) {
      console.error('[Storage] removeItem error:', e)
    }
  }
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      childInfo: mockChildInfo,
      currentTask: null,
      todayTasks: [],
      practiceStatus: 'idle',
      currentBar: 0,
      currentNote: 0,
      combo: 0,
      maxCombo: 0,
      errorCount: 0,
      errorTypes: {
        wrongNote: 0,
        wrongRhythm: 0,
        pause: 0,
        handSwitch: 0
      },
      isIndependent: true,
      helpCount: 0,
      speedMultiplier: 1,
      consecutiveFailures: 0,
      practiceResults: [],
      teacherTasks: [],
      totalStars: 0,
      streakDays: 0,
      lastPracticeDate: null,
      dailyStats: [],
      isReducedSection: false,

      setCurrentTask: (task) => set({ currentTask: task }),

      setPracticeStatus: (status) => set({ practiceStatus: status }),

      startPractice: () => set({
        practiceStatus: 'playing',
        currentBar: 0,
        currentNote: 0,
        combo: 0,
        maxCombo: 0,
        errorCount: 0,
        errorTypes: { wrongNote: 0, wrongRhythm: 0, pause: 0, handSwitch: 0 },
        isIndependent: true,
        helpCount: 0,
        consecutiveFailures: 0,
        speedMultiplier: 1,
        isReducedSection: false
      }),

      nextNote: () => set((state) => {
        const newNote = state.currentNote + 1
        const newBar = Math.floor(newNote / 4)
        return { currentNote: newNote, currentBar: newBar }
      }),

      recordError: (type) => set((state) => {
        const newErrorTypes = {
          ...state.errorTypes,
          [type]: state.errorTypes[type] + 1
        }
        return {
          errorCount: state.errorCount + 1,
          combo: 0,
          consecutiveFailures: state.consecutiveFailures + 1,
          errorTypes: newErrorTypes
        }
      }),

      addCombo: () => set((state) => {
        const newCombo = state.combo + 1
        return {
          combo: newCombo,
          maxCombo: Math.max(state.maxCombo, newCombo),
          consecutiveFailures: 0
        }
      }),

      resetBar: (fromNoteIndex) => set((state) => {
        const newIndex = Math.max(0, fromNoteIndex - 8)
        const newBar = Math.floor(newIndex / 4)
        return {
          currentNote: newIndex,
          currentBar: newBar,
          combo: 0
        }
      }),

      requestHelp: () => set((state) => ({
        helpCount: state.helpCount + 1,
        isIndependent: false
      })),

      finishPractice: (duration) => {
        const state = get()
        const task = state.currentTask
        if (!task) {
          return {} as PracticeResult
        }

        const totalNotes = task.barsCount * 4
        const accuracy = Math.max(0, Math.round(((totalNotes - state.errorCount) / totalNotes) * 100))

        const totalRhythmErrors = state.errorTypes.wrongRhythm + state.errorTypes.pause
        const rhythmAccuracy = Math.max(0, Math.round(100 - (totalRhythmErrors / totalNotes) * 100))

        const stars = calculateStars(accuracy, rhythmAccuracy, state.maxCombo)
        const improvedPoints = generateImprovedPoints(accuracy, state.maxCombo)
        const encouragement = getRandomEncouragement()

        const result: PracticeResult = {
          taskId: task.id,
          stars,
          combo: state.combo,
          maxCombo: state.maxCombo,
          accuracy,
          rhythmAccuracy,
          errorTypes: { ...state.errorTypes },
          duration,
          isIndependent: state.isIndependent,
          helpCount: state.helpCount,
          improvedPoints,
          encouragement,
          date: new Date().toISOString().split('T')[0]
        }

        const today = new Date().toISOString().split('T')[0]
        const lastDate = state.lastPracticeDate
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreakDays = state.streakDays
        if (lastDate === yesterdayStr || lastDate === today) {
          if (lastDate !== today) {
            newStreakDays = state.streakDays + 1
          }
        } else {
          newStreakDays = 1
        }

        const existingDailyIndex = state.dailyStats.findIndex(d => d.date === today)
        let newDailyStats = [...state.dailyStats]
        if (existingDailyIndex >= 0) {
          newDailyStats[existingDailyIndex] = {
            date: today,
            duration: newDailyStats[existingDailyIndex].duration + duration,
            stars: Math.max(newDailyStats[existingDailyIndex].stars, stars),
            isCompleted: true
          }
        } else {
          newDailyStats.push({
            date: today,
            duration,
            stars,
            isCompleted: true
          })
        }

        set((prev) => ({
          practiceStatus: 'finished',
          practiceResults: [...prev.practiceResults, result],
          totalStars: prev.totalStars + stars,
          lastPracticeDate: today,
          streakDays: newStreakDays,
          dailyStats: newDailyStats
        }))

        console.log('[Practice] Finished:', {
          accuracy,
          rhythmAccuracy,
          stars,
          maxCombo: state.maxCombo,
          errorTypes: state.errorTypes,
          helpCount: state.helpCount,
          isIndependent: state.isIndependent
        })

        return result
      },

      decreaseSpeed: () => set((state) => {
        const newSpeed = Math.max(0.5, state.speedMultiplier - 0.1)
        console.log('[Practice] Speed decreased to:', newSpeed)
        return { speedMultiplier: newSpeed }
      }),

      reduceSection: () => set({ isReducedSection: true }),

      resetPractice: () => set({
        practiceStatus: 'idle',
        currentBar: 0,
        currentNote: 0,
        combo: 0,
        maxCombo: 0,
        errorCount: 0,
        speedMultiplier: 1,
        consecutiveFailures: 0,
        isReducedSection: false
      }),

      updateChildInfo: (info) => set((state) => {
        const newInfo = { ...state.childInfo, ...info }
        console.log('[ChildInfo] Updated:', newInfo)
        return { childInfo: newInfo }
      }),

      generateTodayTasks: () => {
        const state = get()
        const child = state.childInfo
        const teacherTasks = state.teacherTasks

        const totalDuration = teacherTasks.reduce((sum, t) => sum + t.duration, 0)
        const maxDuration = 300
        const remainingDuration = maxDuration - totalDuration

        const normalTasks: PracticeTask[] = []
        let currentDuration = 0
        let taskIndex = 0

        while (currentDuration < remainingDuration && taskIndex < 3) {
          const task = generateTaskForChild(child, taskIndex, false)
          if (currentDuration + task.duration <= remainingDuration) {
            normalTasks.push(task)
            currentDuration += task.duration
          }
          taskIndex++
        }

        const sortedTeacherTasks = [...teacherTasks].sort((a, b) => {
          if (a.isTeacherTask && !b.isTeacherTask) return -1
          if (!a.isTeacherTask && b.isTeacherTask) return 1
          return 0
        })

        const allTasks = [...sortedTeacherTasks, ...normalTasks]

        console.log('[Tasks] Generated today tasks:', {
          count: allTasks.length,
          teacherCount: sortedTeacherTasks.length,
          normalCount: normalTasks.length,
          totalDuration: allTasks.reduce((sum, t) => sum + t.duration, 0)
        })

        set({
          todayTasks: allTasks,
          currentTask: allTasks[0] || null
        })
      },

      addTeacherTask: (task) => set((state) => {
        const newTask = { ...task, isTeacherTask: true, id: `teacher_${Date.now()}` }
        console.log('[Tasks] Teacher task added:', newTask)
        return { teacherTasks: [...state.teacherTasks, newTask] }
      }),

      removeTeacherTask: (taskId) => set((state) => {
        const newTasks = state.teacherTasks.filter(t => t.id !== taskId)
        console.log('[Tasks] Teacher task removed:', taskId)
        return { teacherTasks: newTasks }
      }),

      getParentStats: () => {
        const state = get()
        const results = state.practiceResults
        const dailyStats = state.dailyStats

        const totalPracticeDays = [...new Set(results.map(r => r.date))].length
        const totalPracticeTime = results.reduce((sum, r) => sum + r.duration, 0)
        const avgStars = results.length > 0
          ? Math.round((results.reduce((sum, r) => sum + r.stars, 0) / results.length) * 10) / 10
          : 0

        const independentCount = results.filter(r => r.isIndependent).length
        const independentRate = results.length > 0
          ? Math.round((independentCount / results.length) * 100)
          : 100

        const totalHelpCount = results.reduce((sum, r) => sum + r.helpCount, 0)
        const avgHelpCount = results.length > 0
          ? Math.round((totalHelpCount / results.length) * 10) / 10
          : 0

        const allErrors = results.reduce((acc, r) => {
          Object.entries(r.errorTypes).forEach(([type, count]) => {
            acc[type] = (acc[type] || 0) + count
          })
          return acc
        }, {} as Record<string, number>)
        const mostErrorType = getMostErrorType(allErrors)

        const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        const today = new Date()
        const weeklyData = weekdays.map((day, index) => {
          const date = new Date(today)
          date.setDate(date.getDate() - (6 - index))
          const dateStr = date.toISOString().split('T')[0]
          const dayData = dailyStats.find(d => d.date === dateStr)
          return {
            date: day,
            duration: dayData ? Math.round(dayData.duration / 60) : 0,
            stars: dayData ? dayData.stars : 0,
            isCompleted: dayData ? dayData.isCompleted : false
          }
        })

        return {
          totalPracticeDays,
          streakDays: state.streakDays,
          totalPracticeTime,
          avgStars,
          independentRate,
          avgHelpCount,
          mostErrorType,
          weeklyData
        }
      }
    }),
    {
      name: 'practice-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        childInfo: state.childInfo,
        practiceResults: state.practiceResults,
        teacherTasks: state.teacherTasks,
        totalStars: state.totalStars,
        streakDays: state.streakDays,
        lastPracticeDate: state.lastPracticeDate,
        dailyStats: state.dailyStats
      })
    }
  )
)
