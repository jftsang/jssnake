(() => {
  const SNAKE_MOVE_INTERVAL = 100;
  const FOOD_SPAWN_INTERVAL = 1000;
  const STARTING_LENGTH = 5;
  const STARTING_FOOD = 10;
  const N_WALLS = 5;
  const WALL_LENGTH = 50;
  const WALL_GRACE = 4;

  function randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  enum CellType {
    snake = "cell-snake",
    food = "cell-food",
    wall = "cell-wall",
    empty = "cell-empty",
  }

  type Coordinate = [number, number];
  type Velocity = [number, number];

  const Direction = {
    up: <Velocity>[-1, 0],
    down: <Velocity>[1, 0],
    left: <Velocity>[0, -1],
    right: <Velocity>[0, 1],
  };

  function randomDirection() {
    return randomChoice(
      [Direction.up, Direction.down, Direction.left, Direction.right]
    );
  }

  class Snake {
    public cells: Coordinate[];
    public direction: Velocity;

    constructor(cells, direction) {
      this.cells = cells;
      this.direction = direction;
    }

    head() {
      return this.cells[this.cells.length - 1];
    }
  }

  class Wall {
    constructor(
      public cells: Coordinate[],
      public direction: Velocity,
    ) {
    };
  }

  class SnakeGame {
    cells: CellType[][];
    private advanceSnakeInterval: number;
    private spawnFoodInterval: number;
    private readonly grid: HTMLDivElement;
    private alwaysGrow: boolean;
    private snake: Snake;
    private foodLocations: Set<Coordinate>;

    constructor(public div: HTMLDivElement, public n_rows: number, public n_cols: number) {
      this.cells = new Array(n_rows);
      for (let i = 0; i < n_rows; i++) {
        this.cells[i] = new Array(n_cols);
        for (let j = 0; j < n_cols; j++) {
          this.cells[i][j] = CellType.empty;
        }
      }

      this.grid = <HTMLDivElement>document.createElement("div");
      for (let i = 0; i < n_rows; i++) {
        const row = <HTMLDivElement>document.createElement("div");
        row.classList.add("row");
        this.grid.appendChild(row);

        for (let j = 0; j < n_cols; j++) {
          const gridCell = <HTMLDivElement>document.createElement("div");
          row.appendChild(gridCell);
          gridCell.classList.add("cell");
          row.appendChild(gridCell);
        }
        this.grid.appendChild(row);
      }

      while (!this.snake) {
        const startingPoint = [Math.floor(Math.random() * n_rows), Math.floor(Math.random() * n_cols)];
        if (this.cells[startingPoint[0]][startingPoint[1]] === CellType.empty)
          this.snake = new Snake([startingPoint], randomDirection());

        this.alwaysGrow = true;
        for (let t = 0; t < STARTING_LENGTH - 1; t++) {
          this.advanceSnake();
        }
        this.alwaysGrow = false;
      }

      // Snake initially creates a 'force field' that stops walls from
      // spawning nearby

      const canBuildWall = new Array(n_rows);
      for (let i = 0; i < n_rows; i++) {
        canBuildWall[i] = new Array(n_cols);
        for (let j = 0; j < n_cols; j++) {

          for (let [si, sj] of this.snake.cells) {
            canBuildWall[i][j] = Math.abs(si - i) + Math.abs(sj - j) > WALL_GRACE;
          }
        }
      }

      for (let w = 0; w < N_WALLS; w++) {
        let i = Math.floor(Math.random() * n_rows)
        let j = Math.floor(Math.random() * n_cols);
        for (let l = 0; l < WALL_LENGTH; l++) {
          const direction = randomDirection();
          [i, j] = this.cyclicAdd([i, j], direction);

          if (canBuildWall[i][j])
            this.cells[i][j] = CellType.wall;
        }
      }

      this.foodLocations = new Set();

      for (let cell of this.snake.cells) {
        this.cells[cell[0]][cell[1]] = CellType.snake;
      }

      this.div.appendChild(this.grid);

      this.alwaysGrow = false;

      this.redrawAll();
    };

    cyclicAdd(position: Coordinate, velocity: Velocity): Coordinate {
      let i = position[0] + velocity[0];
      if (i < 0) i = this.n_rows - 1;
      if (i >= this.n_rows) i = 0;
      let j = position[1] + velocity[1];
      if (j < 0) j = this.n_cols - 1;
      if (j >= this.n_cols) j = 0;
      return [i, j];
    }

    redrawCell(i, j) {
      const gridCell = this.grid.children[i].children[j];
      gridCell.classList.remove(CellType.snake, CellType.food, CellType.wall, CellType.empty, "cell-snake-eye");
      gridCell.classList.add(this.cells[i][j]);
    }

    redrawAll() {
      for (let i = 0; i < this.n_rows; i++)
        for (let j = 0; j < this.n_cols; j++)
          this.redrawCell(i, j);
    }

    advanceSnake() {
      const head = this.snake.head();
      const newHead = this.cyclicAdd(head, this.snake.direction);

      if ((this.cells[newHead[0]][newHead[1]] === CellType.snake) || (this.cells[newHead[0]][newHead[1]] === CellType.wall)) {
        this.stop();
        alert("Game over!");
        return false;
      }

      if (!this.alwaysGrow && !(this.cells[newHead[0]][newHead[1]] in this.foodLocations)) {
        const oldTail = this.snake.cells.shift();
        this.cells[oldTail[0]][oldTail[1]] = CellType.empty;
        this.redrawCell(...oldTail);
      }

      this.snake.cells.push(newHead);
      this.cells[newHead[0]][newHead[1]] = CellType.snake;
      this.redrawCell(...newHead);
      return true;
    }

    spawnFood() {
      const i = Math.floor(Math.random() * this.n_rows);
      const j = Math.floor(Math.random() * this.n_cols);
      if (this.cells[i][j] === CellType.empty) {
        this.foodLocations.add([i, j]);
        this.cells[i][j] = CellType.food;
        this.redrawCell(i, j);
      }
    }

    start() {
      this.advanceSnakeInterval = window.setInterval(() => {
        this.advanceSnake()
      }, SNAKE_MOVE_INTERVAL);
      this.spawnFoodInterval = window.setInterval(() => {
        this.spawnFood()
      }, FOOD_SPAWN_INTERVAL);

      window.addEventListener("keydown", (e) => {
        if (e.key === "Shift") {
          this.alwaysGrow = true;
        } else if (e.key === "ArrowUp") {
          if (this.snake.direction !== Direction.down)
            this.snake.direction = Direction.up;
        } else if (e.key === "ArrowDown") {
          if (this.snake.direction !== Direction.up)
            this.snake.direction = Direction.down;
        } else if (e.key === "ArrowLeft") {
          if (this.snake.direction !== Direction.right)
            this.snake.direction = Direction.left;
        } else if (e.key === "ArrowRight") {
          if (this.snake.direction !== Direction.left)
            this.snake.direction = Direction.right;
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.key === "Shift") {
          this.alwaysGrow = false;
        }
      })

      while (this.foodLocations.size < STARTING_FOOD) {
        this.spawnFood();
      }
    }

    stop() {
      window.clearInterval(this.advanceSnakeInterval);
      window.clearInterval(this.spawnFoodInterval);
    }
  }

  const snakeGame = new SnakeGame(
    <HTMLDivElement>document.getElementById("game"),
    Math.floor(window.innerHeight / 20 * 0.8),
    Math.floor(window.innerWidth / 20 * 0.8)
  );

  snakeGame.start();

  // @ts-ignore
  window.snakeGame = snakeGame;  // expose to the console
})();
