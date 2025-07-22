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
import { Perfil } from './perfil.model';

@Table({
  tableName: 'usuario_perfil',
  schema: 'public',
  timestamps: false,
  underscored: false,
})
export class UsuarioPerfil extends Model<UsuarioPerfil> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'id',
  })
  //  id: string;
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  user_id: string;

  @AllowNull(true)
  @ForeignKey(() => Perfil)
  @Column({
    type: DataType.UUID,
    field: 'idperfil',
  })
  idperfil: string;

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

  // Relaciones
  @BelongsTo(() => Perfil, {
    foreignKey: 'idperfil',
    as: 'perfil',
  })
  perfil: Perfil;

  // Métodos estáticos
  static async findByUser(user_id: string): Promise<UsuarioPerfil[]> {
    return this.findAll({
      where: { user_id },
      include: [
        {
          model: Perfil,
          as: 'perfil',
          where: { estado: true },
          required: true,
          include: [
            {
              model: require('./aplicacion.model').Aplicacion,
              as: 'aplicacion',
              where: { estado: true },
              required: true,
            },
          ],
        },
      ],
    });
  }

  static async findByUserAndApplication(
    user_id: string,
    idaplicacion: string,
  ): Promise<UsuarioPerfil[]> {
    return this.findAll({
      where: { user_id },
      include: [
        {
          model: Perfil,
          as: 'perfil',
          where: {
            estado: true,
            idaplicacion,
          },
          required: true,
        },
      ],
    });
  }
}
