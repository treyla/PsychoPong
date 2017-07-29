class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set length(value) {
        const factor = value / this.length;
        this.x *= factor;
        this.y *= factor;
    }
}

class Rectangle {
    constructor(x = 0, y = 0) {
        this.position = new Vector(0, 0);
        this.size = new Vector(x, y);
        // this.color = color === null ? '#FFF' : color;
    }

    get left() {
        return this.position.x - this.size.x / 2;
    }

    get right() {
        return this.position.x + this.size.x / 2;
    }

    get top() {
        return this.position.y - this.size.y / 2;
    }

    get bottom() {
        return this.position.y + this.size.y / 2;
    }
}

class Ball extends Rectangle {
    constructor() {
        super(10, 10);
        this.velocity = new Vector;
    }
}

class Player extends Rectangle {
    constructor() {
        super(20, 100);
        this.velocity = new Vector;
        this.score = 0;
        this._lastPosition = new Vector;
    }

    update(deltaTime) {
        this.velocity.y = (this.position.y - this._lastPosition.y) / deltaTime;
        this._lastPosition.y = this.position.y;
    }
}

class Pong {
    constructor(canvas) {

        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        this.initialAcceleration = 250;

        this.ball = new Ball;

        this.players = [
            new Player,
            new Player
        ];

        this.players[0].position.x = 40;
        this.players[1].position.x = this._canvas.width - 40;
        this.players.forEach(player => {
            player.position.y = this._canvas.height / 2;
        });

        let lastTime;
        this._renderFrameCallback = (millis) => {
            if (lastTime) {
                const diff = millis - lastTime;
                this.update(diff / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(this._renderFrameCallback);
        };

        this.CHAR_PIXEL = 10;
        this.CHARS = [
            '111101101101111', //0
            '010010010010010', //1
            '111001111100111', //2
            '111001111001111', //3
            '101101111001001', //4
            '111100111001111', //5
            '111100111101111', //6
            '111001001010100', //7
            '111101111101111', //8
            '111101111001111', //9
        ].map(element => {
            const canvas = document.createElement('canvas');
            canvas.height = this.CHAR_PIXEL * 5;
            canvas.width = this.CHAR_PIXEL * 3;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            element.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect(
                        (i % 3) * this.CHAR_PIXEL,
                        (i / 3 | 0) * this.CHAR_PIXEL,
                        this.CHAR_PIXEL,
                        this.CHAR_PIXEL);
                }
            });
            return canvas;
        });

        this.reset();

    }

    clear() {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = '#cccccc';
        this._context.fillRect(this._canvas.width / 2 - 2.5, 0, 5, this._canvas.height); //line
    }

    collide(player, ball) {
        if (player.left < ball.right && player.right > ball.left && player.top < ball.bottom && player.bottom > ball.top) {
            ball.velocity.x = -ball.velocity.x * 1.05;
            const ballAcceleration = ball.velocity.length;
            ball.velocity.y += player.velocity.y * .2;
            ball.velocity.length = ballAcceleration;
        }
    }

    draw() {
        this.clear();

        this.drawRectangle(this.ball, '#80ff00');
        this.players.forEach(player => this.drawRectangle(player, '#8000ff'));

        this.drawScore();
    }

    drawRectangle(rectangle, color) {
        this._context.fillStyle = color;
        this._context.fillRect(rectangle.left, rectangle.top, rectangle.size.x, rectangle.size.y);
    }

    drawScore() {
        const align = this._canvas.width / 3;
        const charWidth = this.CHAR_PIXEL * 4; //1 pixel extra space per CHAR
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (charWidth * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, position) => {
                this._context.drawImage(this.CHARS[char | 0], offset + position * charWidth, 20); // pipe does convert to integer
            })
        })
    }

    play() {
        const ball = this.ball;
        if (ball.velocity.x === 0 && ball.velocity.y === 0) {
            ball.velocity.x = 200 * (Math.random() > .5 ? 1 : -1);
            ball.velocity.y = 200 * (Math.random() * 2 - 1);
            ball.velocity.length = this.initialAcceleration;
        }
    }

    reset() {
        const ball = this.ball;
        ball.velocity.x = 0;
        ball.velocity.y = 0;
        ball.position.x = this._canvas.width / 2;
        ball.position.y = this._canvas.height / 2;
    }

    start() {
        requestAnimationFrame(this._renderFrameCallback);
    }

    update(deltaTime) {

        const canvas = this._canvas;
        const ball = this.ball;

        ball.position.x += ball.velocity.x * deltaTime;
        ball.position.y += ball.velocity.y * deltaTime;

        if (ball.right < 0 || ball.left > canvas.width) {
            let playerId;
            if (ball.velocity.x < 0) {
                playerId = 1;
            } else {
                playerId = 0;
            }
            this.players[playerId].score++;
            this.reset();
        }

        if (ball.velocity.y < 0 && ball.top < 0 || ball.velocity.y > 0 && ball.bottom > canvas.height) {
            ball.velocity.y = -ball.velocity.y;
        }

        this.players[1].position.y = ball.position.y;

        this.players.forEach(player => {
            player.update(deltaTime);
            this.collide(player, ball);
        });

        this.draw();

    }
}

const canvas = document.getElementById('pong');
const pong = new Pong(canvas);

canvas.addEventListener('click', () => pong.play());

canvas.addEventListener('mousemove', event => {
    const scale = event.offsetY / event.target.getBoundingClientRect().height;
    pong.players[0].position.y = canvas.height * scale;
});

pong.start();