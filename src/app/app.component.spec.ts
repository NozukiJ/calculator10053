
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
// AppComponentをインポートしています。
import { AppComponent } from './app.component';

// describe()関数を使用して、テストスイートを定義しています。
// ここではAppComponentに関するテストを行うためのスイートを定義しています。
describe('AppComponent', () => {
// beforeEach()関数を使用して、各テストケースの事前準備を行っています。
// TestBed.configureTestingModule()メソッドを使用して、テスト用のAngularモジュールを構成しています。
  beforeEach(() => TestBed.configureTestingModule({
    // RouterTestingModuleをインポートし、AppComponentを宣言しています。
    imports: [RouterTestingModule],
    declarations: [AppComponent]
  }));

// it()関数を使用して、個々のテストケースを定義しています。
// ここでは、アプリケーションが正しく作成されるかどうかをテストしています。
// TestBed.createComponent()メソッドを使用して、
// AppComponentのインスタンスを作成し、それをfixtureとして取得しています。
// fixture.componentInstanceを使用して、AppComponentのインスタンスであるappを取得し、それが真であることを期待しています。
// このテストは、Angularのテストユーティリティを使用して、AppComponentが正しく作成されるかどうかを確認するものです。
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have as title 'calculator'`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   expect(app.title).toEqual('calculator');
  // });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('calculator app is running!');
  });
});






