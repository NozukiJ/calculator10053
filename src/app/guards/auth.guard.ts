import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const afAuth = inject(AngularFireAuth);
  const router = inject(Router);
  
  return afAuth.authState.pipe(
    take(1), // 最初の状態のみを取得
    map(user => !!user), // ユーザーが存在するかどうかを確認
    tap(loggedIn => {
      if (!loggedIn) {
        router.navigate(['/auth']); // 未ログインならログインページへリダイレクト
      }
    })
  );
};
