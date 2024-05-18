import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  async login(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('メールアドレスが登録されていません');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('メールアドレスとパスワードが一致しません');
      } else {
        console.error('ログインエラー:', error);
        throw new Error('ログインに失敗しました');
      }
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await this.firestore.collection('users').doc(credential.user.uid).set({
        email: email,
        // 他のユーザー情報を追加可能
      });
    } catch (error) {
      console.error('登録エラー:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/auth']);  // ログアウト後に認証画面にリダイレクト
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  getUser() {
    return this.afAuth.authState;
  }

  async saveCalculation(calculatorData: any): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    try {
      await this.firestore.collection('calculations').doc(user.uid).set(calculatorData, { merge: true });
    } catch (error) {
      console.error('計算データの保存エラー:', error);
      throw error;
    }
  }

  getCalculation(): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('calculations').doc(user.uid).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }
}
