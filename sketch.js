let table;
let allQuestions = [];
let quizQuestions = [];
let current = 0;
let score = 0;
let state = "start"; // start, question, result
let confetti = [];
let lightning = [];

let rawLines; // 原始檔案每行文字

function preload() {
  // 讀入 CSV 原始行（相對路徑到你的檔案）
  rawLines = loadStrings("questions.csv/questions.csv");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Microsoft JhengHei");
  processData();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(30, 40, 70);

  if (state === "start") drawStart();
  else if (state === "question") drawQuestion();
  else if (state === "result") drawResult();

  // 根據分數顯示特效
  if (state === "result") {
    if (score === quizQuestions.length) {
      drawConfetti();
    } else if (score * 20 < 50) {
      drawLightning();
    }
  }
}

// 將 CSV 轉成題目陣列 (處理換行、去掉中括號)
function processData() {
  allQuestions = [];
  if (!rawLines || rawLines.length === 0) {
    console.error("questions.csv 讀取失敗或為空");
    return;
  }
  for (let i = 0; i < rawLines.length; i++) {
    let line = (rawLines[i] || "").replace(/\r/g, "").trim();
    if (line === "") continue;
    let commas = (line.match(/,/g) || []).length;
    // 若逗號小於 5，向下合併下一行（容錯被換行切割的欄位）
    while (commas < 5 && i + 1 < rawLines.length) {
      i++;
      line += " " + (rawLines[i] || "").replace(/\r/g, "").trim();
      commas = (line.match(/,/g) || []).length;
    }
    let parts = line.split(",");
    if (parts.length < 6) {
      console.warn("跳過不完整的行：", line);
      continue;
    }
    // 取前 6 欄並 trim
    let get = (idx) => (parts[idx] || "").replace(/\r/g, "").replace(/\n/g, "").trim();
    // 若題目有用中括號包起來，移除左右中括號
    let rawQ = get(0);
    let q = rawQ.replace(/^\[|\]$/g, "").trim();
    let a = get(1);
    let b = get(2);
    let c = get(3);
    let d = get(4);
    let correctRaw = get(5);
    let correct = correctRaw.length > 0 ? correctRaw.charAt(0).toUpperCase() : "";
    allQuestions.push({ q, a, b, c, d, correct });
  }
  console.log("載入題目數：", allQuestions.length);
  // 顯示前幾題確認（除錯用）
  for (let i = 0; i < min(10, allQuestions.length); i++) {
    console.log(i+1, allQuestions[i].q, "->", allQuestions[i].correct);
  }
}

function drawStart() {
  fill(255);
  textAlign(CENTER, CENTER);
  let titleSize = min(64, width * 0.06);
  textSize(titleSize);
  text("p5.js 題庫測驗", width / 2, height * 0.28);
  textSize(min(24, width * 0.02));
  text("從題庫中隨機抽 5 題，每題 20 分", width / 2, height * 0.36);
  let bw = min(300, width * 0.25);
  let bh = min(70, height * 0.08);
  drawButton(width/2 - bw/2, height*0.5, bw, bh, "開始測驗");
}

function drawQuestion() {
  let q = quizQuestions[current];
  if (!q) {
    state = "start";
    return;
  }
  fill(255);
  textAlign(LEFT, TOP);
  textSize(min(22, width * 0.02));
  text(`第 ${current + 1} 題 / ${quizQuestions.length} 題`, width * 0.05, height * 0.05);
  textSize(min(28, width * 0.028));
  let qx = width * 0.05;
  let qy = height * 0.12;
  let qw = width * 0.9;
  text(q.q, qx, qy, qw, height * 0.25);

  // 選項位置使用相對值
  let optW = width * 0.9;
  let optX = width * 0.05;
  let startY = height * 0.45;
  let gap = min(90, height * 0.11);
  let opts = [
    {x: optX, y: startY + 0 * gap, w: optW, h: gap * 0.7, t: "A. " + q.a, v: "A"},
    {x: optX, y: startY + 1 * gap, w: optW, h: gap * 0.7, t: "B. " + q.b, v: "B"},
    {x: optX, y: startY + 2 * gap, w: optW, h: gap * 0.7, t: "C. " + q.c, v: "C"},
    {x: optX, y: startY + 3 * gap, w: optW, h: gap * 0.7, t: "D. " + q.d, v: "D"}
  ];

  for (let o of opts) {
    drawButton(o.x, o.y, o.w, o.h, o.t);
  }
}

