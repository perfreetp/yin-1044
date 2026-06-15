export interface ChildInfo {
  name: string
  age: number
  studyYears: number
  currentBook: string
}

export interface DailyFocus {
  type: 'rhythm' | 'handSwitch' | 'continuous'
  label: string
  icon: string
  description: string
}

export interface PracticeTask {
  id: string
  title: string
  duration: number
  difficulty: number
  barsCount: number
  focus: DailyFocus
  isTeacherTask: boolean
  description: string
}

export interface Note {
  pitch: string
  duration: number
  barIndex: number
  noteIndex: number
}

export interface PracticeResult {
  taskId: string
  stars: number
  combo: number
  maxCombo: number
  accuracy: number
  rhythmAccuracy: number
  errorTypes: ErrorTypeStats
  duration: number
  isIndependent: boolean
  helpCount: number
  improvedPoints: string[]
  encouragement: string
  date: string
}

export interface ErrorTypeStats {
  wrongNote: number
  wrongRhythm: number
  pause: number
  handSwitch: number
}

export interface Sticker {
  id: string
  name: string
  icon: string
  unlocked: boolean
  unlockedDate?: string
  requiredStars: number
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  progress: number
  target: number
  type: 'combo' | 'streak' | 'accuracy' | 'duration'
}

export interface ParentStats {
  totalPracticeDays: number
  streakDays: number
  totalPracticeTime: number
  avgStars: number
  independentRate: number
  avgHelpCount: number
  mostErrorType: string
  weeklyData: DailyStats[]
}

export interface DailyStats {
  date: string
  duration: number
  stars: number
  isCompleted: boolean
}

export type PracticeStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'finished'
