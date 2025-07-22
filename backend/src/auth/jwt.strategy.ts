import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  aud: string;
  role?: string;
  exp: number;
  iat: number;
  user_metadata?: {
    role?: string;
  };
  raw_user_meta_data?: {
    role?: string;
    [key: string]: any;
  };
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token JWT inválido');
    }

    // Busca el rol en raw_user_meta_data y user_metadata, o usa 'user' por defecto
    const role =
      (payload.raw_user_meta_data && payload.raw_user_meta_data.role) ||
      (payload.user_metadata && payload.user_metadata.role) ||
      payload.role ||
      'user';

    return {
      id: payload.sub,
      email: payload.email,
      role,
    };
  }
}