import { encouragementList } from '@/data/mockData'

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) {
    return `${mins}分钟`
  }
  return `${mins}分${secs}秒`
}

export const getRandomEncouragement = (): string => {
  const index = Math.floor(Math.random() * encouragementList.length)
  return encouragementList[index]
}

export const getErrorTypeName = (type: string): string => {
  const map: Record<string, string> = {
    wrongNote: '错音',
    wrongRhythm: '节拍不准',
    pause: '停顿',
    handSwitch: '换手不顺'
  }
  return map[type] || type
}

export const getDifficultyText = (level: number): string => {
  return '⭐'.repeat(level)
}

export const generateImprovedPoints = (accuracy: number, combo: number): string[] => {
  const points: string[] = []
  if (accuracy >= 90) {
    points.push('音准越来越好了')
  } else if (accuracy >= 80) {
    points.push('错音比上次少了')
  }
  if (combo >= 10) {
    points.push('连击数创新高')
  }
  if (combo >= 5) {
    points.push('节奏感更稳了')
  }
  if (points.length === 0) {
    points.push('今天也有进步哦')
  }
  return points.slice(0, 2)
}

export const calculateStars = (accuracy: number, rhythmAccuracy: number, combo: number): number => {
  let stars = 0
  if (accuracy >= 70) stars++
  if (accuracy >= 85) stars++
  if (combo >= 8) stars++
  return Math.min(stars, 3)
}

export const getMostErrorType = (errors: Record<string, number>): string => {
  let maxType = ''
  let maxCount = 0
  Object.entries(errors).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxType = type
    }
  })
  return getErrorTypeName(maxType)
}
