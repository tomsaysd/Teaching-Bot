import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        profession: data.profession,
        username: data.username,
        password: hashedPassword,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        profession: user.profession,
        username: user.username,
        createdAt: user.createdAt,
      },
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username or password');
    }

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        profession: user.profession,
        username: user.username,
        createdAt: user.createdAt,
      },
    };
  }
}