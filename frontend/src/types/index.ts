export interface Message {
  id: number | string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: Date
}

export interface Page {
  key: string
  icon: React.ReactNode
  label: string
}
