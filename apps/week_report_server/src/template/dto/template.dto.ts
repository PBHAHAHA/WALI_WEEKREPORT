import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsIn(['daily', 'weekly', 'custom'])
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'custom'])
  type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
