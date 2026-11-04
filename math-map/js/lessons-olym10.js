// 奥数拓展 第 10 批：七年级竞赛入门
(function () {
  const fr = window.fr;
  const X = '<i>x</i>', Y = '<i>y</i>', A_ = '<i>a</i>', B_ = '<i>b</i>';
  // 题目配图（内联 SVG，由脚本按角度精确生成；只标已知量）
  const FIG = {
    PX1: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="165.7,25 94.3,75 153.9,125" class="fnone sstrong round"/><path d="M151.7,25 A14,14 0 0 0 154.2,33" class="fnone s1"/><text x="118.9" y="44.3" text-anchor="middle">35°</text><path d="M139.9,125 A14,14 0 0 1 143.2,116" class="fnone s1"/><text x="109.4" y="113.3" text-anchor="middle">40°</text><text x="165.7" y="18" text-anchor="middle" class="lbl">B</text><text x="153.9" y="142" text-anchor="middle" class="lbl">D</text><text x="81.3" y="79.4" text-anchor="middle" class="lbl">E</text></svg>',
    PX2: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="109,25 151,75 122.1,125" class="fnone sstrong round"/><path d="M95,25 A14,14 0 0 0 118,35.7" class="fnone s1"/><text x="96" y="57.5" text-anchor="middle">130°</text><path d="M108.1,125 A14,14 0 0 1 129.1,112.9" class="fnone s1"/><text x="106.4" y="102.3" text-anchor="middle">120°</text><text x="109" y="18" text-anchor="middle" class="lbl">B</text><text x="122.1" y="142" text-anchor="middle" class="lbl">D</text><text x="163.9" y="78.9" text-anchor="middle" class="lbl">E</text></svg>',
    PX3: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="22" x2="252" y2="22" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="15" text-anchor="middle" class="lbl">A</text><text x="246" y="142" text-anchor="middle" class="lbl">C</text><polyline points="192.5,22 133,56.3 161.8,90.7 67.5,125" class="fnone sstrong round"/><path d="M179.5,22 A13,13 0 0 0 181.2,28.5" class="fnone s1"/><text x="146" y="39" text-anchor="middle">30°</text><text x="192.5" y="15" text-anchor="middle" class="lbl">B</text><path d="M144.3,49.8 A13,13 0 0 1 141.4,66.3" class="fnone s2"/><text x="166.5" y="66.7" text-anchor="middle">80°</text><text x="120.2" y="59.1" text-anchor="middle" class="lbl">E</text><path d="M153.5,80.7 A13,13 0 0 0 149.6,95.1" class="fnone s1"/><text x="127.4" y="85.9" text-anchor="middle">70°</text><text x="174.4" y="99" text-anchor="middle" class="lbl">F</text><text x="67.5" y="142" text-anchor="middle" class="lbl">D</text></svg>',
    PX4: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="212.3,25 125.7,75 167.6,125" class="fnone sstrong round"/><polyline points="212.3,25 47.7,69.1 167.6,125" class="fnone s2 round"/><path d="M136.9,68.5 A13,13 0 0 1 134,85" class="fnone s3"/><text x="159.2" y="85.4" text-anchor="middle">80°</text><path d="M203.3,25 A9,9 0 0 0 203.6,27.3" class="fnone s2 thin"/><path d="M203.6,27.3 A9,9 0 0 0 204.5,29.5" class="fnone s2 thin"/><path d="M158.6,125 A9,9 0 0 1 159.5,121.2" class="fnone s2 thin"/><path d="M159.5,121.2 A9,9 0 0 1 161.8,118.1" class="fnone s2 thin"/><text x="212.3" y="18" text-anchor="middle" class="lbl">B</text><text x="167.6" y="142" text-anchor="middle" class="lbl">D</text><text x="112.9" y="77.7" text-anchor="middle" class="lbl">E</text><text x="34.8" y="73" text-anchor="middle" class="lbl">F</text></svg>',
    PQ1: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="183.6,25 76.4,75 118.3,125" class="fnone sstrong round"/><path d="M169.6,25 A14,14 0 0 0 170.9,30.9" class="fnone s1"/><text x="135.7" y="40.1" text-anchor="middle">25°</text><path d="M104.3,125 A14,14 0 0 1 109.3,114.3" class="fnone s1"/><text x="80" y="111.6" text-anchor="middle">50°</text><text x="183.6" y="18" text-anchor="middle" class="lbl">B</text><text x="118.3" y="142" text-anchor="middle" class="lbl">D</text><text x="63.7" y="77.2" text-anchor="middle" class="lbl">E</text></svg>',
    PQ2: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="170,25 90,75 121.2,125" class="fnone sstrong round"/><path d="M156,25 A14,14 0 0 0 158.1,32.4" class="fnone s1"/><text x="122.8" y="43" text-anchor="middle">32°</text><path d="M101,68.1 A13,13 0 0 1 96.9,86" class="fnone s3"/><text x="121.9" y="86.9" text-anchor="middle">90°</text><text x="170" y="18" text-anchor="middle" class="lbl">B</text><text x="121.2" y="142" text-anchor="middle" class="lbl">D</text><text x="77.3" y="77.1" text-anchor="middle" class="lbl">E</text></svg>',
    PQ3: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="159.8,25 100.2,75 150.2,125" class="fnone sstrong round"/><text x="159.8" y="18" text-anchor="middle" class="lbl">B</text><text x="150.2" y="142" text-anchor="middle" class="lbl">D</text><text x="87.2" y="79.4" text-anchor="middle" class="lbl">E</text></svg>',
    PQ4: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="130.9,25 159.8,75 100.2,125" class="fnone sstrong round"/><path d="M116.9,25 A14,14 0 0 0 137.9,37.1" class="fnone s1"/><text x="115.2" y="56.7" text-anchor="middle">120°</text><path d="M86.2,125 A14,14 0 0 1 110.9,116" class="fnone s1"/><text x="89.7" y="100.8" text-anchor="middle">140°</text><text x="130.9" y="18" text-anchor="middle" class="lbl">B</text><text x="100.2" y="142" text-anchor="middle" class="lbl">D</text><text x="172.6" y="82.3" text-anchor="middle" class="lbl">E</text></svg>',
    PQ5: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="86.7,25 173.3,75 144.4,125" class="fnone sstrong round"/><path d="M72.7,25 A14,14 0 0 0 98.8,32" class="fnone s1"/><text x="78.9" y="58.8" text-anchor="middle">150°</text><path d="M162,68.5 A13,13 0 0 0 166.8,86.3" class="fnone s3"/><text x="141.7" y="88" text-anchor="middle">90°</text><text x="86.7" y="18" text-anchor="middle" class="lbl">B</text><text x="144.4" y="142" text-anchor="middle" class="lbl">D</text><text x="185.9" y="76.6" text-anchor="middle" class="lbl">E</text></svg>',
    PQ6: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="112.5,25 147.5,75 124.2,125" class="fnone sstrong round"/><path d="M98.5,25 A14,14 0 0 0 120.5,36.5" class="fnone s1"/><text x="98.1" y="57.1" text-anchor="middle">125°</text><path d="M110.2,125 A14,14 0 0 1 130.1,112.3" class="fnone s1"/><text x="107.2" y="102.8" text-anchor="middle">115°</text><text x="112.5" y="18" text-anchor="middle" class="lbl">B</text><text x="124.2" y="142" text-anchor="middle" class="lbl">D</text><text x="160.5" y="78.9" text-anchor="middle" class="lbl">E</text></svg>',
    PQ7: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="155,25 105,75 128.3,125" class="fnone sstrong round"/><path d="M141,25 A14,14 0 0 0 145.1,34.9" class="fnone s1"/><text x="113.9" y="46.5" text-anchor="middle">45°</text><path d="M114.2,65.8 A13,13 0 0 1 110.5,86.8" class="fnone s3"/><text x="135.5" y="84.9" text-anchor="middle">110°</text><text x="155" y="18" text-anchor="middle" class="lbl">B</text><text x="128.3" y="142" text-anchor="middle" class="lbl">D</text><text x="92.2" y="77.7" text-anchor="middle" class="lbl">E</text></svg>',
    PQ8: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="22" x2="252" y2="22" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="15" text-anchor="middle" class="lbl">A</text><text x="246" y="142" text-anchor="middle" class="lbl">C</text><polyline points="123.8,22 82.8,56.3 177.2,90.7 117.7,125" class="fnone sstrong round"/><path d="M110.8,22 A13,13 0 0 0 113.8,30.4" class="fnone s1"/><text x="80.2" y="42.3" text-anchor="middle">40°</text><text x="123.8" y="15" text-anchor="middle" class="lbl">B</text><path d="M92.8,48 A13,13 0 0 1 95.1,60.8" class="fnone s2"/><text x="120.3" y="54.2" text-anchor="middle">60°</text><text x="70" y="63.6" text-anchor="middle" class="lbl">E</text><path d="M164.9,86.2 A13,13 0 0 0 165.9,97.2" class="fnone s1"/><text x="136" y="98.8" text-anchor="middle">50°</text><text x="190.1" y="94.5" text-anchor="middle" class="lbl">F</text><text x="117.7" y="142" text-anchor="middle" class="lbl">D</text></svg>',
    PQ9: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="22" x2="252" y2="22" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="15" text-anchor="middle" class="lbl">A</text><text x="246" y="142" text-anchor="middle" class="lbl">C</text><polyline points="156.4,22 107.3,56.3 166.8,90.7 93.2,125" class="fnone sstrong round"/><path d="M143.4,22 A13,13 0 0 0 145.7,29.5" class="fnone s1"/><text x="110.5" y="41" text-anchor="middle">35°</text><text x="156.4" y="15" text-anchor="middle" class="lbl">B</text><text x="94.4" y="61.9" text-anchor="middle" class="lbl">E</text><path d="M155.6,84.2 A13,13 0 0 0 155,96.2" class="fnone s1"/><text x="127.4" y="93.4" text-anchor="middle">55°</text><text x="179.8" y="96.2" text-anchor="middle" class="lbl">F</text><path d="M105,119.5 A13,13 0 0 1 106.2,125" class="fnone s2"/><text x="140.2" y="119.1" text-anchor="middle">25°</text><text x="93.2" y="142" text-anchor="middle" class="lbl">D</text></svg>',
    PQ10: '<svg class="fig" viewBox="0 0 260 190"><line x1="8" y1="22" x2="252" y2="22" class="sstrong"/><line x1="8" y1="165" x2="252" y2="165" class="sstrong"/><text x="14" y="15" text-anchor="middle" class="lbl">A</text><text x="14" y="182" text-anchor="middle" class="lbl">C</text><polyline points="179.1,22 80.9,57.8 157.6,93.5 106.5,129.2 168.4,165" class="fnone sstrong round"/><path d="M166.1,22 A13,13 0 0 0 166.9,26.4" class="fnone s1"/><text x="131.7" y="34.9" text-anchor="middle">20°</text><text x="179.1" y="15" text-anchor="middle" class="lbl">B</text><path d="M93.1,53.3 A13,13 0 0 1 92.7,63.2" class="fnone s2"/><text x="124.4" y="64.1" text-anchor="middle">45°</text><text x="67.9" y="62.2" text-anchor="middle" class="lbl">E</text><path d="M145.8,88 A13,13 0 0 0 146.9,101" class="fnone s1"/><text x="119.7" y="101.3" text-anchor="middle">60°</text><text x="170.5" y="97.4" text-anchor="middle" class="lbl">F</text><text x="93.5" y="134.8" text-anchor="middle" class="lbl">G</text><path d="M157.2,158.5 A13,13 0 0 0 155.4,165" class="fnone s1"/><text x="121.9" y="157" text-anchor="middle">30°</text><text x="168.4" y="182" text-anchor="middle" class="lbl">D</text></svg>',
    PQ11: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="192.5,25 133,75 161.8,125" class="fnone sstrong round"/><polyline points="192.5,25 67.5,70.5 161.8,125" class="fnone s2 round"/><path d="M142.9,66.6 A13,13 0 0 1 139.5,86.3" class="fnone s3"/><text x="164.2" y="85" text-anchor="middle">100°</text><path d="M183.5,25 A9,9 0 0 0 184.1,28.1" class="fnone s2 thin"/><path d="M184.1,28.1 A9,9 0 0 0 185.6,30.8" class="fnone s2 thin"/><path d="M152.8,125 A9,9 0 0 1 154,120.5" class="fnone s2 thin"/><path d="M154,120.5 A9,9 0 0 1 157.3,117.2" class="fnone s2 thin"/><text x="192.5" y="18" text-anchor="middle" class="lbl">B</text><text x="161.8" y="142" text-anchor="middle" class="lbl">D</text><text x="120.1" y="77.7" text-anchor="middle" class="lbl">E</text><text x="54.5" y="74.4" text-anchor="middle" class="lbl">F</text></svg>',
    PQ12: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="167.6,25 125.7,75 212.3,125" class="fnone sstrong round"/><polyline points="167.6,25 47.7,80.9 212.3,125" class="fnone s2 round"/><path d="M153.6,25 A14,14 0 0 0 158.6,35.7" class="fnone s1"/><text x="129.3" y="47.4" text-anchor="middle" style="paint-order: stroke; stroke: var(--surface); stroke-width: 4px">50°</text><path d="M198.3,125 A14,14 0 0 1 200.1,118" class="fnone s1"/><text x="164.8" y="116.8" text-anchor="middle" style="paint-order: stroke; stroke: var(--surface); stroke-width: 4px">30°</text><path d="M158.6,25 A9,9 0 0 0 159.5,28.8" class="fnone s2 thin"/><path d="M159.5,28.8 A9,9 0 0 0 161.8,31.9" class="fnone s2 thin"/><path d="M203.3,125 A9,9 0 0 1 203.6,122.7" class="fnone s2 thin"/><path d="M203.6,122.7 A9,9 0 0 1 204.5,120.5" class="fnone s2 thin"/><text x="167.6" y="18" text-anchor="middle" class="lbl">B</text><text x="212.3" y="142" text-anchor="middle" class="lbl">D</text><text x="112.9" y="82.3" text-anchor="middle" class="lbl">E</text><text x="34.8" y="87" text-anchor="middle" class="lbl">F</text></svg>',
    PQ13: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="216.9,25 130.3,75 189.9,125" class="fnone sstrong round"/><polyline points="216.9,25 43.1,71.6 189.9,125" class="fnone s2 round"/><path d="M54.7,68.5 A12,12 0 0 1 54.4,75.7" class="fnone s3"/><text x="90.2" y="78.1" text-anchor="middle">35°</text><path d="M207.9,25 A9,9 0 0 0 208.2,27.3" class="fnone s2 thin"/><path d="M208.2,27.3 A9,9 0 0 0 209.1,29.5" class="fnone s2 thin"/><path d="M180.9,125 A9,9 0 0 1 181.4,121.9" class="fnone s2 thin"/><path d="M181.4,121.9 A9,9 0 0 1 183,119.2" class="fnone s2 thin"/><text x="216.9" y="18" text-anchor="middle" class="lbl">B</text><text x="189.9" y="142" text-anchor="middle" class="lbl">D</text><text x="117.4" y="78.9" text-anchor="middle" class="lbl">E</text><text x="30.1" y="76" text-anchor="middle" class="lbl">F</text></svg>',
    PQ14: '<svg class="fig" viewBox="0 0 260 150"><line x1="8" y1="25" x2="252" y2="25" class="sstrong"/><line x1="8" y1="125" x2="252" y2="125" class="sstrong"/><text x="14" y="18" text-anchor="middle" class="lbl">A</text><text x="14" y="142" text-anchor="middle" class="lbl">C</text><polyline points="142,25 160.2,75 118.3,125" class="fnone sstrong round"/><polyline points="142,25 99.8,85.3 118.3,125" class="fnone s2 round"/><path d="M155.8,62.8 A13,13 0 0 0 151.9,85" class="fnone s3"/><text x="130.3" y="74.2" text-anchor="middle">120°</text><path d="M133,25 A9,9 0 0 0 136.9,32.4" class="fnone s2 thin"/><path d="M136.9,32.4 A9,9 0 0 0 145.1,33.5" class="fnone s2 thin"/><path d="M109.3,125 A9,9 0 0 1 114.5,116.8" class="fnone s2 thin"/><path d="M114.5,116.8 A9,9 0 0 1 124.1,118.1" class="fnone s2 thin"/><text x="142" y="18" text-anchor="middle" class="lbl">B</text><text x="118.3" y="142" text-anchor="middle" class="lbl">D</text><text x="173" y="82.3" text-anchor="middle" class="lbl">E</text><text x="86.8" y="89.2" text-anchor="middle" class="lbl">F</text></svg>',
    PT_SQ: '<svg class="fig" viewBox="0 0 280 56"><line x1="48" y1="12" x2="70" y2="12" class="sstrong round"/><line x1="48" y1="34" x2="70" y2="34" class="sstrong round"/><line x1="48" y1="12" x2="48" y2="34" class="sstrong round"/><line x1="70" y1="12" x2="70" y2="34" class="sstrong round"/><text x="59" y="50" text-anchor="middle">第 1 个</text><line x1="96" y1="12" x2="140" y2="12" class="sstrong round"/><line x1="96" y1="34" x2="140" y2="34" class="sstrong round"/><line x1="96" y1="12" x2="96" y2="34" class="sstrong round"/><line x1="118" y1="12" x2="118" y2="34" class="sstrong round"/><line x1="140" y1="12" x2="140" y2="34" class="sstrong round"/><text x="118" y="50" text-anchor="middle">第 2 个</text><line x1="166" y1="12" x2="232" y2="12" class="sstrong round"/><line x1="166" y1="34" x2="232" y2="34" class="sstrong round"/><line x1="166" y1="12" x2="166" y2="34" class="sstrong round"/><line x1="188" y1="12" x2="188" y2="34" class="sstrong round"/><line x1="210" y1="12" x2="210" y2="34" class="sstrong round"/><line x1="232" y1="12" x2="232" y2="34" class="sstrong round"/><text x="199" y="50" text-anchor="middle">第 3 个</text></svg>',
    PT_TRI: '<svg class="fig" viewBox="0 0 280 52"><polyline points="64.5,31.1 75.5,12 86.5,31.1" class="fnone sstrong round"/><line x1="64.5" y1="31.1" x2="86.5" y2="31.1" class="sstrong round"/><text x="75.5" y="46" text-anchor="middle">第 1 个</text><polyline points="112.5,31.1 123.5,12 134.5,31.1 145.5,12" class="fnone sstrong round"/><line x1="112.5" y1="31.1" x2="134.5" y2="31.1" class="sstrong round"/><line x1="123.5" y1="12" x2="145.5" y2="12" class="sstrong round"/><text x="129" y="46" text-anchor="middle">第 2 个</text><polyline points="171.5,31.1 182.5,12 193.5,31.1 204.5,12 215.5,31.1" class="fnone sstrong round"/><line x1="171.5" y1="31.1" x2="215.5" y2="31.1" class="sstrong round"/><line x1="182.5" y1="12" x2="204.5" y2="12" class="sstrong round"/><text x="193.5" y="46" text-anchor="middle">第 3 个</text></svg>',
    PT_HEX: '<svg class="fig" viewBox="0 0 280 56"><polygon points="57.7,10 69,16.5 69,29.5 57.7,36 46.5,29.5 46.5,16.5" class="fnone sstrong round"/><text x="57.7" y="50" text-anchor="middle">第 1 个</text><polygon points="106.2,10 117.5,16.5 117.5,29.5 106.2,36 95,29.5 95,16.5" class="fnone sstrong round"/><polygon points="128.7,10 140,16.5 140,29.5 128.7,36 117.5,29.5 117.5,16.5" class="fnone sstrong round"/><text x="117.5" y="50" text-anchor="middle">第 2 个</text><polygon points="177.3,10 188.5,16.5 188.5,29.5 177.3,36 166,29.5 166,16.5" class="fnone sstrong round"/><polygon points="199.8,10 211,16.5 211,29.5 199.8,36 188.5,29.5 188.5,16.5" class="fnone sstrong round"/><polygon points="222.3,10 233.5,16.5 233.5,29.5 222.3,36 211,29.5 211,16.5" class="fnone sstrong round"/><text x="199.8" y="50" text-anchor="middle">第 3 个</text></svg>',
    PT_GRID: '<svg class="fig" viewBox="0 0 280 64"><line x1="60" y1="8" x2="78" y2="8" class="sstrong round"/><line x1="60" y1="26" x2="78" y2="26" class="sstrong round"/><line x1="60" y1="44" x2="78" y2="44" class="sstrong round"/><line x1="60" y1="8" x2="60" y2="44" class="sstrong round"/><line x1="78" y1="8" x2="78" y2="44" class="sstrong round"/><text x="69" y="58" text-anchor="middle">第 1 个</text><line x1="104" y1="8" x2="140" y2="8" class="sstrong round"/><line x1="104" y1="26" x2="140" y2="26" class="sstrong round"/><line x1="104" y1="44" x2="140" y2="44" class="sstrong round"/><line x1="104" y1="8" x2="104" y2="44" class="sstrong round"/><line x1="122" y1="8" x2="122" y2="44" class="sstrong round"/><line x1="140" y1="8" x2="140" y2="44" class="sstrong round"/><text x="122" y="58" text-anchor="middle">第 2 个</text><line x1="166" y1="8" x2="220" y2="8" class="sstrong round"/><line x1="166" y1="26" x2="220" y2="26" class="sstrong round"/><line x1="166" y1="44" x2="220" y2="44" class="sstrong round"/><line x1="166" y1="8" x2="166" y2="44" class="sstrong round"/><line x1="184" y1="8" x2="184" y2="44" class="sstrong round"/><line x1="202" y1="8" x2="202" y2="44" class="sstrong round"/><line x1="220" y1="8" x2="220" y2="44" class="sstrong round"/><text x="193" y="58" text-anchor="middle">第 3 个</text></svg>',
  };
  window.LESSONS = Object.assign(window.LESSONS || {}, {
    // ───────────────────────── 绝对值与零点分段 ─────────────────────────
    c_abs: {
      goal: '会用“零点分段法”去掉绝对值：找零点、分段、在每一段里判断符号并化简；会根据数轴上点的位置化简绝对值式子；会用绝对值的非负性求字母的值；会分段解含多个绝对值的方程，并检验解是否在这一段里。',
      fj: '常见题型：① 已知字母的范围或数轴上点的位置，化简 |<i>a</i> − <i>b</i>| + |<i>b</i> + <i>c</i>| 一类式子（选择、填空高频）；② |<i>a</i> − 2| + |<i>b</i> + 3| = 0 求字母的值；③ 不给范围，分段化简 |<i>x</i> + 1| + |<i>x</i> − 2|；④ 解 |<i>x</i> − 1| + |<i>x</i> + 2| = 5 一类方程。变式常把系数放大（如 |2<i>x</i> − 4|）、用减号连接两个绝对值，或者在方程右边放含 <i>x</i> 的式子。',
      sections: [
        {
          h: '先看符号，再去绝对值',
          html: `<p>绝对值就像一台“去负号机器”：放进去的数是正数或 0，原样出来；放进去的是负数，出来的是它的相反数。</p>
<p class="formula">|<i>A</i>| = <i>A</i>（<i>A</i> ≥ 0）　　|<i>A</i>| = −<i>A</i>（<i>A</i> &lt; 0）</p>
<p>所以去掉绝对值的关键只有一件事：<b>判断绝对值里面那个式子是正还是负</b>。比如 ${X} &gt; 3 时，${X} − 3 &gt; 0，|${X} − 3| = ${X} − 3；${X} &lt; 3 时，${X} − 3 &lt; 0，|${X} − 3| = −(${X} − 3) = 3 − ${X}。</p>
<p>如果题目给的是数轴上点的位置，就用“右边的数减左边的数是正数”来判断差的符号。</p>
<p>另外，绝对值不会是负数（<b>非负性</b>）。几个绝对值相加等于 0，只能每一个都等于 0。</p>`
        },
        {
          h: '零点：把数轴切成几段',
          html: `<p>如果不知道 ${X} 的范围，比如化简 |${X} + 1| + |${X} − 2|，怎么办？</p>
<p>让绝对值里面等于 0 的 ${X} 叫<b>零点</b>：${X} + 1 = 0 得 ${X} = −1，${X} − 2 = 0 得 ${X} = 2。零点是“变号的地方”：在零点左边，里面是负的；在零点右边，里面是正的。</p>
<p>两个零点把数轴切成 3 段，每一段里每个绝对值的符号都是确定的，就能去掉绝对值了。<b><i>n</i> 个不同的零点把数轴分成 <i>n</i> + 1 段。</b></p>
<p class="try">动手试试：拖动数轴上的圆点，看 ${X} 在不同的段里，每个绝对值里面是正还是负；再点“逐段化简”，看每一段的结果。</p>`,
          anim: 'c_abs_zeros'
        },
        {
          h: '零点分段法三步走',
          html: `<p class="formula">① 找零点　→　② 分段　→　③ 每段判断符号、去绝对值、合并</p>
<p>以 |${X} + 1| + |${X} − 2| 为例：</p>
<table class="mini"><tr><th>范围</th><th>${X} + 1</th><th>${X} − 2</th><th>原式</th></tr>
<tr><td>${X} &lt; −1</td><td>负</td><td>负</td><td>−(${X} + 1) − (${X} − 2) = −2${X} + 1</td></tr>
<tr><td>−1 ≤ ${X} ≤ 2</td><td>非负</td><td>非正</td><td>(${X} + 1) − (${X} − 2) = 3</td></tr>
<tr><td>${X} &gt; 2</td><td>正</td><td>正</td><td>(${X} + 1) + (${X} − 2) = 2${X} − 1</td></tr></table>
<p>零点本身放在哪一段都可以（在零点处绝对值是 0，两种写法结果一样），但<b>每个数都要被分到某一段，不重不漏</b>。</p>`
        },
        {
          h: '解绝对值方程：分段求解，再检验',
          html: `<p>解 |${X} − 1| + |${X} + 2| = 5，同样先分段，在每一段里方程就变成了普通的一元一次方程。</p>
<p>关键的一步是<b>检验</b>：在“${X} &lt; −2”这一段里解出的 ${X}，必须真的小于 −2 才算数，否则要舍去。</p>
<p>有时某一段化简后 ${X} 消失了：如果等式成立，这一段的<b>每个数都是解</b>；如果不成立，这一段<b>无解</b>。</p>
<p class="try">选择不同的方程，点“下一步”，一段一段地解，注意哪些解被打了 ✗。</p>`,
          anim: 'c_abs_solve'
        }
      ],
      pitfalls: [
        `|${X} − 3| 的零点是 3，不是 −3：零点是让绝对值<b>里面</b>等于 0 的 ${X}。`,
        `去绝对值取相反数时，整个式子要加括号：${X} − 2 &lt; 0 时，|${X} − 2| = −(${X} − 2) = 2 − ${X}，不是 −${X} − 2。`,
        '分段解方程时，每段解出的数要检验是否在这一段的范围内，不在就舍去；最后把各段的解合起来写。'
      ],
      examples: [
        {
          q: `已知 ${X} &gt; 3，化简 |${X} − 3| + |${X} + 1|。`,
          steps: [
            `先判断绝对值里面的符号：${X} &gt; 3，所以 ${X} − 3 &gt; 0；${X} + 1 &gt; 4 &gt; 0。`,
            `两个都是正的，绝对值直接去掉：(${X} − 3) + (${X} + 1)。`,
            `合并：2${X} − 2。`
          ],
          ans: `2${X} − 2`
        },
        {
          q: `有理数 ${A_}、${B_} 在数轴上的位置是：${A_} &lt; 0 &lt; ${B_}，并且 ${A_} 离原点比 ${B_} 远。化简 |${A_} + ${B_}| − |${A_} − ${B_}|。`,
          steps: [
            `${A_} 离原点更远，说明 |${A_}| &gt; |${B_}|，异号两数相加取绝对值大的符号，所以 ${A_} + ${B_} &lt; 0，|${A_} + ${B_}| = −${A_} − ${B_}。`,
            `${A_} 在 ${B_} 的左边，${A_} − ${B_} &lt; 0（左边减右边是负数），|${A_} − ${B_}| = −(${A_} − ${B_}) = ${B_} − ${A_}。`,
            `原式 = (−${A_} − ${B_}) − (${B_} − ${A_}) = −${A_} − ${B_} − ${B_} + ${A_} = −2${B_}。`
          ],
          ans: `−2${B_}`
        },
        {
          q: `已知 |${A_} − 2| + |${B_} + 3| = 0，求 ${A_} + ${B_}。`,
          steps: [
            '绝对值都不会是负数，两个不是负数的数相加等于 0，只能两个都是 0。',
            `${A_} − 2 = 0，${A_} = 2；${B_} + 3 = 0，${B_} = −3。`,
            `${A_} + ${B_} = 2 + (−3) = −1。`
          ],
          ans: '−1'
        },
        {
          q: `化简 |${X} + 1| + |${X} − 2|。`,
          steps: [
            `找零点：${X} = −1 和 ${X} = 2，把数轴分成三段。`,
            `${X} &lt; −1 时，两个都是负的：原式 = −(${X} + 1) − (${X} − 2) = −2${X} + 1。`,
            `−1 ≤ ${X} ≤ 2 时，${X} + 1 ≥ 0，${X} − 2 ≤ 0：原式 = (${X} + 1) − (${X} − 2) = 3。`,
            `${X} &gt; 2 时，两个都是正的：原式 = (${X} + 1) + (${X} − 2) = 2${X} − 1。`
          ],
          ans: `${X} &lt; −1 时为 −2${X} + 1；−1 ≤ ${X} ≤ 2 时为 3；${X} &gt; 2 时为 2${X} − 1`
        },
        {
          q: `化简 |${X}| + |${X} − 1| − |${X} + 2|。`,
          steps: [
            `三个零点：0、1、−2，按从小到大排：−2、0、1，分成四段。`,
            `${X} &lt; −2：三个里面都是负的，原式 = −${X} − (${X} − 1) + (${X} + 2) = −${X} + 3。（注意第三项前面是减号：−|${X} + 2| = −[−(${X} + 2)] = ${X} + 2）`,
            `−2 ≤ ${X} &lt; 0：${X} + 2 ≥ 0，其余为负，原式 = −${X} − (${X} − 1) − (${X} + 2) = −3${X} − 1；0 ≤ ${X} ≤ 1：原式 = ${X} − (${X} − 1) − (${X} + 2) = −${X} − 1。`,
            `${X} &gt; 1：三个都是正的，原式 = ${X} + (${X} − 1) − (${X} + 2) = ${X} − 3。可以在分界点检验：${X} = −2 时前两段都得 5，${X} = 0 时都得 −1，${X} = 1 时都得 −2，说明没算错。`
          ],
          ans: `${X} &lt; −2 时 −${X} + 3；−2 ≤ ${X} &lt; 0 时 −3${X} − 1；0 ≤ ${X} ≤ 1 时 −${X} − 1；${X} &gt; 1 时 ${X} − 3`
        },
        {
          q: `解方程 |${X} − 1| + |${X} + 2| = 5。`,
          steps: [
            `零点 1 和 −2，分三段讨论。`,
            `${X} &lt; −2：−(${X} − 1) − (${X} + 2) = 5，即 −2${X} − 1 = 5，${X} = −3。−3 &lt; −2，在这一段里，保留。`,
            `−2 ≤ ${X} ≤ 1：(1 − ${X}) + (${X} + 2) = 3，3 = 5 不成立，这一段无解。`,
            `${X} &gt; 1：(${X} − 1) + (${X} + 2) = 5，即 2${X} + 1 = 5，${X} = 2，在这一段里，保留。`
          ],
          ans: `${X} = −3 或 ${X} = 2`
        },
        {
          q: `解方程 |${X} + 1| + |2${X} − 4| = 6。`,
          steps: [
            `零点：${X} = −1 和 ${X} = 2（2${X} − 4 = 0）。`,
            `${X} &lt; −1：−(${X} + 1) − (2${X} − 4) = −3${X} + 3 = 6，${X} = −1。但这一段要求 ${X} &lt; −1，−1 不满足，<b>舍去</b>。`,
            `−1 ≤ ${X} ≤ 2：(${X} + 1) − (2${X} − 4) = −${X} + 5 = 6，${X} = −1，在这一段里，保留。`,
            `${X} &gt; 2：(${X} + 1) + (2${X} − 4) = 3${X} − 3 = 6，${X} = 3，保留。代回检验：|−1 + 1| + |−2 − 4| = 6 ✓，|3 + 1| + |6 − 4| = 6 ✓。`
          ],
          ans: `${X} = −1 或 ${X} = 3`
        }
      ],
      quiz: [
        { type: 'choice', q: `当 ${X} &lt; 2 时，|${X} − 2| 等于（　）。`, opts: [`${X} − 2`, `2 − ${X}`, `${X} + 2`, `−${X} − 2`], ans: 1, why: `${X} &lt; 2 时 ${X} − 2 &lt; 0，绝对值是它的相反数：−(${X} − 2) = 2 − ${X}。` },
        { type: 'fill', q: `当 ${X} = −3 时，|${X} − 1| + |${X} + 5| = ______。`, ans: ['6'], why: '|−3 − 1| = |−4| = 4，|−3 + 5| = |2| = 2，4 + 2 = 6。' },
        { type: 'fill', q: `已知 ${X} &lt; −3，化简 |${X} + 3| + ${X} 的结果是常数______。`, ans: ['-3'], why: `${X} &lt; −3 时 ${X} + 3 &lt; 0，|${X} + 3| = −${X} − 3，再加 ${X}：−${X} − 3 + ${X} = −3。` },
        { type: 'choice', q: `已知 1 &lt; ${X} &lt; 4，化简 |${X} − 1| + |${X} − 4| 得（　）。`, opts: [`2${X} − 5`, '3', '−3', `5 − 2${X}`], ans: 1, why: `${X} − 1 &gt; 0，${X} − 4 &lt; 0，原式 = (${X} − 1) + (4 − ${X}) = 3。` },
        { type: 'choice', q: `${A_}、${B_} 在数轴上满足 ${A_} &lt; 0 &lt; ${B_}，且 |${A_}| &lt; |${B_}|。化简 |${A_} + ${B_}| + |${A_} − ${B_}| 得（　）。`, opts: [`2${A_}`, `2${B_}`, `−2${A_}`, `−2${B_}`], ans: 1, why: `|${B_}| 更大，${A_} + ${B_} &gt; 0，|${A_} + ${B_}| = ${A_} + ${B_}；${A_} − ${B_} &lt; 0，|${A_} − ${B_}| = ${B_} − ${A_}。相加：${A_} + ${B_} + ${B_} − ${A_} = 2${B_}。` },
        { type: 'choice', q: `数轴上从左到右依次是 ${A_}、${B_}、0、<i>c</i>。化简 |${A_} − ${B_}| + |${B_} − <i>c</i>| − |<i>c</i>| 得（　）。`, opts: [`${A_}`, `−${A_}`, `2<i>c</i> − ${A_}`, `${A_} − 2${B_}`], ans: 1, why: `${A_} 在 ${B_} 左边，${A_} − ${B_} &lt; 0，|${A_} − ${B_}| = ${B_} − ${A_}；${B_} &lt; <i>c</i>，|${B_} − <i>c</i>| = <i>c</i> − ${B_}；<i>c</i> &gt; 0，|<i>c</i>| = <i>c</i>。原式 = ${B_} − ${A_} + <i>c</i> − ${B_} − <i>c</i> = −${A_}。` },
        { type: 'choice', q: `若 ${X} &lt; 0 &lt; <i>y</i>，化简 |${X}| + |<i>y</i>| − |${X} − <i>y</i>| 得（　）。`, opts: ['0', `2${X}`, `2<i>y</i>`, `−2${X}`], ans: 0, why: `|${X}| = −${X}，|<i>y</i>| = <i>y</i>；${X} − <i>y</i> &lt; 0，|${X} − <i>y</i>| = <i>y</i> − ${X}。原式 = −${X} + <i>y</i> − <i>y</i> + ${X} = 0。` },
        { type: 'fill', q: `已知 |${A_} + 1| + |${B_} − 4| = 0，那么 ${A_}${B_} = ______。`, ans: ['-4'], why: `两个绝对值都不是负数，和为 0 只能都等于 0：${A_} = −1，${B_} = 4，${A_}${B_} = −4。` },
        { type: 'fill', q: `已知 (${A_} − 3)<sup>2</sup> + |${B_} + 2| = 0，那么 ${B_}<sup>${A_}</sup> = ______。`, ans: ['-8'], why: `平方和绝对值都不是负数，所以 ${A_} − 3 = 0，${B_} + 2 = 0，${A_} = 3，${B_} = −2。(−2)<sup>3</sup> = −8。` },
        { type: 'choice', q: `|${X} + 2| + |${X} − 1| + |${X} − 5| 的零点把数轴分成几段？`, opts: ['2 段', '3 段', '4 段', '5 段'], ans: 2, why: '三个零点 −2、1、5，3 个点把数轴分成 4 段。' },
        { type: 'choice', q: `|2${X} − 6| 的零点是（　）。`, opts: ['−3', '3', '6', '−6'], ans: 1, why: `令 2${X} − 6 = 0，得 ${X} = 3。零点是让绝对值里面等于 0 的数，不是看常数项。` },
        { type: 'choice', q: `当 ${X} &lt; −1 时，|${X} + 1| + |${X} − 2| 化简为（　）。`, opts: [`2${X} − 1`, '3', `−2${X} + 1`, `−2${X} − 1`], ans: 2, why: `两个都是负的：−(${X} + 1) − (${X} − 2) = −${X} − 1 − ${X} + 2 = −2${X} + 1。注意 −(${X} − 2) = −${X} + 2，不要把 2 的符号弄错。` },
        { type: 'fill', q: `当 −3 ≤ ${X} ≤ 1 时，|${X} − 1| + |${X} + 3| 化简后等于常数______。`, ans: ['4'], why: `${X} − 1 ≤ 0，${X} + 3 ≥ 0，原式 = (1 − ${X}) + (${X} + 3) = 4。` },
        { type: 'choice', q: `当 ${X} &gt; 2 时，|${X} − 2| − |${X} + 1| 化简为（　）。`, opts: [`2${X} − 1`, '−3', '3', `1 − 2${X}`], ans: 1, why: `两个都是正的：(${X} − 2) − (${X} + 1) = −3。减号后面的整个绝对值要加括号。` },
        { type: 'fill', q: `方程 |${X} − 2| = 5 的两个解的和是______。`, ans: ['4'], why: `${X} − 2 = 5 或 ${X} − 2 = −5，${X} = 7 或 ${X} = −3，和为 4。` },
        { type: 'fill', q: `方程 |${X} − 1| + |${X} + 2| = 7 的两个解中，较大的那个是______。`, ans: ['3'], why: `${X} &gt; 1 时 2${X} + 1 = 7，${X} = 3；${X} &lt; −2 时 −2${X} − 1 = 7，${X} = −4；中间一段原式恒为 3，不等于 7。较大的解是 3。` },
        { type: 'fill', q: `方程 |${X} + 1| + |${X} − 3| = 6 的两个解的积是______。`, ans: ['-8'], why: `${X} &gt; 3 时 2${X} − 2 = 6，${X} = 4；${X} &lt; −1 时 −2${X} + 2 = 6，${X} = −2；−1 ≤ ${X} ≤ 3 时原式恒为 4 ≠ 6。积 = 4 × (−2) = −8。` },
        { type: 'choice', q: `方程 |${X} − 3| = 2${X} 的解是（　）。`, opts: [`${X} = −3`, `${X} = 1`, `${X} = 1 或 ${X} = −3`, '无解'], ans: 1, why: `${X} ≥ 3 时：${X} − 3 = 2${X}，${X} = −3，不满足 ${X} ≥ 3，舍去。${X} &lt; 3 时：3 − ${X} = 2${X}，${X} = 1，满足。所以只有 ${X} = 1。` },
        { type: 'choice', q: `方程 |2${X} − 1| = ${X} + 2 的解是（　）。`, opts: [`${X} = 3`, `${X} = −${fr(1, 3)}`, `${X} = 3 或 ${X} = −${fr(1, 3)}`, '无解'], ans: 2, why: `零点 ${fr(1, 2)}。${X} ≥ ${fr(1, 2)} 时 2${X} − 1 = ${X} + 2，${X} = 3，满足；${X} &lt; ${fr(1, 2)} 时 1 − 2${X} = ${X} + 2，${X} = −${fr(1, 3)}，满足。两个都保留，代回检验也成立。` },
        { type: 'fill', q: `方程 |${X} + 2| − |${X} − 1| = 2 的解是 ${X} = ______。`, ans: ['1/2'], why: `${X} &lt; −2 时原式 = −(${X} + 2) + (${X} − 1) = −3 ≠ 2；−2 ≤ ${X} ≤ 1 时原式 = (${X} + 2) + (${X} − 1) = 2${X} + 1 = 2，${X} = ${fr(1, 2)}，在范围内；${X} &gt; 1 时原式 = 3 ≠ 2。所以 ${X} = ${fr(1, 2)}。` },
        { type: 'choice', q: `（挑战）方程 |${X} − 1| + |${X} + 2| = 3 的解是（　）。`, opts: [`${X} = 1 或 ${X} = −2`, `只有 ${X} = 1`, `−2 ≤ ${X} ≤ 1 的所有数`, '无解'], ans: 2, why: `−2 ≤ ${X} ≤ 1 时原式 = (1 − ${X}) + (${X} + 2) = 3，等式总成立，这一段每个数都是解；${X} &lt; −2 时 −2${X} − 1 = 3 得 ${X} = −2，不在段内；${X} &gt; 1 时 2${X} + 1 = 3 得 ${X} = 1，不在段内。所以解是 −2 ≤ ${X} ≤ 1 的所有数，有无数个。` }
      ]
    },

    // ───────────────────────── 有理数巧算 ─────────────────────────
    c_rational_trick: {
      goal: '面对一长串有理数运算，先观察结构再动笔：会用分组配对、凑整、倒序相加、裂项相消、逆用乘法分配律、错位相减和整体换元等方法简化计算。',
      fj: '常见题型：① 1 − 2 + 3 − 4 + … 这类正负交替的长算式；② 1 + 2 + … + 100、1 + 3 + 5 + … 的求和（倒序相加）；③ 1/(1×2) + 1/(2×3) + … 的裂项求和，变式有 1/(1×3) + 1/(3×5) + …、1/2 + 1/6 + 1/12 + …；④ 逆用分配律、凑整的计算题；⑤ 1 + 2 + 2² + … + 2<sup>10</sup>（错位相减）和整体换元的挑战题。多以填空、计算题出现，也常作为“找规律”题的最后一步。',
      sections: [
        {
          h: '配对：让一对一对的数互相抵消',
          html: `<p>小明玩跳格子：第 1 步向前 1 格，第 2 步后退 2 格，第 3 步向前 3 格，第 4 步后退 4 格……走完 100 步，他在哪里？</p>
<p>算式是 1 − 2 + 3 − 4 + … + 99 − 100。一项一项加太累，但相邻两项一配对：(1 − 2) + (3 − 4) + … 每一对都是 −1，一共 50 对：</p>
<p class="formula">1 − 2 + 3 − 4 + … + 99 − 100 = (−1) × 50 = −50</p>
<p>配对之前一定要<b>数清楚项数</b>：如果项数是奇数，最后会剩下一项没有伙伴。符号按“+ − − +”循环的，可以四个一组，每组正好是 0。</p>
<p class="try">选择算式类型、拖动 <i>n</i>，点按钮看看怎样配对。</p>`,
          anim: 'c_rational_trick_pair'
        },
        {
          h: '倒序相加：首尾配对',
          html: `<p>求 S = 1 + 2 + 3 + … + 100，把它倒过来再写一遍：S = 100 + 99 + … + 1。上下对齐相加，每一列都是 101，一共 100 列：</p>
<p class="formula">2S = 101 × 100，S = 5050　　一般地，1 + 2 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1) ÷ 2</p>
<p>只要相邻两项的差都相同（比如 2 + 4 + … + 100，1 + 3 + 5 + … + 99），都能这样算：<b>和 =（首项 + 末项）× 项数 ÷ 2</b>。</p>
<p class="try">在上面的动画里选“倒序相加”，看两行数怎样对齐。</p>`
        },
        {
          h: '裂项相消：把一项拆成两项的差',
          html: `<p>${fr(1, 2)} − ${fr(1, 3)} = ${fr(1, 6)} = ${fr(1, '2×3')}。反过来看：${fr(1, '2×3')} 可以拆成 ${fr(1, 2)} − ${fr(1, 3)}。</p>
<p class="formula">${fr(1, '<i>n</i>(<i>n</i> + 1)')} = ${fr(1, '<i>n</i>')} − ${fr(1, '<i>n</i> + 1')}　　　${fr(1, '<i>n</i>(<i>n</i> + 2)')} = ${fr(1, 2)} × (${fr(1, '<i>n</i>')} − ${fr(1, '<i>n</i> + 2')})</p>
<p>拆开以后，前一项减掉的，正好被后一项加回来，中间全部抵消，<b>只剩头和尾</b>。</p>
<p>分母两个因数相差 2 时，拆完的差是原来的 2 倍，所以前面要乘 ${fr(1, 2)}。拆完以后用第一项验算一下最保险。</p>
<p class="try">点“裂项”“抵消”，看中间的项怎样一对一对消掉。</p>`,
          anim: 'c_rational_trick_split'
        },
        {
          h: '凑整、逆用分配律、错位相减、整体换元',
          html: `<p><b>凑整：</b>把能凑成整数的放在一起，3.7 和 6.3、−5.4 和 −4.6，交换位置时<b>符号跟着数走</b>。</p>
<p><b>逆用分配律：</b>几个积里有相同的因数，就把它提出来：−2.5 × 37 − 2.5 × 63 = −2.5 × (37 + 63) = −250。99 × (−36) 可以看成 (100 − 1) × (−36)。</p>
<p><b>错位相减：</b>S = 1 + 3 + 3<sup>2</sup> + … + 3<sup>5</sup>，乘 3 得 3S = 3 + 3<sup>2</sup> + … + 3<sup>6</sup>，两式相减，中间全消掉：2S = 3<sup>6</sup> − 1。</p>
<p><b>整体换元：</b>算式里反复出现同一串数，就把它看成一个字母，展开后大部分会抵消。</p>`
        }
      ],
      pitfalls: [
        '1 − 2 + 3 − … + 99 一共 99 项，只能配成 49 对，最后的 99 单独加：结果是 −49 + 99 = 50。配对前先数清楚项数。',
        `裂项 ${fr(1, '<i>n</i>(<i>n</i> + 2)')} 时前面要乘 ${fr(1, 2)}；拆完一定要用第一项验算：1 − ${fr(1, 3)} = ${fr(2, 3)}，是 ${fr(1, '1×3')} 的 2 倍。`,
        '交换加数位置时，数前面的符号要跟着这个数一起走：−3 + 5 − 7 换成 5 − 3 − 7，而不是 3 + 5 − 7。'
      ],
      examples: [
        {
          q: '计算 1 − 2 + 3 − 4 + … + 99 − 100。',
          steps: [
            '想：项数很多，但符号很有规律，相邻两项一配对，每对的结果都相同。',
            '(1 − 2) + (3 − 4) + … + (99 − 100)，每一对都是 −1。',
            '100 项正好配成 50 对，结果是 (−1) × 50 = −50。'
          ],
          ans: '−50'
        },
        {
          q: '计算 1 − 2 + 3 − 4 + … − 2026 + 2027。',
          steps: [
            '先数项数：1 到 2027 一共 2027 项，是奇数，不能全部配对。',
            '前 2026 项配成 1013 对，每对是 −1，合起来是 −1013。',
            '最后一项 2027 单独加：−1013 + 2027 = 1014。'
          ],
          ans: '1014'
        },
        {
          q: '计算 2 + 4 + 6 + … + 100。',
          steps: [
            '相邻两项都相差 2，可以首尾配对：2 + 100 = 4 + 98 = … = 102。',
            '项数：从 2 到 100 的偶数有 100 ÷ 2 = 50 个。',
            '和 =（首项 + 末项）× 项数 ÷ 2 = 102 × 50 ÷ 2 = 2550。'
          ],
          ans: '2550'
        },
        {
          q: '计算 3.7 − 5.4 + 6.3 − 4.6 + 2.5。',
          steps: [
            '观察小数部分：3.7 和 6.3 能凑成整数，−5.4 和 −4.6 也能。',
            '交换位置（符号跟着数走）：(3.7 + 6.3) + (−5.4 − 4.6) + 2.5。',
            '= 10 − 10 + 2.5 = 2.5。'
          ],
          ans: '2.5'
        },
        {
          q: `计算 ${fr(1, '1×2')} + ${fr(1, '2×3')} + ${fr(1, '3×4')} + … + ${fr(1, '99×100')}。`,
          steps: [
            '想：直接通分不可能，但每个分母都是相邻两个整数的积，可以裂项。',
            `每一项拆开：(1 − ${fr(1, 2)}) + (${fr(1, 2)} − ${fr(1, 3)}) + … + (${fr(1, 99)} − ${fr(1, 100)})。`,
            `中间的 ${fr(1, 2)}、${fr(1, 3)}……全部抵消，只剩 1 − ${fr(1, 100)} = ${fr(99, 100)}。`
          ],
          ans: fr(99, 100)
        },
        {
          q: `计算 ${fr(1, '1×3')} + ${fr(1, '3×5')} + … + ${fr(1, '19×21')}。`,
          steps: [
            `分母的两个因数相差 2：${fr(1, '<i>n</i>(<i>n</i> + 2)')} = ${fr(1, 2)} × (${fr(1, '<i>n</i>')} − ${fr(1, '<i>n</i> + 2')})。`,
            `原式 = ${fr(1, 2)} × [(1 − ${fr(1, 3)}) + (${fr(1, 3)} − ${fr(1, 5)}) + … + (${fr(1, 19)} − ${fr(1, 21)})]。`,
            `中括号里只剩 1 − ${fr(1, 21)} = ${fr(20, 21)}，再乘 ${fr(1, 2)}：${fr(10, 21)}。`
          ],
          ans: fr(10, 21)
        },
        {
          q: '计算 −2.5 × 37 + 2.5 × (−63)。',
          steps: [
            '两个积都含有 2.5，而且 37 + 63 正好是 100，适合逆用分配律。',
            '2.5 × (−63) = −2.5 × 63，所以原式 = −2.5 × (37 + 63)。',
            '= −2.5 × 100 = −250。'
          ],
          ans: '−250'
        },
        {
          q: '计算 S = 1 + 3 + 3<sup>2</sup> + 3<sup>3</sup> + 3<sup>4</sup> + 3<sup>5</sup>。',
          steps: [
            '后一项都是前一项的 3 倍，把整个式子乘 3，会“错开一位”。',
            '3S = 3 + 3<sup>2</sup> + 3<sup>3</sup> + 3<sup>4</sup> + 3<sup>5</sup> + 3<sup>6</sup>。',
            '两式相减，中间相同的项全部消掉：3S − S = 3<sup>6</sup> − 1 = 728，所以 S = 364。'
          ],
          ans: '364'
        },
        {
          q: `（挑战）计算 (1 + ${fr(1, 2)} + ${fr(1, 3)}) × (${fr(1, 2)} + ${fr(1, 3)} + ${fr(1, 4)}) − (1 + ${fr(1, 2)} + ${fr(1, 3)} + ${fr(1, 4)}) × (${fr(1, 2)} + ${fr(1, 3)})。`,
          steps: [
            `${fr(1, 2)} + ${fr(1, 3)} 反复出现，把它看成一个整体，记作 <i>t</i>。`,
            `原式 = (1 + <i>t</i>)(<i>t</i> + ${fr(1, 4)}) − (1 + <i>t</i> + ${fr(1, 4)})<i>t</i>。`,
            `展开：<i>t</i> + ${fr(1, 4)} + <i>t</i><sup>2</sup> + ${fr(1, 4)}<i>t</i> − <i>t</i> − <i>t</i><sup>2</sup> − ${fr(1, 4)}<i>t</i> = ${fr(1, 4)}。`
          ],
          ans: fr(1, 4)
        }
      ],
      quiz: [
        { type: 'fill', q: '1 − 2 + 3 − 4 + … + 49 − 50 = ______。', ans: ['-25'], why: '50 项配成 25 对，每对 −1，结果 −25。' },
        { type: 'fill', q: '1 − 2 + 3 − 4 + … − 98 + 99 = ______。', ans: ['50'], why: '99 项：前 98 项配成 49 对得 −49，再加最后的 99：−49 + 99 = 50。' },
        { type: 'fill', q: '−1 + 2 − 3 + 4 − … − 99 + 100 = ______。', ans: ['50'], why: '(−1 + 2) + (−3 + 4) + … + (−99 + 100)，50 对，每对 1，结果 50。' },
        { type: 'fill', q: '1 − 2 − 3 + 4 + 5 − 6 − 7 + 8 + … + 97 − 98 − 99 + 100 = ______。', ans: ['0'], why: '符号按“+ − − +”循环，每 4 个一组：1 − 2 − 3 + 4 = 0，5 − 6 − 7 + 8 = 0……100 ÷ 4 = 25 组，全是 0。' },
        { type: 'fill', q: '1 + 2 + 3 + … + 50 = ______。', ans: ['1275'], why: '倒序相加：(1 + 50) × 50 ÷ 2 = 1275。' },
        { type: 'fill', q: '1 + 3 + 5 + … + 99 = ______。', ans: ['2500'], why: '1 到 99 的奇数有 50 个，和 = (1 + 99) × 50 ÷ 2 = 2500。' },
        { type: 'choice', q: '101 + 102 + 103 + … + 200 = （　）。', opts: ['15050', '15150', '30100', '15000'], ans: 0, why: '项数 200 − 101 + 1 = 100，和 = (101 + 200) × 100 ÷ 2 = 15050。' },
        { type: 'fill', q: '(−20) + (−19) + … + (−1) + 0 + 1 + 2 + … + 21 = ______。', ans: ['21'], why: '−20 和 20、−19 和 19……互为相反数的两两抵消，0 不影响，只剩 21。' },
        { type: 'fill', q: '2.4 − 3.75 + 7.6 − 6.25 = ______。', ans: ['0'], why: '凑整：(2.4 + 7.6) + (−3.75 − 6.25) = 10 − 10 = 0。' },
        { type: 'fill', q: '(−0.125) × 37 × (−8) = ______。', ans: ['37'], why: '先算 (−0.125) × (−8) = 1，再乘 37 得 37。乘法可以交换顺序，先凑出整数。' },
        { type: 'choice', q: `下面的裂项，正确的是（　）。`, opts: [`${fr(1, '<i>n</i>(<i>n</i> + 1)')} = ${fr(1, '<i>n</i>')} + ${fr(1, '<i>n</i> + 1')}`, `${fr(1, '<i>n</i>(<i>n</i> + 1)')} = ${fr(1, '<i>n</i>')} − ${fr(1, '<i>n</i> + 1')}`, `${fr(1, '<i>n</i>(<i>n</i> + 1)')} = ${fr(1, '<i>n</i> + 1')} − ${fr(1, '<i>n</i>')}`, `${fr(1, '<i>n</i>(<i>n</i> + 2)')} = ${fr(1, '<i>n</i>')} − ${fr(1, '<i>n</i> + 2')}`], ans: 1, why: `用 <i>n</i> = 1 验算：1/(1×2) = ${fr(1, 2)}，1 − ${fr(1, 2)} = ${fr(1, 2)} ✓。第四个漏了前面的 ${fr(1, 2)}：1 − ${fr(1, 3)} = ${fr(2, 3)} ≠ ${fr(1, 3)}。` },
        { type: 'fill', q: `${fr(1, '1×2')} + ${fr(1, '2×3')} + … + ${fr(1, '9×10')} = ______。`, ans: ['9/10'], why: `裂项后只剩 1 − ${fr(1, 10)} = ${fr(9, 10)}。` },
        { type: 'fill', q: `${fr(1, 2)} + ${fr(1, 6)} + ${fr(1, 12)} + ${fr(1, 20)} + ${fr(1, 30)} = ______。`, ans: ['5/6'], why: `先认出分母：2 = 1×2，6 = 2×3，12 = 3×4，20 = 4×5，30 = 5×6。裂项后剩 1 − ${fr(1, 6)} = ${fr(5, 6)}。` },
        { type: 'fill', q: `${fr(1, '1×3')} + ${fr(1, '3×5')} + … + ${fr(1, '9×11')} = ______。`, ans: ['5/11'], why: `${fr(1, 2)} × (1 − ${fr(1, 11)}) = ${fr(1, 2)} × ${fr(10, 11)} = ${fr(5, 11)}。` },
        { type: 'choice', q: `小明算 ${fr(1, '1×3')} + ${fr(1, '3×5')} + ${fr(1, '5×7')}，写成 1 − ${fr(1, 7)} = ${fr(6, 7)}。正确答案是（　）。`, opts: [fr(6, 7), fr(3, 7), fr(1, 7), fr(12, 7)], ans: 1, why: `分母两个因数相差 2，裂项要乘 ${fr(1, 2)}：${fr(1, 2)} × (1 − ${fr(1, 7)}) = ${fr(3, 7)}。小明忘了乘 ${fr(1, 2)}。` },
        { type: 'fill', q: `${fr(1, '2×4')} + ${fr(1, '4×6')} + … + ${fr(1, '18×20')} = ______。`, ans: ['9/40'], why: `相差 2：${fr(1, 2)} × (${fr(1, 2)} − ${fr(1, 20)}) = ${fr(1, 2)} × ${fr(9, 20)} = ${fr(9, 40)}。注意剩下的头是 ${fr(1, 2)} 不是 1。` },
        { type: 'fill', q: '99 × (−36) = ______。', ans: ['-3564'], why: '(100 − 1) × (−36) = −3600 + 36 = −3564。' },
        { type: 'fill', q: `(−36) × (${fr(1, 4)} − ${fr(5, 9)} + ${fr(7, 12)}) = ______。`, ans: ['-10'], why: '用分配律分别乘：−36 × ' + fr(1, 4) + ' = −9，−36 × (−' + fr(5, 9) + ') = 20，−36 × ' + fr(7, 12) + ' = −21，合计 −9 + 20 − 21 = −10。' },
        { type: 'fill', q: '7.5 × 13 − 7.5 × 3 + 7.5 × (−20) = ______。', ans: ['-75'], why: '提出 7.5：7.5 × (13 − 3 − 20) = 7.5 × (−10) = −75。' },
        { type: 'fill', q: '1 + 2 + 2<sup>2</sup> + 2<sup>3</sup> + … + 2<sup>10</sup> = ______。', ans: ['2047'], why: '设和为 S，2S = 2 + 2<sup>2</sup> + … + 2<sup>11</sup>，相减得 S = 2<sup>11</sup> − 1 = 2048 − 1 = 2047。' },
        { type: 'fill', q: `1 + ${fr(1, 2)} + ${fr(1, 4)} + ${fr(1, 8)} + … + ${fr(1, 64)} = ______。`, ans: ['127/64'], why: `设和为 S，${fr(1, 2)}S = ${fr(1, 2)} + ${fr(1, 4)} + … + ${fr(1, 128)}，相减：${fr(1, 2)}S = 1 − ${fr(1, 128)}，S = 2 − ${fr(1, 64)} = ${fr(127, 64)}。` },
        { type: 'fill', q: `（挑战）(1 − ${fr(1, 2)} − ${fr(1, 3)}) × (${fr(1, 2)} + ${fr(1, 3)} + ${fr(1, 4)}) − (1 − ${fr(1, 2)} − ${fr(1, 3)} − ${fr(1, 4)}) × (${fr(1, 2)} + ${fr(1, 3)}) = ______。`, ans: ['1/4'], why: `设 <i>t</i> = ${fr(1, 2)} + ${fr(1, 3)}，原式 = (1 − <i>t</i>)(<i>t</i> + ${fr(1, 4)}) − (1 − <i>t</i> − ${fr(1, 4)})<i>t</i> = <i>t</i> + ${fr(1, 4)} − <i>t</i><sup>2</sup> − ${fr(1, 4)}<i>t</i> − <i>t</i> + <i>t</i><sup>2</sup> + ${fr(1, 4)}<i>t</i> = ${fr(1, 4)}。` },
        { type: 'fill', q: `（挑战）(${fr(1, 2)} + ${fr(1, 3)} + ${fr(1, 4)}) × (${fr(1, 3)} + ${fr(1, 4)} + ${fr(1, 5)}) − (${fr(1, 2)} + ${fr(1, 3)} + ${fr(1, 4)} + ${fr(1, 5)}) × (${fr(1, 3)} + ${fr(1, 4)}) = ______。`, ans: ['1/10'], why: `设 <i>t</i> = ${fr(1, 3)} + ${fr(1, 4)}，原式 = (${fr(1, 2)} + <i>t</i>)(<i>t</i> + ${fr(1, 5)}) − (${fr(1, 2)} + <i>t</i> + ${fr(1, 5)})<i>t</i>，展开后 <i>t</i><sup>2</sup> 和含 <i>t</i> 的项都消掉，只剩 ${fr(1, 2)} × ${fr(1, 5)} = ${fr(1, 10)}。` }
      ]
    },

    // ───────────────────────── 不定方程与整数解 ─────────────────────────
    c_int_eq: {
      goal: '知道一个二元一次方程有无数组解；会用“表示一个未知数 → 由正整数定范围 → 逐个试看能否整除”的方法求它的正整数解；会用奇偶性、公因数判断有没有整数解；会把购买、凑钱、租船一类问题列成不定方程，找出全部方案。',
      fj: '常见题型：① 求 3<i>x</i> + 5<i>y</i> = 31 一类方程的正整数解（填“有几组”或写出全部解）；② 购买方案、凑钱、租船问题，问有几种方案；③ 三个未知数、两个方程（如“百钱买百鸡”），先消去一个未知数，变成二元不定方程；④ 用奇偶性、整除判断方程有没有整数解。',
      sections: [
        {
          h: '一个方程，两个未知数：解有无数组',
          html: `<p>铅笔 3 元一支，本子 5 元一本，31 元正好花完，可以怎么买？设铅笔 ${X} 支、本子 ${Y} 本：3${X} + 5${Y} = 31。</p>
<p>只有一个方程却有两个未知数，如果 ${X}、${Y} 可以是任意数，它有<b>无数组解</b>。在坐标系里，这些解组成一条直线。</p>
<p>但实际问题要求 ${X}、${Y} 都是<b>正整数</b>，就只剩下直线经过的、在第一象限里的<b>整数点</b>，通常只有几个。</p>
<p class="try">拖动滑块改变 <i>a</i>、<i>b</i>、<i>c</i>，看直线 <i>ax</i> + <i>by</i> = <i>c</i> 上有哪些整数点；点“只看正整数解”。</p>`,
          anim: 'c_int_eq_grid'
        },
        {
          h: '筛选：用范围和整除排除',
          html: `<p class="formula">① 用一个未知数表示另一个　② 由“都是正整数”定出范围　③ 在范围内逐个试，看能否整除</p>
<p>3${X} + 5${Y} = 31：${X} ≥ 1，所以 5${Y} ≤ 28，${Y} ≤ 5。${Y} 只能是 1～5，逐个代入看 31 − 5${Y} 能不能被 3 整除：</p>
<table class="mini"><tr><th>${Y}</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><th>31 − 5${Y}</th><td>26</td><td>21</td><td>16</td><td>11</td><td>6</td></tr><tr><th>${X}</th><td>✗</td><td>7</td><td>✗</td><td>✗</td><td>2</td></tr></table>
<p><b>拿系数大的那个未知数来试</b>，范围小，试的次数少。</p>
<p class="try">选一个方程，点“试下一个”：橙色是系数大的那部分，剩下的蓝色能正好分完就是一组解。</p>`,
          anim: 'c_int_eq_try'
        },
        {
          h: '小技巧：奇偶性、公因数、相邻的解',
          html: `<p><b>看公因数：</b>4${X} + 6${Y} 一定是偶数，不可能等于 25，所以 4${X} + 6${Y} = 25 <b>没有整数解</b>。一般地，${A_}、${B_} 的公因数整除不了 <i>c</i>，<i>ax</i> + <i>by</i> = <i>c</i> 就没有整数解。</p>
<p><b>看奇偶、看末位：</b>5${X} + 2${Y} = 37 中 2${Y} 是偶数，37 是奇数，所以 5${X} 是奇数，${X} 只能是奇数，试的次数减少一半。</p>
<p><b>相邻的解有规律：</b>3${X} + 5${Y} = 31 的两组解 (7, 2) 和 (2, 5)：${X} 减少 5，${Y} 就增加 3，3 × 5 = 5 × 3，左边总和不变。找到一组解后，可以这样一组组推出其他解。</p>`
        },
        {
          h: '应用：方案问题',
          html: `<p>买东西、换零钱、租船、分组……只要“总数固定、每种的单价（容量）不同、个数必须是整数”，都能列成不定方程。</p>
<p>注意题目的限制：“每种至少一个”是正整数解，“可以不买”就允许 0；钱要“正好用完”是等式，“不超过”就要用不等式。</p>
<p>三个未知数、两个方程时，先<b>消去一个未知数</b>，变成二元不定方程，再按上面的方法试。</p>`
        }
      ],
      pitfalls: [
        '题目说“正整数解”时，0 和负数都不算；说“非负整数解”时 0 也算。看清楚再数。',
        '在范围内要全部试完，找到一组就停会漏解。',
        '应用题要回到实际意义：人数、件数必须是正整数；三元问题求出两个未知数后，别忘了检验第三个也符合要求（比如是 3 的倍数）。'
      ],
      examples: [
        {
          q: `求方程 2${X} + ${Y} = 7 的正整数解。`,
          steps: [
            `用 ${X} 表示 ${Y}：${Y} = 7 − 2${X}。`,
            `${Y} 要是正整数：7 − 2${X} &gt; 0，${X} &lt; 3.5，所以 ${X} 只能是 1、2、3。`,
            `${X} = 1 时 ${Y} = 5；${X} = 2 时 ${Y} = 3；${X} = 3 时 ${Y} = 1。`
          ],
          ans: `共 3 组：(1, 5)、(2, 3)、(3, 1)`
        },
        {
          q: `求方程 3${X} + 5${Y} = 31 的正整数解。`,
          steps: [
            `${Y} 的系数大，拿 ${Y} 来试：${X} ≥ 1，所以 5${Y} ≤ 28，${Y} ≤ 5。`,
            `${X} = ${fr('31 − 5<i>y</i>', 3)}，要求 31 − 5${Y} 是 3 的倍数。${Y} = 1～5 时，31 − 5${Y} 依次是 26、21、16、11、6，只有 21 和 6 是 3 的倍数。`,
            `${Y} = 2 时 ${X} = 7；${Y} = 5 时 ${X} = 2。可以看到相邻两组解 ${X} 相差 5、${Y} 相差 3。`
          ],
          ans: `${X} = 7，${Y} = 2 或 ${X} = 2，${Y} = 5`
        },
        {
          q: `求方程 7${X} + 4${Y} = 60 的正整数解。`,
          steps: [
            `${X} 的系数大，拿 ${X} 试：${Y} ≥ 1，7${X} ≤ 56，${X} ≤ 8。`,
            `4${Y} = 60 − 7${X} 要是 4 的倍数。60 是 4 的倍数，所以 7${X} 也要是 4 的倍数，${X} 必须是 4 的倍数：${X} = 4 或 8。`,
            `${X} = 4 时 ${Y} = 8；${X} = 8 时 ${Y} = 1。`
          ],
          ans: `${X} = 4，${Y} = 8 或 ${X} = 8，${Y} = 1`
        },
        {
          q: `方程 4${X} + 6${Y} = 25 有整数解吗？`,
          steps: [
            `4${X} 和 6${Y} 都是偶数，不管 ${X}、${Y} 取什么整数，左边都是偶数。`,
            '右边 25 是奇数，偶数不可能等于奇数。',
            '所以这个方程没有整数解，更没有正整数解。'
          ],
          ans: '没有整数解'
        },
        {
          q: '用 50 元买 3 元一本和 5 元一本的两种笔记本，钱正好用完，每种至少买一本，有几种买法？',
          steps: [
            `设 3 元的买 ${X} 本，5 元的买 ${Y} 本：3${X} + 5${Y} = 50，${X}、${Y} 是正整数。`,
            `拿 ${Y} 试：${X} ≥ 1，5${Y} ≤ 47，${Y} ≤ 9。50 − 5${Y} 要是 3 的倍数：${Y} = 1 得 45，${Y} = 4 得 30，${Y} = 7 得 15，其他都不行。`,
            `对应 ${X} = 15、10、5，共 3 种买法。`
          ],
          ans: '3 种：(15, 1)、(10, 4)、(5, 7)'
        },
        {
          q: '（挑战·百钱买百鸡）公鸡 5 元一只，母鸡 3 元一只，小鸡 1 元三只。用 100 元正好买 100 只鸡，三种都要有，有哪些买法？',
          steps: [
            `设公鸡 ${X} 只、母鸡 ${Y} 只、小鸡 <i>z</i> 只：${X} + ${Y} + <i>z</i> = 100，5${X} + 3${Y} + ${fr('<i>z</i>', 3)} = 100。`,
            `第二个方程乘 3：15${X} + 9${Y} + <i>z</i> = 300，减去第一个方程，消去 <i>z</i>：14${X} + 8${Y} = 200，即 7${X} + 4${Y} = 100。`,
            `${X} 要使 100 − 7${X} 是 4 的倍数，${X} 必须是 4 的倍数：${X} = 4、8、12（${X} = 16 时 ${Y} 为负）。对应 ${Y} = 18、11、4。`,
            '再求 <i>z</i> = 100 − <i>x</i> − <i>y</i>：78、81、84，都是 3 的倍数，符合“1 元三只”。'
          ],
          ans: '3 种：公鸡 4、母鸡 18、小鸡 78；公鸡 8、母鸡 11、小鸡 81；公鸡 12、母鸡 4、小鸡 84'
        }
      ],
      quiz: [
        { type: 'choice', q: `二元一次方程 2${X} − ${Y} = 3 的解有（　）。`, opts: ['只有 1 组', '2 组', '无数组', '没有'], ans: 2, why: `任给一个 ${X}，都能算出 ${Y} = 2${X} − 3，所以有无数组解。只有限定“正整数”等条件时，才只剩有限几组。` },
        { type: 'choice', q: `方程 ${X} + ${Y} = 5 的正整数解有（　）。`, opts: ['3 组', '4 组', '5 组', '无数组'], ans: 1, why: `(1, 4)、(2, 3)、(3, 2)、(4, 1)，共 4 组。${X} = 0 或 5 时另一个是 0，不是正整数。` },
        { type: 'fill', q: `方程 2${X} + 3${Y} = 12 的正整数解有______组。`, ans: ['1'], why: `${Y} ≤ 3。2${X} = 12 − 3${Y} 是偶数，${Y} 必须是偶数，只能 ${Y} = 2，此时 ${X} = 3。只有 1 组。` },
        { type: 'fill', q: `方程 ${X} + 2${Y} = 9 的正整数解有______组。`, ans: ['4'], why: `${Y} = 1、2、3、4 时 ${X} = 7、5、3、1，都是正整数；${Y} = 5 时 ${X} = −1，不行。共 4 组。` },
        { type: 'fill', q: `方程 5${X} + 3${Y} = 46 的正整数解有______组。`, ans: ['3'], why: `拿 ${X} 试：${X} ≤ 8。46 − 5${X} 要是 3 的倍数：${X} = 2 得 36，${X} = 5 得 21，${X} = 8 得 6。对应 ${Y} = 12、7、2，共 3 组。` },
        { type: 'fill', q: `方程 2${X} + 5${Y} = 23 的正整数解中，${X} 最大是______。`, ans: ['9'], why: `${Y} 越小 ${X} 越大。${Y} = 1 时 2${X} = 18，${X} = 9；另一组是 ${Y} = 3，${X} = 4。最大是 9。` },
        { type: 'choice', q: `方程 4${X} + 3${Y} = 29 的正整数解是（　）。`, opts: [`${X} = 2，${Y} = 7`, `${X} = 5，${Y} = 3`, `${X} = 2，${Y} = 7 和 ${X} = 5，${Y} = 3`, `${X} = 8，${Y} = −1`], ans: 2, why: `${X} ≤ 6，29 − 4${X} 是 3 的倍数：${X} = 2 时 21，${Y} = 7；${X} = 5 时 9，${Y} = 3。两组都要写，(8, −1) 中 ${Y} 是负数，不是正整数解。` },
        { type: 'choice', q: '下列方程中，没有整数解的是（　）。', opts: [`2${X} + 4${Y} = 7`, `3${X} + 2${Y} = 7`, `${X} + 4${Y} = 7`, `5${X} + 2${Y} = 7`], ans: 0, why: `2${X} + 4${Y} 总是偶数，不可能等于奇数 7。其他三个都有整数解，比如 (1, 2)、(3, 1)、(1, 1)。` },
        { type: 'choice', q: `方程 6${X} + 9${Y} = 20 的整数解有（　）。`, opts: ['无数组', '1 组', '2 组', '0 组'], ans: 3, why: `6${X} + 9${Y} = 3(2${X} + 3${Y}) 一定是 3 的倍数，而 20 不是 3 的倍数，所以没有整数解。` },
        { type: 'fill', q: `方程 5${X} + 2${Y} = 37 的正整数解有______组。`, ans: ['4'], why: `2${Y} 是偶数，37 是奇数，所以 5${X} 是奇数，${X} 只能取奇数：${X} = 1、3、5、7，对应 ${Y} = 16、11、6、1（${X} = 9 时 ${Y} 为负）。共 4 组。` },
        { type: 'fill', q: `已知 ${X} = 31，${Y} = 1 是方程 3${X} + 7${Y} = 100 的一组解，那么这个方程的正整数解一共有______组。`, ans: ['5'], why: `相邻两组解：${X} 减少 7，${Y} 就增加 3（3 × 7 = 7 × 3）。从 (31, 1) 出发：(24, 4)、(17, 7)、(10, 10)、(3, 13)，再往下 ${X} 就是负数了。共 5 组。` },
        { type: 'fill', q: `方程 2${X} + 3${Y} = 40 的正整数解有______组。`, ans: ['6'], why: `2${X} 是偶数，40 是偶数，所以 3${Y} 是偶数，${Y} 是偶数：${Y} = 2、4、6、8、10、12，对应 ${X} = 17、14、11、8、5、2（${Y} = 14 时 ${X} 为负）。共 6 组。` },
        { type: 'fill', q: '用面值 2 元和 5 元的纸币凑出 30 元，两种都要用，有______种凑法。', ans: ['2'], why: `2${X} + 5${Y} = 30，${Y} 必须是偶数：${Y} = 2 时 ${X} = 10，${Y} = 4 时 ${X} = 5，${Y} = 6 时 ${X} = 0（没用 2 元，不行）。共 2 种。` },
        { type: 'fill', q: '某班 34 人去划船，大船每条坐 6 人，小船每条坐 4 人，每条船都坐满，两种船都要租，有______种租法。', ans: ['3'], why: `6${X} + 4${Y} = 34，即 3${X} + 2${Y} = 17，${X} 必须是奇数：${X} = 1、3、5，对应 ${Y} = 7、4、1。共 3 种。` },
        { type: 'choice', q: '买 8 元一个的 A 种文具和 6 元一个的 B 种文具，正好花 100 元，每种至少买一个，有几种买法？', opts: ['2 种', '3 种', '4 种', '5 种'], ans: 2, why: `8${X} + 6${Y} = 100，即 4${X} + 3${Y} = 50。${X} ≤ 11，50 − 4${X} 是 3 的倍数：${X} = 2、5、8、11，对应 ${Y} = 14、10、6、2。共 4 种。` },
        { type: 'fill', q: '（挑战）钢笔 10 元一支，圆珠笔 3 元一支，铅笔 0.5 元一支。用 100 元正好买 50 支笔，三种都要有，钢笔买了______支。', ans: ['5'], why: `设钢笔 ${X}、圆珠笔 ${Y}、铅笔 <i>z</i>：${X} + ${Y} + <i>z</i> = 50，10${X} + 3${Y} + 0.5<i>z</i> = 100。第二式乘 2：20${X} + 6${Y} + <i>z</i> = 200，减去第一式：19${X} + 5${Y} = 150。19${X} 要是 5 的倍数，${X} = 5 时 ${Y} = 11，<i>z</i> = 34；${X} = 10 时 ${Y} 为负。所以钢笔买 5 支。` }
      ]
    },

    // ───────────────────────── 含参方程与方程组 ─────────────────────────
    c_param_eq: {
      goal: `会把含字母系数的一元一次方程整理成 ${A_}${X} = ${B_} 的形式，按 ${A_} 是否为 0 讨论唯一解、无解、无数解；会由方程（组）的解反求参数；会用整体代入处理方程组含参问题；会解“看错系数”“解为整数”一类问题。`,
      fj: `常见题型：① 讨论 ${A_}${X} = ${B_} 什么时候有唯一解、无解、无数解；② 已知 ${X} = 2 是方程的解，或两个方程同解，求字母的值；③ 方程组的解满足 ${X} + ${Y} = 某数，求参数（两式相加减，整体代入）；④ 甲、乙两人“看错系数”求原方程组；⑤ 方程的解是正整数，求整数参数。多以填空、选择出现，也是解答题的常见小问。`,
      sections: [
        {
          h: `整理成 ${A_}${X} = ${B_}，再看 ${A_}`,
          html: `<p>老师在黑板上写：(${A_} − 1)${X} = 4，问解是多少。同学们都说：两边除以 ${A_} − 1。老师追问：如果 ${A_} = 1 呢？</p>
<p>除数不能是 0。所以解含字母系数的方程，最后一步“两边除以系数”之前，要先看系数是不是 0：</p>
<table class="mini"><tr><th>${A_}${X} = ${B_}</th><th>解的情况</th></tr>
<tr><td>${A_} ≠ 0</td><td><b>唯一解</b> ${X} = ${fr(B_, A_)}</td></tr>
<tr><td>${A_} = 0，${B_} = 0</td><td>0${X} = 0，任何数都是解：<b>无数解</b></td></tr>
<tr><td>${A_} = 0，${B_} ≠ 0</td><td>0${X} = ${B_} 不可能：<b>无解</b></td></tr></table>
<p class="try">拖动滑块改变 <i>a</i>、<i>b</i>，或点“让 a 从 −3 走到 5”：<i>a</i> 越靠近 1，解跑得越远；正好等于 1 时，解突然“消失”或“布满”整条数轴。</p>`,
          anim: 'c_param_eq_slider'
        },
        {
          h: '先整理，再讨论',
          html: `<p>方程不一定一开始就是 ${A_}${X} = ${B_} 的样子。比如 <i>m</i>${X} − 2 = 3${X} + <i>n</i>：</p>
<p class="formula">移项：<i>m</i>${X} − 3${X} = <i>n</i> + 2　→　合并：(<i>m</i> − 3)${X} = <i>n</i> + 2</p>
<p>这时“${A_}”是 <i>m</i> − 3，“${B_}”是 <i>n</i> + 2，再按上面的表格讨论：<i>m</i> ≠ 3 时唯一解；<i>m</i> = 3 且 <i>n</i> = −2 时无数解；<i>m</i> = 3 且 <i>n</i> ≠ −2 时无解。</p>
<p class="try">拖动 <i>m</i>、<i>n</i>，点“下一步”看移项、合并的过程，最后看是哪种情况。</p>`,
          anim: 'c_param_eq_move'
        },
        {
          h: '已知解，代回去；方程组用整体',
          html: `<p><b>方程的解就是使方程成立的数。</b>已知 ${X} = 2 是方程的解，把 2 代进去，就得到关于字母的方程。两个方程<b>同解</b>：先解出不含字母的那个，再代入另一个。</p>
<p><b>方程组含参数，常常不必解出 ${X}、${Y}：</b>如果要求的是 ${X} + ${Y}，就把两个方程相加或相减，直接凑出 ${X} + ${Y}。</p>
<p><b>看错系数：</b>甲看错了第一个方程里的系数，他的解虽然不满足第一个方程，却满足<b>第二个方程</b>（他没看错的那个）。所以“谁看错哪个，就把他的解代入另一个”。</p>`
        },
        {
          h: '解是整数：参数要让除法除得尽',
          html: `<p>(${A_} − 1)${X} = 6 的解是正整数，${A_} 是整数，求 ${A_}。</p>
<p>${X} = ${fr(6, `${A_} − 1`)} 是正整数，说明 ${A_} − 1 是 6 的<b>正因数</b>：1、2、3、6，所以 ${A_} = 2、3、4、7。</p>
<p>如果只要求“整数解”，负因数 −1、−2、−3、−6 也可以，答案会翻倍——这是最常见的漏解点。</p>`
        }
      ],
      pitfalls: [
        `${A_}${X} = ${B_} 两边除以 ${A_} 之前，要先确认 ${A_} ≠ 0；${A_} 是字母时必须分情况讨论。`,
        `“方程有解”包括唯一解和无数解两种情况；“方程无解”要求 ${A_} = 0 且 ${B_} ≠ 0，两个条件缺一不可。`,
        '看错系数的题，看错谁就不能代入谁：甲看错第一个方程，他的解只能代入第二个方程。'
      ],
      examples: [
        {
          q: `讨论关于 ${X} 的方程 (${A_} − 1)${X} = 3 的解。`,
          steps: [
            `系数是 ${A_} − 1，要看它是不是 0。`,
            `${A_} ≠ 1 时，两边除以 ${A_} − 1，唯一解 ${X} = ${fr(3, `${A_} − 1`)}。`,
            `${A_} = 1 时，方程变成 0${X} = 3，左边永远是 0，无解。`
          ],
          ans: `${A_} ≠ 1 时 ${X} = ${fr(3, `${A_} − 1`)}；${A_} = 1 时无解`
        },
        {
          q: `关于 ${X} 的方程 (${A_} − 2)${X} = ${B_} − 3 有无数个解，求 ${A_}、${B_}。`,
          steps: [
            '无数解要求变成 0 = 0 的样子：系数和右边都是 0。',
            `${A_} − 2 = 0，${B_} − 3 = 0。`,
            `所以 ${A_} = 2，${B_} = 3。`
          ],
          ans: `${A_} = 2，${B_} = 3`
        },
        {
          q: `讨论关于 ${X} 的方程 <i>m</i>${X} − 2 = 3${X} + <i>n</i> 的解。`,
          steps: [
            `先整理成 ${A_}${X} = ${B_}：移项得 <i>m</i>${X} − 3${X} = <i>n</i> + 2，即 (<i>m</i> − 3)${X} = <i>n</i> + 2。`,
            `<i>m</i> ≠ 3 时，唯一解 ${X} = ${fr('<i>n</i> + 2', '<i>m</i> − 3')}。`,
            `<i>m</i> = 3 时变成 0${X} = <i>n</i> + 2：若 <i>n</i> = −2，无数解；若 <i>n</i> ≠ −2，无解。`
          ],
          ans: `<i>m</i> ≠ 3 唯一解；<i>m</i> = 3 且 <i>n</i> = −2 无数解；<i>m</i> = 3 且 <i>n</i> ≠ −2 无解`
        },
        {
          q: `已知 ${X} = 2 是关于 ${X} 的方程 ${A_}${X} + 3 = 5${X} − ${A_} 的解，求 ${A_}。`,
          steps: [
            `“${X} = 2 是解”就是把 2 代进去等式成立。`,
            `2${A_} + 3 = 10 − ${A_}。`,
            `3${A_} = 7，${A_} = ${fr(7, 3)}。`
          ],
          ans: `${A_} = ${fr(7, 3)}`
        },
        {
          q: `方程组 { 2${X} + ${Y} = 3<i>k</i> − 1，${X} + 2${Y} = −2 } 的解满足 ${X} + ${Y} = 1，求 <i>k</i>。`,
          steps: [
            `不必解出 ${X}、${Y}：两个方程的 ${X}、${Y} 系数交叉，相加正好得到 3${X} + 3${Y}。`,
            `两式相加：3${X} + 3${Y} = 3<i>k</i> − 3，所以 ${X} + ${Y} = <i>k</i> − 1。`,
            `由 ${X} + ${Y} = 1 得 <i>k</i> − 1 = 1，<i>k</i> = 2。`
          ],
          ans: '<i>k</i> = 2'
        },
        {
          q: `解方程组 { ${A_}${X} + 5${Y} = 15 ①，4${X} − ${B_}${Y} = −2 ② } 时，甲看错了 ${A_}，解得 ${X} = −3，${Y} = −1；乙看错了 ${B_}，解得 ${X} = 5，${Y} = 4。求 ${A_}、${B_}。`,
          steps: [
            `甲看错了 ${A_}（在方程①里），但方程②他没看错，所以他的解满足②：4 × (−3) − ${B_} × (−1) = −2，−12 + ${B_} = −2，${B_} = 10。`,
            `乙看错了 ${B_}（在方程②里），他的解满足①：5${A_} + 5 × 4 = 15，5${A_} = −5，${A_} = −1。`,
            `所以 ${A_} = −1，${B_} = 10。`
          ],
          ans: `${A_} = −1，${B_} = 10`
        },
        {
          q: `关于 ${X} 的方程 (${A_} − 1)${X} = 6 的解是正整数，求整数 ${A_} 的值。`,
          steps: [
            `${A_} = 1 时无解，所以 ${A_} ≠ 1，${X} = ${fr(6, `${A_} − 1`)}。`,
            `${X} 是正整数，说明 ${A_} − 1 是 6 的正因数：1、2、3、6。`,
            `所以 ${A_} = 2、3、4、7，对应的解 ${X} = 6、3、2、1。`
          ],
          ans: `${A_} = 2、3、4 或 7`
        }
      ],
      quiz: [
        { type: 'choice', q: `关于 ${X} 的方程 ${A_}${X} = 2 无解，则（　）。`, opts: [`${A_} = 0`, `${A_} ≠ 0`, `${A_} = 2`, `${A_} 为任意数`], ans: 0, why: `${A_} = 0 时变成 0${X} = 2，左边永远是 0，无解；${A_} ≠ 0 时有唯一解 ${X} = ${fr(2, A_)}。` },
        { type: 'choice', q: `关于 ${X} 的方程 (<i>k</i> + 2)${X} = <i>k</i> + 2 有无数个解，则 <i>k</i> = （　）。`, opts: ['2', '−2', '0', '任意数'], ans: 1, why: `无数解要求系数和右边都为 0：<i>k</i> + 2 = 0，<i>k</i> = −2，此时 0${X} = 0。其他 <i>k</i> 都有唯一解 ${X} = 1。` },
        { type: 'choice', q: `关于 ${X} 的方程 (<i>m</i> − 3)${X} = 5 有唯一解的条件是（　）。`, opts: ['<i>m</i> = 3', '<i>m</i> ≠ 3', '<i>m</i> ≠ 0', '<i>m</i> &gt; 3'], ans: 1, why: `系数 <i>m</i> − 3 ≠ 0 就能两边相除，得唯一解；<i>m</i> = 3 时 0${X} = 5 无解。` },
        { type: 'fill', q: `关于 ${X} 的方程 ${A_}${X} + 3 = 2${X} − ${B_} 有无数个解，则 ${A_} + ${B_} = ______。`, ans: ['-1'], why: `整理：(${A_} − 2)${X} = −${B_} − 3。无数解要求 ${A_} − 2 = 0 且 −${B_} − 3 = 0，${A_} = 2，${B_} = −3，和为 −1。` },
        { type: 'choice', q: `当 <i>m</i> = 2 时，关于 ${X} 的方程 <i>m</i>${X} + 1 = 2${X} + <i>m</i> 的解的情况是（　）。`, opts: [`唯一解 ${X} = 1`, '无解', '无数解', `${X} = 0`], ans: 1, why: `整理得 (<i>m</i> − 2)${X} = <i>m</i> − 1。<i>m</i> = 2 时 0${X} = 1，无解。` },
        { type: 'fill', q: `关于 ${X} 的方程 2(${X} − ${A_}) = ${A_}${X} + 4 无解，则 ${A_} = ______。`, ans: ['2'], why: `去括号移项：(2 − ${A_})${X} = 2${A_} + 4。无解要求 2 − ${A_} = 0 且 2${A_} + 4 ≠ 0：${A_} = 2 时右边是 8 ≠ 0，满足。` },
        { type: 'fill', q: `已知 ${X} = 3 是方程 2${X} − ${A_} = 1 的解，则 ${A_} = ______。`, ans: ['5'], why: `把 ${X} = 3 代入：6 − ${A_} = 1，${A_} = 5。` },
        { type: 'fill', q: `已知 ${X} = 1 是关于 ${X} 的方程 3${X} − ${A_} = ${A_}${X} + 2 的解，则 ${A_} = ______。`, ans: ['1/2'], why: `代入：3 − ${A_} = ${A_} + 2，2${A_} = 1，${A_} = ${fr(1, 2)}。` },
        { type: 'fill', q: `方程 2${X} + 3 = ${X} + 5 与关于 ${X} 的方程 3${X} − <i>m</i> = 4 的解相同，则 <i>m</i> = ______。`, ans: ['2'], why: `先解不含字母的：${X} = 2。代入另一个：6 − <i>m</i> = 4，<i>m</i> = 2。` },
        { type: 'fill', q: `关于 ${X}、${Y} 的方程组 { ${X} + ${Y} = 5<i>k</i>，${X} − ${Y} = 9<i>k</i> } 的解满足 2${X} + 3${Y} = 6，则 <i>k</i> = ______。`, ans: ['3/4'], why: `两式相加 2${X} = 14<i>k</i>，${X} = 7<i>k</i>；相减 2${Y} = −4<i>k</i>，${Y} = −2<i>k</i>。代入：14<i>k</i> − 6<i>k</i> = 8<i>k</i> = 6，<i>k</i> = ${fr(3, 4)}。` },
        { type: 'fill', q: `关于 ${X}、${Y} 的方程组 { 2${X} + ${Y} = 1 + 3<i>m</i>，${X} + 2${Y} = 1 − <i>m</i> } 的解满足 ${X} + ${Y} = 0，则 <i>m</i> = ______。`, ans: ['-1'], why: `两式相加：3${X} + 3${Y} = 2 + 2<i>m</i>。${X} + ${Y} = 0，所以 2 + 2<i>m</i> = 0，<i>m</i> = −1。` },
        { type: 'fill', q: `不论 <i>m</i> 取何值，方程组 { 3${X} + 2${Y} = <i>m</i> + 1，2${X} + ${Y} = <i>m</i> − 1 } 的解都满足 ${X} + ${Y} = ______。`, ans: ['2'], why: `两式相减：(3${X} + 2${Y}) − (2${X} + ${Y}) = (<i>m</i> + 1) − (<i>m</i> − 1)，即 ${X} + ${Y} = 2，和 <i>m</i> 无关。` },
        { type: 'choice', q: `解方程组 { ${A_}${X} + ${Y} = 7，${X} − ${B_}${Y} = 1 } 时，甲看错了 ${A_}，得 ${X} = 2，${Y} = −1；乙看错了 ${B_}，得 ${X} = 1，${Y} = 3。则（　）。`, opts: [`${A_} = 4，${B_} = −1`, `${A_} = 4，${B_} = 1`, `${A_} = −1，${B_} = 4`, `${A_} = 2，${B_} = −1`], ans: 0, why: `甲看错 ${A_}，解满足第二个方程：2 + ${B_} = 1，${B_} = −1。乙看错 ${B_}，解满足第一个方程：${A_} + 3 = 7，${A_} = 4。` },
        { type: 'fill', q: `方程组 { ${A_}${X} + ${B_}${Y} = 2，<i>c</i>${X} − 7${Y} = 8 }，甲正确地解得 ${X} = 3，${Y} = −2；乙看错了 <i>c</i>，解得 ${X} = −2，${Y} = 2。则 ${A_} + ${B_} + <i>c</i> = ______。`, ans: ['7'], why: `甲的解满足两个方程：3${A_} − 2${B_} = 2，3<i>c</i> + 14 = 8，<i>c</i> = −2。乙只看错 <i>c</i>，解满足第一个方程：−2${A_} + 2${B_} = 2。和 3${A_} − 2${B_} = 2 相加得 ${A_} = 4，再得 ${B_} = 5。4 + 5 − 2 = 7。` },
        { type: 'fill', q: `关于 ${X} 的方程 (${A_} − 1)${X} = 6 的解是正整数，则整数 ${A_} 有______个。`, ans: ['4'], why: `${A_} − 1 是 6 的正因数 1、2、3、6，${A_} = 2、3、4、7，共 4 个。` },
        { type: 'fill', q: `关于 ${X} 的方程 <i>k</i>${X} − 4 = 2${X} 的解是正整数，则整数 <i>k</i> 有______个。`, ans: ['3'], why: `整理：(<i>k</i> − 2)${X} = 4，<i>k</i> − 2 是 4 的正因数 1、2、4，<i>k</i> = 3、4、6，共 3 个。` },
        { type: 'fill', q: `关于 ${X} 的方程 (${A_} − 1)${X} = 6 的解是整数，则整数 ${A_} 有______个。`, ans: ['8'], why: `这次只要求整数解，${A_} − 1 可以是 6 的正因数或负因数：±1、±2、±3、±6，共 8 个，${A_} = 2、0、3、−1、4、−2、7、−5。别漏掉负因数。` },
        { type: 'fill', q: `（挑战）关于 ${X} 的方程 ${A_}${X} + 3 = 4${X} + 1 的解是正整数，所有整数 ${A_} 的和是______。`, ans: ['5'], why: `整理：(${A_} − 4)${X} = −2，${X} = ${fr(2, `4 − ${A_}`)}。${X} 是正整数，4 − ${A_} 是 2 的正因数 1 或 2，${A_} = 3 或 2，和为 5。` }
      ]
    },

    // ───────────────────────── 不等式综合 ─────────────────────────
    c_ineq_adv: {
      goal: '会在数轴上表示含参数的不等式（组）的解集，根据整数解的个数、有解或无解反求参数范围，并检验端点能否取等；会讨论 <i>ax</i> &gt; <i>b</i> 中 <i>a</i> 的正负；会把方程的解与不等式结合；会用不等式（组）设计方案。',
      fj: '常见题型：① 不等式组恰有 3 个整数解，求 <i>a</i> 的取值范围（端点能不能取等是难点）；② 不等式组有解、无解，求参数范围；③ (<i>a</i> − 1)<i>x</i> &gt; <i>a</i> − 1 的解集是 <i>x</i> &lt; 1，求 <i>a</i>；④ 方程（组）的解是正数或满足某个不等式，求参数范围；⑤ 方案设计：列不等式组求整数解，再比较费用选最省钱的方案。',
      sections: [
        {
          h: '数整数解：解集画在数轴上',
          html: `<p>{ ${X} &gt; ${A_}，${X} ≤ 3 } 恰好有 3 个整数解，${A_} 可以是多少？</p>
<p>3 是“定死”的端点，从它往左数：3、2、1 是解，0 不能是解。所以 ${A_} 要在 0 和 1 之间（或等于其中某个端点）。</p>
<p class="formula">画数轴 → 从已知端点数出需要的整数 → 确定参数的大致位置 → 端点单独代入检验能否取等</p>
<p>检验端点：${A_} = 0 时 ${X} &gt; 0，整数解 1、2、3 恰好 3 个，<b>能取</b>；${A_} = 1 时 ${X} &gt; 1，只剩 2、3，<b>不能取</b>。所以 0 ≤ ${A_} &lt; 1。</p>
<p class="try">拖动 <i>a</i>，看整数解的个数怎样变化；再点“扫一扫”，下面那条数轴会记录哪些 <i>a</i> 恰好满足要求。改一改“&gt;”和“≥”，端点的实心空心也会跟着变。</p>`,
          anim: 'c_ineq_adv_count'
        },
        {
          h: '有解、无解：两部分有没有重叠',
          html: `<p>不等式组 { ${X} &gt; ${A_}，${X} &lt; 2 } 有解，就是数轴上“${A_} 的右边”和“2 的左边”有公共部分，需要 ${A_} &lt; 2。</p>
<p>无解就是没有公共部分：${A_} ≥ 2。端点同样要检验：${A_} = 2 时 ${X} &gt; 2 且 ${X} &lt; 2，没有公共部分，所以无解时能取等号。</p>
<p>如果两个都带等号，比如 { ${X} ≥ ${A_}，${X} ≤ 3 }，${A_} = 3 时 ${X} = 3 是解，此时无解的条件就变成 ${A_} &gt; 3。<b>等号在不在，结论会不同。</b></p>`
        },
        {
          h: '系数含字母：除以负数要变号',
          html: `<p>解 <i>ax</i> &gt; <i>b</i>，最后要两边除以 <i>a</i>：</p>
<table class="mini"><tr><th><i>a</i> &gt; 0</th><td><i>x</i> &gt; ${fr('<i>b</i>', '<i>a</i>')}（方向不变）</td></tr>
<tr><th><i>a</i> &lt; 0</th><td><i>x</i> &lt; ${fr('<i>b</i>', '<i>a</i>')}（<b>方向改变</b>）</td></tr>
<tr><th><i>a</i> = 0</th><td>0 &gt; <i>b</i>：对就全体数都是解，不对就无解</td></tr></table>
<p>反过来，如果已知 (${A_} − 1)${X} &gt; ${A_} − 1 的解集是 ${X} &lt; 1，说明除的时候方向变了，${A_} − 1 &lt; 0，${A_} &lt; 1。</p>
<p class="try">拖动滑块改变 <i>a</i>、<i>b</i>，点“两边同时除以 a”，看不等号什么时候转了个身。</p>`,
          anim: 'c_ineq_adv_flip'
        },
        {
          h: '方程与不等式结合、方案设计',
          html: `<p><b>方程的解满足不等式：</b>先用参数表示方程的解，再把它代入不等式，得到关于参数的不等式。例如 2${X} − ${A_} = 1 的解是正数：${X} = ${fr(`1 + ${A_}`, 2)} &gt; 0，${A_} &gt; −1。</p>
<p><b>方案设计：</b>设一个量为 ${X}，按“费用不超过”“数量不少于”等条件列不等式组，求出 ${X} 的整数解，每一个整数解就是一种方案；再算出每种方案的费用，比较大小。</p>`
        }
      ],
      pitfalls: [
        '端点能不能取等，要把端点值代回原不等式组单独检验，不能凭感觉。',
        '不等式两边除以含字母的式子，先判断它的正负；判断不了就要分类讨论，还要单独看它等于 0 的情况。',
        '“恰有 3 个整数解”要从已知的那个端点开始往里数，数够 3 个后，第 4 个必须被排除。'
      ],
      examples: [
        {
          q: `关于 ${X} 的不等式组 { ${X} &gt; ${A_}，${X} ≤ 3 } 恰好有 3 个整数解，求 ${A_} 的取值范围。`,
          steps: [
            `解集是 ${A_} &lt; ${X} ≤ 3。从 3 往左数 3 个整数：3、2、1，而 0 不能是解。`,
            `1 是解：${A_} &lt; 1；0 不是解：${A_} ≥ 0（${X} &gt; ${A_} 中 0 不满足，就是 0 ≤ ${A_}）。`,
            `检验端点：${A_} = 0 时整数解 1、2、3，恰 3 个 ✓；${A_} = 1 时只有 2、3 ✗。`
          ],
          ans: `0 ≤ ${A_} &lt; 1`
        },
        {
          q: `关于 ${X} 的不等式组 { ${X} − ${A_} ≥ 0，5 − 2${X} &gt; 1 } 恰好有 3 个整数解，求 ${A_} 的取值范围。`,
          steps: [
            `先解每个不等式：${X} ≥ ${A_}；5 − 2${X} &gt; 1 得 ${X} &lt; 2。解集 ${A_} ≤ ${X} &lt; 2。`,
            `从 2 往左数（2 本身不是解）：1、0、−1 是解，−2 不能是解。所以 −2 &lt; ${A_} ≤ −1。`,
            `检验端点：${A_} = −1 时 ${X} ≥ −1，整数解 −1、0、1 恰 3 个 ✓；${A_} = −2 时多了 −2，4 个 ✗。`
          ],
          ans: `−2 &lt; ${A_} ≤ −1`
        },
        {
          q: `关于 ${X} 的不等式组 { ${X} &gt; ${A_}，${X} &lt; 2 } 无解，求 ${A_} 的取值范围。`,
          steps: [
            `无解就是在数轴上“${A_} 的右边”和“2 的左边”没有公共部分，${A_} 要在 2 的右边或正好在 2。`,
            `检验 ${A_} = 2：${X} &gt; 2 且 ${X} &lt; 2，确实没有数满足，所以可以取等号。`
          ],
          ans: `${A_} ≥ 2`
        },
        {
          q: `关于 ${X} 的不等式 (${A_} − 1)${X} &gt; ${A_} − 1 的解集是 ${X} &lt; 1，求 ${A_} 的取值范围。`,
          steps: [
            `两边除以 ${A_} − 1 之后，“&gt;”变成了“&lt;”，说明除的是负数。`,
            `所以 ${A_} − 1 &lt; 0，${A_} &lt; 1。`,
            `（${A_} − 1 = 0 时不等式变成 0 &gt; 0，无解，也不符合。）`
          ],
          ans: `${A_} &lt; 1`
        },
        {
          q: `关于 ${X} 的方程 2${X} − ${A_} = 1 的解是正数，求 ${A_} 的取值范围。`,
          steps: [
            `先把 ${A_} 当成已知数解方程：2${X} = 1 + ${A_}，${X} = ${fr(`1 + ${A_}`, 2)}。`,
            `解是正数：${fr(`1 + ${A_}`, 2)} &gt; 0，1 + ${A_} &gt; 0。`,
            `所以 ${A_} &gt; −1。`
          ],
          ans: `${A_} &gt; −1`
        },
        {
          q: '学校要买 A、B 两种树苗共 10 棵，A 每棵 30 元，B 每棵 20 元。要求总费用不超过 260 元，且 A 种不少于 4 棵。有几种购买方案？哪种最省钱？',
          steps: [
            `设买 A 种 ${X} 棵，B 种 (10 − ${X}) 棵。费用：30${X} + 20(10 − ${X}) ≤ 260，即 10${X} + 200 ≤ 260，${X} ≤ 6。`,
            `又 ${X} ≥ 4，所以 4 ≤ ${X} ≤ 6，${X} 取整数 4、5、6，共 3 种方案。`,
            `费用 = 10${X} + 200，${X} 越小越省：${X} = 4 时 240 元，最省钱（A 4 棵、B 6 棵）。`
          ],
          ans: '3 种方案；买 A 种 4 棵、B 种 6 棵最省钱，240 元'
        }
      ],
      quiz: [
        { type: 'fill', q: `不等式组 { ${X} &gt; −2，${X} ≤ 3 } 的整数解有______个。`, ans: ['5'], why: '−1、0、1、2、3，共 5 个。−2 不满足 x &gt; −2，3 满足 x ≤ 3。' },
        { type: 'fill', q: `不等式 3${X} − 1 &lt; 8 的正整数解有______个。`, ans: ['2'], why: `3${X} &lt; 9，${X} &lt; 3，正整数解是 1、2，共 2 个。` },
        { type: 'choice', q: `关于 ${X} 的不等式组 { ${X} &gt; ${A_}，${X} ≤ 2 } 恰有 2 个整数解，则 ${A_} 的取值范围是（　）。`, opts: [`0 &lt; ${A_} &lt; 1`, `0 ≤ ${A_} &lt; 1`, `0 &lt; ${A_} ≤ 1`, `0 ≤ ${A_} ≤ 1`], ans: 1, why: `整数解应是 2、1，0 不是解。${A_} = 0 时 ${X} &gt; 0，解为 1、2 ✓，能取；${A_} = 1 时只剩 2 ✗，不能取。` },
        { type: 'choice', q: `关于 ${X} 的不等式组 { ${X} ≥ ${A_}，${X} &lt; 3 } 恰有 4 个整数解，则 ${A_} 的取值范围是（　）。`, opts: [`−2 &lt; ${A_} ≤ −1`, `−2 ≤ ${A_} &lt; −1`, `−2 ≤ ${A_} ≤ −1`, `−1 &lt; ${A_} ≤ 0`], ans: 0, why: `整数解应是 2、1、0、−1，−2 不能是解。${A_} = −1 时 ${X} ≥ −1 正好 4 个 ✓；${A_} = −2 时多出 −2，5 个 ✗。` },
        { type: 'choice', q: `关于 ${X} 的不等式 ${X} − ${A_} ≤ 0 的正整数解只有 1、2、3，则 ${A_} 的取值范围是（　）。`, opts: [`3 &lt; ${A_} &lt; 4`, `3 ≤ ${A_} &lt; 4`, `3 &lt; ${A_} ≤ 4`, `3 ≤ ${A_} ≤ 4`], ans: 1, why: `${X} ≤ ${A_}，3 要是解：${A_} ≥ 3；4 不能是解：${A_} &lt; 4。${A_} = 3 时 ${X} ≤ 3 正好 ✓；${A_} = 4 时 4 也成了解 ✗。` },
        { type: 'fill', q: `关于 ${X} 的不等式组 { ${X} &gt; −1，${X} &lt; ${A_} } 恰有 2 个整数解，且 ${A_} 是整数，则 ${A_} = ______。`, ans: ['2'], why: `整数解应是 0、1，2 不能是解：1 &lt; ${A_} ≤ 2。整数 ${A_} = 2（${A_} = 2 时 ${X} &lt; 2，解 0、1 ✓）。` },
        { type: 'choice', q: `关于 ${X} 的不等式组 { ${X} &gt; ${A_}，${X} &lt; 3 } 有解，则（　）。`, opts: [`${A_} &lt; 3`, `${A_} ≤ 3`, `${A_} &gt; 3`, `${A_} ≥ 3`], ans: 0, why: `需要 ${A_} 和 3 之间有数，${A_} &lt; 3。${A_} = 3 时 ${X} &gt; 3 且 ${X} &lt; 3 无解，不能取等。` },
        { type: 'choice', q: `关于 ${X} 的不等式组 { ${X} ≥ ${A_}，${X} ≤ 3 } 无解，则（　）。`, opts: [`${A_} ≥ 3`, `${A_} &gt; 3`, `${A_} &lt; 3`, `${A_} ≤ 3`], ans: 1, why: `${A_} = 3 时 ${X} = 3 满足两个条件，有解！所以无解要 ${A_} &gt; 3，不能取等。这是和上一题最大的区别。` },
        { type: 'choice', q: `关于 ${X} 的不等式组 { ${X} − 1 &gt; 0，${X} &lt; <i>m</i> } 无解，则（　）。`, opts: ['<i>m</i> &lt; 1', '<i>m</i> ≤ 1', '<i>m</i> &gt; 1', '<i>m</i> ≥ 1'], ans: 1, why: `${X} &gt; 1 和 ${X} &lt; <i>m</i> 没有公共部分，<i>m</i> ≤ 1。<i>m</i> = 1 时 ${X} &gt; 1 且 ${X} &lt; 1 无解，能取等。` },
        { type: 'choice', q: `若 ${A_} &lt; 0，则关于 ${X} 的不等式 ${A_}${X} &gt; 2${A_} 的解集是（　）。`, opts: [`${X} &gt; 2`, `${X} &lt; 2`, `${X} &gt; −2`, `${X} &lt; −2`], ans: 1, why: `两边除以负数 ${A_}，不等号改变方向：${X} &lt; 2。` },
        { type: 'choice', q: `关于 ${X} 的不等式 (<i>m</i> − 2)${X} &gt; <i>m</i> − 2 的解集是 ${X} &lt; 1，则（　）。`, opts: ['<i>m</i> &gt; 2', '<i>m</i> &lt; 2', '<i>m</i> = 2', '<i>m</i> ≠ 2'], ans: 1, why: '不等号方向变了，说明除的是负数：<i>m</i> − 2 &lt; 0，<i>m</i> &lt; 2。' },
        { type: 'choice', q: `关于 ${X} 的不等式 ${A_}${X} &gt; ${B_} 的解集是 ${X} &lt; ${fr(B_, A_)}，则（　）。`, opts: [`${A_} &gt; 0`, `${A_} &lt; 0`, `${A_} = 0`, `${A_} ≠ 0`], ans: 1, why: `“&gt;”变成了“&lt;”，两边除以的 ${A_} 一定是负数。` },
        { type: 'choice', q: `当 ${A_} = 0 时，关于 ${X} 的不等式 ${A_}${X} &gt; −1 的解集是（　）。`, opts: ['无解', `${X} &gt; 0`, '任意有理数', `${X} &lt; 0`], ans: 2, why: `${A_} = 0 时变成 0 &gt; −1，不管 ${X} 是几都成立，所以任意有理数都是解。不能“两边除以 0”。` },
        { type: 'choice', q: `关于 ${X} 的方程 3${X} − 2${A_} = 6 的解是负数，则（　）。`, opts: [`${A_} &lt; −3`, `${A_} &gt; −3`, `${A_} &lt; 3`, `${A_} &gt; 3`], ans: 0, why: `${X} = ${fr(`6 + 2${A_}`, 3)} &lt; 0，6 + 2${A_} &lt; 0，${A_} &lt; −3。` },
        { type: 'choice', q: `关于 ${X}、${Y} 的方程组 { 2${X} + ${Y} = <i>k</i> + 1，${X} + 2${Y} = 2 } 的解满足 ${X} + ${Y} &lt; 1，则（　）。`, opts: ['<i>k</i> &lt; 0', '<i>k</i> &gt; 0', '<i>k</i> &lt; 1', '<i>k</i> &gt; −3'], ans: 0, why: `两式相加：3${X} + 3${Y} = <i>k</i> + 3，${X} + ${Y} = ${fr('<i>k</i> + 3', 3)} &lt; 1，<i>k</i> + 3 &lt; 3，<i>k</i> &lt; 0。` },
        { type: 'fill', q: `关于 ${X} 的方程 ${X} + 2 = <i>m</i> 的解是非负数，<i>m</i> 的最小整数值是______。`, ans: ['2'], why: `${X} = <i>m</i> − 2 ≥ 0，<i>m</i> ≥ 2，最小整数是 2。“非负数”包括 0，所以能取等。` },
        { type: 'fill', q: '商店购进 A、B 两种商品共 20 件，A 每件 40 元，B 每件 25 元。总费用不超过 650 元，且 A 至少 8 件，共有______种进货方案。', ans: ['3'], why: '设 A 为 x 件：40x + 25(20 − x) ≤ 650，15x ≤ 150，x ≤ 10；又 x ≥ 8，x = 8、9、10，共 3 种。' },
        { type: 'fill', q: '接上题，最省钱的方案总费用是______元。', ans: ['620'], why: '费用 = 15x + 500，x 越小越省。x = 8 时：15 × 8 + 500 = 620 元。' },
        { type: 'fill', q: '（挑战）把一些苹果分给几个小朋友：每人 3 个，还剩 8 个；每人 5 个，那么最后一个小朋友分到了苹果，但不到 3 个。苹果一共有______个。', ans: ['26'], why: '设有 n 个小朋友，苹果 3n + 8 个。前 n − 1 人各 5 个，最后一人分到 3n + 8 − 5(n − 1) = 13 − 2n 个，要求 1 ≤ 13 − 2n &lt; 3，得 5 &lt; n ≤ 6，n = 6，苹果 3 × 6 + 8 = 26 个。' }
      ]
    },

    // ───────────────────────── 整数问题 ─────────────────────────
    c_integer: {
      goal: '会找乘方个位数字的周期，求 2<sup>2026</sup> 一类大数的个位，以及几个乘方的和、差的个位；会用余数的周期和“和差积的余数等于余数的和差积”求大数除以某数的余数；会用整除特征判断和填数；会用奇偶性判断“能不能做到”。',
      fj: '常见题型：① 求 3<sup>2026</sup>、7<sup>2026</sup> 的个位数字，或几个乘方的和、积的个位；② 求 2<sup>100</sup> 除以 7 的余数；③ 判断一个多位数能否被 3、4、9、11 整除，或在方框里填数字使它能被整除；④ 用奇偶性判断“能不能做到”，如在 1～10 之间添加正负号使结果为 0、翻杯子问题。多以填空、选择出现。',
      sections: [
        {
          h: '个位数字会转圈',
          html: `<p>2<sup>2026</sup> 是一个 600 多位的大数，谁也算不出来，可它的个位数字却很容易知道。</p>
<p>乘积的个位只由两个因数的个位决定。所以算 2 的乘方的个位，只要把上一个个位乘 2 再取个位：2 → 4 → 8 → 6 → 2 → 4 → …… 四个一循环。</p>
<table class="mini"><tr><th>底数的个位</th><td>0、1、5、6</td><td>4、9</td><td>2、3、7、8</td></tr><tr><th>个位的周期</th><td>1（不变）</td><td>2</td><td>4</td></tr></table>
<p class="formula">求 <i>a</i><sup><i>n</i></sup> 的个位：<i>n</i> ÷ 4 看余数，余 1、2、3 取周期里第 1、2、3 个，余 0 取第 4 个</p>
<p class="try">选一个底数，点“下一项”，看个位数字怎样转圈；输入 n，点“求第 n 项的个位”。</p>`,
          anim: 'c_integer_cycle'
        },
        {
          h: '余数也会转圈',
          html: `<p>求 2<sup>100</sup> 除以 7 的余数，同样不用算出 2<sup>100</sup>：</p>
<p class="formula">和、差、积除以 <i>m</i> 的余数，等于各自的余数相加、减、乘后再除以 <i>m</i> 的余数</p>
<p>所以下一个余数 = 上一个余数 × 2 再除以 7 的余数：2 → 4 → 1 → 2 → 4 → 1……三个一循环。100 ÷ 3 = 33 余 1，取第 1 个，余数是 2。</p>
<p>余数只有 0～6 这 7 种可能，走下去一定会遇到走过的余数，从那以后就开始重复。</p>
<p class="try">在“余数钟”上点“乘一次”，看余数怎样走回原来的地方。</p>`,
          anim: 'c_integer_clock'
        },
        {
          h: '整除特征',
          html: `<table class="mini"><tr><th>能被……整除</th><th>看什么</th></tr>
<tr><td>2、5</td><td>个位</td></tr>
<tr><td>4、25</td><td>末两位组成的数</td></tr>
<tr><td>8、125</td><td>末三位组成的数</td></tr>
<tr><td>3、9</td><td>各位数字之和</td></tr>
<tr><td>11</td><td>从右往左，奇数位上的数字和与偶数位上的数字和之差（是 0 或 11 的倍数）</td></tr></table>
<p>同时被 3 和 4 整除，就是被 12 整除；同时被 2 和 9 整除，就是被 18 整除。</p>
<p>一个数除以 9 的余数，等于它各位数字之和除以 9 的余数，用来求大数的余数很方便。</p>`
        },
        {
          h: '奇偶分析',
          html: `<p>奇数 ± 奇数 = 偶数，奇数 ± 偶数 = 奇数。把一个加号改成减号，结果减少了这个数的 2 倍（偶数），<b>奇偶性不变</b>。</p>
<p>在 1、2、…、10 之间添上“+”或“−”，结果能是 0 吗？全用加号是 55（奇数），不管怎么改，结果都是奇数，不可能等于 0。</p>
<p>“操作前后某个量的奇偶性不变”是判断“做不到”的常用方法。</p>`
        }
      ],
      pitfalls: [
        '<i>n</i> ÷ 4 余 0 时，个位要取周期里的<b>第 4 个</b>（最后一个），不是第 1 个。',
        '求个位只看底数的个位：13<sup>2026</sup>、2023<sup>2026</sup> 的个位和 3<sup>2026</sup> 一样；但求除以 7 的余数时不能只看个位，要看整个数除以 7 的余数。',
        '判断能否被 11 整除，是奇数位数字和与偶数位数字和的<b>差</b>，不是各位数字之和。'
      ],
      examples: [
        {
          q: '求 2<sup>2026</sup> 的个位数字。',
          steps: [
            '先列出前几项的个位：2、4、8、6、2、4……四个一循环。',
            '2026 ÷ 4 = 506 余 2，取周期里第 2 个。',
            '所以个位是 4。'
          ],
          ans: '4'
        },
        {
          q: '求 7<sup>2026</sup> + 3<sup>2026</sup> 的个位数字。',
          steps: [
            '7 的乘方个位：7、9、3、1 循环；3 的乘方个位：3、9、7、1 循环。',
            '2026 ÷ 4 余 2，都取第 2 个：7<sup>2026</sup> 个位是 9，3<sup>2026</sup> 个位是 9。',
            '和的个位只看个位相加：9 + 9 = 18，个位是 8。'
          ],
          ans: '8'
        },
        {
          q: '求 2027<sup>2027</sup> 的个位数字。',
          steps: [
            '只看底数的个位 7：周期 7、9、3、1。',
            '2027 ÷ 4 = 506 余 3，取第 3 个。',
            '个位是 3。'
          ],
          ans: '3'
        },
        {
          q: '求 2<sup>100</sup> 除以 7 的余数。',
          steps: [
            '算前几项除以 7 的余数：2<sup>1</sup> 余 2，2<sup>2</sup> = 4 余 4，2<sup>3</sup> = 8 余 1，2<sup>4</sup> 的余数 = 1 × 2 = 2……',
            '余数按 2、4、1 循环，周期 3。',
            '100 ÷ 3 = 33 余 1，取第 1 个，余数是 2。'
          ],
          ans: '2'
        },
        {
          q: '求 2026 × 2027 除以 9 的余数。',
          steps: [
            '除以 9 的余数看各位数字之和：2026 → 2 + 0 + 2 + 6 = 10，余 1；2027 → 11，余 2。',
            '积的余数 = 余数的积再取余：1 × 2 = 2。',
            '所以余数是 2。（验算：2026 × 2027 = 4106702，数字和 20，除以 9 余 2 ✓）'
          ],
          ans: '2'
        },
        {
          q: '在三位数 7□2 的方框里填一个数字，使它能同时被 3 和 4 整除，可以填几？',
          steps: [
            '被 4 整除看末两位“□2”：12、32、52、72、92 是 4 的倍数，□ 可以是 1、3、5、7、9。',
            '被 3 整除看数字和 7 + □ + 2 = 9 + □，□ 可以是 0、3、6、9。',
            '同时满足：□ = 3 或 9（732 = 12 × 61，792 = 12 × 66）。'
          ],
          ans: '3 或 9'
        },
        {
          q: '918082 能被 11 整除吗？',
          steps: [
            '从右往左数：第 1、3、5 位（奇数位）是 2、0、1，和为 3；第 2、4、6 位（偶数位）是 8、8、9，和为 25。',
            '差：25 − 3 = 22，是 11 的倍数。',
            '所以能被 11 整除（918082 = 11 × 83462）。'
          ],
          ans: '能'
        },
        {
          q: '在 1、2、3、…、10 这 10 个数之间添上“+”或“−”，能使结果等于 0 吗？',
          steps: [
            '先全部用加号：1 + 2 + … + 10 = 55，是奇数。',
            '把某个数 <i>k</i> 前面的“+”改成“−”，结果减少 2<i>k</i>，是偶数，奇偶性不变。',
            '所以无论怎样添符号，结果都是奇数，不可能是 0。'
          ],
          ans: '不能'
        }
      ],
      quiz: [
        { type: 'fill', q: '3<sup>2026</sup> 的个位数字是______。', ans: ['9'], why: '3 的乘方个位按 3、9、7、1 循环，2026 ÷ 4 余 2，取第 2 个：9。' },
        { type: 'fill', q: '2<sup>2027</sup> 的个位数字是______。', ans: ['8'], why: '2、4、8、6 循环，2027 ÷ 4 余 3，取第 3 个：8。' },
        { type: 'fill', q: '7<sup>100</sup> 的个位数字是______。', ans: ['1'], why: '7、9、3、1 循环，100 ÷ 4 余 0，取第 4 个（最后一个）：1。' },
        { type: 'fill', q: '4<sup>2026</sup> 的个位数字是______。', ans: ['6'], why: '4 的乘方个位按 4、6 循环，周期 2。2026 是偶数，取第 2 个：6。' },
        { type: 'choice', q: '3 的乘方 3、9、27、81、243、…… 的个位数字的周期是（　）。', opts: ['2', '3', '4', '10'], ans: 2, why: '个位依次是 3、9、7、1、3、9……每 4 个重复一次，周期是 4。' },
        { type: 'fill', q: '2<sup>2026</sup> + 3<sup>2026</sup> 的个位数字是______。', ans: ['3'], why: '2026 ÷ 4 余 2：2<sup>2026</sup> 个位 4，3<sup>2026</sup> 个位 9。4 + 9 = 13，个位 3。' },
        { type: 'fill', q: '2026<sup>2026</sup> 的个位数字是______。', ans: ['6'], why: '底数个位是 6，6 × 6 = 36 个位还是 6，6 的任何次方个位都是 6。' },
        { type: 'fill', q: '19<sup>2026</sup> − 1 的个位数字是______。', ans: ['0'], why: '只看 9：9 的乘方个位按 9、1 循环，2026 是偶数，个位是 1。1 − 1 = 0，个位是 0。' },
        { type: 'fill', q: '（挑战）2 + 2<sup>2</sup> + 2<sup>3</sup> + … + 2<sup>2026</sup> 的个位数字是______。', ans: ['6'], why: '每连续 4 项个位是 2、4、8、6，和 20，个位 0。2026 = 4 × 506 + 2，前 2024 项个位和的个位是 0，剩下 2<sup>2025</sup>（个位 2）和 2<sup>2026</sup>（个位 4），2 + 4 = 6。' },
        { type: 'fill', q: '2<sup>2026</sup> 除以 7 的余数是______。', ans: ['2'], why: '余数按 2、4、1 循环。2026 ÷ 3 = 675 余 1，取第 1 个：2。' },
        { type: 'fill', q: '3<sup>100</sup> 除以 5 的余数是______。', ans: ['1'], why: '除以 5 的余数看个位。3<sup>100</sup>：100 ÷ 4 余 0，个位是 1，所以除以 5 余 1。' },
        { type: 'fill', q: '3<sup>2026</sup> 除以 7 的余数是______。', ans: ['4'], why: '余数：3、2、6、4、5、1，然后又是 3……周期 6。2026 ÷ 6 = 337 余 4，取第 4 个：4。' },
        { type: 'fill', q: '2026 × 2027 × 2028 除以 5 的余数是______。', ans: ['1'], why: '三个数除以 5 分别余 1、2、3，积的余数 = 1 × 2 × 3 = 6 再除以 5，余 1。' },
        { type: 'fill', q: '123 + 456 + 789 除以 9 的余数是______。', ans: ['0'], why: '各数除以 9 的余数看数字和：6、15、24，即余 6、6、6。6 + 6 + 6 = 18，除以 9 余 0。（1368 = 9 × 152）' },
        { type: 'fill', q: '四位数 4□35 能被 9 整除，□ 里应填______。', ans: ['6'], why: '数字和 4 + □ + 3 + 5 = 12 + □ 要是 9 的倍数，□ = 6（4635 = 9 × 515）。' },
        { type: 'choice', q: '下列各数中，能被 4 整除的是（　）。', opts: ['2026', '3018', '5132', '7114'], ans: 2, why: '看末两位：26、18、14 都不是 4 的倍数，32 = 4 × 8 是，所以 5132 能被 4 整除。' },
        { type: 'choice', q: '下列各数中，能被 11 整除的是（　）。', opts: ['2025', '3158', '4817', '5049'], ans: 3, why: '5049：奇数位 9 + 0 = 9，偶数位 4 + 5 = 9，差为 0，能被 11 整除（5049 = 11 × 459）。其他三个的差分别是 1、1、10，都不行。' },
        { type: 'fill', q: '在三位数 5□4 的方框里填数字，使它同时能被 3 和 4 整除，□ 最大能填______。', ans: ['6'], why: '被 4 整除：□4 是 4 的倍数，□ 是 0、2、4、6、8；被 3 整除：5 + □ + 4 = 9 + □，□ 是 0、3、6、9。同时满足的是 0 和 6，最大是 6（564 = 12 × 47）。' },
        { type: 'choice', q: '在 1、2、3、…、9 每相邻两个数之间添上“+”或“−”，计算结果可能是（　）。', opts: ['0', '10', '15', '100'], ans: 2, why: '全用加号得 45，改符号不改变奇偶性，结果一定是奇数，且不超过 45。0、10、100 都不行；15 可以，例如把 7、8 前面改成减号：45 − 2 × 15 = 15。' },
        { type: 'choice', q: '桌上有 7 个杯子，杯口全部朝上。每次同时翻动其中 2 个，能否经过若干次翻动，使杯口全部朝下？', opts: ['能，翻 4 次', '能，翻 7 次', '不能', '不一定'], ans: 2, why: '每次翻 2 个，杯口朝上的个数变化 −2、0 或 +2，奇偶性不变。开始朝上 7 个（奇数），全部朝下时朝上 0 个（偶数），不可能。' }
      ]
    },

    // ───────────────────────── 规律探究 ─────────────────────────
    c_pattern: {
      goal: '会从数列、算式、图形中找出变化规律，用含 <i>n</i> 的式子表示第 <i>n</i> 项，并用它求第 100 项或判断某个数是第几项；会处理带正负号和分数的数列、循环规律、火柴棒和点阵问题；猜出式子后会代入验证。',
      fj: '常见题型：① 数列 2、5、8、11、…… 写出第 <i>n</i> 项（等差型 <i>an</i> + <i>b</i>）；② 带正负号、分数的数列，如 ' + fr(1, 2) + '、−' + fr(2, 5) + '、' + fr(3, 10) + '、……；③ 火柴棒、点阵、瓷砖图形逐个增加，求第 <i>n</i> 个图形的根数或个数；④ 循环规律：第 2026 个是什么；⑤ 算式规律：1 + 3 + 5 + … + (2<i>n</i> − 1) = <i>n</i><sup>2</sup>。多以填空题的压轴题出现。',
      sections: [
        {
          h: '相邻两项的差不变：等差型 an + b',
          html: `<p>用火柴棒摆一排正方形：1 个正方形用 4 根，2 个用 7 根，3 个用 10 根……摆 100 个要多少根？</p>
<p>先列表算差：4、7、10、13，每次多 3 根。因为相邻两个正方形<b>共用一条边</b>，每加一个只需要再加 3 根。</p>
<p class="formula">每次增加 <i>d</i> 个，第 1 项是 <i>a</i><sub>1</sub>：第 <i>n</i> 项 = <i>a</i><sub>1</sub> + <i>d</i>(<i>n</i> − 1) = <i>dn</i> + (<i>a</i><sub>1</sub> − <i>d</i>)</p>
<p>正方形一排：4 + 3(<i>n</i> − 1) = 3<i>n</i> + 1，第 100 个用 301 根。</p>
<p class="try">选一种图形，点“加一个”：橙色是新加的火柴，下面的表格同步记下根数。</p>`,
          anim: 'c_pattern_match'
        },
        {
          h: '差在变化：平方数、三角形数',
          html: `<p>有的数列相邻两项的差不是固定的，而是 1、3、5、7……或 1、2、3、4……这时可以用点阵来想。</p>
<p>正方形点阵：每次在外面包一层 L 形，新的一层依次是 1、3、5、7……个点，所以</p>
<p class="formula">1 + 3 + 5 + … + (2<i>n</i> − 1) = <i>n</i><sup>2</sup>　　1 + 2 + 3 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1) ÷ 2</p>
<p>三角形点阵是 1、3、6、10……把两个一样的三角形倒过来拼，正好是 <i>n</i> × (<i>n</i> + 1) 的长方形。</p>
<p class="try">选择点阵类型，点“下一个”看它怎样长大；三角形点阵再点“再拼一个倒过来的”。</p>`,
          anim: 'c_pattern_dots'
        },
        {
          h: '符号、分数、循环',
          html: `<p><b>正负交替：</b>用 (−1)<sup><i>n</i></sup> 或 (−1)<sup><i>n</i>+1</sup> 管符号。第 1 项是负的用 (−1)<sup><i>n</i></sup>，第 1 项是正的用 (−1)<sup><i>n</i>+1</sup>。</p>
<p><b>分数：</b>分子、分母<b>分开找规律</b>。比如 ${fr(1, 2)}、${fr(2, 5)}、${fr(3, 10)}、${fr(4, 17)}：分子是 <i>n</i>，分母 2、5、10、17 是 <i>n</i><sup>2</sup> + 1。</p>
<p><b>循环：</b>按固定的顺序重复出现时，先找周期，第 <i>n</i> 个就看 <i>n</i> 除以周期的余数（余 0 对应周期的最后一个）。</p>`
        },
        {
          h: '猜出来，还要验证',
          html: `<p>找规律的步骤：</p>
<p class="formula">算出前几项 → 观察相邻两项的关系 → 猜出第 <i>n</i> 项 → 代入 <i>n</i> = 1、2、3 检验</p>
<p>验证很重要：3<i>n</i> + 1 和 3<i>n</i> − 2 只差一点点，代入 <i>n</i> = 1 一看就知道哪个对。</p>
<p>算式规律也一样：1<sup>3</sup> = 1<sup>2</sup>，1<sup>3</sup> + 2<sup>3</sup> = 3<sup>2</sup>，1<sup>3</sup> + 2<sup>3</sup> + 3<sup>3</sup> = 6<sup>2</sup>……右边的 1、3、6 是三角形数，所以 1<sup>3</sup> + 2<sup>3</sup> + … + <i>n</i><sup>3</sup> = (1 + 2 + … + <i>n</i>)<sup>2</sup>。</p>`
        }
      ],
      pitfalls: [
        '写出第 <i>n</i> 项后，一定要代入 <i>n</i> = 1、2、3 验算，最容易错的是“差 1”（多算或少算一个）。',
        '(−1)<sup><i>n</i></sup> 在 <i>n</i> 为奇数时是 −1。如果第 1 项是正的，要用 (−1)<sup><i>n</i>+1</sup>。',
        '循环问题余数为 0 时，对应周期的最后一个，不是第一个。'
      ],
      examples: [
        {
          q: '数列 2、5、8、11、…… 的第 <i>n</i> 项是什么？第 100 项是多少？2027 是第几项？',
          steps: [
            '相邻两项都差 3，第 1 项是 2：第 <i>n</i> 项 = 2 + 3(<i>n</i> − 1) = 3<i>n</i> − 1。验算：<i>n</i> = 1 时 2 ✓，<i>n</i> = 2 时 5 ✓。',
            '第 100 项：3 × 100 − 1 = 299。',
            '3<i>n</i> − 1 = 2027，3<i>n</i> = 2028，<i>n</i> = 676，是第 676 项。'
          ],
          ans: '3<i>n</i> − 1；299；第 676 项'
        },
        {
          q: '用火柴棒按下图摆一排正方形（相邻的正方形共用一条边），摆 20 个正方形要多少根？' + FIG.PT_SQ,
          steps: [
            '1 个用 4 根，2 个用 7 根，3 个用 10 根，每多一个正方形多 3 根（共用了一条边）。',
            '第 <i>n</i> 个图形：4 + 3(<i>n</i> − 1) = 3<i>n</i> + 1 根。',
            '<i>n</i> = 20 时：3 × 20 + 1 = 61 根。'
          ],
          ans: '61 根'
        },
        {
          q: '计算 1 + 3 + 5 + … + 99。',
          steps: [
            '想到正方形点阵：1 + 3 + 5 + … + (2<i>n</i> − 1) = <i>n</i><sup>2</sup>。',
            '最后一项 99 = 2<i>n</i> − 1，<i>n</i> = 50，一共 50 个奇数。',
            '和 = 50<sup>2</sup> = 2500。'
          ],
          ans: '2500'
        },
        {
          q: '三角形点阵 1、3、6、10、…… 第 20 个是多少个点？',
          steps: [
            '第 <i>n</i> 个三角形点阵是 1 + 2 + … + <i>n</i> 个点。',
            '两个倒过来拼成 <i>n</i> × (<i>n</i> + 1) 的长方形，所以是 <i>n</i>(<i>n</i> + 1) ÷ 2。',
            '<i>n</i> = 20 时：20 × 21 ÷ 2 = 210。'
          ],
          ans: '210 个'
        },
        {
          q: `数列 ${fr(1, 2)}、−${fr(2, 5)}、${fr(3, 10)}、−${fr(4, 17)}、…… 的第 8 项是什么？`,
          steps: [
            '符号：正负交替，第 1 项为正，用 (−1)<sup><i>n</i>+1</sup>。',
            '分子是 1、2、3、4，即 <i>n</i>；分母 2、5、10、17 比 1、4、9、16 都大 1，即 <i>n</i><sup>2</sup> + 1。',
            `第 <i>n</i> 项 = (−1)<sup><i>n</i>+1</sup> · ${fr('<i>n</i>', '<i>n</i><sup>2</sup> + 1')}。<i>n</i> = 8 时，符号为负，${fr(8, 65)}，即 −${fr(8, 65)}。`
          ],
          ans: `−${fr(8, 65)}`
        },
        {
          q: '一串彩灯按“红、黄、蓝、绿”的顺序重复排列。第 2026 个是什么颜色？前 2026 个灯中有几个蓝灯？',
          steps: [
            '周期是 4。2026 ÷ 4 = 506 余 2，第 2026 个是周期里第 2 个：黄色。',
            '前 2026 个里有 506 个完整的周期，每个周期 1 个蓝灯，共 506 个。',
            '剩下的 2 个是红、黄，没有蓝灯，所以一共 506 个。'
          ],
          ans: '黄色；506 个'
        },
        {
          q: '（挑战）观察：1<sup>3</sup> = 1<sup>2</sup>，1<sup>3</sup> + 2<sup>3</sup> = 3<sup>2</sup>，1<sup>3</sup> + 2<sup>3</sup> + 3<sup>3</sup> = 6<sup>2</sup>，……计算 1<sup>3</sup> + 2<sup>3</sup> + … + 10<sup>3</sup>。',
          steps: [
            '右边底数 1、3、6 是 1、1 + 2、1 + 2 + 3。',
            '猜：1<sup>3</sup> + 2<sup>3</sup> + … + <i>n</i><sup>3</sup> = (1 + 2 + … + <i>n</i>)<sup>2</sup>。验证 <i>n</i> = 4：1 + 8 + 27 + 64 = 100 = 10<sup>2</sup> ✓。',
            '<i>n</i> = 10：1 + 2 + … + 10 = 55，结果是 55<sup>2</sup> = 3025。'
          ],
          ans: '3025'
        }
      ],
      quiz: [
        { type: 'fill', q: '数列 3、7、11、15、…… 的第 20 项是______。', ans: ['79'], why: '每次加 4，第 n 项 = 3 + 4(n − 1) = 4n − 1。n = 20 时 79。' },
        { type: 'choice', q: '数列 5、8、11、14、…… 的第 <i>n</i> 项是（　）。', opts: ['3<i>n</i> + 2', '3<i>n</i> + 5', '<i>n</i> + 3', '5<i>n</i>'], ans: 0, why: '每次加 3，第 n 项 = 5 + 3(n − 1) = 3n + 2。验算：n = 1 时 5 ✓，n = 2 时 8 ✓。' },
        { type: 'fill', q: '数列 4、7、10、13、…… 中，202 是第______项。', ans: ['67'], why: '第 n 项 = 3n + 1，3n + 1 = 202，n = 67。' },
        { type: 'fill', q: '数列 100、96、92、88、…… 从第______项开始出现负数。', ans: ['27'], why: '第 n 项 = 104 − 4n。104 − 4n &lt; 0，n &gt; 26，所以第 27 项开始为负数（第 26 项是 0，第 27 项是 −4）。' },
        { type: 'fill', q: '用火柴棒按下图摆一排三角形（相邻的三角形共用一条边，一正一倒），摆 10 个三角形要______根。' + FIG.PT_TRI, ans: ['21'], why: '第 1 个用 3 根，以后每个多 2 根：3 + 2(n − 1) = 2n + 1。n = 10 时 21 根。' },
        { type: 'fill', q: '用火柴棒摆一排正方形（相邻的共用一条边），100 根火柴最多能摆______个正方形。', ans: ['33'], why: 'n 个正方形用 3n + 1 根，3n + 1 ≤ 100，n ≤ 33。33 个正好用 100 根。' },
        { type: 'choice', q: '用火柴棒按下图摆一排正六边形（相邻的共用一条边，第 <i>n</i> 个图形有 <i>n</i> 个六边形），第 <i>n</i> 个图形用的根数是（　）。' + FIG.PT_HEX, opts: ['6<i>n</i>', '5<i>n</i> + 1', '6<i>n</i> − 1', '5<i>n</i>'], ans: 1, why: '第 1 个用 6 根，以后每个六边形和前一个共用 1 条边，只多 5 根：6 + 5(n − 1) = 5n + 1。' },
        { type: 'fill', q: '（挑战）用火柴棒按下图摆成 2 行、<i>n</i> 列的正方形方格（每个小正方形边长为一根火柴），<i>n</i> = 10 时要______根。' + FIG.PT_GRID, ans: ['52'], why: '横的：3 行，每行 n 根，共 3n 根；竖的：n + 1 列，每列 2 根，共 2(n + 1) 根。合计 5n + 2，n = 10 时 52 根。验算 n = 1：2 个小正方形上下叠，3 + 4 = 7 根 ✓。' },
        { type: 'fill', q: '1 + 3 + 5 + … + 49 = ______。', ans: ['625'], why: '49 = 2n − 1，n = 25，和 = 25² = 625。' },
        { type: 'fill', q: '三角形点阵 1、3、6、10、…… 的第 10 个有______个点。', ans: ['55'], why: '第 n 个是 n(n + 1) ÷ 2，n = 10 时 10 × 11 ÷ 2 = 55。' },
        { type: 'choice', q: '长方形点阵依次有 2、6、12、20、…… 个点，第 <i>n</i> 个有（　）个点。', opts: ['<i>n</i>(<i>n</i> + 1)', '<i>n</i><sup>2</sup> + 1', '2<i>n</i>', '4<i>n</i> − 2'], ans: 0, why: '2 = 1 × 2，6 = 2 × 3，12 = 3 × 4，20 = 4 × 5，所以是 n(n + 1)。验算第三个选项：n = 3 时 2n = 6 ≠ 12。' },
        { type: 'fill', q: '11 + 13 + 15 + … + 49 = ______。', ans: ['600'], why: '= (1 + 3 + … + 49) − (1 + 3 + … + 9) = 25² − 5² = 625 − 25 = 600。' },
        { type: 'choice', q: '数列 −1、2、−3、4、−5、…… 的第 <i>n</i> 项是（　）。', opts: ['(−1)<sup><i>n</i></sup><i>n</i>', '(−1)<sup><i>n</i>+1</sup><i>n</i>', '−<i>n</i>', '(−1)<sup><i>n</i></sup>'], ans: 0, why: '第 1 项是负的，n = 1 时 (−1)¹ = −1，所以用 (−1)ⁿ · n。验算 n = 2：(−1)² × 2 = 2 ✓。' },
        { type: 'fill', q: `数列 ${fr(1, 3)}、${fr(2, 5)}、${fr(3, 7)}、${fr(4, 9)}、…… 的第 10 项是______。`, ans: ['10/21'], why: '分子是 n，分母 3、5、7、9 是 2n + 1，第 10 项是 10/21。' },
        { type: 'fill', q: `数列 ${fr(1, 2)}、−${fr(1, 4)}、${fr(1, 8)}、−${fr(1, 16)}、…… 的第 6 项是______。`, ans: ['-1/64'], why: '分母是 2ⁿ，第 1 项为正，符号用 (−1)ⁿ⁺¹。第 6 项：符号为负，分母 2⁶ = 64，所以是 −1/64。' },
        { type: 'fill', q: '按 1、2、3、1、2、3、…… 排列，前 100 个数的和是______。', ans: ['199'], why: '周期 3，每个周期和为 6。100 ÷ 3 = 33 余 1，和 = 33 × 6 + 1 = 199。' },
        { type: 'choice', q: '某月 1 日是星期一，这个月的 25 日是星期几？', opts: ['星期三', '星期四', '星期五', '星期日'], ans: 1, why: '从 1 日到 25 日过了 24 天，24 ÷ 7 = 3 余 3，从星期一往后数 3 天是星期四。' },
        { type: 'fill', q: fr(1, 7) + ' = 0.142857142857……，小数点后第 2026 位上的数字是______。', ans: ['8'], why: '循环节 142857 有 6 位。2026 ÷ 6 = 337 余 4，取循环节第 4 位：8。' },
        { type: 'fill', q: '观察：1 × 3 = 2<sup>2</sup> − 1，2 × 4 = 3<sup>2</sup> − 1，3 × 5 = 4<sup>2</sup> − 1，……则 99 × 101 = ______。', ans: ['9999'], why: '规律：n(n + 2) = (n + 1)² − 1。n = 99 时，99 × 101 = 100² − 1 = 9999。' },
        { type: 'fill', q: '（挑战）1<sup>3</sup> + 2<sup>3</sup> + 3<sup>3</sup> + 4<sup>3</sup> + 5<sup>3</sup> + 6<sup>3</sup> = ______。', ans: ['441'], why: '= (1 + 2 + … + 6)² = 21² = 441。也可以直接算：1 + 8 + 27 + 64 + 125 + 216 = 441。' }
      ]
    },

    // ───────────────────────── 平行线拐角模型 ─────────────────────────
    c_parallel_model: {
      goal: '认识“猪蹄型”“铅笔型”“锯齿型”三种平行线拐角模型，会过拐点作平行线推出角的关系；能在选择、填空中直接用结论求角，在解答题中写出完整的推理过程；会处理加了角平分线的变式。',
      fj: '常见题型：① 已知 AB ∥ CD 和两个角，求拐点处的角（填空高频）；② 证明 ∠BED = ∠B + ∠D 或三个角之和为 360°；③ 有两三个拐点的锯齿型求角；④ 和角平分线结合的综合题。解答题要写出“过点 E 作 EF ∥ AB”这一步，模型结论不能直接当定理用。',
      sections: [
        {
          h: '猪蹄型：拐角 = 两角之和',
          html: `<p>两条平行的马路 AB 和 CD 之间，一条小路从 B 拐到 E，再拐到 D。拐角 ∠BED 和 ∠B、∠D 有什么关系？</p>
<p>平行线的性质只管“一条直线截两条平行线”，而 E 不在任何一条平行线上。办法是<b>过拐点 E 作一条平行线 EF</b>，把 ∠BED 分成两块：</p>
<p class="formula">EF ∥ AB ∥ CD　→　∠1 = ∠B，∠2 = ∠D（内错角）　→　∠BED = ∠B + ∠D</p>
<p>这种拐点“凸向”两条射线 BA、DC 那一边的图形叫<b>猪蹄型</b>（也叫 M 型）。</p>
<p class="try">拖动 E、B、D，看三个角的关系；点“过 E 作平行线”，看 ∠BED 怎样被分成两块。</p>`,
          anim: 'c_parallel_model_turn'
        },
        {
          h: '铅笔型：三个角加起来 360°',
          html: `<p>把 E 拖到另一边，拐点凸向远离 A、C 的一侧，图形像一支削尖的铅笔。这时作平行线 EF 后，得到的是<b>同旁内角</b>：</p>
<p class="formula">∠B + ∠1 = 180°，∠D + ∠2 = 180°　→　∠B + ∠BED + ∠D = 360°</p>
<p>判断用哪个结论，看拐点凸向哪边：凸向射线这边（角都“张开”朝着拐点）是猪蹄型，凸向另一边是铅笔型。不确定时，就过拐点作平行线，现场推一遍。</p>
<p class="try">在上面的动画里点“铅笔型”，或者自己把 E 拖过去。</p>`
        },
        {
          h: '锯齿型：朝左的角之和 = 朝右的角之和',
          html: `<p>拐点不止一个时，折线像锯齿。过每个拐点都作一条平行线，每个角都被分成两块，相邻的块是内错角，一对一对相等。</p>
<p class="formula">开口朝左的角之和 = 开口朝右的角之和</p>
<p>比如 AB ∥ CD，折线 B—E—F—D 有两个拐点，∠B 和 ∠F 开口朝左，∠E 和 ∠D 开口朝右，那么 ∠B + ∠F = ∠E + ∠D。猪蹄型其实就是只有一个拐点的锯齿型。</p>
<p class="try">选择拐点个数，左右拖动圆点，看蓝色角的和与橙色角的和是否始终相等；再点“过拐点作平行线”。</p>`,
          anim: 'c_parallel_model_zigzag'
        },
        {
          h: '变式：加上角平分线',
          html: `<p>猪蹄型中，如果 BF、DF 分别平分 ∠ABE 和 ∠CDE，交于 F（F 也在两条平行线之间、和 E 在同一侧），那么 F 也是一个猪蹄型的拐点：</p>
<p class="formula">∠BFD = ∠ABF + ∠CDF = ${fr(1, 2)}∠ABE + ${fr(1, 2)}∠CDE = ${fr(1, 2)}∠BED</p>
<p>做综合题时，先认出图中藏着的模型，再把模型结论连起来用。解答题要把“过拐点作平行线”的推理写出来。</p>`
        }
      ],
      pitfalls: [
        '先看拐点凸向哪一边，再决定用“两角之和”还是“和为 360°”，不要见到拐点就相加。',
        '解答题里模型结论不能直接用，要写出“过点 E 作 EF ∥ AB，因为 AB ∥ CD，所以 EF ∥ CD”以及后面的内错角或同旁内角。',
        '锯齿型要分清每个角的开口方向，开口朝左的放一边，朝右的放另一边；两端在平行线上的角也要算进去。'
      ],
      examples: [
        {
          q: '如图，AB ∥ CD，点 E 在两条平行线之间，∠ABE = 35°，∠CDE = 40°，求 ∠BED。' + FIG.PX1,
          steps: [
            '拐点 E 凸向 A、C 一侧，是猪蹄型。过 E 作 EF ∥ AB，因为 AB ∥ CD，所以 EF ∥ CD（平行于同一条直线的两条直线平行）。',
            '∠BEF = ∠ABE = 35°，∠FED = ∠CDE = 40°（两直线平行，内错角相等）。',
            '∠BED = ∠BEF + ∠FED = 35° + 40° = 75°。'
          ],
          ans: '75°'
        },
        {
          q: '如图，AB ∥ CD，点 E 在两条平行线之间，∠ABE = 130°，∠CDE = 120°，求 ∠BED。' + FIG.PX2,
          steps: [
            '拐点 E 凸向远离 A、C 的一侧，是铅笔型。过 E 作 EF ∥ AB，则 EF ∥ CD。',
            '∠ABE + ∠BEF = 180°，∠CDE + ∠DEF = 180°（两直线平行，同旁内角互补），所以 ∠BEF = 50°，∠DEF = 60°。',
            '∠BED = 50° + 60° = 110°。也可以直接用 ∠B + ∠E + ∠D = 360°：360° − 130° − 120° = 110°。'
          ],
          ans: '110°'
        },
        {
          q: '如图，AB ∥ CD，折线 B—E—F—D 有两个拐点，∠ABE = 30°，∠BEF = 80°，∠EFD = 70°，求 ∠FDC。' + FIG.PX3,
          steps: [
            '先分开口方向：∠ABE、∠EFD 开口朝左，∠BEF、∠FDC 开口朝右（这里 C 在 D 的右边）。',
            '过 E、F 分别作 AB 的平行线，相邻的块都是内错角，可得：开口朝左的角之和 = 开口朝右的角之和，即 ∠ABE + ∠EFD = ∠BEF + ∠FDC。',
            '30° + 70° = 80° + ∠FDC，∠FDC = 20°。'
          ],
          ans: '20°'
        },
        {
          q: '（挑战）如图，AB ∥ CD，∠BED = 80°，BF 平分 ∠ABE，DF 平分 ∠CDE，BF、DF 交于点 F，求 ∠BFD。' + FIG.PX4,
          steps: [
            'E 是猪蹄型的拐点：∠ABE + ∠CDE = ∠BED = 80°。',
            'F 也是猪蹄型的拐点：∠BFD = ∠ABF + ∠CDF = ' + fr(1, 2) + '∠ABE + ' + fr(1, 2) + '∠CDE。',
            '= ' + fr(1, 2) + ' × 80° = 40°。'
          ],
          ans: '40°'
        }
      ],
      quiz: [
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 25°，∠CDE = 50°，则 ∠BED = ______°。' + FIG.PQ1, ans: ['75'], why: 'E 凸向 A、C 一侧，是猪蹄型，拐角等于两角之和：25° + 50° = 75°。' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 32°，∠BED = 90°，则 ∠CDE = ______°。' + FIG.PQ2, ans: ['58'], why: '猪蹄型：∠BED = ∠ABE + ∠CDE，∠CDE = 90° − 32° = 58°。' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 45°，∠BED = 110°，则 ∠CDE = ______°。' + FIG.PQ7, ans: ['65'], why: 'E 凸向 A、C 一侧，是猪蹄型：∠CDE = ∠BED − ∠ABE = 110° − 45° = 65°。' },
        { type: 'choice', q: '如图，AB ∥ CD。证明 ∠BED = ∠ABE + ∠CDE 时，关键的辅助线是（　）。' + FIG.PQ3, opts: ['连接 BD', '延长 BE 交 CD 于点 F', '作 ∠BED 的平分线', '过 E 作 EF ∥ AB'], ans: 3, why: '过拐点作平行线，把 ∠BED 分成两块，每块和 ∠ABE、∠CDE 分别是内错角。（延长 BE 用三角形外角也能证，但最通用的是作平行线。）' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 120°，∠CDE = 140°，则 ∠BED = ______°。' + FIG.PQ4, ans: ['100'], why: 'E 凸向远离 A、C 的一侧，是铅笔型，三个角之和为 360°：360° − 120° − 140° = 100°。' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 150°，∠BED = 90°，则 ∠CDE = ______°。' + FIG.PQ5, ans: ['120'], why: '铅笔型：∠ABE + ∠BED + ∠CDE = 360°，∠CDE = 360° − 150° − 90° = 120°。' },
        { type: 'choice', q: '如图，AB ∥ CD，∠ABE = 125°，∠CDE = 115°，则 ∠BED =（　）。' + FIG.PQ6, opts: ['240°', '60°', '120°', '115°'], ans: 2, why: 'E 凸向远离 A、C 的一侧，是铅笔型，不能把两个角相加（240° 比平角还大，不可能是 ∠BED）。∠BED = 360° − 125° − 115° = 120°。' },
        { type: 'choice', q: 'AB ∥ CD，点 E 在两平行线之间，∠ABE = 110°，∠CDE = 140°。下列说法正确的是（　）。', opts: ['一定是猪蹄型，∠BED = 250°', '是铅笔型，∠BED = 110°', '是铅笔型，∠BED = 70°', '无法判断'], ans: 1, why: '猪蹄型里 ∠BED = ∠ABE + ∠CDE，而 ∠BED 是 EB、ED 夹成的角，比平角小，所以两角之和一定小于 180°。这里 110° + 140° = 250°，不可能是猪蹄型，只能是铅笔型：∠BED = 360° − 110° − 140° = 110°。' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 40°，∠BEF = 60°，∠EFD = 50°，则 ∠FDC = ______°。' + FIG.PQ8, ans: ['30'], why: '∠ABE、∠EFD 开口朝左，∠BEF、∠FDC 开口朝右。朝左之和 = 朝右之和：40° + 50° = 60° + ∠FDC，∠FDC = 30°。' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 35°，∠EFD = 55°，∠FDC = 25°，则 ∠BEF = ______°。' + FIG.PQ9, ans: ['65'], why: '朝左的是 ∠ABE、∠EFD，朝右的是 ∠BEF、∠FDC。35° + 55° = ∠BEF + 25°，∠BEF = 65°。别把 ∠FDC 和 ∠ABE 放在同一边。' },
        { type: 'fill', q: '如图，AB ∥ CD，折线 B—E—F—G—D 有三个拐点，∠ABE = 20°，∠BEF = 45°，∠EFG = 60°，∠GDC = 30°，则 ∠FGD = ______°。' + FIG.PQ10, ans: ['65'], why: '开口朝左的是 ∠ABE、∠EFG、∠GDC，开口朝右的是 ∠BEF、∠FGD。20° + 60° + 30° = 45° + ∠FGD，∠FGD = 110° − 45° = 65°。' },
        { type: 'choice', q: '关于锯齿型，下列结论正确的是（　）。', opts: ['所有拐角加起来是 360°', '开口朝左的角之和等于开口朝右的角之和', '每个拐角都相等', '拐角之和等于 180°'], ans: 1, why: '过每个拐点作平行线，相邻的块是内错角，可推出“朝左之和 = 朝右之和”。拐角之和不是固定值。' },
        { type: 'fill', q: '如图，AB ∥ CD，∠ABE = 50°，∠CDE = 30°，BF 平分 ∠ABE，DF 平分 ∠CDE，则 ∠BFD = ______°。' + FIG.PQ12, ans: ['40'], why: '∠ABF = 25°，∠CDF = 15°。F 也是猪蹄型的拐点：∠BFD = ∠ABF + ∠CDF = 25° + 15° = 40°，正好是 ∠BED = 80° 的一半。' },
        { type: 'fill', q: '（挑战）如图，AB ∥ CD，∠BED = 100°，BF 平分 ∠ABE，DF 平分 ∠CDE，则 ∠BFD = ______°。' + FIG.PQ11, ans: ['50'], why: '猪蹄型：∠ABE + ∠CDE = ∠BED = 100°，∠BFD = ∠ABF + ∠CDF = ' + fr(1, 2) + '(∠ABE + ∠CDE) = 50°。' },
        { type: 'fill', q: '（挑战）如图，AB ∥ CD，BF 平分 ∠ABE，DF 平分 ∠CDE，∠BFD = 35°，则 ∠BED = ______°。' + FIG.PQ13, ans: ['70'], why: 'E、F 都是猪蹄型的拐点：∠BFD = ∠ABF + ∠CDF = ' + fr(1, 2) + '(∠ABE + ∠CDE) = ' + fr(1, 2) + '∠BED，所以 ∠BED = 2 × 35° = 70°。' },
        { type: 'fill', q: '（挑战）如图，AB ∥ CD，∠BED = 120°，BF 平分 ∠ABE，DF 平分 ∠CDE，BF、DF 交于点 F，则 ∠BFD = ______°。' + FIG.PQ14, ans: ['120'], why: 'E 凸向远离 A、C 的一侧，是铅笔型：∠ABE + ∠CDE = 360° − 120° = 240°。F 凸向 A、C 一侧，是猪蹄型：∠BFD = ∠ABF + ∠CDF = ' + fr(1, 2) + ' × 240° = 120°。' }
      ]
    }
  });
})();
