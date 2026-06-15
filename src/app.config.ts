export default defineAppConfig({
  pages: [
    'pages/task/index',
    'pages/reward/index',
    'pages/parent/index',
    'pages/practice/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF9A3C',
    navigationBarTitleText: '琴童陪练',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF7E6'
  },
  tabBar: {
    color: '#B2BEC3',
    selectedColor: '#FF9A3C',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/task/index',
        text: '今日任务'
      },
      {
        pagePath: 'pages/reward/index',
        text: '奖励'
      },
      {
        pagePath: 'pages/parent/index',
        text: '家长'
      }
    ]
  }
})
