import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Length,
} from 'sequelize-typescript';
import { Menu } from './menu.model';
import { Perfil } from './perfil.model';
import { Aplicacion } from './aplicacion.model';

@Table({
  tableName: 'perfilmenu',
  schema: 'public',
  timestamps: false,
  underscored: false,
})
export class PerfilMenu extends Model<PerfilMenu> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'idperfilmenu',
  })
  idperfilmenu: string;

  @AllowNull(true)
  @ForeignKey(() => Menu)
  @Column({
    type: DataType.UUID,
    field: 'idmenu',
  })
  idmenu: string;

  @AllowNull(true)
  @ForeignKey(() => Perfil)
  @Column({
    type: DataType.UUID,
    field: 'idperfil',
  })
  idperfil: string;

  @AllowNull(true)
  @ForeignKey(() => Aplicacion)
  @Column({
    type: DataType.UUID,
    field: 'idaplicacion',
  })
  idaplicacion: string;

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
  @BelongsTo(() => Menu, {
    foreignKey: 'idmenu',
    as: 'menu',
  })
  menu: Menu;

  @BelongsTo(() => Perfil, {
    foreignKey: 'idperfil',
    as: 'perfil',
  })
  perfil: Perfil;

  @BelongsTo(() => Aplicacion, {
    foreignKey: 'idaplicacion',
    as: 'aplicacion',
  })
  aplicacion: Aplicacion;

  // Métodos estáticos
  static async findByPerfil(idperfil: string): Promise<PerfilMenu[]> {
    return this.findAll({
      where: { 
        idperfil, 
        estado: true 
      },
      include: [
        {
          model: Menu,
          as: 'menu',
          where: { estado: true },
          required: true,
        },
      ],
      order: [[{ model: Menu, as: 'menu' }, 'descripcion', 'ASC']],
    });
  }

  static async findByApplication(idaplicacion: string): Promise<PerfilMenu[]> {
    return this.findAll({
      where: { 
        idaplicacion, 
        estado: true 
      },
      include: [
        {
          model: Menu,
          as: 'menu',
          where: { estado: true },
          required: true,
        },
        {
          model: Perfil,
          as: 'perfil',
          where: { estado: true },
          required: true,
        },
      ],
    });
  }
}