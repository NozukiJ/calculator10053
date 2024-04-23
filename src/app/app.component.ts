import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']

})

export class AppComponent {

  ngOnInit() {
    const calculator = {
      displayValue: '0',
      firstOperand: null,
      waitingForSecondOperand: false,
      operator: null
    };

    function updateDisplay() {
      //querySelector　指定された要素の中で指定されたセレクター群に一致する最初の要素を返す
      const display: any = document.querySelector('.screen-cal');
      display.value = calculator.displayValue;
    }

    function resetCalculator() {
      calculator.displayValue = '0';
      calculator.firstOperand = null;
      calculator.waitingForSecondOperand = false;
      calculator.operator = null;
    }

    updateDisplay();

    const keys: any = document.querySelector('.btn-cal');

    keys.addEventListener('click', event => {
      const target = event.target;
      if (!target.matches('button')) {
        return;
      }

      if (target.classList.contains('operator')) {
        handleOperator(target.value);
        updateDisplay();
        return;
      }

      if (target.classList.contains('decimal')) {
        inputDecimal(target.value);
        updateDisplay();
        return;
      }

      if (target.classList.contains('clear')) {
        resetCalculator();
        updateDisplay();
      }

      inputDigit(target.value);
      updateDisplay();
      return;
    });

    function inputDigit(digit) {
      const { displayValue, waitingForSecondOperand } = calculator;

      if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
      } else {
        calculator.displayValue =
          displayValue === '0' ? digit : displayValue + digit;
      }
    }

    function inputDecimal(dot) {
      if (calculator.waitingForSecondOperand === true) {
        return;
      }
      if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
      }
    }

    //Infinity問題の解決方法は？ここ？？
    const performCalculation = {
      '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
      '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
      '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
      '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
      '=': (firstOperand, secondOperand) => secondOperand
    };

    //引数がnextOperatorだから、たぶんここ！
    // →違った。引数を当てにするよりもおそらく選択処理の方が目印になる
    function handleOperator(nextOperator) {
      const { firstOperand, displayValue, operator } = calculator;
      const inputValue = parseFloat(displayValue);

      //もし演算子と第二被演算数待ちの場合は次のオペレーターへ
      if (operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
      }
      //もし第一被演算数の値がない場合はインプットバリューを代入。ここじゃない
      if (firstOperand === null) {
        calculator.firstOperand = inputValue;
      }

      else if (operator)  {
        const currentValue = firstOperand || 0;
        const result = performCalculation[operator](currentValue, inputValue);
        if (isNaN(result)) {
          calculator.displayValue = '0で割れません';
        } else if (result === Infinity) {
          calculator.displayValue = '0で割れません';
        } else {
          const lastValue = Number(result.toFixed(10));
          calculator.displayValue = String(lastValue);
          calculator.firstOperand = result;
        }
      }
      calculator.waitingForSecondOperand = true;
      calculator.operator = nextOperator;
    }
  }
}
