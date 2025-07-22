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
import { UsuarioPerfil } from './usuario-perfil.model';

@Table({
  tableName: 'perfil',
  schema: 'public',
  timestamps: false,
  underscored: false,
})
export class Perfil extends Model<Perfil> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
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

  @AllowNull(true)
  @Length({ max: 255 })
  @Column({
    type: DataType.STRING,
    field: 'descripcion',
  })
  descripcion: string;

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

  @HasMany(() => PerfilMenu, {
    foreignKey: 'idperfil',
    as: 'perfilMenus',
  })
  perfilMenus: PerfilMenu[];

  @HasMany(() => UsuarioPerfil, {
    foreignKey: 'idperfil',
    as: 'usuarioPerfiles',
  })
  usuarioPerfiles: UsuarioPerfil[];

  // Métodos estáticos
  static async findByApplication(idaplicacion: string): Promise<Perfil[]> {
    return this.findAll({
      where: { 
        idaplicacion, 
        estado: true 
      },
      include: [
        {
          model: Aplicacion,
          as: 'aplicacion',
          attributes: ['idaplicacion', 'descripcion'],
        },
      ],
      order: [['descripcion', 'ASC']],
    });
  }

  static async findWithMenus(idperfil: string): Promise<Perfil | null> {
    return this.findOne({
      where: { idperfil, estado: true },
      include: [
        {
          model: PerfilMenu,
          as: 'perfilMenus',
          where: { estado: true },
          required: false,
        },
      ],
    });
  }
}