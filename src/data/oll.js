// ═══════════════════════════════════════════════════════════════════
// OLL · Orientation of the Last Layer · 57 种顶层定向情况
// 公式参考 algdb.net / Cubeskills 通用版本。
// scramble 由 invertAlg(alg) 自动推导（见 utils.js）。
// ═══════════════════════════════════════════════════════════════════

import { invertAlg } from '../utils'

const m = (id, num, group, alg, desc) => ({
  id, name: `OLL ${num}`, group, alg, scramble: invertAlg(alg), desc,
})

export const OLL_CASES = [
  // ── 点形 / 无边定向（最难一组，常需 9-12 步） ──
  m('OLL1',  1,  '点形',   "R U2 R2 F R F' U2 R' F R F'",            '点形：四边全错，对称'),
  m('OLL2',  2,  '点形',   "F R U R' U' F' f R U R' U' f'",          '点形：四边全错，另一变形'),
  m('OLL3',  3,  '点形',   "f R U R' U' f' U' F R U R' U' F'",       '点形：四边全错，棱黄在右后'),
  m('OLL4',  4,  '点形',   "f R U R' U' f' U F R U R' U' F'",        '点形：四边全错，棱黄在左后'),

  // ── 方块形 ──
  m('OLL5',  5,  '方块',   "r' U2 R U R' U r",                        '左方块'),
  m('OLL6',  6,  '方块',   "r U2 R' U' R U' r'",                      '右方块'),

  // ── 小闪电 ──
  m('OLL7',  7,  '小闪电', "r U R' U R U2 r'",                        '右指闪电'),
  m('OLL8',  8,  '小闪电', "r' U' R U' R' U2 r",                      '左指闪电'),

  // ── 鱼形 ──
  m('OLL9',  9,  '鱼形',   "R U R' U' R' F R2 U R' U' F'",            '右鱼（鱼头朝左前）'),
  m('OLL10', 10, '鱼形',   "R U R' U R' F R F' R U2 R'",              '右鱼（鱼头朝右前）'),

  // ── 闪电变形 ──
  m('OLL11', 11, '闪电',   "r U R' U R' F R F' R U2 r'",              '大闪电左'),
  m('OLL12', 12, '闪电',   "F R U R' U' F' U F R U R' U' F'",        '大闪电右'),

  // ── 马步形 ──
  m('OLL13', 13, '马步',   "F U R U' R2 F' R U R U' R'",              '马步 1'),
  m('OLL14', 14, '马步',   "R' F R U R' F' R F U' F'",                '马步 2'),
  m('OLL15', 15, '马步',   "r' U' r R' U' R U r' U r",                '马步 3'),
  m('OLL16', 16, '马步',   "r U r' R U R' U' r U' r'",                '马步 4'),

  // ── 无角定向（仅边） ──
  m('OLL17', 17, '点形角', "R U R' U R' F R F' U2 R' F R F'",         '点形 + 对角'),
  m('OLL18', 18, '点形角', "r U R' U R U2 r2 U' R U' R' U2 r",        '点形 + 邻角'),
  m('OLL19', 19, '点形角', "M U R U R' U' M' R' F R F'",              '点形 + 三角'),
  m('OLL20', 20, '点形角', "M U R U R' U' M2 U R U' r'",              '点形 + 全角不定向（H 状）'),

  // ── 全角已定向（仅需翻边的 7 种） ──
  m('OLL21', 21, '全角',   "R U2 R' U' R U R' U' R U' R'",            'H 形（对边对称）'),
  m('OLL22', 22, '全角',   "R U2 R2 U' R2 U' R2 U2 R",                'Pi 形'),
  m('OLL23', 23, '全角',   "R2 D' R U2 R' D R U2 R",                  'U 形头灯'),
  m('OLL24', 24, '全角',   "r U R' U' r' F R F'",                     'T 形十字'),
  m('OLL25', 25, '全角',   "F' r U R' U' r' F R",                     'L 形（牛角）'),
  m('OLL26', 26, '全角',   "R U2 R' U' R U' R'",                      'Anti-Sune（反小鱼）'),
  m('OLL27', 27, '全角',   "R U R' U R U2 R'",                        'Sune（小鱼）'),

  // ── 不对称形（Awkward） ──
  m('OLL28', 28, '不对称', "r U R' U' M U R U' R'",                   'Awkward 1'),
  m('OLL29', 29, '不对称', "M U R U R' U' R' F R F' M'",              'Awkward 2'),
  m('OLL30', 30, '不对称', "F R' F R2 U' R' U' R U R' F2",            'Awkward 3'),
  m('OLL41', 41, '不对称', "R U R' U R U2 R' F R U R' U' F'",         'Awkward + Sune'),
  m('OLL42', 42, '不对称', "R' U' R U' R' U2 R F R U R' U' F'",       'Awkward + Anti-Sune'),

  // ── P 形 ──
  m('OLL31', 31, 'P 形',    "R' U' F U R U' R' F' R",                  'P 1（朝右前）'),
  m('OLL32', 32, 'P 形',    "L U F' U' L' U L F L'",                   'P 2（朝左前）'),
  m('OLL43', 43, 'P 形',    "F' U' L' U L F",                          'P 3（短，朝左后）'),
  m('OLL44', 44, 'P 形',    "F U R U' R' F'",                          'P 4（短，朝右后）'),

  // ── T 形 ──
  m('OLL33', 33, 'T 形',    "R U R' U' R' F R F'",                     'T 1（Sledgehammer）'),
  m('OLL45', 45, 'T 形',    "F R U R' U' F'",                          'T 2（短）'),

  // ── C 形 ──
  m('OLL34', 34, 'C 形',    "R U R2 U' R' F R U R U' F'",              'C 1'),
  m('OLL46', 46, 'C 形',    "R' U' R' F R F' U R",                     'C 2'),

  // ── W 形 ──
  m('OLL36', 36, 'W 形',    "L' U' L U' L' U L U L F' L' F",           'W 1'),
  m('OLL38', 38, 'W 形',    "R U R' U R U' R' U' R' F R F'",           'W 2'),

  // ── 大闪电 ──
  m('OLL39', 39, '大闪电',  "L F' L' U' L U F U' L'",                  '大闪电左'),
  m('OLL40', 40, '大闪电',  "R' F R U R' U' F' U R",                   '大闪电右'),

  // ── 双鱼 / 大鱼 ──
  m('OLL35', 35, '鱼形',    "R U2 R2 F R F' R U2 R'",                  '大鱼左'),
  m('OLL37', 37, '鱼形',    "F R' F' R U R U' R'",                     '大鱼右'),

  // ── L 形（无角定向） ──
  m('OLL47', 47, 'L 形',    "F' L' U' L U L' U' L U F",                'L 1'),
  m('OLL48', 48, 'L 形',    "F R U R' U' R U R' U' F'",                'L 2'),
  m('OLL49', 49, 'L 形',    "r U' r2 U r2 U r2 U' r",                  'L 3（slice）'),
  m('OLL50', 50, 'L 形',    "r' U r2 U' r2 U' r2 U r'",                'L 4（slice 镜像）'),

  // ── I 形 ──
  m('OLL51', 51, 'I 形',    "F U R U' R' U R U' R' F'",                'I 1（横条）'),
  m('OLL52', 52, 'I 形',    "R' F' U' F U' R U R' U R",                'I 2'),
  m('OLL55', 55, 'I 形',    "R U2 R2 U' R U' R' U2 F R U R' U' F'",    'I 3（竖条）'),
  m('OLL56', 56, 'I 形',    "r U r' U R U' R' U R U' R' r U' r'",      'I 4'),

  // ── 全边定向不对称 ──
  m('OLL53', 53, '其他',    "r' U' R U' R' U R U' R' U2 r",            '53'),
  m('OLL54', 54, '其他',    "r U R' U R U' R' U R U2 r'",              '54'),

  // ── 最后一个：经典 OLL 57 ──
  m('OLL57', 57, '其他',    "R U R' U' M' U R U' r'",                  '十字 + 头灯（最简单）'),
]
