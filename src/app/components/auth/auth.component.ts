import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError: string | null = null;
  registerError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });

    this.registerForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  // ログインメソッド
  async login() {
    this.loginError = null;
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      this.router.navigate(['/calculator']); // ログイン成功時にCalculatorComponentへリダイレクト
    } catch (error) {
      this.loginError = error.message; // エラーメッセージを設定
      console.error('ログインエラー:', error);
    }
  }

  // 登録メソッド
  async register() {
    this.registerError = null;
    const { email, password } = this.registerForm.value;
    try {
      await this.authService.register(email, password);
      this.router.navigate(['/calculator']); // 登録成功時にCalculatorComponentへリダイレクト
    } catch (error) {
      this.registerError = error.message; // エラーメッセージを設定
      console.error('登録エラー:', error);
    }
  }
}
