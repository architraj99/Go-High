(function() {
    "use strict";
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    if(!ctx.roundRect) {
        ctx.roundRect = function (x, y, w, h, r) {
            r = Math.min(r, w / 2, h / 2);
            this.beginPath();
            this.moveTo(x + r, y);
            this.lineTo(x + w -r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
        };
    }
    const scoreEl = document.getElementById("scoreEl");
    const highScoreEl = document.getElementById("highScoreEl");
    const startOverlay = document.getElementById("startOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");

    const finalScoreEl = document.getElementById("finalScoreEl");
    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 600;
    const GRAVITY = 0.45;
    const JUMP_FORCE = -12;
    const MOVE_SPEED = 5;

    const PLATFORM_MIN_WIDTH = 60;
    const PLATFORM_MAX_WIDTH = 120;
    const PLATFORM_HEIGHT = 14;
    const PLATFORM_GAP_MIN = 50;
    const PLATFORM_GAP_MAX = 120;
    const PLAYER_WIDTH = 36;
    const PLAYER_HEIGHT = 40;
    const CAMERA_LEAD = 0.4;

    let animationId = null;
    let player = null;
    let platforms = [];
    let cameraY = 0;
    let startCameraY = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem("go-high-score") || "0", 10);
    let gameRunning = false;
    let keys = { left: false, right: false};
    let time = 0;
})();