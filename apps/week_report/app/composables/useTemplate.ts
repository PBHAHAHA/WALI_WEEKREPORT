interface Template {
  id: number
  title: string
  content: string
  type: 'daily' | 'weekly' | 'custom'
  description: string
  isPublic: boolean
  useCount: number
  userId: number
  createdAt: string
  updatedAt: string
}

interface CreateTemplateData {
  title: string
  content: string
  type: 'daily' | 'weekly' | 'custom'
  description?: string
  isPublic?: boolean
}

export const useTemplate = () => {
  const api = useApi()

  // 创建模板
  const create = async (data: CreateTemplateData) => {
    return api.post<Template>('/templates', data)
  }

  // 获取我的模板
  const getMy = async (type?: string) => {
    const query = type ? `?type=${type}` : ''
    return api.get<Template[]>(`/templates/my${query}`)
  }

  // 获取公开模板
  const getPublic = async (type?: string) => {
    const query = type ? `?type=${type}` : ''
    return api.get<Template[]>(`/templates/public${query}`)
  }

  // 获取单个模板
  const getOne = async (id: number) => {
    return api.get<Template>(`/templates/${id}`)
  }

  // 更新模板
  const update = async (id: number, data: Partial<CreateTemplateData>) => {
    return api.put<Template>(`/templates/${id}`, data)
  }

  // 删除模板
  const remove = async (id: number) => {
    return api.del(`/templates/${id}`)
  }

  // 使用模板
  const use = async (id: number) => {
    return api.post<Template>(`/templates/${id}/use`, {})
  }

  return {
    create,
    getMy,
    getPublic,
    getOne,
    update,
    remove,
    use,
  }
}
