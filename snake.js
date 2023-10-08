(function () {
    var SNAKE_MOVE_INTERVAL = 100;
    var FOOD_SPAWN_INTERVAL = 1000;
    var STARTING_LENGTH = 5;
    var STARTING_FOOD = 10;
    var N_WALLS = 5;
    var WALL_LENGTH = 50;
    var WALL_TWISTINESS = 0.5;
    var WALL_GRACE = 4;
    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    var CellType;
    (function (CellType) {
        CellType["snake"] = "cell-snake";
        CellType["food"] = "cell-food";
        CellType["wall"] = "cell-wall";
        CellType["empty"] = "cell-empty";
    })(CellType || (CellType = {}));
    var Direction = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1]
    };
    function randomDirection() {
        return randomChoice([Direction.up, Direction.down, Direction.left, Direction.right]);
    }
    var Snake = /** @class */ (function () {
        function Snake(cells, direction) {
            this.cells = cells;
            this.direction = direction;
        }
        Snake.prototype.head = function () {
            return this.cells[this.cells.length - 1];
        };
        return Snake;
    }());
    var Wall = /** @class */ (function () {
        function Wall(cells, direction) {
            this.cells = cells;
            this.direction = direction;
        }
        ;
        return Wall;
    }());
    var SnakeGame = /** @class */ (function () {
        function SnakeGame(div, n_rows, n_cols) {
            var _a;
            this.div = div;
            this.n_rows = n_rows;
            this.n_cols = n_cols;
            this.cells = new Array(n_rows);
            for (var i = 0; i < n_rows; i++) {
                this.cells[i] = new Array(n_cols);
                for (var j = 0; j < n_cols; j++) {
                    this.cells[i][j] = CellType.empty;
                }
            }
            this.grid = document.createElement("div");
            for (var i = 0; i < n_rows; i++) {
                var row = document.createElement("div");
                row.classList.add("row");
                this.grid.appendChild(row);
                for (var j = 0; j < n_cols; j++) {
                    var gridCell = document.createElement("div");
                    row.appendChild(gridCell);
                    gridCell.classList.add("cell");
                    row.appendChild(gridCell);
                }
                this.grid.appendChild(row);
            }
            while (!this.snake) {
                var startingPoint = [Math.floor(Math.random() * n_rows), Math.floor(Math.random() * n_cols)];
                if (this.cells[startingPoint[0]][startingPoint[1]] === CellType.empty)
                    this.snake = new Snake([startingPoint], randomDirection());
                this.alwaysGrow = true;
                for (var t = 0; t < STARTING_LENGTH - 1; t++) {
                    this.advanceSnake();
                }
                this.alwaysGrow = false;
            }
            // Snake initially creates a 'force field' that stops walls from
            // spawning nearby
            var canBuildWall = new Array(n_rows);
            for (var i = 0; i < n_rows; i++) {
                canBuildWall[i] = new Array(n_cols);
                for (var j = 0; j < n_cols; j++) {
                    for (var _i = 0, _b = this.snake.cells; _i < _b.length; _i++) {
                        var _c = _b[_i], si = _c[0], sj = _c[1];
                        canBuildWall[i][j] = Math.abs(si - i) + Math.abs(sj - j) > WALL_GRACE;
                    }
                }
            }
            for (var w = 0; w < N_WALLS; w++) {
                var i = Math.floor(Math.random() * n_rows);
                var j = Math.floor(Math.random() * n_cols);
                var direction = randomDirection();
                for (var l = 0; l < WALL_LENGTH; l++) {
                    if (Math.random() < WALL_TWISTINESS)
                        direction = randomDirection();
                    _a = this.cyclicAdd([i, j], direction), i = _a[0], j = _a[1];
                    if (canBuildWall[i][j])
                        this.cells[i][j] = CellType.wall;
                }
            }
            this.foodLocations = new Set();
            for (var _d = 0, _e = this.snake.cells; _d < _e.length; _d++) {
                var cell = _e[_d];
                this.cells[cell[0]][cell[1]] = CellType.snake;
            }
            this.div.appendChild(this.grid);
            this.alwaysGrow = false;
            this.redrawAll();
        }
        ;
        SnakeGame.prototype.cyclicAdd = function (position, velocity) {
            var i = position[0] + velocity[0];
            if (i < 0)
                i = this.n_rows - 1;
            if (i >= this.n_rows)
                i = 0;
            var j = position[1] + velocity[1];
            if (j < 0)
                j = this.n_cols - 1;
            if (j >= this.n_cols)
                j = 0;
            return [i, j];
        };
        SnakeGame.prototype.redrawCell = function (i, j) {
            var gridCell = this.grid.children[i].children[j];
            gridCell.classList.remove(CellType.snake, CellType.food, CellType.wall, CellType.empty, "cell-snake-eye");
            gridCell.classList.add(this.cells[i][j]);
        };
        SnakeGame.prototype.redrawAll = function () {
            for (var i = 0; i < this.n_rows; i++)
                for (var j = 0; j < this.n_cols; j++)
                    this.redrawCell(i, j);
        };
        SnakeGame.prototype.advanceSnake = function () {
            var head = this.snake.head();
            var newHead = this.cyclicAdd(head, this.snake.direction);
            if (!this.alwaysGrow && ((this.cells[newHead[0]][newHead[1]] === CellType.snake) || (this.cells[newHead[0]][newHead[1]] === CellType.wall))) {
                this.stop();
                alert("Game over!");
                return false;
            }
            if (!this.alwaysGrow && !(this.cells[newHead[0]][newHead[1]] in this.foodLocations)) {
                var oldTail = this.snake.cells.shift();
                this.cells[oldTail[0]][oldTail[1]] = CellType.empty;
                this.redrawCell.apply(this, oldTail);
            }
            this.snake.cells.push(newHead);
            this.cells[newHead[0]][newHead[1]] = CellType.snake;
            this.redrawCell.apply(this, newHead);
            return true;
        };
        SnakeGame.prototype.spawnFood = function () {
            var i = Math.floor(Math.random() * this.n_rows);
            var j = Math.floor(Math.random() * this.n_cols);
            if (this.cells[i][j] === CellType.empty) {
                this.foodLocations.add([i, j]);
                this.cells[i][j] = CellType.food;
                this.redrawCell(i, j);
            }
        };
        SnakeGame.prototype.start = function () {
            var _this = this;
            this.advanceSnakeInterval = window.setInterval(function () {
                _this.advanceSnake();
            }, SNAKE_MOVE_INTERVAL);
            this.spawnFoodInterval = window.setInterval(function () {
                _this.spawnFood();
            }, FOOD_SPAWN_INTERVAL);
            window.addEventListener("keydown", function (e) {
                if (e.key === "Shift") {
                    _this.alwaysGrow = true;
                }
                else if (e.key === "ArrowUp") {
                    if (_this.snake.direction !== Direction.down)
                        _this.snake.direction = Direction.up;
                }
                else if (e.key === "ArrowDown") {
                    if (_this.snake.direction !== Direction.up)
                        _this.snake.direction = Direction.down;
                }
                else if (e.key === "ArrowLeft") {
                    if (_this.snake.direction !== Direction.right)
                        _this.snake.direction = Direction.left;
                }
                else if (e.key === "ArrowRight") {
                    if (_this.snake.direction !== Direction.left)
                        _this.snake.direction = Direction.right;
                }
            });
            window.addEventListener("keyup", function (e) {
                if (e.key === "Shift") {
                    _this.alwaysGrow = false;
                }
            });
            while (this.foodLocations.size < STARTING_FOOD) {
                this.spawnFood();
            }
        };
        SnakeGame.prototype.stop = function () {
            window.clearInterval(this.advanceSnakeInterval);
            window.clearInterval(this.spawnFoodInterval);
        };
        return SnakeGame;
    }());
    var snakeGame = new SnakeGame(document.getElementById("game"), Math.floor(window.innerHeight / 20 * 0.8), Math.floor(window.innerWidth / 20 * 0.8));
    snakeGame.start();
    // @ts-ignore
    window.snakeGame = snakeGame; // expose to the console
})();
