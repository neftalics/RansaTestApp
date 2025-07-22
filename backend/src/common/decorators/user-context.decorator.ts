import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from '../../database/sequelize.config';

/**
 * Decorator para extraer el contexto de usuario del request
 * Combina información del JWT con el token para RLS
 */
export const GetUserContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Del JwtAuthGuard
    const token = extractTokenFromHeader(request);

    if (!user || !token) {
      throw new Error('Contexto de usuario no disponible');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      token: token,
    };
  },
);

function extractTokenFromHeader(request: any): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}