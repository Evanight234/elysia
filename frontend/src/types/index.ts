// Tipe data User
export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface Chapter {
  id: string
  bookId: string
  title: string
  content: string
  order: number
}

// Tipe data Book
export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  cover: string | null
  category: string
  fileUrl: string | null
  viewCount: number
  likeCount: number
  chapters: Chapter[]
  createdAt: string
}

// Tipe data Library (buku yang disimpan user)
export interface LibraryItem {
  id: string
  status: 'SAVED' | 'FAVORITE' | 'READING'
  lastChapterId: string | null
  addedAt: string
  book: Book
}

// Tipe data Notification
export interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface ReadingProgress {
  bookId: string
  lastChapterId: string | null
  completedChapters: string[]
}

// Tipe response standar dari backend
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}