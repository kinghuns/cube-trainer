# CLAUDE.md — cube-trainer

三阶魔方训练器：层先法（LBL）教学 + CFOP 公式训练 + 魔方状态模拟器。
React 19 + Vite 8，纯前端、纯静态，无后端、无外部运行时依赖。

## 命令

```bash
npm run dev       # 开发服务器（vite，默认 --host 0.0.0.0 --port 8150）
npm run build     # 产物输出到 dist/（纯静态）
npm run preview   # 本地预览构建产物
npm run lint      # eslint
```

部署：`dist/` 直接丢到任意静态服务器即可。部署到子路径时需在 `vite.config.js` 设 `base`。

## 目录结构

```
src/
├── main.jsx                 入口，挂载 CubeTrainer
├── index.css                全局暗色主题（CSS 变量 --bg/--accent/...）
├── data/                    所有公式数据（纯数据，无逻辑）
│   ├── index.js             barrel：导出 LAYER_BY_LAYER 和 CFOP_DATA
│   ├── lbl.js               层先法 7 步（带教学字段，scramble 手写）
│   ├── oll.js               57 OLL
│   ├── pll.js               21 PLL
│   └── f2l.js               41 F2L
├── cube/
│   └── state.js             ★ 魔方状态引擎（纯函数，零依赖）
├── components/
│   ├── CubeTrainer.jsx      主壳：LBL/CFOP 标签页 + 进度 + 重置
│   ├── LBLStep.jsx          层先法单步（学习/练习视图 + 计时）
│   ├── CFOPTrainer.jsx      CFOP case 训练（下拉选择 + 抽测流程）
│   ├── CaseSelect.jsx       可搜索下拉框（autocomplete combobox）
│   ├── AlgPlayer.jsx        魔方视图 + 公式逐步播放控制
│   ├── CubeView2D.jsx       十字展开图渲染（CSS Grid）
│   ├── MoveChip.jsx         单个动作彩色芯片
│   └── AlgRow.jsx           一行 MoveChip
├── moveInfo.js              动作 → 颜色 + 中文助记
└── utils.js                 storage / speak / parseMoves / invertAlg / normalizeAlg / randomScramble
```

## 核心约定（改代码前必读）

### 1. 魔方状态引擎 `src/cube/state.js`
- 状态 = 长度 54 的颜色字母数组，按 **URFDLB** 顺序，每面 9 个（reading order）。
  下标：`U:0-8  R:9-17  F:18-26  D:27-35  L:36-44  B:45-53`。
- 动作置换表用**3D 几何法**生成（每贴纸有 3D 坐标+法向量，转动=整数旋转矩阵），
  **不要手写 cycle 数组**——那是上一版的 bug 来源。
- `applyMove` **大小写敏感**：`d` 是宽层、`D` 是面转、`x/y/z` 是转体、`M/E/S` 是中层。
- 支持记号：6 面转、中层 `M E S`、宽层 `r l u d f b`、转体 `x y z`，各带 `' / 2` 后缀。
  不认识的记号会被**安全跳过**（返回原状态）。
- API：`solvedState()` `applyMove(state, m)` `applyAlg(state, alg)` `isSolved(state)`，
  以及 `FACES`、`COLORS`。

⚠️ **历史 bug**：引擎曾只支持 6 面转，跳过 M/x/y，导致 PLL 打乱被"架空"显示成复原态。
新增动作类型时，务必保证 `state.js` 能识别，否则相关公式的模拟会出错。

### 2. CFOP 数据：scramble 自动派生，不手写
- `oll/pll/f2l.js` 里每条 case 只写 `alg`，**scramble 由 `invertAlg(alg)` 自动生成**。
- 原理：`alg` 的逆序反向 = 把复原态变成该 case 的打乱态。
  所以 `applyAlg(applyAlg(solved, scramble), alg)` 必然回到复原态。
- helper：`m(id, ...)` 内部调用 `invertAlg`。新增 case 照抄现有写法即可。
- 公式可带视觉分组括号 `(R U R')`，`normalizeAlg` 会自动去除。
- LBL 的 scramble 是**手写**的练习打乱（不是 alg 的逆），因为 LBL 公式是情景反复使用，不是一次性解法。

### 3. 公式正确性自检
改完公式数据后，用这个不变量验证：
**每条 CFOP case 必须满足 `applyAlg(applyAlg(solved, scramble), alg) === solved`，
且打乱态本身 ≠ 复原态。** 历史上写过一次性临时脚本 `test-cube.mjs` 跑全量体检（用完即删）。
`AlgPlayer` 本身也是天然校验器：播完不还原 = 公式错。

### 4. 进度持久化
- localStorage key：`cube_trainer_v3`（见 utils.js）。改数据结构时考虑 key 版本号。
- LBL 进度字段 `{ reps, mastered, best }`，CFOP 用 `{ attempts, mastered, best }`。

### 5. 样式
- 全部用内联 style + CSS 变量（`var(--accent)` 等，定义在 index.css `:root`）。
- 字体：Space Mono（等宽，公式/数字）+ Noto Sans SC（中文），由 index.html 的 Google Fonts 引入。
  国内部署若无法访问 Google，字体会回退。

## 数据准确性说明
- PLL 21 条：公式与命名均为社区标准，可信。
- OLL 57 条：编号严格按标准 1-57，公式选用通用短版，个别 case 有多种流行写法。
- F2L 41 条：算法经引擎验证可正确还原，但**编号不严格对应 Fridrich 原始编号**。
- 严肃训练建议对照 algdb.net 复核。
