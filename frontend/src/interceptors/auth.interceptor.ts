import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authState = this.authService.getAuthState()();
    
    if (authState.token && authState.isAuthenticated) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authState.token}`)
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}