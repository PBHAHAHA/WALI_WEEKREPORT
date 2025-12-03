import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  /**
   * 创建模板
   * POST /api/templates
   */
  @Post()
  create(@Request() req, @Body() dto: CreateTemplateDto) {
    return this.templateService.create(req.user.userId, dto);
  }

  /**
   * 获取我的模板列表
   * GET /api/templates/my?type=daily
   */
  @Get('my')
  findMy(@Request() req, @Query('type') type?: string) {
    return this.templateService.findByUser(req.user.userId, type);
  }

  /**
   * 获取公开模板列表
   * GET /api/templates/public?type=daily
   */
  @Get('public')
  findPublic(@Query('type') type?: string) {
    return this.templateService.findPublic(type);
  }

  /**
   * 获取单个模板
   * GET /api/templates/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.templateService.findOne(+id, req.user.userId);
  }

  /**
   * 更新模板
   * PUT /api/templates/:id
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templateService.update(+id, req.user.userId, dto);
  }

  /**
   * 删除模板
   * DELETE /api/templates/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.templateService.remove(+id, req.user.userId);
  }

  /**
   * 使用模板
   * POST /api/templates/:id/use
   */
  @Post(':id/use')
  use(@Param('id') id: string, @Request() req) {
    return this.templateService.use(+id, req.user.userId);
  }
}
