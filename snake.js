(() => {
  const SNAKE_MOVE_INTERVAL = 100;
  const FOOD_SPAWN_INTERVAL = 1000;
  const STARTING_LENGTH = 5;

  const CellType = {
    snake: "cell-snake",
    food: "cell-food",
    wall: "cell-wall",
    empty: "cell-empty",
  };

  const Direction = {
    up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  };

  class Snake {
    constructor(cells, direction) {
      this.cells = cells;
      this.direction = direction;
    }

    head() {
      return this.cells[this.cells.length - 1];
    }

    tail() {
      return this.cells[0];
    }
  }

  class SnakeGame {
    constructor(div, n_rows, n_cols) {
      this.div = div;

      this.n_rows = n_rows;
      this.n_cols = n_cols;

      this.cells = new Array(n_rows);
      for (let i = 0; i < n_rows; i++) {
        this.cells[i] = new Array(n_cols).fill(CellType.empty);
      }

      const startingPoint = [Math.floor(Math.random() * n_rows), Math.floor(Math.random() * n_cols)];
      this.snake = new Snake([startingPoint], Direction.right);

      for (let cell of this.snake.cells) {
        this.cells[cell[0]][cell[1]] = CellType.snake;
      }

      this.table = document.createElement("table");
      for (let i = 0; i < n_rows; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < n_cols; j++) {
          const cell = document.createElement("td");
          cell.classList.add("cell");
          row.appendChild(cell);

        }
        this.table.appendChild(row);
      }

      this.div.appendChild(this.table);

      this.alwaysGrow = false;

      this.redrawAll();

    };

    redrawCell(i, j) {
      const td = this.table.children[i].children[j];
      td.classList.remove(CellType.snake, CellType.food, CellType.wall, CellType.empty, "cell-snake-eye");
      td.classList.add(this.cells[i][j]);
    }

    redrawAll() {
      for (let i = 0; i < this.n_rows; i++)
        for (let j = 0; j < this.n_cols; j++)
          this.redrawCell(i, j);
    }

    advanceSnake() {
      const head = this.snake.head();
      const newHead = [head[0] + this.snake.direction[0], head[1] + this.snake.direction[1]];
      if (newHead[0] === -1)
        newHead[0] = this.n_rows - 1;
      if (newHead[0] === this.n_rows)
        newHead[0] = 0;
      if (newHead[1] === -1)
        newHead[1] = this.n_cols - 1;
      if (newHead[1] === this.n_cols)
        newHead[1] = 0;

      if ((this.cells[newHead[0]][newHead[1]] === CellType.snake) || (this.cells[newHead[0]][newHead[1]] === CellType.wall)) {
        this.stop();
        alert("Game over!");
      }

      if (!this.alwaysGrow && this.cells[newHead[0]][newHead[1]] !== CellType.food) {
        const oldTail = this.snake.cells.shift();
        this.cells[oldTail[0]][oldTail[1]] = CellType.empty;
        this.redrawCell(...oldTail);
      }

      this.snake.cells.push(newHead);
      this.cells[newHead[0]][newHead[1]] = CellType.snake;
      this.redrawCell(...newHead);
    }

    spawnFood() {
      const i = Math.floor(Math.random() * this.n_rows);
      const j = Math.floor(Math.random() * this.n_cols);
      if (this.cells[i][j] === CellType.empty) {
        this.cells[i][j] = CellType.food;
        this.redrawCell(i, j);
      }
    }

    start() {
      this.advanceSnakeInterval = window.setInterval(() => {this.advanceSnake()}, SNAKE_MOVE_INTERVAL);
      this.spawnFoodInterval = window.setInterval(() => {this.spawnFood()}, FOOD_SPAWN_INTERVAL);

      window.addEventListener("keydown", (e) => {
        if (e.key === "Shift") {
          this.alwaysGrow = true;
        }
        else if (e.key === "ArrowUp") {
          if (this.snake.direction !== Direction.down)
            this.snake.direction = Direction.up;
        }
        else if (e.key === "ArrowDown") {
          if (this.snake.direction !== Direction.up)
            this.snake.direction = Direction.down;
        }
        else if (e.key === "ArrowLeft") {
          if (this.snake.direction !== Direction.right)
            this.snake.direction = Direction.left;
        }
        else if (e.key === "ArrowRight") {
          if (this.snake.direction !== Direction.left)
            this.snake.direction = Direction.right;
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.key === "Shift") {
          this.alwaysGrow = false;
        }
      })

      for (let t = 0; t < STARTING_LENGTH - 1; t++) {
        this.advanceSnake();
      }
    }

    stop() {
      window.clearInterval(this.advanceSnakeInterval);
      window.clearInterval(this.spawnFoodInterval);
    }
  }


  const snakeGame = new SnakeGame(document.getElementById("game"), 30, 80);

  snakeGame.start();

  window.snakeGame = snakeGame;  // expose to the console
})();