'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-08-05T17:01:17.194Z',
    '2022-08-11T23:36:17.929Z',
    '2022-08-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
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

const formatMovementDate = function (date, locale) {
  const calcDaysPast = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPast = calcDaysPast(new Date(), date);

  if (daysPast === 0) return 'Today';
  if (daysPast === 1) return 'Yesterday';
  if (daysPast <= 7) return `${daysPast} Days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const formateNumbers = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const displayMovements = function (acc, sort = false) {
  // sort movements by ascending
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : movements;
  //empty the containerMovement
  containerMovements.innerHTML = '';
  movs.forEach((move, i) => {
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(date, acc.locale);
    //check if the movement is withdraw or deposit
    const type = move > 0 ? 'deposit' : 'withdrawal';

    const formattedMovement = formateNumbers(move, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}"> ${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMovement}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//calc and print balance
const calcPrintBalance = function (account) {
  const balance = account.movements.reduce(
    (accu, currMov) => accu + currMov,
    0
  );
  account.balance = balance;

  labelBalance.textContent = formateNumbers(
    balance,
    account.locale,
    account.currency
  );
};

// calc summary
const calcDisplaySummary = function (account) {
  //labelSumIn
  const income = account.movements
    .filter(move => move > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = formateNumbers(
    income,
    account.locale,
    account.currency
  );
  //labelSumOut
  const outCome = movements
    .filter(move => move <= 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = formateNumbers(
    Math.abs(outCome),
    account.locale,
    account.currency
  );
  //labelSumInterest
  const interest = movements
    .filter(move => move >= 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formateNumbers(
    interest,
    account.locale,
    account.currency
  );
};

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
  displayMovements(currAcc);
  // display balance
  calcPrintBalance(currAcc);
  // display summary
  calcDisplaySummary(currAcc);
};

//logout timer
const logoutTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//get current account
let currentAccount, timer;

// implementing login
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  // create date
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // check PIN
  // using optional chaining
  if (currentAccount?.pin === +inputLoginPin.value) {
    // display welcome message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //create a date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      Day: 'numeric',
      month: 'numeric',
      // month:'long'
      year: 'numeric',
    };
    const locals = navigator.language;
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = `${now.getFullYear()}`;
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // const displayDate = `${day}/${month}/${year}  ${hour - 12}:${min}`;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = logoutTimer();
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // get amount & receiver username
  const amount = inputTransferAmount.value;
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

    //add dates to movement dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //clear inputs
    inputTransferAmount.value = inputTransferTo.value = '';
    updateUI(currentAccount);
    clearInterval(timer);
    timer = logoutTimer();
  } else {
    console.log('cannot do it');
  }
});

// request loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  // grant loan if there is a deposit of 10% of the requested amount of loan
  if (
    amount > 0 &&
    currentAccount.movements.some(dep => dep >= (amount * 10) / 100)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = logoutTimer();
    }, 2000);
  }
  inputLoanAmount.value = '';
});
// delete an account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  // check user's credentials
  //if user input == accounts.username
  const userCredName = inputCloseUsername.value;
  const userCredPin = +inputClosePin.value;

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
  displayMovements(currentAccount, !stateSort);
  // reassign the variable
  stateSort = !stateSort;
});
