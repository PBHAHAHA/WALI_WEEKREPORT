interface DailyLog {
  id: number
  date: string
  content: string
  userId: number
  createdAt: string
  updatedAt: string
}

export const useDailyLog = () => {
  const api = useApi()

  // 创建或更新日报
  const createOrUpdate = async (date: string, content: string) => {
    return api.post<DailyLog>('/daily-logs', { date, content })
  }

  // 获取本周日报
  const getCurrentWeek = async () => {
    return api.get<DailyLog[]>('/daily-logs/current-week')
  }

  // 获取指定日期的日报
  const getByDate = async (date: string) => {
    return api.get<DailyLog | null>(`/daily-logs/by-date?date=${date}`)
  }

  // 获取日期范围内的日报
  const getByRange = async (startDate: string, endDate: string) => {
    return api.get<DailyLog[]>(`/daily-logs/range?startDate=${startDate}&endDate=${endDate}`)
  }

  // 删除日报
  const remove = async (id: number) => {
    return api.del(`/daily-logs/${id}`)
  }

  return {
    createOrUpdate,
    getCurrentWeek,
    getByDate,
    getByRange,
    remove,
  }
}
