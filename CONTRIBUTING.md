# 贡献指南

感谢你考虑为 Week Report System 做出贡献！

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们作为贡献者和维护者承诺：无论年龄、体型、残疾、种族、性别认同和表达、经验水平、国籍、个人外貌、种族、宗教或性认同和取向如何，参与我们的项目和社区的每个人都不会受到骚扰。

### 我们的标准

有助于创造积极环境的行为示例包括：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同情

## 如何贡献

### 报告 Bug

在提交 bug 报告之前，请先检查 [Issues](https://github.com/yourusername/week-report/issues) 页面，确保该问题尚未被报告。

创建 bug 报告时，请包含以下信息：

- **清晰的标题和描述**
- **重现步骤**：详细说明如何重现问题
- **预期行为**：描述你期望发生什么
- **实际行为**：描述实际发生了什么
- **截图**：如果适用，添加截图来帮助解释问题
- **环境信息**：
  - OS: [例如 Windows 11, macOS 14]
  - Node.js 版本
  - pnpm 版本
  - 浏览器 [例如 Chrome 120, Safari 17]

### 提出功能建议

功能建议也通过 [Issues](https://github.com/yourusername/week-report/issues) 提交。请提供：

- **清晰的标题和描述**
- **详细的用例**：解释为什么这个功能对用户有用
- **可能的实现方式**：如果你有想法，请分享
- **替代方案**：描述你考虑过的替代解决方案

### Pull Request 流程

1. **Fork 仓库**并从 `main` 创建你的分支

   ```bash
   git checkout -b feature/AmazingFeature
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **进行修改**并确保代码符合项目规范

   - 遵循现有的代码风格
   - 添加必要的注释
   - 更新相关文档

4. **测试你的修改**

   ```bash
   # 前端测试
   cd apps/week_report
   pnpm dev

   # 后端测试
   cd apps/week_report_server
   pnpm test
   ```

5. **提交修改**

   ```bash
   git add .
   git commit -m 'feat: Add some AmazingFeature'
   ```

   提交信息格式请参考 [Conventional Commits](https://www.conventionalcommits.org/)：

   - `feat`: 新功能
   - `fix`: Bug 修复
   - `docs`: 文档更新
   - `style`: 代码格式（不影响代码运行的变动）
   - `refactor`: 重构（既不是新增功能，也不是修复 bug）
   - `perf`: 性能优化
   - `test`: 增加测试
   - `chore`: 构建过程或辅助工具的变动

6. **推送到你的 Fork**

   ```bash
   git push origin feature/AmazingFeature
   ```

7. **创建 Pull Request**

   - 提供清晰的 PR 标题和描述
   - 关联相关的 Issue（如果有）
   - 添加截图或 GIF（如果适用）
   - 确保所有 CI 检查通过

## 开发指南

### 项目结构

```
apps/
├── week_report/              # 前端
│   ├── app/
│   │   ├── components/       # 可复用组件
│   │   ├── composables/      # Vue 组合式函数
│   │   ├── layouts/          # 布局组件
│   │   ├── middleware/       # 路由中间件
│   │   ├── pages/            # 页面路由
│   │   └── utils/            # 工具函数
│   └── public/               # 静态资源
└── week_report_server/       # 后端
    └── src/
        ├── auth/             # 认证模块
        ├── daily-logs/       # 日报模块
        ├── weekly-reports/   # 周报模块
        ├── templates/        # 模板模块
        └── users/            # 用户模块
```

### 代码规范

#### 前端（Vue/Nuxt）

- 使用 Composition API
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- 使用 TypeScript 类型注解
- 遵循 Vue 3 风格指南

示例：

```vue
<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()
</script>
```

#### 后端（NestJS）

- 使用依赖注入
- 遵循 SOLID 原则
- 使用 DTO 进行数据验证
- 使用装饰器进行路由和验证
- 编写单元测试

示例：

```typescript
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.reportsService.findAll(req.user.id);
  }
}
```

### 样式规范

- 使用 TailwindCSS 工具类
- 避免自定义 CSS（除非必要）
- 使用设计系统中定义的颜色和间距
- 确保响应式设计

### Git 工作流

1. 始终从最新的 `main` 分支创建新分支
2. 保持提交历史清晰
3. 一个 PR 只做一件事
4. 及时同步上游更改

### 测试

- 为新功能编写测试
- 确保现有测试通过
- 测试覆盖率应保持在 80% 以上

## 社区

- 加入我们的 [Discord](https://discord.gg/your-invite) 讨论
- 关注我们的 [Twitter](https://twitter.com/your-handle)
- 阅读我们的 [博客](https://blog.your-domain.com)

## 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下授权。

## 问题？

如果你有任何问题，请随时：

- 在 [Discussions](https://github.com/yourusername/week-report/discussions) 中提问
- 发送邮件到 support@your-domain.com
- 在 Discord 中联系我们

---

再次感谢你的贡献！🎉
