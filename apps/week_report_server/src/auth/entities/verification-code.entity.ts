import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum VerificationCodeType {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
}

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ length: 6 })
  code: string;

  @Column({
    type: 'enum',
    enum: VerificationCodeType,
    default: VerificationCodeType.REGISTER,
  })
  type: VerificationCodeType;

  @Column({ default: false })
  isUsed: boolean;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
