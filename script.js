'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

const displayMovements = function (movements, sort = false) {
  // sort movements by ascending
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  //empty the containerMovement
  containerMovements.innerHTML = '';
  movs.forEach((move, i) => {
    //check if the movement is withdraw or deposit
    const type = move > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}"> ${
      i + 1
    } ${type}</div>
      <div class="movements__value">${move}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// displayMovements(account1.movements);

//calc and print balance
const calcPrintBalance = function (account) {
  const balance = account.movements.reduce(
    (accu, currMov) => accu + currMov,
    0
  );
  account.balance = balance;
  labelBalance.textContent = `${balance} EUR`;
};
// calcPrintBalance(movements);

// calc summary
const calcDisplaySummary = function ({ movements, interestRate }) {
  //labelSumIn
  const income = movements
    .filter(move => move > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${income}€`;
  //labelSumOut
  const outCome = movements
    .filter(move => move <= 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = `${Math.abs(outCome)}€`;
  //labelSumInterest
  const interest = movements
    .filter(move => move >= 0)
    .map(deposit => (deposit * interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};
// calcDisplaySummary(movements);

// compute usernames
const createUserNames = function (accs) {
  //modify the original array
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(val => val[0])
      .join('');
  });
};
createUserNames(accounts);

//update UI
const updateUI = function (currAcc) {
  // display movements
  displayMovements(currAcc.movements);
  // display balance
  calcPrintBalance(currAcc);
  // display summary
  calcDisplaySummary(currAcc);
};
//get current account
let currentAccount;
// implementing login
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // check PIN
  // using optional chaining
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display welcome message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // get amount & receiver username
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // check amount
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // add the movement to the current account
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //clear inputs
    inputTransferAmount.value = inputTransferTo.value = '';
    updateUI(currentAccount);
  } else {
    console.log('cannot do it');
  }
});

// request loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  // grant loan if there is a deposit of 10% of the requested amount of loan
  if (
    amount > 0 &&
    currentAccount.movements.some(dep => dep >= (amount * 10) / 100)
  ) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});
// delete an account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  // check user's credentials
  //if user input == accounts.username
  const userCredName = inputCloseUsername.value;
  const userCredPin = Number(inputClosePin.value);

  if (
    userCredName === currentAccount.username &&
    userCredPin === currentAccount.pin
  ) {
    // deletion of the account
    const indexOfCurrAcc = accounts.findIndex(
      acc => acc.username === userCredName
    );
    accounts.splice(indexOfCurrAcc, 1);
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let stateSort = false;
// sort movements
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !stateSort);
  // reassign the variable
  stateSort = !stateSort;
});
