// src/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { AuthState, User } from '../types/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';

  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  private authState = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  /** Gets el usuario actual */
  get currentUser()    { return this.authState().user; }
  /** Indica si hay sesión activa */
  get isAuthenticated(){ return this.authState().isAuthenticated; }
  /** Indica si está cargando */
  get isLoading()      { return this.authState().isLoading; }
  /** Indica si el usuario es admin */
  get isAdmin()        { return this.currentUser?.role === 'admin'; }

  constructor(private router: Router) {
    this.initializeAuth();
    this.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        if (session?.user && session.access_token) {
          this.handleSession(session);
        } else {
          this.clearAuthData();
        }
      }
    );
  }

  /** Inicializa el estado leyendo Supabase */
  private async initializeAuth(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    data.session ? this.handleSession(data.session) : this.clearAuthData();
  }

  /** Mapea session de Supabase a AuthState */
  private handleSession(session: Session): void {
    const supaUser = session.user;
    const user: User = {
      id:    supaUser.id,
      email: supaUser.email!,
      // TS4111: acceder con corchetes porque es índice dinámico
      role:  (supaUser.user_metadata as Record<string, any>)['role'] || 'user'
    };
    this.setAuthData(user, session.access_token);
  }

  /** Hace login y actualiza el estado */
  async login(email: string, password: string): Promise<{ error: Error | null }> {
    this.authState.update(s => ({ ...s, isLoading: true }));
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      this.clearAuthData();
      return { error };
    }
    this.handleSession(data.session);
    return { error: null };
  }

  /** Cierra sesión en Supabase y limpia estado */
  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /** Guarda token y user en localStorage y señal */
  private setAuthData(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authState.set({ user, token, isAuthenticated: true, isLoading: false });
  }

  /** Limpia storage y señal */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authState.set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }

  /** Exponer señal de estado */
  getAuthState() { return this.authState; }

  /** Recuperar token para interceptores */
  getToken(): string | null { return this.authState().token; }
}
