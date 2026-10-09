# 第 3 阶段：语音、词汇话题、交际用语

格式：id | 完整标题 | 图上短名 | 模块 | 年级 | 考频 | 前置

## A 组 语音 → data/phonics.js
- p-alphabet | 26 个字母与常见缩写 | 26 个字母 | phonics | 4 | 1 | —
- p-letter-sounds | 自然拼读：辅音字母的发音 | 辅音发音 | phonics | 4 | 1 | p-alphabet
- p-short-vowels | 短元音与闭音节 | 短元音 | phonics | 4 | 1 | p-letter-sounds
- p-long-vowels | 长元音与“不发音的 e” | 长元音 | phonics | 5 | 1 | p-short-vowels
- p-vowel-teams | 元音字母组合 ee/ea/ai/oa/oo/ar/er... | 元音组合 | phonics | 5 | 1 | p-long-vowels
- p-consonant-blends | 辅音字母组合 sh/ch/th/ph/ck/ng... | 辅音组合 | phonics | 5 | 1 | p-letter-sounds
- p-s-ed-sounds | -s/-es 与 -ed 的读音 | -s/-ed 读音 | phonics | 6 | 1 | p-consonant-blends, g-plural, g-past-simple
- p-ipa | 国际音标 | 国际音标 | phonics | 7 | 2 | p-vowel-teams, p-consonant-blends
- p-stress-intonation | 重音、语调、连读与失去爆破 | 重音与语调 | phonics | 7 | 2 | p-ipa

## B 组 词汇（上）→ data/vocab-a.js
- v-numbers-time | 数字、时间、星期与月份 | 数字与日期词 | vocab | 4 | 2 | g-numeral
- v-family-people | 家庭成员与职业 | 家庭与职业 | vocab | 4 | 2 | —
- v-school | 学校、科目与文具 | 学校生活 | vocab | 4 | 2 | —
- v-body-health | 身体部位与疾病 | 身体与健康 | vocab | 4 | 2 | —
- v-food | 食物、饮料与餐具 | 食物饮料 | vocab | 4 | 2 | —
- v-clothes-colors | 颜色、衣物与购物 | 颜色与衣物 | vocab | 4 | 2 | —
- v-animals-nature | 动物、植物与自然 | 动物与自然 | vocab | 5 | 2 | g-plural
- v-weather-seasons | 天气与季节 | 天气季节 | vocab | 5 | 2 | —
- v-home-city | 家居、城市场所与交通标志 | 家居与城市 | vocab | 5 | 2 | g-prep-place
- v-hobbies-sports | 爱好、运动与娱乐 | 爱好与运动 | vocab | 5 | 2 | —

## C 组 词汇（下）→ data/vocab-b.js
- v-travel-transport | 交通出行与旅游 | 交通与旅行 | vocab | 6 | 2 | v-home-city
- v-high-freq-verbs | 高频动词辨析 say/speak/talk/tell 等 | 高频动词辨析 | vocab | 7 | 3 | —
- v-festivals-culture | 节日、文化与家乡福建 | 节日与文化 | vocab | 7 | 2 | v-numbers-time
- v-feelings-personality | 情感与性格 | 情感与性格 | vocab | 7 | 3 | g-adj-adv
- v-confusables | 易混词辨析 | 易混词辨析 | vocab | 8 | 3 | v-high-freq-verbs
- v-environment | 环境保护与自然灾害 | 环境保护 | vocab | 8 | 3 | v-weather-seasons, v-animals-nature
- v-science-tech | 科技、发明与网络 | 科技与发明 | vocab | 8 | 2 | g-word-form
- v-life-growth | 成长、梦想、志愿与人际 | 成长与梦想 | vocab | 9 | 3 | v-feelings-personality

## D 组 交际用语 → data/talk.js
- t-greetings | 问候、介绍与告别 | 问候与介绍 | talk | 4 | 2 | g-be
- t-thanks-sorry | 感谢、道歉与回应 | 感谢与道歉 | talk | 4 | 3 | t-greetings
- t-ask-way | 问路与指路 | 问路指路 | talk | 5 | 2 | g-imperative, g-prep-place
- t-shopping | 购物 | 购物 | talk | 6 | 2 | g-how-q
- t-phone | 打电话 | 打电话 | talk | 6 | 2 | t-greetings
- t-doctor | 看病与健康建议 | 看病 | talk | 7 | 2 | g-modal, v-body-health
- t-invite-suggest | 邀请、建议与回应 | 邀请与建议 | talk | 6 | 3 | g-would-like
- t-request | 请求、许可与回应 | 请求与许可 | talk | 7 | 3 | g-modal
- t-opinions | 询问看法、同意与反对 | 观点与看法 | talk | 7 | 2 | g-wh-q
- t-wishes | 祝愿、祝贺与节日问候 | 祝愿与祝贺 | talk | 7 | 3 | t-thanks-sorry
- t-feelings | 表达情感与安慰鼓励 | 情感回应 | talk | 8 | 3 | t-wishes, g-exclamation
