import { create } from 'zustand'
import type { ChildInfo, PracticeTask, PracticeResult, PracticeStatus, ErrorTypeStats } from '@/types'
import { mockChildInfo, mockDailyTask } from '@/data/mockData'
import { calculateStars, generateImprovedPoints, getRandomEncouragement } from '@/utils'

interface PracticeState {
  childInfo: ChildInfo
  currentTask: PracticeTask | null
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

  setCurrentTask: (task: PracticeTask) => void
  setPracticeStatus: (status: PracticeStatus) => void
  startPractice: () => void
  nextNote: () => void
  recordError: (type: keyof ErrorTypeStats) => void
  addCombo: () => void
  resetBar: () => void
  requestHelp: () => void
  finishPractice: () => PracticeResult
  decreaseSpeed: () => void
  resetPractice: () => void
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  childInfo: mockChildInfo,
  currentTask: mockDailyTask,
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
    consecutiveFailures: 0
  }),

  nextNote: () => set((state) => {
    const newNote = state.currentNote + 1
    return { currentNote: newNote }
  }),

  recordError: (type) => set((state) => ({
    errorCount: state.errorCount + 1,
    combo: 0,
    consecutiveFailures: state.consecutiveFailures + 1,
    errorTypes: {
      ...state.errorTypes,
      [type]: state.errorTypes[type] + 1
    }
  })),

  addCombo: () => set((state) => {
    const newCombo = state.combo + 1
    return {
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      consecutiveFailures: 0
    }
  }),

  resetBar: () => set((state) => ({
    currentNote: Math.max(0, state.currentNote - 4),
    combo: 0
  })),

  requestHelp: () => set((state) => ({
    helpCount: state.helpCount + 1,
    isIndependent: false
  })),

  finishPractice: () => {
    const state = get()
    const task = state.currentTask
    if (!task) {
      return {} as PracticeResult
    }

    const totalNotes = task.barsCount * 4
    const accuracy = Math.round(((totalNotes - state.errorCount) / totalNotes) * 100)
    const rhythmAccuracy = Math.max(0, 100 - state.errorTypes.wrongRhythm * 5)
    const stars = calculateStars(accuracy, rhythmAccuracy, state.maxCombo)
    const improvedPoints = generateImprovedPoints(accuracy, state.maxCombo)
    const encouragement = getRandomEncouragement()

    const result: PracticeResult = {
      taskId: task.id,
      stars,
      combo: state.maxCombo,
      maxCombo: state.maxCombo,
      accuracy,
      rhythmAccuracy,
      errorTypes: { ...state.errorTypes },
      duration: task.duration,
      isIndependent: state.isIndependent,
      helpCount: state.helpCount,
      improvedPoints,
      encouragement,
      date: new Date().toISOString().split('T')[0]
    }

    set((prev) => ({
      practiceStatus: 'finished',
      practiceResults: [...prev.practiceResults, result]
    }))

    return result
  },

  decreaseSpeed: () => set((state) => ({
    speedMultiplier: Math.max(0.5, state.speedMultiplier - 0.1)
  })),

  resetPractice: () => set({
    practiceStatus: 'idle',
    currentBar: 0,
    currentNote: 0,
    combo: 0,
    maxCombo: 0,
    errorCount: 0,
    speedMultiplier: 1,
    consecutiveFailures: 0
  })
})
