import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '../../components/ui/modal.component';
import { AplicacionService } from '../../services/aplicacion.service';
import { AuthService } from '../../services/auth.service';
import { Aplicacion, CreateAplicacionDto, UpdateAplicacionDto } from '../../types/aplicacion.types';

@Component({
  selector: 'app-aplicaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ModalComponent
  ],
  templateUrl: './aplicaciones.component.html',
  styleUrls: ['./aplicaciones.component.css']
})
export class AplicacionesComponent implements OnInit {
  aplicaciones  = signal<Aplicacion[]>([]);
  isLoading     = signal(true);
  showModal     = signal(false);
  isSubmitting  = signal(false);
  editingApp    = signal<Aplicacion | null>(null);

  formData: CreateAplicacionDto = {
    nombre:      '',
    descripcion: '',
    activo:      true
  };
  modalTitle = signal('');

  constructor(
    private aplicacionService: AplicacionService,
    public  authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAplicaciones();
  }

  private loadAplicaciones(): void {
    this.isLoading.set(true);
    const obs = this.authService.isAdmin
      ? this.aplicacionService.getAll()
      : this.aplicacionService.getByUsuario();
    obs.subscribe({
      next: apps => { this.aplicaciones.set(apps); this.isLoading.set(false); },
      error: err => { console.error(err); this.isLoading.set(false); }
    });
  }

  openCreateModal(): void {
    this.editingApp.set(null);
    this.modalTitle.set('Nueva Aplicación');
    this.formData = { nombre:'', descripcion:'', activo:true };
    this.showModal.set(true);
  }

  openEditModal(app: Aplicacion): void {
    this.editingApp.set(app);
    this.modalTitle.set('Editar Aplicación');
    this.formData = { nombre:app.nombre, descripcion:app.descripcion||'', activo:app.activo };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isSubmitting.set(false);
  }

  onSubmit(): void {
    if (!this.formData.nombre.trim()) return;
    this.isSubmitting.set(true);

    const op = this.editingApp()
      ? this.aplicacionService.update(this.editingApp()!.id.toString(), this.formData as UpdateAplicacionDto)
      : this.aplicacionService.create(this.formData);
    op.subscribe({
      next: () => { this.closeModal(); this.loadAplicaciones(); },
      error: err => { console.error(err); this.isSubmitting.set(false); }
    });
  }

  deleteAplicacion(app: Aplicacion): void {
    if (!confirm(`Eliminar "${app.nombre}"?`)) return;
    this.aplicacionService.delete(app.id.toString()).subscribe({
      next: () => this.loadAplicaciones(),
      error: err => console.error(err)
    });
  }

  /** TRACKBY para *ngFor */
  trackById(index: number, app: Aplicacion): number {
    return app.id;
  }
}
