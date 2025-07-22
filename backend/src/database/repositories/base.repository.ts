import { Injectable, Logger } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { SequelizeConfigService, UserContext } from '../sequelize.config';

@Injectable()
export abstract class BaseRepository<T extends Model> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly model: ModelCtor<T>,
    protected readonly sequelizeConfig: SequelizeConfigService,
  ) {}

  /**
   * Ejecuta una operación con contexto de usuario para RLS
   */
  protected async withUserContext<R>(
    context: UserContext,
    operation: () => Promise<R>,
  ): Promise<R> {
    return this.sequelizeConfig.withUserContext(context, operation);
  }

  /**
   * Operaciones CRUD básicas con Sequelize
   */
  async findAll(context?: UserContext): Promise<T[]> {
    if (context) {
      return this.withUserContext(context, () => this.model.findAll());
    }
    return this.model.findAll();
  }

  async findById(id: string, context?: UserContext): Promise<T | null> {
    if (context) {
      return this.withUserContext(context, () => this.model.findByPk(id));
    }
    return this.model.findByPk(id);
  }

  async create(data: Partial<T>, context?: UserContext): Promise<T> {
    if (context) {
      return this.withUserContext(context, () =>
        this.model.create(data as any),
      );
    }
    return this.model.create(data as any);
  }

  async update(
    id: string,
    data: Partial<T>,
    context?: UserContext,
  ): Promise<[number, T[]]> {
    if (context) {
      return this.withUserContext(context, () =>
        this.model.update(data as any, {
          where: { [this.model.primaryKeyAttribute]: id } as any,
          returning: true,
        }),
      );
    }
    return this.model.update(data as any, {
      where: { [this.model.primaryKeyAttribute]: id } as any,
      returning: true,
    });
  }

  async delete(id: string, context?: UserContext): Promise<number> {
    if (context) {
      return this.withUserContext(context, () =>
        this.model.destroy({
          where: { [this.model.primaryKeyAttribute]: id } as any,
        }),
      );
    }
    return this.model.destroy({
      where: { [this.model.primaryKeyAttribute]: id } as any,
    });
  }

  /**
   * Ejecuta una consulta SQL cruda con contexto de usuario
   */
  protected async executeRawQuery<R>(
    query: string,
    replacements: any = {},
    context?: UserContext,
  ): Promise<R> {
    const sequelize = this.sequelizeConfig.getSequelize();

    if (context) {
      return this.withUserContext(context, async () => {
        const results = await sequelize.query(query, {
          replacements,
          type: QueryTypes.SELECT,
        });
        return results as R;
      });
    }

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
    
    return results as R;
  }
}
