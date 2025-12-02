import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  // 创建模板
  async create(userId: number, dto: CreateTemplateDto): Promise<Template> {
    const template = this.templateRepository.create({
      ...dto,
      userId,
    });
    return this.templateRepository.save(template);
  }

  // 获取用户的模板列表
  async findByUser(userId: number, type?: string): Promise<Template[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.userId = :userId', { userId });

    if (type) {
      query.andWhere('template.type = :type', { type });
    }

    return query.orderBy('template.updatedAt', 'DESC').getMany();
  }

  // 获取公开模板
  async findPublic(type?: string): Promise<Template[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.isPublic = :isPublic', { isPublic: true });

    if (type) {
      query.andWhere('template.type = :type', { type });
    }

    return query.orderBy('template.useCount', 'DESC').getMany();
  }

  // 获取单个模板
  async findOne(id: number, userId: number): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    // 检查权限：必须是自己的模板或公开模板
    if (template.userId !== userId && !template.isPublic) {
      throw new NotFoundException('无权访问此模板');
    }

    return template;
  }

  // 更新模板
  async update(
    id: number,
    userId: number,
    dto: UpdateTemplateDto,
  ): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id, userId },
    });

    if (!template) {
      throw new NotFoundException('模板不存在或无权修改');
    }

    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  // 删除模板
  async remove(id: number, userId: number): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id, userId },
    });

    if (!template) {
      throw new NotFoundException('模板不存在或无权删除');
    }

    await this.templateRepository.remove(template);
  }

  // 使用模板（增加使用次数）
  async use(id: number, userId: number): Promise<Template> {
    const template = await this.findOne(id, userId);
    template.useCount += 1;
    return this.templateRepository.save(template);
  }
}
