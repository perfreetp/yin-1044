import type { DailyFocus, PracticeTask, Sticker, Badge, PracticeResult, ParentStats, ChildInfo, DailyStats } from '@/types'

export const mockChildInfo: ChildInfo = {
  name: '小乐',
  age: 7,
  studyYears: 1,
  currentBook: '小汤第二册'
}

export const mockFocusList: DailyFocus[] = [
  { type: 'rhythm', label: '节奏练习', icon: '🎵', description: '今天重点：稳住节拍' },
  { type: 'handSwitch', label: '换手练习', icon: '🤲', description: '今天重点：左右手切换' },
  { type: 'continuous', label: '连贯练习', icon: '🎹', description: '今天重点：看谱不停顿' }
]

export const mockDailyTask: PracticeTask = {
  id: 'task_001',
  title: '欢乐颂 第1-8小节',
  duration: 180,
  difficulty: 2,
  barsCount: 8,
  startBar: 1,
  endBar: 8,
  focus: mockFocusList[0],
  isTeacherTask: true,
  priority: 0,
  description: '四分音符为主，注意保持平稳节奏'
}

export const mockTaskList: PracticeTask[] = [
  mockDailyTask,
  {
    id: 'task_002',
    title: '小星星 第1-4小节',
    duration: 120,
    difficulty: 1,
    barsCount: 4,
    startBar: 1,
    endBar: 4,
    focus: mockFocusList[2],
    isTeacherTask: false,
    priority: 999,
    description: '简单旋律，练习连贯弹奏'
  },
  {
    id: 'task_003',
    title: '两只老虎 第5-12小节',
    duration: 200,
    difficulty: 2,
    barsCount: 8,
    startBar: 5,
    endBar: 12,
    focus: mockFocusList[1],
    isTeacherTask: false,
    priority: 999,
    description: '左右手交替练习'
  }
]

export const mockStickers: Sticker[] = [
  { id: 's1', name: '音乐小星', icon: '⭐', unlocked: true, unlockedDate: '2024-01-01', requiredStars: 0 },
  { id: 's2', name: '节奏达人', icon: '🎵', unlocked: true, unlockedDate: '2024-01-05', requiredStars: 5 },
  { id: 's3', name: '钢琴王子', icon: '🎹', unlocked: true, unlockedDate: '2024-01-10', requiredStars: 10 },
  { id: 's4', name: '坚持小勇士', icon: '💪', unlocked: false, requiredStars: 20 },
  { id: 's5', name: '音乐精灵', icon: '🧚', unlocked: false, requiredStars: 30 },
  { id: 's6', name: '小小作曲家', icon: '🎼', unlocked: false, requiredStars: 50 },
  { id: 's7', name: '快乐琴童', icon: '😊', unlocked: true, unlockedDate: '2024-01-15', requiredStars: 3 },
  { id: 's8', name: '闪亮新星', icon: '✨', unlocked: false, requiredStars: 15 },
  { id: 's9', name: '旋律小天使', icon: '👼', unlocked: false, requiredStars: 40 },
  { id: 's10', name: '超级琴键大师', icon: '🏆', unlocked: false, requiredStars: 100 }
]

export const mockBadges: Badge[] = [
  { id: 'b1', name: '连击小能手', icon: '🔥', description: '连续弹奏10次不中断', unlocked: true, progress: 7, target: 10, type: 'combo' },
  { id: 'b2', name: '七日挑战', icon: '📅', description: '连续打卡7天', unlocked: false, progress: 5, target: 7, type: 'streak' },
  { id: 'b3', name: '准确之星', icon: '🎯', description: '准确率达到95%', unlocked: false, progress: 85, target: 95, type: 'accuracy' },
  { id: 'b4', name: '练习小达人', icon: '⏰', description: '累计练习30分钟', unlocked: true, progress: 45, target: 30, type: 'duration' },
  { id: 'b5', name: '月度之星', icon: '🌟', description: '累计打卡30天', unlocked: false, progress: 12, target: 30, type: 'streak' },
  { id: 'b6', name: '完美演奏家', icon: '💎', description: '获得三星评价', unlocked: false, progress: 0, target: 5, type: 'combo' }
]

export const mockPracticeResult: PracticeResult = {
  taskId: 'task_001',
  taskTitle: '欢乐颂 第1-8小节',
  stars: 3,
  combo: 12,
  maxCombo: 15,
  accuracy: 92,
  rhythmAccuracy: 88,
  errorTypes: {
    wrongNote: 3,
    wrongRhythm: 2,
    pause: 1,
    handSwitch: 1
  },
  duration: 175,
  isIndependent: true,
  helpCount: 0,
  improvedPoints: ['节奏比上次更稳了', '错音比上次少了2个'],
  encouragement: '太棒了！今天的节奏掌握得很好，继续加油哦~',
  date: '2024-01-20',
  barDetails: [],
  errorLocations: [],
  nextPracticeSuggestion: '下次练习第3-4小节',
  practicedBars: '1-8小节',
  finalSpeed: 1,
  wasReducedSection: false
}

export const mockParentStats: ParentStats = {
  totalPracticeDays: 12,
  streakDays: 5,
  totalPracticeTime: 240,
  avgStars: 2.5,
  independentRate: 78,
  avgHelpCount: 1.2,
  mostErrorType: '错音',
  weeklyData: [
    { date: '周一', duration: 25, stars: 2, isCompleted: true },
    { date: '周二', duration: 30, stars: 3, isCompleted: true },
    { date: '周三', duration: 20, stars: 2, isCompleted: true },
    { date: '周四', duration: 35, stars: 3, isCompleted: true },
    { date: '周五', duration: 28, stars: 2, isCompleted: true },
    { date: '周六', duration: 40, stars: 3, isCompleted: true },
    { date: '周日', duration: 0, stars: 0, isCompleted: false }
  ]
}

export const encouragementList: string[] = [
  '太棒了！今天进步真大！',
  '你真是个小小音乐家！',
  '继续加油，你越来越棒了！',
  '妈妈/爸爸为你骄傲！',
  '今天的表现超棒的，明天继续！',
  '你弹得真好听，再来一首？',
  '坚持练习，你会越来越厉害！',
  '今天比昨天又进步啦！',
  '你认真的样子超可爱！',
  '音乐小天才就是你！'
]

export const textbookOptions: string[] = [
  '小汤第一册',
  '小汤第二册',
  '小汤第三册',
  '大汤第一册',
  '拜厄钢琴基本教程',
  '哈农钢琴练指法',
  '车尔尼599',
  '布格缪勒'
]
