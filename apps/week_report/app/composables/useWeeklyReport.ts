interface WeeklyReport {
  id: number
  title: string
  content: string
  summary: string
  year: number
  weekNumber: number
  startDate: string
  endDate: string
  userId: number
  createdAt: string
  updatedAt: string
}

interface CreateWeeklyReportData {
  title: string
  content: string
  summary?: string
  year: number
  weekNumber: number
  startDate: string
  endDate: string
}

export const useWeeklyReport = () => {
  const api = useApi()

  // 创建周报
  const create = async (data: CreateWeeklyReportData) => {
    return api.post<WeeklyReport>('/weekly-reports', data)
  }

  // 获取周报列表
  const getAll = async (page = 1, limit = 10) => {
    return api.get<{ data: WeeklyReport[]; total: number }>(`/weekly-reports?page=${page}&limit=${limit}`)
  }

  // 获取最近的周报
  const getRecent = async (limit = 4) => {
    return api.get<WeeklyReport[]>(`/weekly-reports/recent?limit=${limit}`)
  }

  // 获取单个周报
  const getOne = async (id: number) => {
    return api.get<WeeklyReport>(`/weekly-reports/${id}`)
  }

  // 更新周报
  const update = async (id: number, data: Partial<CreateWeeklyReportData>) => {
    return api.put<WeeklyReport>(`/weekly-reports/${id}`, data)
  }

  // 删除周报
  const remove = async (id: number) => {
    return api.del(`/weekly-reports/${id}`)
  }

  // 使用模板生成周报
  const generateWithTemplate = async (data: {
    templateId?: number
    dailyLogs: Array<{ date: string; content: string }>
    year: number
    weekNumber: number
    startDate?: string
    endDate?: string
  }) => {
    return api.post<WeeklyReport>('/weekly-reports/generate-with-template', data)
  }

  return {
    create,
    getAll,
    getRecent,
    getOne,
    update,
    remove,
    generateWithTemplate,
  }
}
