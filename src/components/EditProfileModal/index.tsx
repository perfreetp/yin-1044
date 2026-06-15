import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { textbookOptions } from '@/data/mockData'
import type { ChildInfo } from '@/types'
import styles from './index.module.scss'

interface EditProfileModalProps {
  visible: boolean
  title: string
  editType: 'childInfo' | 'textbook'
  initialData?: Partial<ChildInfo>
  onClose: () => void
  onSave: (data: Partial<ChildInfo>) => void
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  title,
  editType,
  initialData,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('7')
  const [studyYears, setStudyYears] = useState('1')
  const [currentBook, setCurrentBook] = useState('小汤第二册')
  const [bookIndex, setBookIndex] = useState(1)

  useEffect(() => {
    if (initialData && visible) {
      if (initialData.name) setName(initialData.name)
      if (initialData.age !== undefined) setAge(initialData.age.toString())
      if (initialData.studyYears !== undefined) setStudyYears(initialData.studyYears.toString())
      if (initialData.currentBook) {
        setCurrentBook(initialData.currentBook)
        const idx = textbookOptions.findIndex(b => b === initialData.currentBook)
        if (idx >= 0) setBookIndex(idx)
      }
    }
  }, [initialData, visible])

  const handleSave = () => {
    const data: Partial<ChildInfo> = {}

    if (editType === 'childInfo') {
      if (!name.trim()) {
        Taro.showToast({ title: '请输入孩子姓名', icon: 'none' })
        return
      }
      const ageNum = parseInt(age)
      if (isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
        Taro.showToast({ title: '年龄请在3-18岁之间', icon: 'none' })
        return
      }
      const yearsNum = parseInt(studyYears)
      if (isNaN(yearsNum) || yearsNum < 0 || yearsNum > 15) {
        Taro.showToast({ title: '学琴年限请在0-15年之间', icon: 'none' })
        return
      }
      data.name = name.trim()
      data.age = ageNum
      data.studyYears = yearsNum
    }

    if (editType === 'textbook') {
      data.currentBook = textbookOptions[bookIndex]
    }

    console.log('[EditModal] Saving:', data)
    onSave(data)
    onClose()
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  const handleBookChange = (e: any) => {
    const idx = parseInt(e.detail.value)
    setBookIndex(idx)
    setCurrentBook(textbookOptions[idx])
  }

  const handleAgeChange = (delta: number) => {
    const current = parseInt(age) || 7
    const newAge = Math.max(3, Math.min(18, current + delta))
    setAge(newAge.toString())
  }

  const handleYearsChange = (delta: number) => {
    const current = parseInt(studyYears) || 1
    const newYears = Math.max(0, Math.min(15, current + delta))
    setStudyYears(newYears.toString())
  }

  if (!visible) return null

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>{title}</Text>
          <View className={styles.closeBtn} onClick={onClose}>
            <Text>✕</Text>
          </View>
        </View>

        <View className={styles.content}>
          {editType === 'childInfo' && (
            <>
              <View className={styles.formItem}>
                <Text className={styles.label}>孩子姓名</Text>
                <Input
                  className={styles.input}
                  placeholder="请输入孩子姓名"
                  value={name}
                  onInput={(e) => setName(e.detail.value)}
                  maxlength={10}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>年龄</Text>
                <View className={styles.numberPicker}>
                  <View
                    className={styles.numberBtn}
                    onClick={() => handleAgeChange(-1)}
                  >
                    <Text>−</Text>
                  </View>
                  <Text className={styles.numberValue}>{age} 岁</Text>
                  <View
                    className={styles.numberBtn}
                    onClick={() => handleAgeChange(1)}
                  >
                    <Text>+</Text>
                  </View>
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>学琴年限</Text>
                <View className={styles.numberPicker}>
                  <View
                    className={styles.numberBtn}
                    onClick={() => handleYearsChange(-1)}
                  >
                    <Text>−</Text>
                  </View>
                  <Text className={styles.numberValue}>{studyYears} 年</Text>
                  <View
                    className={styles.numberBtn}
                    onClick={() => handleYearsChange(1)}
                  >
                    <Text>+</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {editType === 'textbook' && (
            <View className={styles.formItem}>
              <Text className={styles.label}>当前教材</Text>
              <Picker
                mode="selector"
                range={textbookOptions}
                value={bookIndex}
                onChange={handleBookChange}
              >
                <View className={styles.picker}>
                  <Text className={styles.pickerText}>{currentBook}</Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>
          )}
        </View>

        <View className={styles.footer}>
          <View className={styles.cancelBtn} onClick={onClose}>
            <Text>取消</Text>
          </View>
          <View className={styles.confirmBtn} onClick={handleSave}>
            <Text>保存</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default EditProfileModal
