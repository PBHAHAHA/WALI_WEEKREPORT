import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, Subject } from 'rxjs';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('AI_API_URL') || 'https://api.zhizengzeng.com/v1';
    this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
    this.model = this.configService.get<string>('AI_MODEL') || 'gpt-3.5-turbo';
  }

  /**
   * 发送聊天请求
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API 请求失败: ${error}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * 流式聊天请求
   */
  chatStream(messages: ChatMessage[]): Observable<string> {
    const subject = new Subject<string>();

    (async () => {
      try {
        const response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: 0.7,
            stream: true,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          subject.error(new Error(`AI API 请求失败: ${error}`));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          subject.error(new Error('无法获取响应流'));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (!trimmed.startsWith('data: ')) continue;

            try {
              const json = JSON.parse(trimmed.slice(6)) as StreamChunk;
              const content = json.choices[0]?.delta?.content;
              if (content) {
                subject.next(content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }

        subject.complete();
      } catch (error) {
        subject.error(error);
      }
    })();

    return subject.asObservable();
  }

  /**
   * 简单问答（流式）
   */
  askStream(question: string, systemPrompt?: string): Observable<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      messages.push({ 
        role: 'system', 
        content: `你是一个专业的工作助手，可以帮助用户撰写日报、周报、回答工作相关问题。
请使用 Markdown 格式回复，支持：
- 标题使用 # ## ###
- 列表使用 - 或 1. 2. 3.
- 代码使用 \`code\` 或 \`\`\`
- 加粗使用 **text**
- 斜体使用 *text*

保持回复简洁、专业、有条理。` 
      });
    }
    
    messages.push({ role: 'user', content: question });
    
    return this.chatStream(messages);
  }

  /**
   * 简单问答（非流式，保留兼容）
   */
  async ask(question: string, systemPrompt?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: question });
    
    return this.chat(messages);
  }

  /**
   * 根据日报生成周报（流式）
   */
  generateWeeklyReportStream(dailyLogs: Array<{ date: string; content: string }>): Observable<string> {
    const systemPrompt = `你是一个专业的周报撰写助手。请根据用户提供的本周日报内容，生成一份结构清晰、内容完整的周报。

周报应包含以下部分：
## 本周工作总结
## 主要完成的工作
## 遇到的问题及解决方案
## 下周工作计划

请使用 Markdown 格式输出。`;

    const dailyContent = dailyLogs
      .map(log => `【${log.date}】\n${log.content}`)
      .join('\n\n');

    const userMessage = `以下是我本周的日报内容，请帮我生成周报：\n\n${dailyContent}`;

    return this.chatStream([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);
  }

  /**
   * 根据日报生成周报（非流式，保留兼容）
   */
  async generateWeeklyReport(dailyLogs: Array<{ date: string; content: string }>): Promise<string> {
    const systemPrompt = `你是一个专业的周报撰写助手。请根据用户提供的本周日报内容，生成一份结构清晰、内容完整的周报。
周报应包含以下部分：
1. 本周工作总结
2. 主要完成的工作
3. 遇到的问题及解决方案
4. 下周工作计划

请使用 Markdown 格式输出。`;

    const dailyContent = dailyLogs
      .map(log => `【${log.date}】\n${log.content}`)
      .join('\n\n');

    const userMessage = `以下是我本周的日报内容，请帮我生成周报：\n\n${dailyContent}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);
  }

  /**
   * 优化日报内容
   */
  async improveDailyLog(content: string): Promise<string> {
    const systemPrompt = `你是一个专业的日报优化助手。请帮助用户优化日报内容，使其更加清晰、专业。
保持原有信息不变，但可以：
1. 改善表达方式
2. 添加适当的结构
3. 突出重点内容

请使用 Markdown 格式输出。`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请优化以下日报内容：\n\n${content}` },
    ]);
  }
}
