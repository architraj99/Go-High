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

    function addPlatformsAbove(topY) {
        let lastY = platforms.length ? Math.min(...platforms.map((p) => p.y)) : topY;
        
        while(lastY > topY - CANVAS_HEIGHT - 200) {
            lastY -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
            const width = PLATFORM_MIN_WIDTH + Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH);
            const x = Math.random() * (CANVAS_WIDTH - width);
            const typeRand = Math.random();
            let type = "normal";
            if(typeRand < 0.12) type = "break";
            else if(typeRand < 0.32) type = "moving";
            platforms.push(createPlatform(x, lastY, width, type));
        }
    }

    function resetGame() {
        cameraY = 0;
        score = 0;
        time = 0;
        keys.left = false;
        keys.right = false;
        initPlatforms();
        const firstPlatform = platforms[0];
        player = {
            x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
            y: firstPlatform.y - PLAYER_HEIGHT - 2,
            vx: 0,
            vy: 0,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
        };
        startCameraY = player.y - CANVAS_HEIGHT * CAMERA_LEAD;
        gameRunning = true;
        scoreEl.textContent = "0";
        highScoreEl.textContent = highScore;
    }

    function drawBackdrop() {

        ctx.fillStyle = "#c8ddd5";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.strokeStyle = "#b5cec5";
        ctx.lineWidth = 1;
        const offset = ((-cameraY * 0.2) % 80 + 80) % 80;

       for(let y = offset; y < CANVAS_HEIGHT; y += 80) {
            ctx.beginPath();
            ctx.moveTo(16, y);
            ctx.lineTo(CANVAS_WIDTH - 16, y);
            ctx.stroke();
        }

        ctx.strokeStyle = "#9fbdb2";
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(16, CANVAS_HEIGHT);
        ctx.moveTo(CANVAS_WIDTH - 16, 0);
        ctx.lineTo(CANVAS_WIDTH - 16, CANVAS_HEIGHT);
        ctx.stroke();

        ctx.fillStyle = "#5f776f";
        ctx.font = '10px "IBM Plex Mono"';
        ctx.textAlign = "right";

        for (let y = offset; y < CANVAS_HEIGHT; y += 80) {
            ctx.fillText("+", CANVAS_WIDTH - 18, y - 5);
            ctx.beginPath();
            ctx.moveTo(12, y);
            ctx.lineTo(21, y);
            ctx.moveTo(CANVAS_WIDTH - 21, y);
            ctx.lineTo(CANVAS_WIDTH - 12, y);
            ctx.stroke();
        }
        ctx.fillStyle = "#79978c";
        ctx.textAlign = "left";
        ctx.font = '9px "IBM Plex Mono"';
        ctx.fillText("UP", 24, 24);
        ctx.strokeStyle = "#86a89b";
        ctx.beginPath();
        ctx.moveTo(24, 31);
        ctx.lineTo(42, 31);
        ctx.stroke();
    }

    function drawPlayer() {

        const x = player.x;
        const y = player.y - cameraY;
        if (y < -PLAYER_HEIGHT - 20 || y > CANVAS_HEIGHT + 20) return;
        ctx.save();
        ctx.translate(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT / 2);

        if (keys.left) ctx.scale(-1, 1);
        ctx.translate(-(x + PLAYER_WIDTH / 2), -(y + PLAYER_HEIGHT / 2));
        ctx.fillStyle = "#202321";

        ctx.beginPath();
        ctx.roundRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, 6);
        ctx.fill();

        ctx.fillStyle = "#f4f1e8";
        ctx.beginPath();
        ctx.arc(x + 12, y + 14, 6, 0, Math.PI * 2);
        ctx.arc(x + PLAYER_WIDTH - 12, y + 14, 6, 0, Math.PI * 2);

        ctx.fill();
        ctx.fillStyle = "#202321";
        ctx.beginPath();
        ctx.arc(x + 12, y + 14, 3, 0, Math.PI * 2);
        ctx.arc(x + PLAYER_WIDTH - 12, y + 14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d7b45c";
        ctx.fillRect(x + 6, y + PLAYER_HEIGHT - 8, PLAYER_WIDTH - 12, 3);
        ctx.restore();
    }

    function drawPlatform(p) {
        const y = p.y - cameraY;

        if(y < -PLATFORM_HEIGHT - 20 || y > CANVAS_HEIGHT + 50) return;
        const x = p.x;
        const w = p.width;
        const h = p.height;

        if (p.type === "normal") {
            ctx.fillStyle = "#547e61";
            ctx.strokeStyle = "#355840";
        } 
        else if (p.type === "break") {
            ctx.fillStyle = "#b58c52";
            ctx.strokeStyle = "#775d38";
        } 
        else {
            ctx.fillStyle = "#718a95";
            ctx.strokeStyle = "#445b65";
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(244, 241, 232, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 7, y + 4);
        ctx.lineTo(x + w - 7, y + 4);
        ctx.stroke();
    }

    function gameOver() {
        gameRunning = false;
        if(animationId) cancelAnimationFrame(animationId);
        finalScoreEl.textContent = score;
        gameOverOverlay.classList.remove("hidden");
    }

    function isLeftKey(key) {
        return key === "ArrowLeft" || key === "a" || key === "A";
    }
    function isRightKey(key) {
        return key === "ArrowRight" || key === "d" || key === "D";
    }
    window.addEventListener("blur", function() {
        keys.left = false;
        keys.right = false;
    });
})();