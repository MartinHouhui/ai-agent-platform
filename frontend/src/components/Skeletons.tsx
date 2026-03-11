import { Skeleton } from 'antd'

// 页面加载骨架屏
export const PageSkeleton = () => (
  <div style={{ padding: '24px' }}>
    <div style={{ marginBottom: '24px' }}>
      <Skeleton active paragraph={{ rows: 1 }} />
    </div>
    <div style={{ marginBottom: '16px' }}>
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
    <div style={{ marginBottom: '16px' }}>
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  </div>
)

// 表格加载骨架屏
export const TableSkeleton = () => (
  <div style={{ padding: '24px' }}>
    <div style={{ marginBottom: '16px' }}>
      <Skeleton.Input active style={{ width: '200px' }} />
    </div>
    <Skeleton active paragraph={{ rows: 6 }} />
  </div>
)

// 卡片加载骨架屏
export const CardSkeleton = () => (
  <div style={{ padding: '16px' }}>
    <Skeleton avatar active paragraph={{ rows: 3 }} />
  </div>
)

// 对话消息骨架屏
export const MessageSkeleton = () => (
  <div style={{ padding: '16px' }}>
    <Skeleton avatar active paragraph={{ rows: 2 }} />
  </div>
)
