import { Component, AfterViewInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements AfterViewInit {
  calculator = {
    displayValue: '0',
    currentInput: '',
    history: [],
    favorites: [],
    newCalculation: false,
    lastOperator: '', // New flag to track the last pressed operator
    error: false // New flag to indicate if an error occurred
  };

  constructor(private authService: AuthService) {}

  ngAfterViewInit() {
    this.updateDisplay();

    const keyButtons = Array.from(document.querySelectorAll('.btn-cal button'));
    keyButtons.forEach(button => button.addEventListener('click', this.handleButtonClick.bind(this)));

    document.querySelector('.clear-history').addEventListener('click', this.clearHistory.bind(this));
    document.querySelector('.save-favorite').addEventListener('click', this.saveFavorite.bind(this));
    document.querySelector('.clear-favorites').addEventListener('click', this.clearFavorites.bind(this));
    document.querySelector('.export-history').addEventListener('click', this.exportHistoryToPDF.bind(this));

    this.authService.getCalculation().subscribe(calculatorData => {
      if (calculatorData) {
        this.calculator = calculatorData;
        this.updateDisplay();
      }
    });
  }

  handleButtonClick(event) {
    const target = event.target;
    if (this.calculator.error && !target.classList.contains('clear')) {
      this.displayErrorMessage();
      return;
    }

    if (this.calculator.error) {
      this.resetCalculator();
    }
    if (target.classList.contains('operator')) {
      this.handleOperator(target.value);
    } else if (target.classList.contains('decimal')) {
      this.inputDecimal(target.value);
    } else if (target.classList.contains('clear')) {
      this.resetCalculator();
    } else {
      this.inputDigit(target.value);
    }
    this.updateDisplay();
    this.saveCalculatorData();
  }

  updateDisplay() {
    const display: any = document.querySelector('.screen-cal');
    display.value = this.replaceOperators(this.calculator.displayValue);
    this.updateListDisplay('.history-entries', this.calculator.history);
    this.updateListDisplay('.favorites-entries', this.calculator.favorites, true);
  }

  replaceOperators(value: string): string {
    return value.replace(/\*/g, '×').replace(/\//g, '÷');
  }

  resetCalculator() {
    this.calculator.displayValue = '0';
    this.calculator.currentInput = '';
    this.calculator.lastOperator = ''; // Reset last operator
    this.calculator.error = false; // Reset error flag
    this.enableAllButtons(); // Enable all buttons when reset
    this.saveCalculatorData();
  }

  inputDigit(digit) {
    if (this.calculator.newCalculation) {
      this.calculator.currentInput = digit;
      this.calculator.newCalculation = false;
    } else {
      if (digit === '-' && /[+\-*/]$/.test(this.calculator.currentInput)) {
        this.calculator.currentInput += digit;
      } else {
        this.calculator.currentInput = this.calculator.currentInput === '0' ? digit : this.calculator.currentInput + digit;
      }
    }
    this.calculator.displayValue = this.calculator.currentInput;
    this.calculator.lastOperator = ''; // Reset last operator when digit is input
  }

  inputDecimal(dot) {
    if (this.calculator.displayValue === '0') {
      this.calculator.currentInput = '0.';
    } else {
      const currentOperand = this.calculator.currentInput.split(/[+\-*/]/).pop();
      if (!currentOperand.includes(dot)) {
        this.calculator.currentInput += dot;
      }
    }
    this.calculator.displayValue = this.calculator.currentInput;
  }

  handleOperator(nextOperator) {
    if (this.calculator.lastOperator === '=' && nextOperator !== '=') {
      this.calculator.currentInput = this.calculator.displayValue;
    }

    const lastTwoChars = this.calculator.currentInput.slice(-2);
    const isTwoOperators = /[+\-*/]{2}/.test(lastTwoChars);

    if (isTwoOperators) {
      if (nextOperator !== '-') {
        this.calculator.currentInput = this.calculator.currentInput.slice(0, -1) + nextOperator;
      }
    } else {
      const lastChar = this.calculator.currentInput.slice(-1);
      const isOperator = /[+\-*/]/.test(lastChar);

      if (isOperator && nextOperator !== '-') {
        this.calculator.currentInput = this.calculator.currentInput.slice(0, -1) + nextOperator;
      } else if (nextOperator === '-' && isOperator) {
        this.calculator.currentInput += nextOperator;
      } else {
        this.calculator.currentInput += nextOperator;
      }
    }

    if (nextOperator === '=') {
      if (this.calculator.lastOperator !== '=') {
        this.calculateResult();
      }
    } else {
      this.calculator.displayValue = this.calculator.currentInput;
      this.calculator.newCalculation = false;
    }

    this.calculator.lastOperator = nextOperator; // Set last operator
  }

  calculateResult() {
    try {
      let sanitizedInput = this.calculator.currentInput.replace(/=$/, '').replace(/([-+*/])\1+/g, '$1');

      sanitizedInput = sanitizedInput.replace(/--/g, '+');

      // Check if there are at least two operands and one operator
      const operands = sanitizedInput.split(/[+\-*/]/).filter(op => op !== '');
      const operators = sanitizedInput.match(/[+\-*/]/g);

      if (operands.length < 2 || !operators) {
        this.calculator.displayValue = 'エラー';
        this.calculator.error = true; // Set error flag
        this.displayErrorMessage();
        this.disableAllButtonsExceptAC(); // Disable all buttons except AC
        return;
      }

      if (/\/0(?![.\d])/.test(sanitizedInput)) {
        this.calculator.displayValue = '0で割れません';
        this.calculator.error = true; // Set error flag
        this.displayErrorMessage();
        this.disableAllButtonsExceptAC(); // Disable all buttons except AC
        return;
      }

      const result = eval(sanitizedInput);
      const formattedResult = isNaN(result) ? 'エラー' : String(Number(result.toFixed(10)));

      this.calculator.displayValue = formattedResult;
      this.calculator.history.push(`${this.calculator.currentInput} ${formattedResult}`);
      this.calculator.currentInput = ''; // Clear current input after calculation
      this.calculator.newCalculation = true;
      this.calculator.error = false; // Reset error flag
      this.saveCalculatorData();
    } catch (error) {
      this.calculator.displayValue = 'エラー';
      this.calculator.error = true; // Set error flag
      this.displayErrorMessage();
      this.disableAllButtonsExceptAC(); // Disable all buttons except AC
    }
  }

  updateListDisplay(selector: string, items: string[], isFavorite = false) {
    const container: any = document.querySelector(selector);
    container.innerHTML = items.map((item, index) => `
      <div>
        <button type="button" class="${isFavorite ? 'favorite' : ''}" data-index="${index}">${this.replaceOperators(item)}</button>
        ${isFavorite ? `
          <button type="button" class="recall-favorite" data-index="${index}">呼出</button>
          <button type="button" class="delete-favorite" data-index="${index}">削除</button>` : ''}
      </div>
    `).join('<br>');

    if (isFavorite) {
      const recallButtons = container.querySelectorAll('.recall-favorite');
      recallButtons.forEach(button => button.addEventListener('click', this.handleRecallButtonClick.bind(this)));

      const deleteButtons = container.querySelectorAll('.delete-favorite');
      deleteButtons.forEach(button => button.addEventListener('click', this.handleDeleteButtonClick.bind(this)));
    }
  }

  handleRecallButtonClick(event) {
    const index = event.target.getAttribute('data-index');
    const recalledCalculation = this.calculator.favorites[index];
    this.calculator.currentInput += recalledCalculation; // Append the recalled calculation to the current input
    this.calculator.displayValue = this.calculator.currentInput;
    this.saveCalculatorData();
  }

  handleDeleteButtonClick(event) {
    const index = event.target.getAttribute('data-index');
    this.calculator.favorites.splice(index, 1);
    this.updateDisplay();
    this.saveCalculatorData();
  }

  saveFavorite() {
    this.calculator.favorites.push(this.calculator.displayValue);
    this.updateDisplay();
    this.saveCalculatorData();
  }

  clearHistory() {
    this.calculator.history = [];
    this.updateDisplay();
    this.saveCalculatorData();
  }

  clearFavorites() {
    this.calculator.favorites = [];
    this.updateDisplay();
    this.saveCalculatorData();
  }

  exportHistoryToPDF() {
    const doc = new jsPDF();
    let y = 10;
    this.calculator.history.forEach(entry => {
      const formattedEntry = this.replaceOperators(entry);
      doc.text(formattedEntry, 10, y);
      y += 10;
    });
    doc.save('calculation_history.pdf');
  }

  private async saveCalculatorData() {
    try {
      await this.authService.saveCalculation(this.calculator);
    } catch (error) {
      console.error('計算データの保存エラー:', error);
      alert('計算データの保存に失敗しました。権限を確認してください。');
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      alert('ログアウトに成功しました。');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました。');
    }
  }

  private displayErrorMessage() {
    alert('エラーが発生しました。ACボタンを押してください。ACボタンを押すまでアプリを適切に使用できません。');
  }

  private disableAllButtonsExceptAC() {
    const buttons = document.querySelectorAll('.btn-cal button');
    buttons.forEach(button => {
      if (!button.classList.contains('clear')) {
        button.setAttribute('disabled', 'true');
      }
    });
  }

  private enableAllButtons() {
    const buttons = document.querySelectorAll('.btn-cal button');
    buttons.forEach(button => button.removeAttribute('disabled'));
  }
}
