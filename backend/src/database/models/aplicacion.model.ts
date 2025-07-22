import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  Default,
} from 'sequelize-typescript';
import { Menu } from './menu.model';
import { Perfil } from './perfil.model';

@Table({
  tableName: 'aplicacion',
  schema: 'public',
  timestamps: false,
})
export class Aplicacion extends Model<Aplicacion> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: 'idaplicacion',
  })
  idaplicacion: string;

  @Column({
    type: DataType.STRING,
    field: 'descripcion',
  })
  descripcion: string;

  @Column({
    type: DataType.DATE,
    field: 'fechacreacion',
  })
  fechacreacion: Date;

  @Column({
    type: DataType.STRING,
    field: 'usuariocreacion',
  })
  usuariocreacion: string;

  @Column({
    type: DataType.DATE,
    field: 'fechaactualizacion',
  })
  fechaactualizacion: Date;

  @Column({
    type: DataType.STRING,
    field: 'usuarioactualizacion',
  })
  usuarioactualizacion: string;

  @Column({
    type: DataType.BOOLEAN,
    field: 'estado',
  })
  estado: boolean;

  // Métodos de instancia
  toJSON() {
    const values = { ...this.get() };
    return values;
  }

  // Métodos estáticos para operaciones complejas
  static async findActiveApplications(): Promise<Aplicacion[]> {
    return this.findAll({
      where: { estado: true },
      include: [
        {
          model: Perfil,
          as: 'perfiles',
          where: { estado: true },
          required: false,
        },
      ],
      order: [['descripcion', 'ASC']],
    });
  }

  static async findByIdWithDetails(id: string): Promise<Aplicacion | null> {
    return this.findOne({
      where: { idaplicacion: id, estado: true },
      include: [
        {
          model: Perfil,
          as: 'perfiles',
          where: { estado: true },
          required: false,
        },
        {
          model: Menu,
          as: 'menus',
          where: { estado: true },
          required: false,
        },
      ],
    });
  }
}