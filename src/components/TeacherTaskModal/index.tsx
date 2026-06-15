import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { usePracticeStore } from '@/store/usePracticeStore'
import styles from './index.module.scss'

interface TeacherTaskModalProps {
  visible: boolean
  onClose: () => void
}

const TeacherTaskModal: React.FC<TeacherTaskModalProps> = ({ visible, onClose }) => {
  const { teacherTasks, addTeacherTask, removeTeacherTask, moveTeacherTask } = usePracticeStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [songName, setSongName] = useState('')
  const [startBar, setStartBar] = useState('1')
  const [endBar, setEndBar] = useState('4')
  const [duration, setDuration] = useState('90')

  useEffect(() => {
    if (visible) {
      setShowAddForm(false)
      setSongName('')
      setStartBar('1')
      setEndBar('4')
      setDuration('90')
    }
  }, [visible])

  const handleAddTask = () => {
    if (!songName.trim()) {
      Taro.showToast({ title: '请输入曲目名称', icon: 'none' })
      return
    }

    const start = parseInt(startBar) || 1
    const end = parseInt(endBar) || 4
    const dur = parseInt(duration) || 90

    if (start > end) {
      Taro.showToast({ title: '起始小节不能大于结束小节', icon: 'none' })
      return
    }

    addTeacherTask({
      title: `${songName.trim()} 第${start}-${end}小节`,
      startBar: start,
      endBar: end,
      barsCount: end - start + 1,
      duration: Math.min(180, Math.max(60, dur))
    })

    setSongName('')
    setStartBar('1')
    setEndBar('4')
    setDuration('90')
    setShowAddForm(false)

    Taro.showToast({ title: '添加成功', icon: 'success' })
  }

  const handleDelete = (taskId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个老师布置的谱子吗？',
      success: (res) => {
        if (res.confirm) {
          removeTeacherTask(taskId)
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }

  const handleMoveUp = (taskId: string, index: number) => {
    if (index === 0) return
    moveTeacherTask(taskId, 'up')
  }

  const handleMoveDown = (taskId: string, index: number) => {
    if (index === teacherTasks.length - 1) return
    moveTeacherTask(taskId, 'down')
  }

  if (!visible) return null

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>老师布置的谱子</Text>
          <View className={styles.closeBtn} onClick={onClose}>
            <Text>✕</Text>
          </View>
        </View>

        <View className={styles.content}>
          <View className={styles.tip}>
            <Text className={styles.tipText}>
              💡 排在前面的谱子会优先出现在今日任务中，总时长不超过5分钟
            </Text>
          </View>

          {teacherTasks.length > 0 && (
            <View className={styles.taskList}>
              {teacherTasks.map((task, index) => (
                <View key={task.id} className={styles.taskItem}>
                  <View className={styles.taskPriority}>
                    <Text className={styles.priorityNum}>{index + 1}</Text>
                  </View>
                  <View className={styles.taskInfo}>
                    <Text className={styles.taskTitle}>{task.title}</Text>
                    <Text className={styles.taskMeta}>
                      {Math.round(task.duration / 60)}分钟 · {task.barsCount}小节
                    </Text>
                  </View>
                  <View className={styles.taskActions}>
                    <View
                      className={`${styles.actionBtn} ${index === 0 ? styles.disabled : ''}`}
                      onClick={() => handleMoveUp(task.id, index)}
                    >
                      <Text>↑</Text>
                    </View>
                    <View
                      className={`${styles.actionBtn} ${index === teacherTasks.length - 1 ? styles.disabled : ''}`}
                      onClick={() => handleMoveDown(task.id, index)}
                    >
                      <Text>↓</Text>
                    </View>
                    <View
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(task.id)}
                    >
                      <Text>删除</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {teacherTasks.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>还没有老师布置的谱子</Text>
              <Text className={styles.emptyDesc}>点击下方按钮添加</Text>
            </View>
          )}

          {showAddForm ? (
            <View className={styles.addForm}>
              <View className={styles.formTitle}>添加新谱子</View>

              <View className={styles.formItem}>
                <Text className={styles.label}>曲目名称</Text>
                <Input
                  className={styles.input}
                  placeholder="如：欢乐颂"
                  value={songName}
                  onInput={(e) => setSongName(e.detail.value)}
                  maxlength={20}
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formItem}>
                  <Text className={styles.label}>起始小节</Text>
                  <Input
                    className={styles.input}
                    type="number"
                    placeholder="1"
                    value={startBar}
                    onInput={(e) => setStartBar(e.detail.value)}
                  />
                </View>
                <View className={styles.formItem}>
                  <Text className={styles.label}>结束小节</Text>
                  <Input
                    className={styles.input}
                    type="number"
                    placeholder="4"
                    value={endBar}
                    onInput={(e) => setEndBar(e.detail.value)}
                  />
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>练习时长（秒）</Text>
                <Input
                  className={styles.input}
                  type="number"
                  placeholder="90"
                  value={duration}
                  onInput={(e) => setDuration(e.detail.value)}
                />
              </View>

              <View className={styles.formActions}>
                <View className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>
                  <Text>取消</Text>
                </View>
                <View className={styles.confirmBtn} onClick={handleAddTask}>
                  <Text>添加</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className={styles.addBtn} onClick={() => setShowAddForm(true)}>
              <Text className={styles.addIcon}>+</Text>
              <Text>添加老师布置的谱子</Text>
            </View>
          )}
        </View>

        <View className={styles.footer}>
          <View className={styles.closeModalBtn} onClick={onClose}>
            <Text>关闭</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default TeacherTaskModal
