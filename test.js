function guessBigSmall() {
    return Math.random() < 0.5 ? "Big" : "Small"; // 50% 概率返回 "Big" 或 "Small"
}

// 计算凯利公式下注比例（修正计算逻辑）
function kellyCriterion(winRate, odds) {
    let kellyFraction = (winRate * (odds + 1) - 1) / odds;
    return Math.max(0.01, kellyFraction); // 防止出现负数下注，至少下注 1% 余额
}

function advancedStrategy({
    initialBet = 5, // 初始下注额
    maxRounds = 1000, // 每天最多下注轮数
    maxLossStreak = 5, // 最高连输次数
    stopLoss = 200, // 低于 200 停止
    stopWin = 2000, // 达到 2000 停止
    odds = 1, // 赔率 (1:1)
}) {
    let balance = 1000; // 初始资金
    let bet = initialBet;
    let lossStreak = 0;
    let history = []; // 记录开奖历史
    let lastResult = null;
    let consecutiveCount = 0;

    for (let round = 1; round <= maxRounds; round++) {
        let result = guessBigSmall();
        history.push(result);

        // 计算是否存在连开
        if (result === lastResult) {
            consecutiveCount++;
        } else {
            consecutiveCount = 1;
        }
        lastResult = result;

        // **趋势 & 反趋势分析**
        let guess;
        if (consecutiveCount >= 6) {
            guess = result === "Big" ? "Small" : "Big"; // 反向下注
        } else {
            guess = guessBigSmall(); // 随机下注
        }

        // **动态下注策略**
        let winRate = 0.5; // 默认 50% 预测胜率
        let kellyBetFraction = kellyCriterion(winRate, odds); // 计算凯利下注比例
        let dynamicBet = Math.max(bet, balance * kellyBetFraction); // **确保下注值不为 0**

        // 防止下注金额超过当前余额
        dynamicBet = Math.min(dynamicBet, balance);

        console.log(
            `Round ${round}: Guess ${guess}, Result ${result}, Bet ${dynamicBet.toFixed(2)}, Balance ${balance}`
        );

        if (guess === result) {
            balance += dynamicBet;
            bet = initialBet; // 重新回到初始下注
            lossStreak = 0;
        } else {
            balance -= dynamicBet;
            lossStreak++;

            // **止损逻辑**：如果资金低于 stopLoss，停止下注
            if (balance <= stopLoss) {
                console.log("🚨 止损触发，停止下注！");
                break;
            }

            // **止盈逻辑**：如果资金高于 stopWin，停止下注
            if (balance >= stopWin) {
                console.log("💰 达到目标盈利，停止下注！");
                break;
            }

            // **倍投策略**: 不采用无限倍投，而是根据凯利公式调整
            if (lossStreak >= maxLossStreak) {
                bet = initialBet;
                lossStreak = 0;
                console.log("⚠️ 超过最大倍投次数，回到初始投注！");
            } else {
                bet = Math.min(dynamicBet * 2, balance * 0.2); // 限制最大下注额（≤ 资金的 20%）
            }
        }

        if (balance <= 0) {
            console.log("❌ 破产了！");
            break;
        }
    }

    console.log(`🔚 最终余额: ${balance}`);
    console.log(`📜 开奖历史: ${history.join(", ")}`);
}

// 运行优化策略
advancedStrategy({
    initialBet: 5, // 初始下注
    maxRounds: 1000, // 最多下注 1000 局
    maxLossStreak: 5, // 最高倍投 5 次
    stopLoss: 200, // 低于 200 停止
    stopWin: 2000, // 目标 2000 停止
    odds: 1, // 赔率 1:1
});
