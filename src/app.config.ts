export default defineAppConfig({
  pages: [
    'pages/collect/index',
    'pages/library/index',
    'pages/collage/index',
    'pages/search/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#6366F1',
    navigationBarTitleText: '灵感口袋',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/collect/index',
        text: '收集'
      },
      {
        pagePath: 'pages/library/index',
        text: '灵感库'
      },
      {
        pagePath: 'pages/collage/index',
        text: '拼贴板'
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
