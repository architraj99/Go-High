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

    function setPixelRatio() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
        ctx.scale(dpr, dpr);
    }

    function createPlatform(x, y, width, type) {
        return {
            x, 
            y,
            width, 
            height: PLATFORM_HEIGHT,
            type: type || "normal",
            moveDir: type === "moving" ? (Math.random() > 0.5 ? 1 : -1) : 0,
            moveRange: type === "moving" ? 40 + Math.random() * 40 : 0,
            startX: x,
        };
    }

    function initPlatforms() {
        platforms = [];
        let y = CANVAS_HEIGHT - 80;

        for(let i = 0; i < 10; i++) {
            const width = PLATFORM_MIN_WIDTH + Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH);
            let x = Math.random() * (CANVAS_WIDTH - width);
            let type = "normal";
            if(i === 0) {
                x = (CANVAS_WIDTH - width) / 2;
            }
            else {
                const typeRand = Math.random();
                if(typeRand < 0.15) type = "break";
                else if(typeRand < 0.35) type = "moving";  
            }
            platforms.push(createPlatform(x, y, width, type));
            y -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
            
        }
    }
})();