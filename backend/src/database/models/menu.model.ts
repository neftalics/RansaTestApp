import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
  Length,
} from 'sequelize-typescript';
import { Aplicacion } from './aplicacion.model';
import { PerfilMenu } from './perfil-menu.model';

@Table({
  tableName: 'menu',
  schema: 'public',
  timestamps: false,
  underscored: false,
})
export class Menu extends Model<Menu> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'idmenu',
  })
  idmenu: string;

  @AllowNull(true)
  @ForeignKey(() => Aplicacion)
  @Column({
    type: DataType.UUID,
    field: 'idaplicacion',
  })
  idaplicacion: string;

  @AllowNull(true)
  @Length({ max: 255 })
  @Column({
    type: DataType.STRING,
    field: 'descripcion',
  })
  descripcion: string;

  @AllowNull(true)
  @ForeignKey(() => Menu)
  @Column({
    type: DataType.UUID,
    field: 'menupadre',
  })
  menupadre: string;

  @AllowNull(true)
  @Length({ max: 255 })
  @Column({
    type: DataType.STRING,
    field: 'icono',
  })
  icono: string;

  @AllowNull(true)
  @Length({ max: 255 })
  @Column({
    type: DataType.STRING,
    field: 'path',
  })
  path: string;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'fechacreacion',
  })
  fechacreacion: Date;

  @AllowNull(false)
  @Length({ max: 100 })
  @Column({
    type: DataType.STRING(100),
    field: 'usuariocreacion',
  })
  usuariocreacion: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'fechaactualizacion',
  })
  fechaactualizacion: Date;

  @AllowNull(true)
  @Length({ max: 100 })
  @Column({
    type: DataType.STRING(100),
    field: 'usuarioactualizacion',
  })
  usuarioactualizacion: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'estado',
  })
  estado: boolean;

  // Relaciones
  @BelongsTo(() => Aplicacion, {
    foreignKey: 'idaplicacion',
    as: 'aplicacion',
  })
  aplicacion: Aplicacion;

  @BelongsTo(() => Menu, {
    foreignKey: 'menupadre',
    as: 'menuPadre',
  })
  menuPadre: Menu;

  @HasMany(() => Menu, {
    foreignKey: 'menupadre',
    as: 'subMenus',
  })
  subMenus: Menu[];

  @HasMany(() => PerfilMenu, {
    foreignKey: 'idmenu',
    as: 'perfilMenus',
  })
  perfilMenus: PerfilMenu[];

  // Métodos estáticos
  static async findByApplication(idaplicacion: string): Promise<Menu[]> {
    return this.findAll({
      where: { 
        idaplicacion, 
        estado: true 
      },
      include: [
        {
          model: Menu,
          as: 'menuPadre',
          attributes: ['idmenu', 'descripcion'],
          required: false,
        },
        {
          model: Menu,
          as: 'subMenus',
          where: { estado: true },
          required: false,
        },
      ],
      order: [['descripcion', 'ASC']],
    });
  }

  static async findRootMenus(idaplicacion: string): Promise<Menu[]> {
    return this.findAll({
      where: { 
        idaplicacion, 
        menupadre: null,
        estado: true 
      },
      include: [
        {
          model: Menu,
          as: 'subMenus',
          where: { estado: true },
          required: false,
          include: [
            {
              model: Menu,
              as: 'subMenus',
              where: { estado: true },
              required: false,
            },
          ],
        },
      ],
      order: [
        ['descripcion', 'ASC'],
        [{ model: Menu, as: 'subMenus' }, 'descripcion', 'ASC'],
      ],
    });
  }

  static async findMenuHierarchy(idaplicacion: string): Promise<Menu[]> {
    return this.findAll({
      where: { 
        idaplicacion,
        estado: true 
      },
      include: [
        {
          model: Menu,
          as: 'menuPadre',
          required: false,
        },
      ],
      order: [['descripcion', 'ASC']],
    });
  }
}