function drawResult() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(48, width * 0.05));
  text("測驗結束！", width / 2, height * 0.18);
  textSize(min(36, width * 0.04));
  text(`你的得分：${score * 20} 分`, width / 2, height * 0.3);
  textSize(min(22, width * 0.02));
  text("答對題目數：" + score + " / " + quizQuestions.length, width / 2, height * 0.4);

  // 低於 50 分顯示訊息
  if (score * 20 < 50) {
    fill(255, 200, 0);
    textSize(min(28, width * 0.03));
    text("你都沒在上課!!!", width / 2, height * 0.48);
  }

  let bw = min(300, width * 0.25);
  let bh = min(70, height * 0.08);
  drawButton(width/2 - bw/2, height*0.65, bw, bh, "重新開始");
}

function drawButton(x, y, w, h, label) {
  let hover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  noStroke();
  fill(hover ? "#66aaff" : "#3355aa");
  rect(x, y, w, h, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(20, width * 0.02));
  text(label, x + w / 2, y + h / 2);
}

function mousePressed() {
  if (state === "start") {
    let bw = min(300, width * 0.25);
    let bh = min(70, height * 0.08);
    if (isOver(width/2 - bw/2, height*0.5, bw, bh)) startQuiz();
  } else if (state === "question") {
    // 與 drawQuestion 使用相同的相對位置
    let optW = width * 0.9;
    let optX = width * 0.05;
    let startY = height * 0.45;
    let gap = min(90, height * 0.11);
    let opts = [
      {x: optX, y: startY + 0 * gap, w: optW, h: gap * 0.7, v: "A"},
      {x: optX, y: startY + 1 * gap, w: optW, h: gap * 0.7, v: "B"},
      {x: optX, y: startY + 2 * gap, w: optW, h: gap * 0.7, v: "C"},
      {x: optX, y: startY + 3 * gap, w: optW, h: gap * 0.7, v: "D"}
    ];
    let q = quizQuestions[current];
    for (let o of opts) {
      if (isOver(o.x, o.y, o.w, o.h)) {
        console.log("選擇：", o.v, " 正確：", q.correct, " 題目：", q.q);
        if (o.v === q.correct) {
          score++;
          console.log("答對！目前答對數：", score);
        } else {
          console.log("答錯。");
        }
        current++;
        if (current >= quizQuestions.length) {
          state = "result";
          // 根據成績建立特效
          if (score === quizQuestions.length) {
            createConfetti();
          } else if (score * 20 < 50) {
            createLightning();
          }
        }
        break;
      }
    }
  } else if (state === "result") {
    let bw = min(300, width * 0.25);
    let bh = min(70, height * 0.08);
    if (isOver(width/2 - bw/2, height*0.65, bw, bh)) {
      startQuiz();
    }
  }
}

function isOver(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function startQuiz() {
  if (allQuestions.length < 5) {
    console.error("題庫不足 5 題，無法開始測驗");
    alert("題庫不足 5 題，無法開始測驗");
    return;
  }
  score = 0;
  current = 0;
  quizQuestions = shuffle(allQuestions).slice(0, 5).map(q => ({ ...q }));
  state = "question";
  confetti = [];
  lightning = [];
  console.log("新測驗題目：");
  quizQuestions.forEach((t, i) => console.log(i+1, t.q, "->", t.correct));
}

function createConfetti() {
  confetti = [];
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: random(width),
      y: random(-200, 0),
      vy: random(2, 6),
      c: color(random(255), random(255), random(255))
    });
  }
}

function drawConfetti() {
  for (let c of confetti) {
    fill(c.c);
    noStroke();
    ellipse(c.x, c.y, 8);
    c.y += c.vy;
    if (c.y > height) c.y = random(-100, 0);
  }
}

// 閃電特效：建立與繪製
function createLightning() {
  lightning = [];
  let bolts = 3;
  for (let i = 0; i < bolts; i++) {
    let x = random(width * 0.2, width * 0.8);
    let segs = [];
    let segments = 6;
    for (let j = 0; j <= segments; j++) {
      let px = x + random(-80, 80) * (j / segments);
      let py = j * (height * 0.12) + random(-10, 10);
      segs.push({ x: px, y: py });
    }
    lightning.push({ segs, alpha: 255, life: random(40, 90) });
  }
}

function drawLightning() {
  // 背景短暫閃白
  push();
  noStroke();
  fill(255, 255, 255, 30);
  rect(0, 0, width, height);
  pop();

  for (let i = lightning.length - 1; i >= 0; i--) {
    let b = lightning[i];
    stroke(255, 240, 60, b.alpha);
    strokeWeight(6);
    noFill();
    beginShape();
    for (let p of b.segs) vertex(p.x, p.y);
    endShape();
    // 內層亮線
    stroke(255, 255, 200, b.alpha);
    strokeWeight(3);
    beginShape();
    for (let p of b.segs) vertex(p.x + random(-2,2), p.y + random(-2,2));
    endShape();

    b.life--;
    b.alpha = map(b.life, 0, 90, 0, 255);
    if (b.life <= 0) lightning.splice(i, 1);
  }
}