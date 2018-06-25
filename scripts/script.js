
/**
 * Creates field with application
 * 
 * @constructor 
 * @param {number} maxSizeX - width of the field
 * @param {number} maxSizeY - height of the field
 * @param {object } container(HTMLElement) - container for the application
 * @param {number} steps - count of steps for the mixing field before beginning of the game
 * @this {Field}
 * 
 */
function Field(maxSizeX, maxSizeY, container, steps) {
  this.maxSizeX = maxSizeX;
  this.maxSizeY = maxSizeY;
  this.container = container;

  this.minSize = 0;

  this.victoryCombination = this.createArray(maxSizeY, maxSizeX);
  this.workingArray = this.createArray(maxSizeY, maxSizeX);
  this.shuffledList = this.shuffle(steps);
  this.date = new Date();

  this.init();
}

Field.prototype = {
  /**
   * Initialize eventListeners by using a delegation and render field with application
   * 
   * @this {Field } - instance of constructor Field
   * 
   */
  init: function () {
    this.container.addEventListener("click", this.changePlaces.bind(this));
    this.render(this.shuffledList);
  },

  /**
   * Checks cells for the swiping
   *  
   * @param {object } e - event object
   * @this {Field } - instance of constructor Field
   * @returns {null}
   * 
   */
  changePlaces: function (e) {
    if (e.target.tagName !== 'TD') {
      return null;
    }
    for (var i = 0; i < this.shuffledList.length; i++) {
      for (var j = 0; j < this.shuffledList[i].length; j++) {
        if (this.shuffledList[i][j] == e.target.innerHTML) {
          var neighbours = this.getNeighbours(i, j);
          if (neighbours) {
            this.swipe(this.shuffledList, i, j, true);
          }
          return null;
        };
      }
    }
  },

  /**
   * Renders data on the web-page
   * 
   * @param  {object } data - array for the rendering
   * @this {Field } - instance of constructor Field
   * 
   */
  render: function (data) {
    this.container.innerHTML = '';
    var table = document.createElement('table');
    table.classList.add('table');
    for (var i = 0; i < this.maxSizeY; i++) {
      var tr = document.createElement('tr');
      for (var j = 0; j < this.maxSizeX; j++) {
        var td = document.createElement('td');
        td.classList.add('table__item');
        td.innerHTML = data[i][j];
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.container.appendChild(table);
    this.setEmptyCell();
  },

  /**
   * Shuffles the array before the rendering any times (based on number of steps)
   * 
   * @param  {number} steps - number of steps for shuffling
   * @return {array } - new shuffled array
   * 
   */
  shuffle: function (steps) {
    var objWithGenerations = {};
    var coords = {};
    this.workingArray.forEach((inside, i) => {
      inside.forEach((elem, j) => {
        if (elem == 'x') {
          coords.i = i;
          coords.j = j;
          if (i - 1 >= this.minSize) {
            objWithGenerations.top = i - 1;
          } else {
            objWithGenerations.top = null;
          }
          if (j - 1 >= this.minSize) {
            objWithGenerations.left = j - 1;
          } else {
            objWithGenerations.left = null;
          }
          if (i + 1 < this.maxSizeY) {
            objWithGenerations.bottom = i + 1;
          } else {
            objWithGenerations.bottom = null;
          }
          if (j + 1 < this.maxSizeX) {
            objWithGenerations.right = j + 1;
          } else {
            objWithGenerations.right = null;
          }
        }
      });
    });

    var generationsList = [];

    for (var prop in objWithGenerations) {
      if (objWithGenerations[prop] !== null) {
        generationsList.push(prop);
      }
    }

    var generation = generationsList[Math.floor(Math.random() * generationsList.length)];
    switch (generation) {
      case 'left':
        coords.j = objWithGenerations.left;
        break;
      case 'right':
        coords.j = objWithGenerations.right;
        break;
      case 'top':
        coords.i = objWithGenerations.top;
        break;
      case 'bottom':
        coords.i = objWithGenerations.bottom;
        break;
    }

    this.swipe(this.workingArray, coords.i, coords.j, false);
    if (steps) {
      this.shuffle(--steps);
    }

    return this.workingArray;
  },

  /**
   * Replaces two elements of two arrays
   * 
   * @param  {array } changingArr - array before changing
   * @param  {number } indexY - height of the field
   * @param  {number } indexX - width of the field
   * @param  {boolean } rendering - flag for the rendering web page
   * @return {array } - changed array
   * 
   */
  swipe: function (changingArr, indexY, indexX, rendering) {
    for (var a = 0; a < this.maxSizeY; a++) {
      for (var b = 0; b < this.maxSizeX; b++) {
        if (changingArr[a][b] == 'x') {
          changingArr[a][b] = changingArr[indexY][indexX];
        }
      }
    }
    changingArr[indexY][indexX] = 'x';
    if (rendering) {
      this.render(changingArr);
      this.checkArray();
    }
    return changingArr;
  },

  /**
   * Check a place for the replacing elements of the array (field)
   * 
   * @param  {number } verticalIndex - first index of any array
   * @param  {number } horisontalIndex - second index of any array
   * @return {boolean } - availability of place for the changing
   * 
   */
  getNeighbours: function (verticalIndex, horisontalIndex) {
    return (verticalIndex - 1 >= this.minSize && this.shuffledList[verticalIndex - 1][horisontalIndex] == 'x') ||
      (verticalIndex + 1 < this.maxSizeY && this.shuffledList[verticalIndex + 1][horisontalIndex] == 'x') ||
      (horisontalIndex - 1 >= this.minSize && this.shuffledList[verticalIndex][horisontalIndex - 1] == 'x') ||
      (horisontalIndex + 1 < this.maxSizeX && this.shuffledList[verticalIndex][horisontalIndex + 1] == 'x');
  },

  /**
   * Compares array (state) with victory-combination array add shows modal window with result in case of victory
   * 
   */
  checkArray: function () {
    if (this.isDeepEqual(this.victoryCombination, this.shuffledList)) {
      setTimeout(() => {
        alert('Ура! Вы решили головоломку за ' + this.getTime(this.date));
        location.reload();
      }, 100);
    }
    return null;
  },

  /**
   * Create exemplar of Array
   * @param  {number} verticalCountity - height of the array
   * @param  {number} horizontalCountity - width of the array
   * @return {array } - exemplar of Array
   * 
   */
  createArray: function (verticalCountity, horizontalCountity) {
    var count = 0;
    var emptyArray = new Array(verticalCountity);
    for (var i = 0; i < emptyArray.length; i++) {
      emptyArray[i] = new Array(horizontalCountity);
      for (var j = 0; j < emptyArray[i].length; j++) {
        emptyArray[i][j] = ++count;
      }
    }
    emptyArray[verticalCountity - 1][horizontalCountity - 1] = 'x';
    return emptyArray;
  },

  /**
   * Returns time of the game in case of the victory
   * @param  {number } date - number of millisecons since of the beginning of the play
   * @return {string } - string with time in #:## format
   * 
   */
  getTime: function (date) {
    var timeOfTheGame = Math.floor((new Date() - date) / 1000);
    var hours = Math.floor(timeOfTheGame / 3600);
    var minutes = Math.floor(timeOfTheGame % 3600 / 60);
    var seconds = Math.floor(timeOfTheGame % 3600 % 60);
    return hours ?
      hours + ":" + minutes + ":" + seconds :
      minutes + ":" + seconds;
  },

  /**
   * Set class "table__item--active" with some css-styles for the table-cell with symbol of 'x'
   * 
   */
  setEmptyCell: function () {
    var cells = document.querySelectorAll('td');
    [].forEach.call(cells, singleCell => {
      singleCell.classList.remove('table__item--active');
      if (singleCell.innerHTML === 'x') {
        singleCell.classList.add('table__item--active');
      }
    });
  },

  /**
   * Compares two arrays by value
   * 
   * @param  {array } arrA - first comparing array
   * @param  {array } arrB - second comparing array
   * @return {boolean} - arrays equality
   */
  isDeepEqual: function (arrA, arrB) {
    var flag = true;
    arrA.forEach((inside, i) => {
      inside.forEach((elem, j) => {
        if (elem !== arrB[i][j]) {
          flag = false;
        }
      });
    });
    return flag;
  }
};

/**
 * Creates form with settings for the application
 * 
 * @constructor 
 * @param {object } container(HTMLElement) - container for the application
 * @this {Form }
 * 
 */
function Form(container) {
  this.container = container;
  this.init();
}


Form.prototype = {

  /**
   * Renders form on the web-page
   * 
   * @this {Form } - instance of constructor Field
   * @prop {difficulty } - number of the shuffling steps
   * 
   */
  render: function () {
    var form = document.createElement('form');
    form.classList.add('form');
    var head = document.createElement('h1');
    head.classList.add('form__item');
    head.classList.add('form__item--head');
    head.textContent = "Choose size of the field and difficulty"
    form.appendChild(head);

    this.inputs = {
      width: null,
      height: null,
      difficulty: null
    };

    for (var item in this.inputs) {
      this.inputs[item] = document.createElement('input');
      this.inputs[item].setAttribute('type', 'number');
      this.inputs[item].setAttribute('min', '3');
      this.inputs[item].setAttribute('placeholder', item);
      this.inputs[item].classList.add('form__item');
      form.appendChild(this.inputs[item]);
    }
    this.inputs.button = document.createElement('button');
    this.inputs.button.textContent = 'Create field';
    this.inputs.button.classList.add('form__item');
    this.inputs.button.classList.add('form__item--button');

    form.appendChild(this.inputs.button);
    this.container.appendChild(form);
  },

  /**
   * Initialize eventListeners by using a delegation and render form with settings
   * 
   * @this {Form } self - instance of constructor Field
   * 
   */
  init: function () {
    var self = this;
    this.container.addEventListener('click', this.createField.bind(self));
    this.render();
  },

  /**
   * Collects values of inputs of the form and create application based on it
   * 
   * @param  {object } e - event object
   * @return {object } - instance of Field
   * 
   */
  createField: function (e) {
    if (e.target.tagName !== 'BUTTON') {
      return false;
    }
    e.preventDefault();
    var width = +this.inputs.width.value || 4;
    var height = +this.inputs.height.value || 4;
    var difficulty = +this.inputs.difficulty.value || 25;

    return new Field(width, height, this.container, difficulty);
  }
};

/**
 * @see {new Field }
 */
var form = new Form(document.getElementById('app'));