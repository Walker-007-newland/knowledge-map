// olym12 组：奥数拓展·八、九年级几何竞赛入门
(function () {
  const fr = window.fr;
  // 题目配图（内联 SVG，按 AUTHORING.md“题目配图”规范，颜色只用主题 class）
  const FIG = {
    ci_4: '<svg class="fig" viewBox="0 0 180 142"><polygon points="20,122.3 160,122.3 160,41.5 38,20" class="fnone sstrong"/><line x1="20" y1="122.3" x2="160" y2="41.5" class="sstrong"/><line x1="160" y1="122.3" x2="38" y2="20" class="sstrong"/><circle cx="20" cy="122.3" r="2.2" class="fstrong"/><circle cx="160" cy="122.3" r="2.2" class="fstrong"/><circle cx="160" cy="41.5" r="2.2" class="fstrong"/><circle cx="38" cy="20" r="2.2" class="fstrong"/><text x="11.1" y="133.8" class="lbl" text-anchor="middle">A</text><text x="168.1" y="134.8" class="lbl" text-anchor="middle">B</text><text x="168.9" y="40.1" class="lbl" text-anchor="middle">C</text><text x="30.8" y="16.7" class="lbl" text-anchor="middle">D</text></svg>',
    ci_alt: '<svg class="fig" viewBox="0 0 200 160"><polygon points="110.3,20 46.5,140 154,140" class="fnone sstrong"/><line x1="46.5" y1="140" x2="141.4" y2="105.5" class="sstrong"/><line x1="154" y1="140" x2="70.2" y2="95.4" class="sstrong"/><line x1="141.4" y1="105.5" x2="70.2" y2="95.4" class="smuted"/><polyline points="135.8,107.5 137.8,113.1 143.5,111.1" class="fnone smuted thin"/><polyline points="75.5,98.3 72.7,103.6 67.4,100.7" class="fnone smuted thin"/><circle cx="110.3" cy="20" r="2.2" class="fstrong"/><circle cx="46.5" cy="140" r="2.2" class="fstrong"/><circle cx="154" cy="140" r="2.2" class="fstrong"/><circle cx="141.4" cy="105.5" r="2.2" class="fstrong"/><circle cx="70.2" cy="95.4" r="2.2" class="fstrong"/><text x="111.1" y="14" class="lbl" text-anchor="middle">A</text><text x="36.7" y="150" class="lbl" text-anchor="middle">B</text><text x="163.3" y="150.9" class="lbl" text-anchor="middle">C</text><text x="152.3" y="109.3" class="lbl" text-anchor="middle">D</text><text x="59.7" y="97" class="lbl" text-anchor="middle">E</text></svg>',
    ci_alt_q: '<svg class="fig" viewBox="0 0 200 160"><polygon points="86,20 30,140 170,140" class="fnone sstrong"/><line x1="30" y1="140" x2="123.9" y2="74.2" class="sstrong"/><line x1="170" y1="140" x2="55" y2="86.4" class="sstrong"/><line x1="123.9" y1="74.2" x2="55" y2="86.4" class="smuted"/><polyline points="119,77.7 122.5,82.6 127.4,79.1" class="fnone smuted thin"/><polyline points="60.4,88.9 57.9,94.4 52.5,91.8" class="fnone smuted thin"/><circle cx="86" cy="20" r="2.2" class="fstrong"/><circle cx="30" cy="140" r="2.2" class="fstrong"/><circle cx="170" cy="140" r="2.2" class="fstrong"/><circle cx="123.9" cy="74.2" r="2.2" class="fstrong"/><circle cx="55" cy="86.4" r="2.2" class="fstrong"/><text x="85" y="14" class="lbl" text-anchor="middle">A</text><text x="20.8" y="151.1" class="lbl" text-anchor="middle">B</text><text x="179.8" y="149.9" class="lbl" text-anchor="middle">C</text><text x="134.1" y="75" class="lbl" text-anchor="middle">D</text><text x="44.1" y="89.9" class="lbl" text-anchor="middle">E</text></svg>',
    ci_eq: '<svg class="fig" viewBox="0 0 170 170"><line x1="105.4" y1="69.3" x2="76" y2="150" class="sstrong"/><line x1="105.4" y1="69.3" x2="134.8" y2="150" class="sstrong"/><line x1="105.4" y1="69.3" x2="35" y2="20" class="sstrong"/><line x1="76" y1="150" x2="35" y2="20" class="sstrong"/><line x1="134.8" y1="150" x2="35" y2="20" class="sstrong"/><line x1="76" y1="150" x2="134.8" y2="150" class="sstrong"/><circle cx="105.4" cy="69.3" r="2.2" class="fstrong"/><circle cx="76" cy="150" r="2.2" class="fstrong"/><circle cx="134.8" cy="150" r="2.2" class="fstrong"/><circle cx="35" cy="20" r="2.2" class="fstrong"/><text x="111.2" y="65" class="lbl" text-anchor="middle">A</text><text x="70.7" y="164.6" class="lbl" text-anchor="middle">B</text><text x="143" y="162.3" class="lbl" text-anchor="middle">C</text><text x="28.4" y="16.2" class="lbl" text-anchor="middle">D</text></svg>',
    ci_eq_q: '<svg class="fig" viewBox="0 0 170 170"><line x1="105.6" y1="66.2" x2="25.5" y2="20" class="sstrong"/><line x1="105.6" y1="66.2" x2="66.5" y2="150" class="sstrong"/><line x1="105.6" y1="66.2" x2="144.6" y2="150" class="sstrong"/><line x1="25.5" y1="20" x2="66.5" y2="150" class="sstrong"/><line x1="25.5" y1="20" x2="144.6" y2="150" class="sstrong"/><line x1="66.5" y1="150" x2="144.6" y2="150" class="sstrong"/><circle cx="105.6" cy="66.2" r="2.2" class="fstrong"/><circle cx="25.5" cy="20" r="2.2" class="fstrong"/><circle cx="66.5" cy="150" r="2.2" class="fstrong"/><circle cx="144.6" cy="150" r="2.2" class="fstrong"/><text x="111.6" y="62" class="lbl" text-anchor="middle">A</text><text x="18.4" y="16.6" class="lbl" text-anchor="middle">B</text><text x="60.8" y="164.4" class="lbl" text-anchor="middle">C</text><text x="153.3" y="161.8" class="lbl" text-anchor="middle">D</text></svg>',
    ci_fold: '<svg class="fig" viewBox="0 0 200 147"><polygon points="20,20 20,126.7 180,126.7 180,20" class="fnone sstrong"/><line x1="20" y1="73.3" x2="89.3" y2="126.7" class="sstrong dash"/><line x1="20" y1="73.3" x2="71.5" y2="59.7" class="smuted"/><line x1="89.3" y1="126.7" x2="71.5" y2="59.7" class="smuted"/><line x1="71.5" y1="59.7" x2="180" y2="20" class="s2 dash"/><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="126.7" r="2.2" class="fstrong"/><circle cx="180" cy="126.7" r="2.2" class="fstrong"/><circle cx="180" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="73.3" r="2.2" class="fstrong"/><circle cx="89.3" cy="126.7" r="2.2" class="fstrong"/><circle cx="71.5" cy="59.7" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="139.7" class="lbl" text-anchor="middle">B</text><text x="189" y="139.7" class="lbl" text-anchor="middle">C</text><text x="189" y="20" class="lbl" text-anchor="middle">D</text><text x="10" y="81.3" class="lbl" text-anchor="middle">E</text><text x="89.3" y="144.7" class="lbl" text-anchor="middle">F</text><text x="75.5" y="55.7" class="lbl" text-anchor="middle">B′</text></svg>',
    ci_rect: '<svg class="fig" viewBox="0 0 190 140"><polygon points="20,120 170,120 170,20 20,20" class="fnone sstrong"/><line x1="20" y1="120" x2="59.8" y2="53.8" class="sstrong"/><line x1="59.8" y1="53.8" x2="170" y2="120" class="sstrong"/><line x1="59.8" y1="53.8" x2="170" y2="20" class="smuted dash"/><polyline points="56.7,58.9 61.8,62 64.9,56.9" class="fnone smuted thin"/><circle cx="20" cy="120" r="2.2" class="fstrong"/><circle cx="170" cy="120" r="2.2" class="fstrong"/><circle cx="170" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="59.8" cy="53.8" r="2.2" class="fstrong"/><text x="11" y="133" class="lbl" text-anchor="middle">A</text><text x="179" y="133" class="lbl" text-anchor="middle">B</text><text x="179" y="20" class="lbl" text-anchor="middle">C</text><text x="11" y="20" class="lbl" text-anchor="middle">D</text><text x="57.8" y="48.8" class="lbl" text-anchor="middle">P</text></svg>',
    ci_sq: '<svg class="fig" viewBox="0 0 190 150"><polygon points="40,130 150,130 150,20 40,20" class="fnone sstrong"/><line x1="40" y1="130" x2="63.5" y2="84.9" class="sstrong"/><line x1="63.5" y1="84.9" x2="150" y2="130" class="sstrong"/><line x1="63.5" y1="84.9" x2="150" y2="20" class="smuted dash"/><polyline points="60.7,90.3 66,93 68.8,87.7" class="fnone smuted thin"/><circle cx="40" cy="130" r="2.2" class="fstrong"/><circle cx="150" cy="130" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="40" cy="20" r="2.2" class="fstrong"/><circle cx="63.5" cy="84.9" r="2.2" class="fstrong"/><text x="31" y="143" class="lbl" text-anchor="middle">A</text><text x="159" y="143" class="lbl" text-anchor="middle">B</text><text x="159" y="20" class="lbl" text-anchor="middle">C</text><text x="31" y="20" class="lbl" text-anchor="middle">D</text><text x="61.5" y="79.9" class="lbl" text-anchor="middle">P</text></svg>',
    ci_sqout: '<svg class="fig" viewBox="0 0 170 190"><polygon points="32,126.4 138.4,126.4 138.4,20 32,20" class="fnone sstrong"/><line x1="32" y1="126.4" x2="138.4" y2="20" class="smuted"/><line x1="138.4" y1="126.4" x2="32" y2="20" class="smuted"/><line x1="32" y1="126.4" x2="115.7" y2="170" class="sstrong"/><line x1="115.7" y1="170" x2="138.4" y2="126.4" class="sstrong"/><polyline points="110.4,167.2 113.2,161.9 118.5,164.7" class="fnone smuted thin"/><line x1="115.7" y1="170" x2="85.2" y2="73.2" class="smuted dash"/><circle cx="32" cy="126.4" r="2.2" class="fstrong"/><circle cx="138.4" cy="126.4" r="2.2" class="fstrong"/><circle cx="138.4" cy="20" r="2.2" class="fstrong"/><circle cx="32" cy="20" r="2.2" class="fstrong"/><circle cx="85.2" cy="73.2" r="2.2" class="fstrong"/><circle cx="115.7" cy="170" r="2.2" class="fstrong"/><text x="23" y="128.4" class="lbl" text-anchor="middle">A</text><text x="147.4" y="128.4" class="lbl" text-anchor="middle">B</text><text x="147.4" y="20" class="lbl" text-anchor="middle">C</text><text x="23" y="20" class="lbl" text-anchor="middle">D</text><text x="85.2" y="69.2" class="lbl" text-anchor="middle">O</text><text x="115.7" y="189" class="lbl" text-anchor="middle">P</text></svg>',
    ci_sqout_q: '<svg class="fig" viewBox="0 0 170 190"><polygon points="33,124.1 137.1,124.1 137.1,20 33,20" class="fnone sstrong"/><line x1="33" y1="124.1" x2="137.1" y2="20" class="smuted"/><line x1="137.1" y1="124.1" x2="33" y2="20" class="smuted"/><line x1="33" y1="124.1" x2="60.6" y2="170" class="sstrong"/><line x1="60.6" y1="170" x2="137.1" y2="124.1" class="sstrong"/><polyline points="57.5,164.9 62.6,161.8 65.7,166.9" class="fnone smuted thin"/><line x1="60.6" y1="170" x2="85" y2="72" class="smuted dash"/><text x="54.5" y="146.4" text-anchor="middle" style="font-size:12px">3</text><text x="94.2" y="143.3" text-anchor="middle" style="font-size:12px">5</text><circle cx="33" cy="124.1" r="2.2" class="fstrong"/><circle cx="137.1" cy="124.1" r="2.2" class="fstrong"/><circle cx="137.1" cy="20" r="2.2" class="fstrong"/><circle cx="33" cy="20" r="2.2" class="fstrong"/><circle cx="85" cy="72" r="2.2" class="fstrong"/><circle cx="60.6" cy="170" r="2.2" class="fstrong"/><text x="24" y="126.1" class="lbl" text-anchor="middle">A</text><text x="146.1" y="126.1" class="lbl" text-anchor="middle">B</text><text x="146.1" y="20" class="lbl" text-anchor="middle">C</text><text x="24" y="20" class="lbl" text-anchor="middle">D</text><text x="85" y="68" class="lbl" text-anchor="middle">O</text><text x="60.6" y="189" class="lbl" text-anchor="middle">P</text></svg>',
    py_alt: '<svg class="fig" viewBox="0 0 210 140"><polygon points="88.2,20 46.5,120 163.2,120" class="fnone sstrong"/><line x1="88.2" y1="20" x2="88.2" y2="120" class="sstrong dash"/><polyline points="88.2,113 95.2,113 95.2,120" class="fnone smuted thin"/><text x="59" y="70.5" text-anchor="middle" style="font-size:12px">13</text><text x="132.9" y="68.6" text-anchor="middle" style="font-size:12px">15</text><text x="104.8" y="134" text-anchor="middle" style="font-size:12px">14</text><circle cx="88.2" cy="20" r="2.2" class="fstrong"/><circle cx="46.5" cy="120" r="2.2" class="fstrong"/><circle cx="163.2" cy="120" r="2.2" class="fstrong"/><circle cx="88.2" cy="120" r="2.2" class="fstrong"/><text x="87.3" y="14" class="lbl" text-anchor="middle">A</text><text x="37.3" y="131.1" class="lbl" text-anchor="middle">B</text><text x="173" y="129.9" class="lbl" text-anchor="middle">C</text><text x="88.2" y="136" class="lbl" text-anchor="middle">D</text></svg>',
    py_alt_q: '<svg class="fig" viewBox="0 0 210 105"><polygon points="68.6,20 20,84.8 190,84.8" class="fnone sstrong"/><line x1="68.6" y1="20" x2="68.6" y2="84.8" class="sstrong dash"/><polyline points="68.6,77.8 75.6,77.8 75.6,84.8" class="fnone smuted thin"/><text x="37.1" y="51" text-anchor="middle" style="font-size:12px">10</text><text x="133.5" y="48.4" text-anchor="middle" style="font-size:12px">17</text><text x="105" y="98.8" text-anchor="middle" style="font-size:12px">21</text><circle cx="68.6" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="84.8" r="2.2" class="fstrong"/><circle cx="190" cy="84.8" r="2.2" class="fstrong"/><circle cx="68.6" cy="84.8" r="2.2" class="fstrong"/><text x="67.2" y="14.1" class="lbl" text-anchor="middle">A</text><text x="10.2" y="94.7" class="lbl" text-anchor="middle">B</text><text x="200.7" y="92.4" class="lbl" text-anchor="middle">C</text><text x="68.6" y="100.8" class="lbl" text-anchor="middle">D</text></svg>',
    py_bamboo: '<svg class="fig" viewBox="0 0 170 150"><line x1="21" y1="117.2" x2="149.2" y2="117.2" class="smuted"/><line x1="53" y1="117.2" x2="53" y2="20" class="sstrong"/><line x1="53" y1="20" x2="117.1" y2="117.2" class="sstrong"/><text x="85.1" y="131.2" text-anchor="middle" style="font-size:12px">3 尺</text><text x="46.6" y="24" text-anchor="end" style="font-size:12px">折断处</text><text x="46.6" y="134" text-anchor="middle" style="font-size:12px">竹根</text><circle cx="53" cy="20" r="2.2" class="fstrong"/></svg>',
    py_box: '<svg class="fig" viewBox="0 0 200 90"><line x1="18" y1="71.6" x2="154.1" y2="71.6" class="sstrong"/><line x1="154.1" y1="71.6" x2="182" y2="52" class="sstrong"/><line x1="18" y1="71.6" x2="18" y2="37.5" class="sstrong"/><line x1="154.1" y1="71.6" x2="154.1" y2="37.5" class="sstrong"/><line x1="182" y1="52" x2="182" y2="18" class="sstrong"/><line x1="18" y1="37.5" x2="154.1" y2="37.5" class="sstrong"/><line x1="154.1" y1="37.5" x2="182" y2="18" class="sstrong"/><line x1="182" y1="18" x2="45.9" y2="18" class="sstrong"/><line x1="45.9" y1="18" x2="18" y2="37.5" class="sstrong"/><line x1="18" y1="71.6" x2="45.9" y2="52" class="smuted dash"/><line x1="45.9" y1="52" x2="182" y2="52" class="smuted dash"/><line x1="45.9" y1="52" x2="45.9" y2="18" class="smuted dash"/><text x="86.1" y="84.6" text-anchor="middle" style="font-size:12px">4</text><text x="173.8" y="74" text-anchor="middle" style="font-size:12px">2</text><text x="191" y="39" text-anchor="middle" style="font-size:12px">1</text><circle cx="18" cy="71.6" r="2.2" class="fstrong"/><circle cx="182" cy="18" r="2.2" class="fstrong"/><text x="9.7" y="83.7" class="lbl" text-anchor="middle">A</text><text x="190.3" y="15.8" class="lbl" text-anchor="middle">G</text></svg>',
    py_box_q: '<svg class="fig" viewBox="0 0 200 104"><line x1="18" y1="85.6" x2="146.8" y2="85.6" class="sstrong"/><line x1="146.8" y1="85.6" x2="182" y2="60.9" class="sstrong"/><line x1="18" y1="85.6" x2="18" y2="42.6" class="sstrong"/><line x1="146.8" y1="85.6" x2="146.8" y2="42.6" class="sstrong"/><line x1="182" y1="60.9" x2="182" y2="18" class="sstrong"/><line x1="18" y1="42.6" x2="146.8" y2="42.6" class="sstrong"/><line x1="146.8" y1="42.6" x2="182" y2="18" class="sstrong"/><line x1="182" y1="18" x2="53.2" y2="18" class="sstrong"/><line x1="53.2" y1="18" x2="18" y2="42.6" class="sstrong"/><line x1="18" y1="85.6" x2="53.2" y2="60.9" class="smuted dash"/><line x1="53.2" y1="60.9" x2="182" y2="60.9" class="smuted dash"/><line x1="53.2" y1="60.9" x2="53.2" y2="18" class="smuted dash"/><text x="82.4" y="98.6" text-anchor="middle" style="font-size:12px">3</text><text x="170.1" y="85.4" text-anchor="middle" style="font-size:12px">2</text><text x="191" y="43.5" text-anchor="middle" style="font-size:12px">1</text><circle cx="18" cy="85.6" r="2.2" class="fstrong"/><circle cx="182" cy="18" r="2.2" class="fstrong"/><text x="9.7" y="97.8" class="lbl" text-anchor="middle">A</text><text x="190.3" y="15.8" class="lbl" text-anchor="middle">G</text></svg>',
    py_box_q2: '<svg class="fig" viewBox="0 0 200 71"><line x1="18" y1="53.5" x2="166.8" y2="53.5" class="sstrong"/><line x1="166.8" y1="53.5" x2="182" y2="42.8" class="sstrong"/><line x1="18" y1="53.5" x2="18" y2="28.7" class="sstrong"/><line x1="166.8" y1="53.5" x2="166.8" y2="28.7" class="sstrong"/><line x1="182" y1="42.8" x2="182" y2="18" class="sstrong"/><line x1="18" y1="28.7" x2="166.8" y2="28.7" class="sstrong"/><line x1="166.8" y1="28.7" x2="182" y2="18" class="sstrong"/><line x1="182" y1="18" x2="33.2" y2="18" class="sstrong"/><line x1="33.2" y1="18" x2="18" y2="28.7" class="sstrong"/><line x1="18" y1="53.5" x2="33.2" y2="42.8" class="smuted dash"/><line x1="33.2" y1="42.8" x2="182" y2="42.8" class="smuted dash"/><line x1="33.2" y1="42.8" x2="33.2" y2="18" class="smuted dash"/><text x="92.4" y="66.5" text-anchor="middle" style="font-size:12px">12</text><text x="180.1" y="60.3" text-anchor="middle" style="font-size:12px">3</text><text x="191" y="34.4" text-anchor="middle" style="font-size:12px">2</text><circle cx="18" cy="53.5" r="2.2" class="fstrong"/><circle cx="182" cy="18" r="2.2" class="fstrong"/><text x="9.7" y="65.7" class="lbl" text-anchor="middle">A</text><text x="190.3" y="15.8" class="lbl" text-anchor="middle">G</text></svg>',
    py_cyl: '<svg class="fig" viewBox="0 0 150 170"><ellipse cx="75.1" cy="33.7" rx="45.6" ry="13.7" class="fnone sstrong"/><path d="M29.5,136.3 A45.6,13.7 0 0 0 120.7,136.3" class="fnone sstrong"/><path d="M29.5,136.3 A45.6,13.7 0 0 1 120.7,136.3" class="fnone smuted dash"/><line x1="29.5" y1="136.3" x2="29.5" y2="33.7" class="sstrong"/><line x1="120.7" y1="136.3" x2="120.7" y2="33.7" class="sstrong"/><circle cx="75.1" cy="150" r="2.2" class="fstrong"/><circle cx="75.1" cy="20" r="2.2" class="fstrong"/><text x="75.1" y="168" class="lbl" text-anchor="middle">A</text><text x="75.1" y="17" class="lbl" text-anchor="middle">B</text></svg>',
    py_cyl_q2: '<svg class="fig" viewBox="0 0 150 156"><ellipse cx="75" cy="36.5" rx="55" ry="16.5" class="fnone sstrong"/><path d="M20,119 A55,16.5 0 0 0 130,119" class="fnone sstrong"/><path d="M20,119 A55,16.5 0 0 1 130,119" class="fnone smuted dash"/><line x1="20" y1="119" x2="20" y2="36.5" class="sstrong"/><line x1="130" y1="119" x2="130" y2="36.5" class="sstrong"/><circle cx="75" cy="135.5" r="2.2" class="fstrong"/><circle cx="75" cy="53" r="2.2" class="fstrong"/><text x="75" y="153.5" class="lbl" text-anchor="middle">A</text><text x="85" y="68" class="lbl" text-anchor="middle">A′</text></svg>',
    py_fold: '<svg class="fig" viewBox="0 0 200 120"><polygon points="20,100 180,100 180,20 20,20" class="fnone sstrong"/><line x1="120" y1="100" x2="80" y2="20" class="sstrong dash"/><circle cx="20" cy="100" r="2.2" class="fstrong"/><circle cx="180" cy="100" r="2.2" class="fstrong"/><circle cx="180" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="120" cy="100" r="2.2" class="fstrong"/><circle cx="80" cy="20" r="2.2" class="fstrong"/><text x="11" y="113" class="lbl" text-anchor="middle">A</text><text x="189" y="113" class="lbl" text-anchor="middle">B</text><text x="189" y="19" class="lbl" text-anchor="middle">C</text><text x="11" y="19" class="lbl" text-anchor="middle">D</text><text x="120" y="118" class="lbl" text-anchor="middle">E</text><text x="80" y="16" class="lbl" text-anchor="middle">F</text></svg>',
    py_fold_q: '<svg class="fig" viewBox="0 0 200 130"><polygon points="40,110 160,110 160,20 40,20" class="fnone sstrong"/><line x1="133.8" y1="110" x2="66.2" y2="20" class="sstrong dash"/><circle cx="133.8" cy="110" r="2.2" class="fstrong"/><text x="31" y="123" class="lbl" text-anchor="middle">A</text><text x="169" y="123" class="lbl" text-anchor="middle">B</text><text x="169" y="19" class="lbl" text-anchor="middle">C</text><text x="31" y="19" class="lbl" text-anchor="middle">D</text><text x="133.8" y="128" class="lbl" text-anchor="middle">E</text></svg>',
    py_foldbd: '<svg class="fig" viewBox="0 0 210 150"><polygon points="36,61.3 36,130 173.5,130 173.5,61.3" class="fnone sline"/><line x1="36" y1="130" x2="173.5" y2="61.3" class="sstrong"/><line x1="36" y1="130" x2="118.5" y2="20" class="sstrong"/><line x1="118.5" y1="20" x2="173.5" y2="61.3" class="sstrong"/><polygon points="36,130 87.6,61.3 173.5,61.3" class="f1s sstrong"/><circle cx="36" cy="61.3" r="2.2" class="fstrong"/><circle cx="36" cy="130" r="2.2" class="fstrong"/><circle cx="173.5" cy="130" r="2.2" class="fstrong"/><circle cx="173.5" cy="61.3" r="2.2" class="fstrong"/><circle cx="87.6" cy="61.3" r="2.2" class="fstrong"/><circle cx="118.5" cy="20" r="2.2" class="fstrong"/><text x="27" y="61.3" class="lbl" text-anchor="middle">A</text><text x="27" y="143" class="lbl" text-anchor="middle">B</text><text x="182.5" y="143" class="lbl" text-anchor="middle">C</text><text x="182.5" y="68.2" class="lbl" text-anchor="middle">D</text><text x="87.6" y="58.3" class="lbl" text-anchor="middle">E</text><text x="118.5" y="16" class="lbl" text-anchor="middle">C′</text></svg>',
    py_foldbd_q: '<svg class="fig" viewBox="0 0 210 142"><polygon points="20,65.3 20,122 190,122 190,65.3" class="fnone sline"/><line x1="20" y1="122" x2="190" y2="65.3" class="sstrong"/><line x1="20" y1="122" x2="156" y2="20" class="sstrong"/><line x1="156" y1="20" x2="190" y2="65.3" class="sstrong"/><polygon points="20,122 95.6,65.3 190,65.3" class="f1s sstrong"/><circle cx="20" cy="65.3" r="2.2" class="fstrong"/><circle cx="20" cy="122" r="2.2" class="fstrong"/><circle cx="190" cy="122" r="2.2" class="fstrong"/><circle cx="190" cy="65.3" r="2.2" class="fstrong"/><circle cx="95.6" cy="65.3" r="2.2" class="fstrong"/><circle cx="156" cy="20" r="2.2" class="fstrong"/><text x="11" y="65.3" class="lbl" text-anchor="middle">A</text><text x="11" y="135" class="lbl" text-anchor="middle">B</text><text x="199" y="135" class="lbl" text-anchor="middle">C</text><text x="199" y="72.3" class="lbl" text-anchor="middle">D</text><text x="95.6" y="62.3" class="lbl" text-anchor="middle">E</text><text x="156" y="16" class="lbl" text-anchor="middle">C′</text></svg>',
    py_reed: '<svg class="fig" viewBox="0 0 200 150"><line x1="50" y1="130" x2="150" y2="130" class="sstrong"/><line x1="50" y1="30" x2="150" y2="30" class="s1 dash"/><line x1="50" y1="130" x2="50" y2="20" class="sstrong"/><line x1="150" y1="130" x2="150" y2="20" class="sstrong"/><line x1="100" y1="130" x2="100" y2="21.7" class="s3"/><line x1="100" y1="130" x2="141.7" y2="30" class="s3 dash"/><text x="108" y="29.8" text-anchor="middle" style="font-size:12px">1</text><text x="120.8" y="43" text-anchor="middle" style="font-size:12px">5</text><text x="75" y="84" text-anchor="middle" style="font-size:12px">水</text><circle cx="100" cy="21.7" r="2.2" class="fstrong"/><circle cx="141.7" cy="30" r="2.2" class="fstrong"/></svg>',
    py_rtfold: '<svg class="fig" viewBox="0 0 200 150"><polygon points="26.5,20 173.2,130 26.5,130" class="fnone sstrong"/><line x1="58.6" y1="130" x2="99.8" y2="75" class="sstrong dash"/><polyline points="26.5,123 33.5,123 33.5,130" class="fnone smuted thin"/><text x="35.5" y="79" text-anchor="middle" style="font-size:12px">6</text><text x="99.8" y="124" text-anchor="middle" style="font-size:12px">8</text><circle cx="58.6" cy="130" r="2.2" class="fstrong"/><text x="21.6" y="15.2" class="lbl" text-anchor="middle">A</text><text x="183.6" y="138.5" class="lbl" text-anchor="middle">B</text><text x="18.7" y="142.8" class="lbl" text-anchor="middle">C</text><text x="52" y="143.8" class="lbl" text-anchor="middle">D</text></svg>',
    qs_cross: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="20" y1="20" x2="106.7" y2="150" class="sstrong"/><line x1="20" y1="150" x2="150" y2="63.3" class="sstrong"/><polyline points="83.9,115.8 89.7,111.9 85.8,106.1" class="fnone smuted thin"/><circle cx="106.7" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="63.3" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="106.7" y="168" class="lbl" text-anchor="middle">E</text><text x="160" y="71.3" class="lbl" text-anchor="middle">F</text></svg>',
    qs_cross_q: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="20" y1="20" x2="117.5" y2="150" class="sstrong"/><line x1="20" y1="150" x2="150" y2="52.5" class="sstrong"/><polyline points="86.6,108.8 92.2,104.6 88,99" class="fnone smuted thin"/><circle cx="117.5" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="52.5" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="117.5" y="168" class="lbl" text-anchor="middle">E</text><text x="160" y="60.5" class="lbl" text-anchor="middle">F</text></svg>',
    qs_half: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="20" y1="20" x2="63.3" y2="150" class="sstrong"/><line x1="20" y1="20" x2="150" y2="85" class="sstrong"/><line x1="63.3" y1="150" x2="150" y2="85" class="sstrong"/><text x="37" y="43.6" text-anchor="middle" style="font-size:12px">45°</text><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="63.3" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="85" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="63.3" y="168" class="lbl" text-anchor="middle">E</text><text x="160" y="93" class="lbl" text-anchor="middle">F</text></svg>',
    qs_half_g: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="20" y1="20" x2="74.2" y2="150" class="sstrong"/><line x1="20" y1="20" x2="150" y2="72" class="sstrong"/><line x1="74.2" y1="150" x2="150" y2="72" class="sstrong"/><text x="38.5" y="42.3" text-anchor="middle" style="font-size:12px">45°</text><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="74.2" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="72" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="74.2" y="168" class="lbl" text-anchor="middle">E</text><text x="160" y="80" class="lbl" text-anchor="middle">F</text></svg>',
    qs_half_q: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="20" y1="20" x2="85" y2="150" class="sstrong"/><line x1="20" y1="20" x2="150" y2="63.3" class="sstrong"/><line x1="85" y1="150" x2="150" y2="63.3" class="sstrong"/><text x="39.6" y="41" text-anchor="middle" style="font-size:12px">45°</text><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="85" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="63.3" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="85" y="168" class="lbl" text-anchor="middle">E</text><text x="160" y="71.3" class="lbl" text-anchor="middle">F</text></svg>',
    qs_half_q2: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="20" y1="20" x2="63.3" y2="150" class="sstrong"/><line x1="20" y1="20" x2="150" y2="85" class="sstrong"/><line x1="63.3" y1="150" x2="150" y2="85" class="sstrong"/><text x="37" y="43.6" text-anchor="middle" style="font-size:12px">45°</text><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="63.3" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="85" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="63.3" y="168" class="lbl" text-anchor="middle">E</text><text x="160" y="93" class="lbl" text-anchor="middle">F</text></svg>',
    qs_mid: '<svg class="fig" viewBox="0 0 190 170"><polygon points="82,20 30,85 82,150 160,85" class="fnone sstrong"/><line x1="82" y1="20" x2="82" y2="150" class="smuted"/><line x1="30" y1="85" x2="160" y2="85" class="smuted"/><polygon points="56,52.5 56,117.5 121,117.5 121,52.5" class="fnone s1"/><circle cx="82" cy="20" r="2.2" class="fstrong"/><circle cx="30" cy="85" r="2.2" class="fstrong"/><circle cx="82" cy="150" r="2.2" class="fstrong"/><circle cx="160" cy="85" r="2.2" class="fstrong"/><circle cx="56" cy="52.5" r="2.2" class="fstrong"/><circle cx="56" cy="117.5" r="2.2" class="fstrong"/><circle cx="121" cy="117.5" r="2.2" class="fstrong"/><circle cx="121" cy="52.5" r="2.2" class="fstrong"/><text x="81.3" y="14" class="lbl" text-anchor="middle">A</text><text x="19" y="90" class="lbl" text-anchor="middle">B</text><text x="81.3" y="166" class="lbl" text-anchor="middle">C</text><text x="171" y="90" class="lbl" text-anchor="middle">D</text><text x="48.2" y="49.7" class="lbl" text-anchor="middle">E</text><text x="48.2" y="130.3" class="lbl" text-anchor="middle">F</text><text x="128.8" y="130.3" class="lbl" text-anchor="middle">G</text><text x="128.8" y="49.7" class="lbl" text-anchor="middle">H</text></svg>',
    qs_mnpq: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="63.3" y1="20" x2="98" y2="150" class="sstrong"/><line x1="20" y1="94.2" x2="150" y2="59.5" class="sstrong"/><polyline points="80.7,85.3 87.5,83.5 85.7,76.7" class="fnone smuted thin"/><circle cx="63.3" cy="20" r="2.2" class="fstrong"/><circle cx="98" cy="150" r="2.2" class="fstrong"/><circle cx="20" cy="94.2" r="2.2" class="fstrong"/><circle cx="150" cy="59.5" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="63.3" y="17" class="lbl" text-anchor="middle">M</text><text x="98" y="168" class="lbl" text-anchor="middle">N</text><text x="10" y="101.2" class="lbl" text-anchor="middle">P</text><text x="160" y="66.5" class="lbl" text-anchor="middle">Q</text></svg>',
    ro_eqp: '<svg class="fig" viewBox="0 0 190 170"><polygon points="20,149.9 170,149.9 95,20" class="fnone sstrong"/><line x1="83.5" y1="130.3" x2="20" y2="149.9" class="smuted"/><line x1="83.5" y1="130.3" x2="170" y2="149.9" class="smuted"/><line x1="83.5" y1="130.3" x2="95" y2="20" class="smuted"/><text x="49.4" y="136.4" text-anchor="middle" style="font-size:12px">3</text><text x="128.5" y="136.3" text-anchor="middle" style="font-size:12px">4</text><text x="81.3" y="78.3" text-anchor="middle" style="font-size:12px">5</text><circle cx="20" cy="149.9" r="2.2" class="fstrong"/><circle cx="170" cy="149.9" r="2.2" class="fstrong"/><circle cx="95" cy="20" r="2.2" class="fstrong"/><circle cx="83.5" cy="130.3" r="2.2" class="fstrong"/><text x="10.1" y="159.6" class="lbl" text-anchor="middle">A</text><text x="180.1" y="159.3" class="lbl" text-anchor="middle">B</text><text x="95" y="17" class="lbl" text-anchor="middle">C</text><text x="83.5" y="149.3" class="lbl" text-anchor="middle">P</text></svg>',
    ro_eqp_q: '<svg class="fig" viewBox="0 0 190 170"><polygon points="20,149.9 170,149.9 95,20" class="fnone sstrong"/><line x1="83.5" y1="130.3" x2="20" y2="149.9" class="smuted"/><line x1="83.5" y1="130.3" x2="170" y2="149.9" class="smuted"/><line x1="83.5" y1="130.3" x2="95" y2="20" class="smuted"/><text x="49.4" y="136.4" text-anchor="middle" style="font-size:12px">6</text><text x="128.5" y="136.3" text-anchor="middle" style="font-size:12px">8</text><text x="81.3" y="78.3" text-anchor="middle" style="font-size:12px">10</text><circle cx="20" cy="149.9" r="2.2" class="fstrong"/><circle cx="170" cy="149.9" r="2.2" class="fstrong"/><circle cx="95" cy="20" r="2.2" class="fstrong"/><circle cx="83.5" cy="130.3" r="2.2" class="fstrong"/><text x="10.1" y="159.6" class="lbl" text-anchor="middle">A</text><text x="180.1" y="159.3" class="lbl" text-anchor="middle">B</text><text x="95" y="17" class="lbl" text-anchor="middle">C</text><text x="83.5" y="149.3" class="lbl" text-anchor="middle">P</text></svg>',
    ro_half: '<svg class="fig" viewBox="0 0 210 125"><polygon points="105,20 20,105 190,105" class="fnone sstrong"/><line x1="105" y1="20" x2="62.5" y2="105" class="sstrong"/><line x1="105" y1="20" x2="133.3" y2="105" class="sstrong"/><polyline points="100.1,24.9 105,29.9 109.9,24.9" class="fnone smuted thin"/><text x="102.9" y="53.9" text-anchor="middle" style="font-size:12px">45°</text><circle cx="105" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="105" r="2.2" class="fstrong"/><circle cx="190" cy="105" r="2.2" class="fstrong"/><circle cx="62.5" cy="105" r="2.2" class="fstrong"/><circle cx="133.3" cy="105" r="2.2" class="fstrong"/><text x="105" y="16" class="lbl" text-anchor="middle">A</text><text x="9.8" y="114.2" class="lbl" text-anchor="middle">B</text><text x="200.2" y="114.2" class="lbl" text-anchor="middle">C</text><text x="57.6" y="119.8" class="lbl" text-anchor="middle">D</text><text x="136.8" y="120.4" class="lbl" text-anchor="middle">E</text></svg>',
    ro_hand: '<svg class="fig" viewBox="0 0 200 142"><polygon points="117.6,20 20,55.5 99.6,122.3" class="fnone sstrong"/><polygon points="117.6,20 148.8,74 180,20" class="fnone sstrong"/><line x1="20" y1="55.5" x2="148.8" y2="74" class="s1"/><line x1="99.6" y1="122.3" x2="180" y2="20" class="s2"/><circle cx="117.6" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="55.5" r="2.2" class="fstrong"/><circle cx="99.6" cy="122.3" r="2.2" class="fstrong"/><circle cx="148.8" cy="74" r="2.2" class="fstrong"/><circle cx="180" cy="20" r="2.2" class="fstrong"/><text x="115.7" y="14.2" class="lbl" text-anchor="middle">A</text><text x="9.1" y="58.8" class="lbl" text-anchor="middle">B</text><text x="99.5" y="138.3" class="lbl" text-anchor="middle">C</text><text x="154" y="88.7" class="lbl" text-anchor="middle">D</text><text x="188.7" y="18.2" class="lbl" text-anchor="middle">E</text></svg>',
    ro_handsq: '<svg class="fig" viewBox="0 0 200 180"><polygon points="111.6,71.1 41.5,89.9 60.3,160 130.4,141.2" class="fnone sstrong"/><polygon points="111.6,71.1 158.6,67 154.5,20 107.5,24.1" class="fnone sstrong"/><line x1="41.5" y1="89.9" x2="158.6" y2="67" class="s1"/><line x1="130.4" y1="141.2" x2="107.5" y2="24.1" class="s2"/><circle cx="111.6" cy="71.1" r="2.2" class="fstrong"/><circle cx="41.5" cy="89.9" r="2.2" class="fstrong"/><circle cx="60.3" cy="160" r="2.2" class="fstrong"/><circle cx="130.4" cy="141.2" r="2.2" class="fstrong"/><circle cx="158.6" cy="67" r="2.2" class="fstrong"/><circle cx="154.5" cy="20" r="2.2" class="fstrong"/><circle cx="107.5" cy="24.1" r="2.2" class="fstrong"/><text x="114" y="65.4" class="lbl" text-anchor="middle">A</text><text x="30.8" y="92.4" class="lbl" text-anchor="middle">B</text><text x="54.8" y="174.5" class="lbl" text-anchor="middle">C</text><text x="137.5" y="154.6" class="lbl" text-anchor="middle">D</text><text x="169" y="75.6" class="lbl" text-anchor="middle">E</text><text x="161.6" y="16.6" class="lbl" text-anchor="middle">F</text><text x="101.3" y="20" class="lbl" text-anchor="middle">G</text></svg>',
    ro_iso: '<svg class="fig" viewBox="0 0 200 120"><polygon points="100,20 20,100 180,100" class="fnone sstrong"/><line x1="100" y1="20" x2="88.8" y2="100" class="sstrong"/><line x1="100" y1="20" x2="180" y2="31.2" class="sstrong"/><line x1="88.8" y1="100" x2="180" y2="31.2" class="sstrong"/><line x1="180" y1="100" x2="180" y2="31.2" class="s2"/><polyline points="95.1,24.9 100,29.9 104.9,24.9" class="fnone smuted thin"/><circle cx="100" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="100" r="2.2" class="fstrong"/><circle cx="180" cy="100" r="2.2" class="fstrong"/><circle cx="88.8" cy="100" r="2.2" class="fstrong"/><circle cx="180" cy="31.2" r="2.2" class="fstrong"/><text x="100" y="16" class="lbl" text-anchor="middle">A</text><text x="9.8" y="109.2" class="lbl" text-anchor="middle">B</text><text x="187.8" y="112.8" class="lbl" text-anchor="middle">C</text><text x="83.2" y="114.5" class="lbl" text-anchor="middle">D</text><text x="190" y="38.2" class="lbl" text-anchor="middle">E</text></svg>',
    ro_iso_q: '<svg class="fig" viewBox="0 0 200 120"><polygon points="100,20 20,100 180,100" class="fnone sstrong"/><line x1="100" y1="20" x2="88.6" y2="100" class="sstrong"/><line x1="100" y1="20" x2="180" y2="31.4" class="sstrong"/><line x1="88.6" y1="100" x2="180" y2="31.4" class="sstrong"/><line x1="180" y1="100" x2="180" y2="31.4" class="s2"/><polyline points="95.1,24.9 100,29.9 104.9,24.9" class="fnone smuted thin"/><text x="54.3" y="114" text-anchor="middle" style="font-size:12px">3</text><text x="134.3" y="114" text-anchor="middle" style="font-size:12px">4</text><circle cx="100" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="100" r="2.2" class="fstrong"/><circle cx="180" cy="100" r="2.2" class="fstrong"/><circle cx="88.6" cy="100" r="2.2" class="fstrong"/><circle cx="180" cy="31.4" r="2.2" class="fstrong"/><text x="100" y="16" class="lbl" text-anchor="middle">A</text><text x="9.8" y="109.2" class="lbl" text-anchor="middle">B</text><text x="187.8" y="112.8" class="lbl" text-anchor="middle">C</text><text x="83" y="114.5" class="lbl" text-anchor="middle">D</text><text x="190" y="38.4" class="lbl" text-anchor="middle">E</text></svg>',
    ro_line: '<svg class="fig" viewBox="0 0 220 137"><line x1="20" y1="117.4" x2="87.5" y2="117.4" class="sstrong"/><line x1="87.5" y1="117.4" x2="200" y2="117.4" class="sstrong"/><line x1="20" y1="117.4" x2="53.8" y2="59" class="sstrong"/><line x1="53.8" y1="59" x2="87.5" y2="117.4" class="sstrong"/><line x1="87.5" y1="117.4" x2="143.8" y2="20" class="sstrong"/><line x1="143.8" y1="20" x2="200" y2="117.4" class="sstrong"/><line x1="20" y1="117.4" x2="143.8" y2="20" class="s1"/><line x1="200" y1="117.4" x2="53.8" y2="59" class="s2"/><circle cx="20" cy="117.4" r="2.2" class="fstrong"/><circle cx="87.5" cy="117.4" r="2.2" class="fstrong"/><circle cx="200" cy="117.4" r="2.2" class="fstrong"/><circle cx="53.8" cy="59" r="2.2" class="fstrong"/><circle cx="143.8" cy="20" r="2.2" class="fstrong"/><text x="10.8" y="128.4" class="lbl" text-anchor="middle">A</text><text x="87.5" y="133.4" class="lbl" text-anchor="middle">B</text><text x="209.8" y="127.4" class="lbl" text-anchor="middle">C</text><text x="49.3" y="53.9" class="lbl" text-anchor="middle">D</text><text x="147.2" y="14.6" class="lbl" text-anchor="middle">E</text></svg>',
    ro_line_n: '<svg class="fig" viewBox="0 0 220 137"><line x1="20" y1="117.4" x2="87.5" y2="117.4" class="sstrong"/><line x1="87.5" y1="117.4" x2="200" y2="117.4" class="sstrong"/><line x1="20" y1="117.4" x2="53.8" y2="59" class="sstrong"/><line x1="53.8" y1="59" x2="87.5" y2="117.4" class="sstrong"/><line x1="87.5" y1="117.4" x2="143.8" y2="20" class="sstrong"/><line x1="143.8" y1="20" x2="200" y2="117.4" class="sstrong"/><line x1="20" y1="117.4" x2="143.8" y2="20" class="s1"/><line x1="200" y1="117.4" x2="53.8" y2="59" class="s2"/><circle cx="20" cy="117.4" r="2.2" class="fstrong"/><circle cx="87.5" cy="117.4" r="2.2" class="fstrong"/><circle cx="200" cy="117.4" r="2.2" class="fstrong"/><circle cx="53.8" cy="59" r="2.2" class="fstrong"/><circle cx="143.8" cy="20" r="2.2" class="fstrong"/><text x="10.8" y="128.4" class="lbl" text-anchor="middle">A</text><text x="87.5" y="133.4" class="lbl" text-anchor="middle">B</text><text x="209.8" y="127.4" class="lbl" text-anchor="middle">C</text><text x="49.3" y="53.9" class="lbl" text-anchor="middle">D</text><text x="147.2" y="14.6" class="lbl" text-anchor="middle">E</text></svg>',
    ro_sqp: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="43.4" y1="60.1" x2="20" y2="20" class="smuted"/><line x1="43.4" y1="60.1" x2="20" y2="150" class="smuted"/><line x1="43.4" y1="60.1" x2="150" y2="150" class="smuted"/><text x="24.8" y="48.1" text-anchor="middle" style="font-size:12px">1</text><text x="24" y="107" text-anchor="middle" style="font-size:12px">2</text><text x="101.9" y="102.9" text-anchor="middle" style="font-size:12px">3</text><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="43.4" cy="60.1" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="53.4" y="61.1" class="lbl" text-anchor="middle">P</text></svg>',
    ro_sqp_q: '<svg class="fig" viewBox="0 0 170 170"><polygon points="20,20 20,150 150,150 150,20" class="fnone sstrong"/><line x1="43.4" y1="60.1" x2="20" y2="20" class="smuted"/><line x1="43.4" y1="60.1" x2="20" y2="150" class="smuted"/><line x1="43.4" y1="60.1" x2="150" y2="150" class="smuted"/><text x="24.8" y="48.1" text-anchor="middle" style="font-size:12px">2</text><text x="24" y="107" text-anchor="middle" style="font-size:12px">4</text><text x="101.9" y="102.9" text-anchor="middle" style="font-size:12px">6</text><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="150" r="2.2" class="fstrong"/><circle cx="150" cy="20" r="2.2" class="fstrong"/><circle cx="43.4" cy="60.1" r="2.2" class="fstrong"/><text x="11" y="20" class="lbl" text-anchor="middle">A</text><text x="11" y="163" class="lbl" text-anchor="middle">B</text><text x="159" y="163" class="lbl" text-anchor="middle">C</text><text x="159" y="20" class="lbl" text-anchor="middle">D</text><text x="53.4" y="61.1" class="lbl" text-anchor="middle">P</text></svg>',
    sh_30: '<svg class="fig" viewBox="0 0 210 125"><line x1="20" y1="105" x2="167.2" y2="20" class="sstrong"/><line x1="20" y1="105" x2="190" y2="105" class="sstrong"/><polygon points="121.1,80.7 82.4,69 152,105" class="fnone smuted dash"/><line x1="20" y1="105" x2="121.1" y2="80.7" class="smuted"/><text x="68.7" y="89.1" text-anchor="middle" style="font-size:12px">10</text><text x="45.1" y="102.3" text-anchor="middle" style="font-size:12px">30°</text><circle cx="20" cy="105" r="2.2" class="fstrong"/><circle cx="167.2" cy="20" r="2.2" class="fstrong"/><circle cx="190" cy="105" r="2.2" class="fstrong"/><circle cx="121.1" cy="80.7" r="2.2" class="fstrong"/><circle cx="82.4" cy="69" r="2.2" class="fstrong"/><circle cx="152" cy="105" r="2.2" class="fstrong"/><text x="10" y="113" class="lbl" text-anchor="middle">O</text><text x="173.2" y="21" class="lbl" text-anchor="middle">A</text><text x="198" y="114" class="lbl" text-anchor="middle">B</text><text x="130.1" y="87.7" class="lbl" text-anchor="middle">P</text><text x="78.4" y="64" class="lbl" text-anchor="middle">M</text><text x="152" y="121" class="lbl" text-anchor="middle">N</text></svg>',
    sh_30q: '<svg class="fig" viewBox="0 0 210 125"><line x1="20" y1="105" x2="167.2" y2="20" class="sstrong"/><line x1="20" y1="105" x2="190" y2="105" class="sstrong"/><polygon points="121.1,80.7 82.4,69 152,105" class="fnone smuted dash"/><line x1="20" y1="105" x2="121.1" y2="80.7" class="smuted"/><text x="68.7" y="89.1" text-anchor="middle" style="font-size:12px">6</text><text x="45.1" y="102.3" text-anchor="middle" style="font-size:12px">30°</text><circle cx="20" cy="105" r="2.2" class="fstrong"/><circle cx="167.2" cy="20" r="2.2" class="fstrong"/><circle cx="190" cy="105" r="2.2" class="fstrong"/><circle cx="121.1" cy="80.7" r="2.2" class="fstrong"/><circle cx="82.4" cy="69" r="2.2" class="fstrong"/><circle cx="152" cy="105" r="2.2" class="fstrong"/><text x="10" y="113" class="lbl" text-anchor="middle">O</text><text x="173.2" y="21" class="lbl" text-anchor="middle">A</text><text x="198" y="114" class="lbl" text-anchor="middle">B</text><text x="130.1" y="87.7" class="lbl" text-anchor="middle">P</text><text x="78.4" y="64" class="lbl" text-anchor="middle">M</text><text x="152" y="121" class="lbl" text-anchor="middle">N</text></svg>',
    sh_40: '<svg class="fig" viewBox="0 0 210 140"><line x1="27" y1="120" x2="146.2" y2="20" class="sstrong"/><line x1="27" y1="120" x2="182.6" y2="120" class="sstrong"/><polygon points="117.5,90.6 77.5,77.6 147.8,120" class="fnone smuted dash"/><line x1="27" y1="120" x2="117.5" y2="90.6" class="smuted"/><text x="51.4" y="115.1" text-anchor="middle" style="font-size:12px">40°</text><circle cx="27" cy="120" r="2.2" class="fstrong"/><circle cx="146.2" cy="20" r="2.2" class="fstrong"/><circle cx="182.6" cy="120" r="2.2" class="fstrong"/><circle cx="117.5" cy="90.6" r="2.2" class="fstrong"/><circle cx="77.5" cy="77.6" r="2.2" class="fstrong"/><circle cx="147.8" cy="120" r="2.2" class="fstrong"/><text x="17" y="128" class="lbl" text-anchor="middle">O</text><text x="152.2" y="21" class="lbl" text-anchor="middle">A</text><text x="190.6" y="129" class="lbl" text-anchor="middle">B</text><text x="126.5" y="97.6" class="lbl" text-anchor="middle">P</text><text x="73.5" y="72.6" class="lbl" text-anchor="middle">M</text><text x="147.8" y="136" class="lbl" text-anchor="middle">N</text></svg>',
    sh_45: '<svg class="fig" viewBox="0 0 210 140"><line x1="34.5" y1="120" x2="134.5" y2="20" class="sstrong"/><line x1="34.5" y1="120" x2="175.9" y2="120" class="sstrong"/><polygon points="115.7,90.1 76.9,77.6 144.3,120" class="fnone smuted dash"/><line x1="34.5" y1="120" x2="115.7" y2="90.1" class="smuted"/><text x="72.3" y="101.5" text-anchor="middle" style="font-size:12px">4</text><text x="58.5" y="114.1" text-anchor="middle" style="font-size:12px">45°</text><circle cx="34.5" cy="120" r="2.2" class="fstrong"/><circle cx="134.5" cy="20" r="2.2" class="fstrong"/><circle cx="175.9" cy="120" r="2.2" class="fstrong"/><circle cx="115.7" cy="90.1" r="2.2" class="fstrong"/><circle cx="76.9" cy="77.6" r="2.2" class="fstrong"/><circle cx="144.3" cy="120" r="2.2" class="fstrong"/><text x="24.5" y="128" class="lbl" text-anchor="middle">O</text><text x="140.5" y="21" class="lbl" text-anchor="middle">A</text><text x="183.9" y="129" class="lbl" text-anchor="middle">B</text><text x="124.7" y="97.1" class="lbl" text-anchor="middle">P</text><text x="72.9" y="72.6" class="lbl" text-anchor="middle">M</text><text x="144.3" y="136" class="lbl" text-anchor="middle">N</text></svg>',
    sh_c1: '<svg class="fig" viewBox="0 0 200 180"><line x1="36.5" y1="66.7" x2="163.2" y2="66.7" class="smuted thin"/><line x1="56.5" y1="160" x2="56.5" y2="20" class="smuted thin"/><polyline points="157.2,63.7 163.2,66.7 157.2,69.7" class="fnone smuted thin"/><polyline points="53.5,26 56.5,20 59.5,26" class="fnone smuted thin"/><text x="161.2" y="80.7" class="lbl" text-anchor="end">x</text><text x="62.5" y="29" class="lbl">y</text><text x="52.5" y="79.7" class="lbl" text-anchor="end">O</text><text x="74.5" y="41.3" text-anchor="start" style="font-size:12px">A(1, 2)</text><text x="114.5" y="148" text-anchor="start" style="font-size:12px">B(4, −6)</text><circle cx="69.8" cy="40" r="2.2" class="fstrong"/><circle cx="109.8" cy="146.7" r="2.2" class="fstrong"/></svg>',
    sh_c2: '<svg class="fig" viewBox="0 0 200 132"><line x1="20" y1="94.7" x2="180" y2="94.7" class="smuted thin"/><line x1="37.8" y1="112.4" x2="37.8" y2="20" class="smuted thin"/><polyline points="174,91.7 180,94.7 174,97.7" class="fnone smuted thin"/><polyline points="34.8,26 37.8,20 40.8,26" class="fnone smuted thin"/><text x="178" y="108.7" class="lbl" text-anchor="end">x</text><text x="43.8" y="29" class="lbl">y</text><text x="33.8" y="107.7" class="lbl" text-anchor="end">O</text><text x="61.8" y="77.3" text-anchor="start" style="font-size:12px">A(1, 1)</text><text x="115.1" y="41.8" text-anchor="start" style="font-size:12px">B(4, 3)</text><circle cx="55.6" cy="76.9" r="2.2" class="fstrong"/><circle cx="108.9" cy="41.3" r="2.2" class="fstrong"/></svg>',
    sh_c3: '<svg class="fig" viewBox="0 0 200 178"><line x1="20" y1="141.3" x2="180" y2="141.3" class="smuted thin"/><line x1="36.8" y1="158.1" x2="36.8" y2="20" class="smuted thin"/><polyline points="174,138.3 180,141.3 174,144.3" class="fnone smuted thin"/><polyline points="33.8,26 36.8,20 39.8,26" class="fnone smuted thin"/><text x="178" y="155.3" class="lbl" text-anchor="end">x</text><text x="42.8" y="29" class="lbl">y</text><text x="32.8" y="154.3" class="lbl" text-anchor="end">O</text><text x="42.7" y="91.4" text-anchor="start" style="font-size:12px">A(0, 3)</text><text x="110.1" y="40.8" text-anchor="start" style="font-size:12px">B(4, 6)</text><circle cx="36.8" cy="90.7" r="2.2" class="fstrong"/><circle cx="104.2" cy="40.2" r="2.2" class="fstrong"/></svg>',
    sh_eq: '<svg class="fig" viewBox="0 0 180 161"><polygon points="90,20 20,141.2 160,141.2" class="fnone sstrong"/><line x1="90" y1="20" x2="90" y2="141.2" class="sstrong"/><line x1="90" y1="74.6" x2="125" y2="80.6" class="s2"/><line x1="90" y1="74.6" x2="160" y2="141.2" class="s2"/><circle cx="90" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="141.2" r="2.2" class="fstrong"/><circle cx="160" cy="141.2" r="2.2" class="fstrong"/><circle cx="90" cy="141.2" r="2.2" class="fstrong"/><circle cx="125" cy="80.6" r="2.2" class="fstrong"/><circle cx="90" cy="74.6" r="2.2" class="fstrong"/><text x="90" y="14" class="lbl" text-anchor="middle">A</text><text x="10.5" y="151.7" class="lbl" text-anchor="middle">B</text><text x="169" y="152.5" class="lbl" text-anchor="middle">C</text><text x="90" y="157.2" class="lbl" text-anchor="middle">D</text><text x="135.8" y="87.5" class="lbl" text-anchor="middle">E</text><text x="81" y="81.6" class="lbl" text-anchor="middle">P</text></svg>',
    sh_iso: '<svg class="fig" viewBox="0 0 200 147"><polygon points="100,20 20,126.7 180,126.7" class="fnone sstrong"/><line x1="100" y1="20" x2="100" y2="126.7" class="sstrong"/><line x1="20" y1="126.7" x2="100" y2="78.7" class="s2"/><line x1="100" y1="78.7" x2="72" y2="57.3" class="s2"/><circle cx="100" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="126.7" r="2.2" class="fstrong"/><circle cx="180" cy="126.7" r="2.2" class="fstrong"/><circle cx="100" cy="126.7" r="2.2" class="fstrong"/><circle cx="100" cy="78.7" r="2.2" class="fstrong"/><circle cx="72" cy="57.3" r="2.2" class="fstrong"/><text x="100" y="14" class="lbl" text-anchor="middle">A</text><text x="10.3" y="136.9" class="lbl" text-anchor="middle">B</text><text x="189.8" y="136.6" class="lbl" text-anchor="middle">C</text><text x="100" y="142.7" class="lbl" text-anchor="middle">D</text><text x="109" y="86.7" class="lbl" text-anchor="middle">M</text><text x="63" y="58.3" class="lbl" text-anchor="middle">N</text></svg>',
    sh_river: '<svg class="fig" viewBox="0 0 230 157"><line x1="20" y1="45.3" x2="210" y2="45.3" class="sstrong"/><line x1="20" y1="83.3" x2="210" y2="83.3" class="sstrong"/><text x="115" y="68.3" text-anchor="middle" style="font-size:12px">河</text><text x="153" y="35.4" text-anchor="middle" style="font-size:12px">北岸</text><text x="84.6" y="106.3" text-anchor="middle" style="font-size:12px">南岸</text><line x1="39" y1="20" x2="39" y2="45.3" class="smuted dash"/><text x="47" y="36.7" text-anchor="middle" style="font-size:12px">2</text><line x1="191" y1="121.3" x2="191" y2="83.3" class="smuted dash"/><text x="183" y="106.3" text-anchor="middle" style="font-size:12px">3</text><line x1="28.9" y1="45.3" x2="28.9" y2="83.3" class="smuted"/><text x="19.9" y="68.3" text-anchor="middle" style="font-size:12px">3</text><line x1="39" y1="132.7" x2="191" y2="132.7" class="smuted"/><line x1="39" y1="128.9" x2="39" y2="136.5" class="smuted"/><line x1="191" y1="128.9" x2="191" y2="136.5" class="smuted"/><text x="115" y="145.7" text-anchor="middle" style="font-size:12px">12</text><circle cx="39" cy="20" r="2.2" class="fstrong"/><circle cx="191" cy="121.3" r="2.2" class="fstrong"/><text x="39" y="16" class="lbl" text-anchor="middle">A</text><text x="191" y="139.3" class="lbl" text-anchor="middle">B</text></svg>',
    sh_river_q: '<svg class="fig" viewBox="0 0 230 170"><line x1="28" y1="51.7" x2="202.4" y2="51.7" class="sstrong"/><line x1="28" y1="67.6" x2="202.4" y2="67.6" class="sstrong"/><text x="115.2" y="63.6" text-anchor="middle" style="font-size:12px">河</text><text x="146.9" y="47.8" text-anchor="middle" style="font-size:12px">北岸</text><text x="89.8" y="85.8" text-anchor="middle" style="font-size:12px">南岸</text><line x1="51.8" y1="20" x2="51.8" y2="51.7" class="smuted dash"/><text x="59.8" y="39.9" text-anchor="middle" style="font-size:12px">2</text><line x1="178.6" y1="131" x2="178.6" y2="67.6" class="smuted dash"/><text x="170.6" y="103.3" text-anchor="middle" style="font-size:12px">4</text><line x1="39.1" y1="51.7" x2="39.1" y2="67.6" class="smuted"/><text x="30.1" y="63.6" text-anchor="middle" style="font-size:12px">1</text><line x1="51.8" y1="145.2" x2="178.6" y2="145.2" class="smuted"/><line x1="51.8" y1="140.5" x2="51.8" y2="150" class="smuted"/><line x1="178.6" y1="140.5" x2="178.6" y2="150" class="smuted"/><text x="115.2" y="158.2" text-anchor="middle" style="font-size:12px">8</text><circle cx="51.8" cy="20" r="2.2" class="fstrong"/><circle cx="178.6" cy="131" r="2.2" class="fstrong"/><text x="51.8" y="16" class="lbl" text-anchor="middle">A</text><text x="178.6" y="149" class="lbl" text-anchor="middle">B</text></svg>',
    sh_sq: '<svg class="fig" viewBox="0 0 160 160"><polygon points="20,20 20,140 140,140 140,20" class="fnone sstrong"/><line x1="20" y1="20" x2="140" y2="140" class="smuted"/><line x1="140" y1="20" x2="65.6" y2="65.6" class="s2"/><line x1="65.6" y1="65.6" x2="140" y2="50" class="s2"/><circle cx="20" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="140" r="2.2" class="fstrong"/><circle cx="140" cy="140" r="2.2" class="fstrong"/><circle cx="140" cy="20" r="2.2" class="fstrong"/><circle cx="140" cy="50" r="2.2" class="fstrong"/><circle cx="65.6" cy="65.6" r="2.2" class="fstrong"/><text x="12.2" y="17.2" class="lbl" text-anchor="middle">A</text><text x="12.2" y="152.8" class="lbl" text-anchor="middle">B</text><text x="147.8" y="152.8" class="lbl" text-anchor="middle">C</text><text x="148.5" y="18" class="lbl" text-anchor="middle">D</text><text x="150" y="58" class="lbl" text-anchor="middle">M</text><text x="63.6" y="82.6" class="lbl" text-anchor="middle">N</text></svg>',
    sh_tri30: '<svg class="fig" viewBox="0 0 220 107"><polygon points="20,87.5 136.9,20 200,87.5" class="fnone sstrong"/><line x1="20" y1="87.5" x2="164" y2="48.9" class="sstrong"/><line x1="136.9" y1="20" x2="106.4" y2="64.4" class="s2"/><line x1="106.4" y1="64.4" x2="72.6" y2="57.1" class="s2"/><circle cx="20" cy="87.5" r="2.2" class="fstrong"/><circle cx="136.9" cy="20" r="2.2" class="fstrong"/><circle cx="200" cy="87.5" r="2.2" class="fstrong"/><circle cx="164" cy="48.9" r="2.2" class="fstrong"/><circle cx="106.4" cy="64.4" r="2.2" class="fstrong"/><circle cx="72.6" cy="57.1" r="2.2" class="fstrong"/><text x="9.4" y="95.3" class="lbl" text-anchor="middle">A</text><text x="140.7" y="14.7" class="lbl" text-anchor="middle">B</text><text x="210.1" y="96.9" class="lbl" text-anchor="middle">C</text><text x="174.6" y="51.1" class="lbl" text-anchor="middle">D</text><text x="110.4" y="79.4" class="lbl" text-anchor="middle">M</text><text x="66.6" y="54.1" class="lbl" text-anchor="middle">N</text></svg>',
    sm_8: '<svg class="fig" viewBox="0 0 200 130"><line x1="33" y1="68.3" x2="70.9" y2="54.5" class="sstrong"/><line x1="70.9" y1="54.5" x2="165.8" y2="20" class="sstrong"/><line x1="32.5" y1="32.3" x2="70.9" y2="54.5" class="sstrong"/><line x1="70.9" y1="54.5" x2="167.1" y2="110" class="sstrong"/><line x1="33" y1="68.3" x2="32.5" y2="32.3" class="sstrong"/><line x1="165.8" y1="20" x2="167.1" y2="110" class="sstrong"/><circle cx="70.9" cy="54.5" r="2.2" class="fstrong"/><circle cx="33" cy="68.3" r="2.2" class="fstrong"/><circle cx="165.8" cy="20" r="2.2" class="fstrong"/><circle cx="32.5" cy="32.3" r="2.2" class="fstrong"/><circle cx="167.1" cy="110" r="2.2" class="fstrong"/><text x="70.9" y="50.5" class="lbl" text-anchor="middle">O</text><text x="26.8" y="82.4" class="lbl" text-anchor="middle">A</text><text x="172" y="15.9" class="lbl" text-anchor="middle">B</text><text x="26.9" y="27.8" class="lbl" text-anchor="middle">C</text><text x="172.6" y="124.5" class="lbl" text-anchor="middle">D</text></svg>',
    sm_a: '<svg class="fig" viewBox="0 0 170 148"><polygon points="63.3,20 20,128.3 150,128.3" class="fnone sstrong"/><line x1="46" y1="63.3" x2="98" y2="63.3" class="sstrong"/><circle cx="63.3" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="128.3" r="2.2" class="fstrong"/><circle cx="150" cy="128.3" r="2.2" class="fstrong"/><circle cx="46" cy="63.3" r="2.2" class="fstrong"/><circle cx="98" cy="63.3" r="2.2" class="fstrong"/><text x="61.7" y="14.1" class="lbl" text-anchor="middle">A</text><text x="10.9" y="139.5" class="lbl" text-anchor="middle">B</text><text x="159.9" y="138.1" class="lbl" text-anchor="middle">C</text><text x="35" y="68.3" class="lbl" text-anchor="middle">D</text><text x="109" y="68.3" class="lbl" text-anchor="middle">E</text></svg>',
    sm_eq: '<svg class="fig" viewBox="0 0 190 170"><polygon points="95,20 20,149.9 170,149.9" class="fnone sstrong"/><line x1="95" y1="20" x2="70" y2="149.9" class="sstrong"/><line x1="70" y1="149.9" x2="153.3" y2="121" class="sstrong"/><text x="83.1" y="138.8" text-anchor="middle" style="font-size:12px">60°</text><circle cx="95" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="149.9" r="2.2" class="fstrong"/><circle cx="170" cy="149.9" r="2.2" class="fstrong"/><circle cx="70" cy="149.9" r="2.2" class="fstrong"/><circle cx="153.3" cy="121" r="2.2" class="fstrong"/><text x="95.8" y="14" class="lbl" text-anchor="middle">A</text><text x="10.5" y="160.4" class="lbl" text-anchor="middle">B</text><text x="179.5" y="160.4" class="lbl" text-anchor="middle">C</text><text x="62.8" y="163.2" class="lbl" text-anchor="middle">D</text><text x="163.7" y="122.4" class="lbl" text-anchor="middle">E</text></svg>',
    sm_eq_q: '<svg class="fig" viewBox="0 0 190 170"><polygon points="95,20 20,149.9 170,149.9" class="fnone sstrong"/><line x1="95" y1="20" x2="70" y2="149.9" class="sstrong"/><line x1="70" y1="149.9" x2="153.3" y2="121" class="sstrong"/><text x="83.1" y="138.8" text-anchor="middle" style="font-size:12px">60°</text><circle cx="95" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="149.9" r="2.2" class="fstrong"/><circle cx="170" cy="149.9" r="2.2" class="fstrong"/><circle cx="70" cy="149.9" r="2.2" class="fstrong"/><circle cx="153.3" cy="121" r="2.2" class="fstrong"/><text x="95.8" y="14" class="lbl" text-anchor="middle">A</text><text x="10.5" y="160.4" class="lbl" text-anchor="middle">B</text><text x="179.5" y="160.4" class="lbl" text-anchor="middle">C</text><text x="62.8" y="163.2" class="lbl" text-anchor="middle">D</text><text x="163.7" y="122.4" class="lbl" text-anchor="middle">E</text></svg>',
    sm_k: '<svg class="fig" viewBox="0 0 210 125"><line x1="20" y1="105" x2="62.5" y2="105" class="sstrong"/><line x1="62.5" y1="105" x2="190" y2="105" class="sstrong"/><line x1="20" y1="41.2" x2="20" y2="105" class="sstrong"/><line x1="190" y1="105" x2="190" y2="20" class="sstrong"/><line x1="20" y1="41.2" x2="62.5" y2="105" class="sstrong"/><line x1="62.5" y1="105" x2="190" y2="20" class="sstrong"/><polyline points="20,99 26,99 26,105" class="fnone smuted thin"/><polyline points="190,99 184,99 184,105" class="fnone smuted thin"/><polyline points="59.2,100 64.2,96.7 67.5,101.7" class="fnone smuted thin"/><text x="12" y="77.1" text-anchor="middle" style="font-size:12px">3</text><text x="41.2" y="119" text-anchor="middle" style="font-size:12px">2</text><text x="126.2" y="119" text-anchor="middle" style="font-size:12px">6</text><circle cx="20" cy="41.2" r="2.2" class="fstrong"/><circle cx="20" cy="105" r="2.2" class="fstrong"/><circle cx="62.5" cy="105" r="2.2" class="fstrong"/><circle cx="190" cy="105" r="2.2" class="fstrong"/><circle cx="190" cy="20" r="2.2" class="fstrong"/><text x="16.8" y="35.7" class="lbl" text-anchor="middle">A</text><text x="12.2" y="117.8" class="lbl" text-anchor="middle">B</text><text x="60.3" y="120.8" class="lbl" text-anchor="middle">P</text><text x="197.8" y="117.8" class="lbl" text-anchor="middle">C</text><text x="195.2" y="15.3" class="lbl" text-anchor="middle">D</text></svg>',
    sm_k_q: '<svg class="fig" viewBox="0 0 210 133"><line x1="20" y1="112.7" x2="66.4" y2="112.7" class="sstrong"/><line x1="66.4" y1="112.7" x2="190" y2="112.7" class="sstrong"/><line x1="20" y1="50.9" x2="20" y2="112.7" class="sstrong"/><line x1="190" y1="112.7" x2="190" y2="20" class="sstrong"/><line x1="20" y1="50.9" x2="66.4" y2="112.7" class="sstrong"/><line x1="66.4" y1="112.7" x2="190" y2="20" class="sstrong"/><polyline points="20,106.7 26,106.7 26,112.7" class="fnone smuted thin"/><polyline points="190,106.7 184,106.7 184,112.7" class="fnone smuted thin"/><polyline points="62.8,107.9 67.6,104.3 71.2,109.1" class="fnone smuted thin"/><text x="12" y="85.8" text-anchor="middle" style="font-size:12px">4</text><text x="43.2" y="126.7" text-anchor="middle" style="font-size:12px">3</text><text x="128.2" y="126.7" text-anchor="middle" style="font-size:12px">8</text><circle cx="20" cy="50.9" r="2.2" class="fstrong"/><circle cx="20" cy="112.7" r="2.2" class="fstrong"/><circle cx="66.4" cy="112.7" r="2.2" class="fstrong"/><circle cx="190" cy="112.7" r="2.2" class="fstrong"/><circle cx="190" cy="20" r="2.2" class="fstrong"/><text x="16.5" y="45.5" class="lbl" text-anchor="middle">A</text><text x="12.2" y="125.5" class="lbl" text-anchor="middle">B</text><text x="64.8" y="128.6" class="lbl" text-anchor="middle">P</text><text x="197.8" y="125.5" class="lbl" text-anchor="middle">C</text><text x="194.9" y="15.2" class="lbl" text-anchor="middle">D</text></svg>',
    sm_kg: '<svg class="fig" viewBox="0 0 210 140"><line x1="23.5" y1="120" x2="88.9" y2="120" class="sstrong"/><line x1="88.9" y1="120" x2="187" y2="120" class="sstrong"/><line x1="48.1" y1="67.3" x2="23.5" y2="120" class="sstrong"/><line x1="187" y1="120" x2="140.3" y2="20" class="sstrong"/><line x1="48.1" y1="67.3" x2="88.9" y2="120" class="sstrong"/><line x1="88.9" y1="120" x2="140.3" y2="20" class="sstrong"/><path d="M34.5,120 A11,11 0 0 0 28.1,110" class="fnone smuted thin"/><path d="M93.9,110.2 A11,11 0 0 0 82.1,111.3" class="fnone smuted thin"/><path d="M182.3,110 A11,11 0 0 0 176,120" class="fnone smuted thin"/><circle cx="48.1" cy="67.3" r="2.2" class="fstrong"/><circle cx="23.5" cy="120" r="2.2" class="fstrong"/><circle cx="88.9" cy="120" r="2.2" class="fstrong"/><circle cx="187" cy="120" r="2.2" class="fstrong"/><circle cx="140.3" cy="20" r="2.2" class="fstrong"/><text x="46.8" y="61.4" class="lbl" text-anchor="middle">A</text><text x="14.2" y="130.9" class="lbl" text-anchor="middle">B</text><text x="89.9" y="136" class="lbl" text-anchor="middle">P</text><text x="196.2" y="130.9" class="lbl" text-anchor="middle">C</text><text x="140.5" y="14" class="lbl" text-anchor="middle">D</text></svg>',
    sm_mo: '<svg class="fig" viewBox="0 0 210 140"><polygon points="20,120 189.9,120 73.2,20" class="fnone sstrong"/><line x1="73.2" y1="20" x2="95.5" y2="120" class="sstrong"/><path d="M67.1,31.5 A13,13 0 0 0 76,32.7" class="fnone smuted thin"/><path d="M178.5,110.2 A15,15 0 0 0 174.9,120" class="fnone smuted thin"/><circle cx="20" cy="120" r="2.2" class="fstrong"/><circle cx="189.9" cy="120" r="2.2" class="fstrong"/><circle cx="73.2" cy="20" r="2.2" class="fstrong"/><circle cx="95.5" cy="120" r="2.2" class="fstrong"/><text x="11" y="131" class="lbl" text-anchor="middle">A</text><text x="198.9" y="131" class="lbl" text-anchor="middle">B</text><text x="71" y="14.2" class="lbl" text-anchor="middle">C</text><text x="95.5" y="138" class="lbl" text-anchor="middle">D</text></svg>',
    sm_mo_q: '<svg class="fig" viewBox="0 0 210 120"><polygon points="20,99.9 190,99.9 49.1,20" class="fnone sstrong"/><line x1="49.1" y1="20" x2="62.5" y2="99.9" class="sstrong"/><path d="M44.6,32.2 A13,13 0 0 0 51.2,32.8" class="fnone smuted thin"/><path d="M177,92.5 A15,15 0 0 0 175,99.9" class="fnone smuted thin"/><circle cx="20" cy="99.9" r="2.2" class="fstrong"/><circle cx="190" cy="99.9" r="2.2" class="fstrong"/><circle cx="49.1" cy="20" r="2.2" class="fstrong"/><circle cx="62.5" cy="99.9" r="2.2" class="fstrong"/><text x="11" y="110.9" class="lbl" text-anchor="middle">A</text><text x="199" y="110.9" class="lbl" text-anchor="middle">B</text><text x="46" y="14.4" class="lbl" text-anchor="middle">C</text><text x="62.5" y="117.9" class="lbl" text-anchor="middle">D</text></svg>',
    sm_pr: '<svg class="fig" viewBox="0 0 210 118"><polygon points="20,98.5 190,98.5 72.3,20" class="fnone sstrong"/><line x1="72.3" y1="20" x2="72.3" y2="98.5" class="sstrong"/><polyline points="72.3,92.5 78.3,92.5 78.3,98.5" class="fnone smuted thin"/><polyline points="68.4,25.8 74.2,29.7 78.1,23.9" class="fnone smuted thin"/><circle cx="20" cy="98.5" r="2.2" class="fstrong"/><circle cx="190" cy="98.5" r="2.2" class="fstrong"/><circle cx="72.3" cy="20" r="2.2" class="fstrong"/><circle cx="72.3" cy="98.5" r="2.2" class="fstrong"/><text x="11" y="109.5" class="lbl" text-anchor="middle">A</text><text x="199" y="109.5" class="lbl" text-anchor="middle">B</text><text x="71" y="14.1" class="lbl" text-anchor="middle">C</text><text x="72.3" y="116.5" class="lbl" text-anchor="middle">D</text></svg>',
    sm_pr_q: '<svg class="fig" viewBox="0 0 210 108"><polygon points="20,88 190,88 54,20" class="fnone sstrong"/><line x1="54" y1="20" x2="54" y2="88" class="sstrong"/><polyline points="54,82 60,82 60,88" class="fnone smuted thin"/><polyline points="50.9,26.3 57.1,29.4 60.3,23.1" class="fnone smuted thin"/><circle cx="20" cy="88" r="2.2" class="fstrong"/><circle cx="190" cy="88" r="2.2" class="fstrong"/><circle cx="54" cy="20" r="2.2" class="fstrong"/><circle cx="54" cy="88" r="2.2" class="fstrong"/><text x="11" y="99" class="lbl" text-anchor="middle">A</text><text x="199" y="99" class="lbl" text-anchor="middle">B</text><text x="51.9" y="14.2" class="lbl" text-anchor="middle">C</text><text x="54" y="106" class="lbl" text-anchor="middle">D</text></svg>',
    sm_pr_q2: '<svg class="fig" viewBox="0 0 210 122"><polygon points="20,101.6 190,101.6 81.2,20" class="fnone sstrong"/><line x1="81.2" y1="20" x2="81.2" y2="101.6" class="sstrong"/><polyline points="81.2,95.6 87.2,95.6 87.2,101.6" class="fnone smuted thin"/><polyline points="77,25.6 82.6,29.8 86.8,24.2" class="fnone smuted thin"/><circle cx="20" cy="101.6" r="2.2" class="fstrong"/><circle cx="190" cy="101.6" r="2.2" class="fstrong"/><circle cx="81.2" cy="20" r="2.2" class="fstrong"/><circle cx="81.2" cy="101.6" r="2.2" class="fstrong"/><text x="11" y="112.6" class="lbl" text-anchor="middle">A</text><text x="199" y="112.6" class="lbl" text-anchor="middle">B</text><text x="80.3" y="14" class="lbl" text-anchor="middle">C</text><text x="81.2" y="119.6" class="lbl" text-anchor="middle">D</text></svg>',
    ta_angbis: '<svg class="fig" viewBox="0 0 200 130"><line x1="30" y1="110" x2="137.3" y2="20" class="sstrong"/><line x1="30" y1="110" x2="170" y2="110" class="sstrong"/><line x1="30" y1="110" x2="165.3" y2="60.7" class="smuted dash"/><line x1="116.5" y1="78.5" x2="80.6" y2="67.6" class="sstrong"/><line x1="116.5" y1="78.5" x2="96" y2="110" class="sstrong"/><circle cx="30" cy="110" r="2.2" class="fstrong"/><circle cx="137.3" cy="20" r="2.2" class="fstrong"/><circle cx="170" cy="110" r="2.2" class="fstrong"/><circle cx="116.5" cy="78.5" r="2.2" class="fstrong"/><circle cx="80.6" cy="67.6" r="2.2" class="fstrong"/><circle cx="96" cy="110" r="2.2" class="fstrong"/><text x="20" y="117" class="lbl" text-anchor="middle">O</text><text x="141.3" y="19" class="lbl" text-anchor="middle">A</text><text x="176" y="119" class="lbl" text-anchor="middle">B</text><text x="125.5" y="80.5" class="lbl" text-anchor="middle">P</text><text x="70" y="69.4" class="lbl" text-anchor="middle">M</text><text x="90" y="124.2" class="lbl" text-anchor="middle">N</text></svg>',
    ta_bis: '<svg class="fig" viewBox="0 0 210 150"><polygon points="141.5,20 58,130 151.6,130" class="fnone sstrong"/><line x1="141.5" y1="20" x2="110" y2="130" class="sstrong"/><text x="92.6" y="73.6" text-anchor="middle" style="font-size:12px">10</text><text x="155.5" y="78.2" text-anchor="middle" style="font-size:12px">8</text><circle cx="141.5" cy="20" r="2.2" class="fstrong"/><circle cx="58" cy="130" r="2.2" class="fstrong"/><circle cx="151.6" cy="130" r="2.2" class="fstrong"/><circle cx="110" cy="130" r="2.2" class="fstrong"/><text x="144.5" y="14.4" class="lbl" text-anchor="middle">A</text><text x="48.1" y="139.9" class="lbl" text-anchor="middle">B</text><text x="159.7" y="142.4" class="lbl" text-anchor="middle">C</text><text x="107" y="145.6" class="lbl" text-anchor="middle">D</text></svg>',
    ta_bis_q: '<svg class="fig" viewBox="0 0 210 150"><polygon points="146.2,20 46.5,130 163.4,130" class="fnone sstrong"/><line x1="146.2" y1="20" x2="113.3" y2="130" class="sstrong"/><line x1="113.3" y1="130" x2="76.6" y2="96.8" class="sstrong"/><polyline points="81.8,101.5 86.5,96.3 81.3,91.6" class="fnone smuted thin"/><text x="89.7" y="73" text-anchor="middle" style="font-size:12px">12</text><text x="163.7" y="77.6" text-anchor="middle" style="font-size:12px">9</text><circle cx="146.2" cy="20" r="2.2" class="fstrong"/><circle cx="46.5" cy="130" r="2.2" class="fstrong"/><circle cx="163.4" cy="130" r="2.2" class="fstrong"/><circle cx="113.3" cy="130" r="2.2" class="fstrong"/><circle cx="76.6" cy="96.8" r="2.2" class="fstrong"/><text x="149.3" y="14.5" class="lbl" text-anchor="middle">A</text><text x="36.4" y="139.5" class="lbl" text-anchor="middle">B</text><text x="171.7" y="142.2" class="lbl" text-anchor="middle">C</text><text x="116.2" y="145.6" class="lbl" text-anchor="middle">D</text><text x="68.5" y="94.4" class="lbl" text-anchor="middle">E</text></svg>',
    ta_c2b: '<svg class="fig" viewBox="0 0 210 121"><polygon points="150.3,20 20,101.4 190,101.4" class="fnone sstrong"/><line x1="150.3" y1="20" x2="126.9" y2="101.4" class="sstrong"/><circle cx="150.3" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="101.4" r="2.2" class="fstrong"/><circle cx="190" cy="101.4" r="2.2" class="fstrong"/><circle cx="126.9" cy="101.4" r="2.2" class="fstrong"/><text x="153.3" y="14.4" class="lbl" text-anchor="middle">A</text><text x="9.4" y="109.4" class="lbl" text-anchor="middle">B</text><text x="199.3" y="112.2" class="lbl" text-anchor="middle">C</text><text x="123.9" y="117" class="lbl" text-anchor="middle">D</text></svg>',
    ta_c2b_aux: '<svg class="fig" viewBox="0 0 210 121"><polygon points="150.3,20 20,101.4 190,101.4" class="fnone sstrong"/><line x1="150.3" y1="20" x2="126.9" y2="101.4" class="sstrong"/><line x1="126.9" y1="101.4" x2="73.5" y2="68" class="sstrong dash"/><circle cx="150.3" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="101.4" r="2.2" class="fstrong"/><circle cx="190" cy="101.4" r="2.2" class="fstrong"/><circle cx="126.9" cy="101.4" r="2.2" class="fstrong"/><circle cx="73.5" cy="68" r="2.2" class="fstrong"/><text x="153.3" y="14.4" class="lbl" text-anchor="middle">A</text><text x="9.4" y="109.4" class="lbl" text-anchor="middle">B</text><text x="199.3" y="112.2" class="lbl" text-anchor="middle">C</text><text x="130.9" y="116.7" class="lbl" text-anchor="middle">D</text><text x="64.1" y="67.2" class="lbl" text-anchor="middle">E</text></svg>',
    ta_ex2: '<svg class="fig" viewBox="0 0 210 139"><polygon points="147.5,20 20,119.2 190,119.2" class="fnone sstrong"/><line x1="147.5" y1="20" x2="105" y2="119.2" class="sstrong"/><line x1="20" y1="119.2" x2="166.6" y2="64.6" class="sstrong"/><circle cx="147.5" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="119.2" r="2.2" class="fstrong"/><circle cx="190" cy="119.2" r="2.2" class="fstrong"/><circle cx="105" cy="119.2" r="2.2" class="fstrong"/><circle cx="166.6" cy="64.6" r="2.2" class="fstrong"/><circle cx="121.1" cy="81.6" r="2.2" class="fstrong"/><text x="150.9" y="14.5" class="lbl" text-anchor="middle">A</text><text x="9.6" y="127.8" class="lbl" text-anchor="middle">B</text><text x="199.2" y="130.2" class="lbl" text-anchor="middle">C</text><text x="100.7" y="134.3" class="lbl" text-anchor="middle">D</text><text x="176.6" y="67.6" class="lbl" text-anchor="middle">E</text><text x="111.1" y="88.6" class="lbl" text-anchor="middle">F</text></svg>',
    ta_iso: '<svg class="fig" viewBox="0 0 220 116"><polygon points="110,20 20,95.5 200,95.5" class="fnone sstrong"/><line x1="20" y1="95.5" x2="145.5" y2="49.8" class="sstrong"/><circle cx="110" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="95.5" r="2.2" class="fstrong"/><circle cx="200" cy="95.5" r="2.2" class="fstrong"/><circle cx="145.5" cy="49.8" r="2.2" class="fstrong"/><text x="110" y="14" class="lbl" text-anchor="middle">A</text><text x="9.7" y="104.3" class="lbl" text-anchor="middle">B</text><text x="210.3" y="104.3" class="lbl" text-anchor="middle">C</text><text x="155.9" y="51.1" class="lbl" text-anchor="middle">D</text></svg>',
    ta_iso_e: '<svg class="fig" viewBox="0 0 220 116"><polygon points="110,20 20,95.5 200,95.5" class="fnone sstrong"/><line x1="20" y1="95.5" x2="145.5" y2="49.8" class="sstrong"/><line x1="145.5" y1="49.8" x2="153.6" y2="95.5" class="sstrong"/><circle cx="110" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="95.5" r="2.2" class="fstrong"/><circle cx="200" cy="95.5" r="2.2" class="fstrong"/><circle cx="145.5" cy="49.8" r="2.2" class="fstrong"/><circle cx="153.6" cy="95.5" r="2.2" class="fstrong"/><text x="110" y="14" class="lbl" text-anchor="middle">A</text><text x="9.7" y="104.3" class="lbl" text-anchor="middle">B</text><text x="210.3" y="104.3" class="lbl" text-anchor="middle">C</text><text x="151" y="45.3" class="lbl" text-anchor="middle">D</text><text x="155.5" y="111.4" class="lbl" text-anchor="middle">E</text></svg>',
    ta_med: '<svg class="fig" viewBox="0 0 200 107"><polygon points="135.6,20 20,86.5 180,86.5" class="fnone sstrong"/><line x1="135.6" y1="20" x2="100" y2="86.5" class="sstrong"/><text x="73.3" y="49.5" text-anchor="middle" style="font-size:12px">5</text><text x="165.3" y="52.3" text-anchor="middle" style="font-size:12px">3</text><circle cx="20" cy="86.5" r="2.2" class="fstrong"/><circle cx="180" cy="86.5" r="2.2" class="fstrong"/><circle cx="135.6" cy="20" r="2.2" class="fstrong"/><circle cx="100" cy="86.5" r="2.2" class="fstrong"/><text x="9.4" y="94.4" class="lbl" text-anchor="middle">B</text><text x="189.7" y="96.7" class="lbl" text-anchor="middle">C</text><text x="139.2" y="14.6" class="lbl" text-anchor="middle">A</text><text x="94.8" y="101.2" class="lbl" text-anchor="middle">D</text></svg>',
    ta_med_aux: '<svg class="fig" viewBox="0 0 200 170"><polygon points="134.9,20 22,85 178.3,85" class="fnone sstrong"/><line x1="134.9" y1="20" x2="100.2" y2="85" class="sstrong"/><line x1="100.2" y1="85" x2="65.4" y2="150" class="sstrong dash"/><line x1="22" y1="85" x2="65.4" y2="150" class="sstrong dash"/><text x="74" y="48.7" text-anchor="middle" style="font-size:12px">5</text><text x="164.1" y="51.5" text-anchor="middle" style="font-size:12px">3</text><circle cx="22" cy="85" r="2.2" class="fstrong"/><circle cx="178.3" cy="85" r="2.2" class="fstrong"/><circle cx="134.9" cy="20" r="2.2" class="fstrong"/><circle cx="100.2" cy="85" r="2.2" class="fstrong"/><circle cx="65.4" cy="150" r="2.2" class="fstrong"/><text x="11.1" y="88.5" class="lbl" text-anchor="middle">B</text><text x="188" y="95.2" class="lbl" text-anchor="middle">C</text><text x="138.6" y="14.6" class="lbl" text-anchor="middle">A</text><text x="109.2" y="100" class="lbl" text-anchor="middle">D</text><text x="66" y="166" class="lbl" text-anchor="middle">E</text></svg>',
    ta_med_q1: '<svg class="fig" viewBox="0 0 200 170"><polygon points="134.9,20 22,85 178.3,85" class="fnone sstrong"/><line x1="134.9" y1="20" x2="100.2" y2="85" class="sstrong"/><line x1="100.2" y1="85" x2="65.4" y2="150" class="sstrong dash"/><line x1="22" y1="85" x2="65.4" y2="150" class="sstrong dash"/><circle cx="22" cy="85" r="2.2" class="fstrong"/><circle cx="178.3" cy="85" r="2.2" class="fstrong"/><circle cx="134.9" cy="20" r="2.2" class="fstrong"/><circle cx="100.2" cy="85" r="2.2" class="fstrong"/><circle cx="65.4" cy="150" r="2.2" class="fstrong"/><text x="11.1" y="88.5" class="lbl" text-anchor="middle">B</text><text x="188" y="95.2" class="lbl" text-anchor="middle">C</text><text x="138.6" y="14.6" class="lbl" text-anchor="middle">A</text><text x="109.2" y="100" class="lbl" text-anchor="middle">D</text><text x="66" y="166" class="lbl" text-anchor="middle">E</text></svg>',
    ta_med_q2: '<svg class="fig" viewBox="0 0 200 118"><polygon points="132.7,20 20,98.2 180,98.2" class="fnone sstrong"/><line x1="132.7" y1="20" x2="100" y2="98.2" class="sstrong"/><text x="71.2" y="55.7" text-anchor="middle" style="font-size:12px">6</text><text x="164" y="58.4" text-anchor="middle" style="font-size:12px">4</text><circle cx="20" cy="98.2" r="2.2" class="fstrong"/><circle cx="180" cy="98.2" r="2.2" class="fstrong"/><circle cx="132.7" cy="20" r="2.2" class="fstrong"/><circle cx="100" cy="98.2" r="2.2" class="fstrong"/><text x="9.5" y="106.5" class="lbl" text-anchor="middle">B</text><text x="189.6" y="108.6" class="lbl" text-anchor="middle">C</text><text x="135.7" y="14.4" class="lbl" text-anchor="middle">A</text><text x="95.8" y="113.4" class="lbl" text-anchor="middle">D</text></svg>',
    ta_med_r: '<svg class="fig" viewBox="0 0 180 72"><polygon points="111.5,20 20,52.3 160,52.3" class="fnone sstrong"/><line x1="111.5" y1="20" x2="90" y2="52.3" class="sstrong"/><text x="62.8" y="31.7" text-anchor="middle" style="font-size:12px">10</text><text x="140.8" y="32.7" text-anchor="middle" style="font-size:12px">6</text><text x="107.4" y="44.6" text-anchor="middle" style="font-size:12px">4</text><circle cx="111.5" cy="20" r="2.2" class="fstrong"/><circle cx="20" cy="52.3" r="2.2" class="fstrong"/><circle cx="160" cy="52.3" r="2.2" class="fstrong"/><circle cx="90" cy="52.3" r="2.2" class="fstrong"/><text x="115.5" y="14.7" class="lbl" text-anchor="middle">A</text><text x="9.2" y="59.2" class="lbl" text-anchor="middle">B</text><text x="170.5" y="60.5" class="lbl" text-anchor="middle">C</text><text x="83.9" y="66.5" class="lbl" text-anchor="middle">D</text></svg>',
    ta_trap: '<svg class="fig" viewBox="0 0 210 150"><polygon points="52.5,20 103,20 158,130 85.5,130" class="fnone sstrong"/><line x1="103" y1="20" x2="69" y2="75" class="sstrong"/><line x1="69" y1="75" x2="158" y2="130" class="sstrong"/><circle cx="52.5" cy="20" r="2.2" class="fstrong"/><circle cx="103" cy="20" r="2.2" class="fstrong"/><circle cx="158" cy="130" r="2.2" class="fstrong"/><circle cx="85.5" cy="130" r="2.2" class="fstrong"/><circle cx="69" cy="75" r="2.2" class="fstrong"/><text x="43.7" y="18.4" class="lbl" text-anchor="middle">A</text><text x="108.8" y="15.6" class="lbl" text-anchor="middle">B</text><text x="167.3" y="140.8" class="lbl" text-anchor="middle">C</text><text x="78.9" y="143.8" class="lbl" text-anchor="middle">D</text><text x="58.3" y="82.5" class="lbl" text-anchor="middle">E</text></svg>',
  };
  window.LESSONS = Object.assign(window.LESSONS || {}, {
    // ───────────────────────── 三角形辅助线 ─────────────────────────
    c_tri_aux: {
      goal: '会用倍长中线、截长补短、沿角平分线翻折（或作垂线）添加辅助线，把分散的边和角集中到一对全等三角形里，解决线段和差的证明、中线的取值范围等问题。',
      fj: '多以证明题出现：“求证 AB = AC + CD”这类线段和差关系常用截长补短；条件里有中线或中点时常用倍长中线，也常以“求中线的取值范围”的填空题出现。常见变式：倍长过中点的线段（类中线）、角平分线加垂线求面积、和等腰三角形结合求角度。',
      sections: [
        {
          h: '中线有多长？倍长中线',
          html: `<p>△ABC 中，AB = 5，AC = 3，BC 边上的中线 AD 可能是多长？AB、AC、AD 三条线段不在同一个三角形里，三边关系用不上——条件太<b>分散</b>了。</p>
<p>办法：<b>延长 AD 到 E，使 DE = AD，连接 BE。</b>因为 BD = CD、∠BDE = ∠CDA（对顶角）、DE = DA，所以 △BDE ≌ △CDA（SAS），BE = AC。这样 AB、AC（变成了 BE）、2AD 就进了同一个 △ABE。</p>
<p class="formula">倍长中线 ⟹ 全等（SAS）⟹ |AB − AC| &lt; 2AD &lt; AB + AC</p>
<p>其实这就是把 △ADC 绕中点 D <b>旋转 180°</b>。</p>
<p class="try">动手试试：先点①把中线延长一倍，再点②看 △ADC 怎样转到 △EDB 的位置。拖动顶点换一个三角形，范围会跟着变。</p>`,
          anim: 'c_tri_aux_double'
        },
        {
          h: '截长补短：证明“一条 = 两条之和”',
          html: `<p>要证 AB = AC + CD 这样的式子，三条线段东一条西一条，没法直接比。有两种思路把它们“接”起来：</p>
<p><b>截长</b>：在长线段 AB 上截取 AE = AC，再证剩下的 EB = CD。<br><b>补短</b>：把短线段 AC 延长到 F，使 CF = CD，再证 AF = AB。</p>
<p class="formula">证 a = b + c：在 a 上截出 b（截长），或把 b 补上 c（补短），再证全等</p>
<p>动画里的条件是：∠C = 2∠B，AD 平分 ∠BAC。截取或补出的那一段，正好让一对三角形关于角平分线 AD 对称。</p>
<p class="try">动手试试：分别点“截长”和“补短”，看 △ACD（或 △ABD）沿 AD 翻折后落在哪里。拖动滑块改变 ∠B，等式始终成立。</p>`,
          anim: 'c_tri_aux_cut'
        },
        {
          h: '角平分线：沿着它翻折',
          html: `<p>角平分线是这个角的<b>对称轴</b>，所以有角平分线时常用两种辅助线：</p>
<p>① <b>在角的两边截取相等的线段</b>：在 OA、OB 上取 OM = ON，点 P 在角平分线上，则 △POM ≌ △PON（SAS）。上面“截长”里的 AE = AC 就是这样做的。</p>
<p>② <b>从角平分线上的点向两边作垂线</b>：角平分线上的点到角两边的距离相等。求面积时特别好用：</p>
<p class="formula">AD 平分 ∠BAC，D 到 AB 的距离为 <i>h</i> ⟹ S<sub>△ABC</sub> = ${fr(1, 2)}<i>h</i>(AB + AC)</p>`
        },
        {
          h: '方法归纳：看条件选辅助线',
          html: `<table class="mini"><tr><th>条件或结论</th><th>常用辅助线</th></tr>
<tr><td>有中线、中点</td><td>倍长中线（或倍长过中点的线段）</td></tr>
<tr><td>证线段的和、差</td><td>截长补短</td></tr>
<tr><td>有角平分线</td><td>两边截取相等线段（翻折），或向两边作垂线</td></tr></table>
<p>共同的想法是：<b>把分散的条件集中到一对全等三角形里</b>。添辅助线时要在证明开头写清作法，例如“延长 AD 到 E，使 DE = AD，连接 BE”。</p>`
        }
      ],
      pitfalls: [
        '倍长中线后要<b>先证全等</b>（SAS，用到对顶角相等）才能得 BE = AC，不能直接写“BE = AC”。',
        '用三边关系求出的是 2AD 的范围，最后别忘了<b>除以 2</b>；三边关系是严格的“&lt;”，不能写“≤”。',
        '截长时要写清在哪条线段上截取哪一段（如“在 AB 上截取 AE = AC”），并且截出的点要在线段上；辅助线的作法必须写在证明里。'
      ],
      examples: [
        {
          q: '△ABC 中，AB = 5，AC = 3，AD 是 BC 边上的中线。求 AD 的取值范围。' + FIG.ta_med,
          steps: [
            '思路：AB、AC、AD 不在同一个三角形里。条件有中线，想到<b>倍长中线</b>，把 AC “搬”到 AB 旁边。',
            '延长 AD 到 E，使 DE = AD，连接 BE。∵ BD = CD，∠BDE = ∠CDA（对顶角相等），DE = DA，∴ △BDE ≌ △CDA（SAS），∴ BE = AC = 3。' + FIG.ta_med_aux,
            '在 △ABE 中，AB − BE &lt; AE &lt; AB + BE，即 5 − 3 &lt; 2AD &lt; 5 + 3，∴ 2 &lt; 2AD &lt; 8。',
            '∴ 1 &lt; AD &lt; 4。'
          ],
          ans: '1 &lt; AD &lt; 4'
        },
        {
          q: '△ABC 中，AD 是 BC 边上的中线，E 是 AC 上一点，BE 交 AD 于点 F，且 AE = EF。求证：AC = BF。' + FIG.ta_ex2,
          steps: [
            '思路：要证的 AC、BF 离得很远。AD 是中线，倍长它，把 AC 搬到点 B 附近，再找等角。',
            '证明：延长 AD 到 G，使 DG = AD，连接 BG。∵ AD 是中线，∴ BD = CD。又 ∠BDG = ∠CDA（对顶角相等），DG = DA，∴ △BDG ≌ △CDA（SAS），∴ BG = AC，∠G = ∠CAD。',
            '∵ AE = EF，∴ ∠EAF = ∠EFA（等边对等角）。又 ∠EFA = ∠BFG（对顶角相等），∴ ∠G = ∠CAD = ∠EFA = ∠BFG。',
            '∴ BF = BG（等角对等边），∴ AC = BF。'
          ],
          ans: '证明见上（倍长中线 → 全等 → 等角对等边）'
        },
        {
          q: '△ABC 中，∠C = 2∠B，AD 平分 ∠BAC 交 BC 于点 D。求证：AB = AC + CD。' + FIG.ta_c2b,
          steps: [
            '思路：要证“一条 = 两条之和”，在长的 AB 上截取一段等于 AC，再证剩下的一段等于 CD（截长）。',
            '证明：∵ ∠C &gt; ∠B，∴ AB &gt; AC。在 AB 上截取 AE = AC，连接 DE。∵ AD 平分 ∠BAC，∴ ∠EAD = ∠CAD。又 AE = AC，AD = AD，∴ △AED ≌ △ACD（SAS），∴ ED = CD，∠AED = ∠C。' + FIG.ta_c2b_aux,
            '∵ ∠AED = ∠B + ∠EDB（三角形的外角等于与它不相邻的两个内角的和），∠C = 2∠B，∴ ∠B + ∠EDB = 2∠B，∴ ∠EDB = ∠B，∴ EB = ED（等角对等边）。',
            '∴ EB = CD，AB = AE + EB = AC + CD。'
          ],
          ans: '证明见上（截长法）'
        },
        {
          q: '四边形 ABCD 中，AB∥CD，点 E 在边 AD 上，BE 平分 ∠ABC，CE 平分 ∠BCD。求证：BC = AB + CD。' + FIG.ta_trap,
          steps: [
            '思路：BC 最长，在 BC 上截取 BF = BA，再证 FC = CD。两条角平分线各用一次“翻折”。',
            '证明：在 BC 上截取 BF = BA，连接 EF。∵ BE 平分 ∠ABC，∴ ∠ABE = ∠FBE。又 BE = BE，∴ △ABE ≌ △FBE（SAS），∴ ∠A = ∠BFE。',
            '∵ AB∥CD，∴ ∠A + ∠D = 180°（两直线平行，同旁内角互补）。又 ∠BFE + ∠CFE = 180°，∴ ∠CFE = ∠D。',
            '∵ CE 平分 ∠BCD，∴ ∠FCE = ∠DCE。又 CE = CE，∴ △FCE ≌ △DCE（AAS），∴ FC = DC。∴ BC = BF + FC = AB + CD。'
          ],
          ans: '证明见上（截长法，两次翻折）'
        },
        {
          q: '△ABC 中，AD 平分 ∠BAC 交 BC 于点 D，AB = 10，AC = 8，△ABC 的面积是 27。求点 D 到 AB 的距离。' + FIG.ta_bis,
          steps: [
            '思路：有角平分线，从 D 向角的两边作垂线。作 DE ⊥ AB 于 E，DF ⊥ AC 于 F，则 DE = DF（角平分线上的点到角两边的距离相等）。',
            `S<sub>△ABC</sub> = S<sub>△ABD</sub> + S<sub>△ACD</sub> = ${fr(1, 2)} × AB × DE + ${fr(1, 2)} × AC × DF = ${fr(1, 2)} × DE × (10 + 8) = 9DE。`,
            '9DE = 27，DE = 3。'
          ],
          ans: '点 D 到 AB 的距离是 3'
        },
        {
          q: '（挑战）△ABC 中，AB = AC，∠A = 100°，BD 平分 ∠ABC 交 AC 于点 D。求证：BC = BD + AD。' + FIG.ta_iso,
          steps: [
            '思路：BC 最长，用截长法：在 BC 上截取 BE = BD，只要证 EC = AD。AD 不好直接搬，再沿角平分线 BD 把 △ABD 翻折到 BC 上。',
            '∠ABC = ∠C = 40°，∠DBC = 20°。在 BC 上截取 BE = BD，连接 DE，则 ∠BED = ∠BDE = (180° − 20°) ÷ 2 = 80°，∠EDC = ∠BED − ∠C = 40° = ∠C，∴ EC = ED。',
            '再在 BC 上截取 BF = BA（∵ ∠A 是 △ABD 的最大角，BD &gt; BA，∴ F 在 B、E 之间），连接 DF。∵ ∠ABD = ∠FBD，BD = BD，∴ △ABD ≌ △FBD（SAS），∴ DF = AD，∠BFD = ∠A = 100°，∴ ∠DFE = 80° = ∠DEF，∴ DF = DE。',
            '∴ EC = DE = DF = AD，BC = BE + EC = BD + AD。'
          ],
          ans: '证明见上（两次截长）'
        }
      ],
      quiz: [
        { type: 'choice', q: '△ABC 中，AD 是中线，延长 AD 到 E，使 DE = AD，连接 BE。证明 △ADC ≌ △EDB 的依据是（　）。' + FIG.ta_med_q1, opts: ['ASA', 'SSS', 'HL', 'SAS'], ans: 3, why: 'AD = ED（作法），∠ADC = ∠EDB（对顶角相等），CD = BD（中线），两边及夹角对应相等，是 SAS。' },
        { type: 'choice', q: '△ABC 中，AB = 6，AC = 4，AD 是 BC 边上的中线，则 AD 的取值范围是（　）。' + FIG.ta_med_q2, opts: ['2 &lt; AD &lt; 10', '1 &lt; AD &lt; 10', '1 &lt; AD &lt; 5', '2 &lt; AD &lt; 5'], ans: 2, why: '倍长中线得 BE = AC = 4，在 △ABE 中 6 − 4 &lt; 2AD &lt; 6 + 4，即 2 &lt; 2AD &lt; 10，所以 1 &lt; AD &lt; 5。选 2 &lt; AD &lt; 10 是忘了除以 2。' },
        { type: 'fill', q: '△ABC 中，AB = 9，AC = 5，AD 是 BC 边上的中线。若 AD 的长是整数，则 AD 最大是______。', ans: ['6'], why: '倍长中线：9 − 5 &lt; 2AD &lt; 9 + 5，即 2 &lt; AD &lt; 7。AD 是整数，最大是 6（取不到 7）。' },
        { type: 'fill', q: '△ABC 中，AD 是 BC 边上的中线，AB = 10，AC = 6，AD = 4。△ABC 的面积是______。', ans: ['24'], why: '延长 AD 到 E 使 DE = AD，得 △EDB ≌ △ADC，BE = AC = 6，AE = 8。6² + 8² = 10²，所以 ∠E = 90°，于是 ∠DAC = ∠E = 90°。S<sub>△ADC</sub> = ½ × 4 × 6 = 12，中线把面积平分，S<sub>△ABC</sub> = 24。' + FIG.ta_med_r },
        { type: 'choice', q: '“截长补短”最适合用来证明哪一类结论？（　）', opts: ['两条直线平行', '两个角互余', '三点共线', '一条线段等于另外两条线段的和（或差）'], ans: 3, why: '截长：在长线段上截出一段等于其中一条短线段；补短：把短线段延长一段。都是为了证“和、差”关系。' },
        { type: 'fill', q: '△ABC 中，∠C = 2∠B，AD 平分 ∠BAC 交 BC 于点 D，AC = 5，CD = 3，则 AB = ______。' + FIG.ta_c2b, ans: ['8'], why: '在 AB 上截取 AE = AC，可证 △AED ≌ △ACD，再得 EB = ED = CD，所以 AB = AC + CD = 5 + 3 = 8。' },
        { type: 'fill', q: '△ABC 中，∠C = 2∠B，AD 平分 ∠BAC 交 BC 于点 D，AB = 10，AC = 6，则 CD = ______。' + FIG.ta_c2b, ans: ['4'], why: '由截长补短得 AB = AC + CD，所以 CD = 10 − 6 = 4。' },
        { type: 'fill', q: '四边形 ABCD 中，AB∥CD，点 E 在边 AD 上，BE 平分 ∠ABC，CE 平分 ∠BCD，AB = 3，CD = 5，则 BC = ______。' + FIG.ta_trap, ans: ['8'], why: '在 BC 上截取 BF = BA，可证 △ABE ≌ △FBE、△FCE ≌ △DCE，所以 BC = AB + CD = 3 + 5 = 8。' },
        { type: 'fill', q: '△ABC 中，AD 平分 ∠BAC 交 BC 于点 D，DE ⊥ AB 于点 E，AB = 12，AC = 9，DE = 4。△ABC 的面积是______。' + FIG.ta_bis_q, ans: ['42'], why: 'D 到 AC 的距离也是 4（角平分线上的点到两边距离相等）。S = ½ × 12 × 4 + ½ × 9 × 4 = 24 + 18 = 42。' },
        { type: 'choice', q: '点 P 在 ∠AOB 的平分线上，点 M、N 分别在 OA、OB 上。再添加下列哪个条件，就能保证 △POM ≌ △PON？（　）' + FIG.ta_angbis, opts: ['OM = ON', 'PM = PN', 'PM ⊥ OA', 'OP = PM'], ans: 0, why: 'OM = ON，∠MOP = ∠NOP，OP 公共，是 SAS。PM = PN 是“边边角”，不能判定全等（N 可能有两个位置）；只知道 PM ⊥ OA 也不够。' },
        { type: 'fill', q: '（挑战）△ABC 中，AB = AC，∠A = 100°，BD 平分 ∠ABC 交 AC 于点 D。在 BC 上截取 BE = BD，连接 DE，则 ∠EDC = ______°。' + FIG.ta_iso_e, ans: ['40'], why: '∠ABC = ∠C = 40°，∠DBE = 20°，BE = BD，所以 ∠BED = (180° − 20°) ÷ 2 = 80°。∠BED 是 △DEC 的外角，∠EDC = 80° − 40° = 40°。' }
      ]
    },

    // ───────────────────────── 几何最值 ─────────────────────────
    c_shortest: {
      goal: '会用轴对称（一次或两次）、平移把折线“拉直”，用“两点之间线段最短”“垂线段最短”“三角形两边之差小于第三边”求线段和的最小值、线段差的最大值。',
      fj: '常以填空、选择的压轴题出现，也常是函数与几何综合题的最后一问。常见变式：角内一点求三角形周长最小（两次对称）；造桥选址（先平移再连线）；“一定两动”求 BM + MN 最小（对称后用垂线段最短）；坐标轴上找点使线段差最大。',
      sections: [
        {
          h: '从将军饮马到“两次饮马”',
          html: `<p>小明家在 P 处，P 在两条马路 OA、OB 夹成的角里。他要先到 OA 边取快递，再到 OB 边扔垃圾，最后回家。怎样走最近？</p>
<p>这是将军饮马的升级版：两个动点 M、N。把 P 分别关于 OA、OB 作对称点 P₁、P₂，则 PM = P₁M，PN = P₂N，</p>
<p class="formula">△PMN 周长 = P₁M + MN + NP₂ ≥ P₁P₂</p>
<p>连接 P₁P₂，与 OA、OB 的交点就是 M、N。而且 OP₁ = OP₂ = OP，∠P₁OP₂ = 2∠AOB，最小值可以在 △P₁OP₂ 里算出来。</p>
<p class="try">动手试试：先拖动 M、N 找最小周长，再点“作两次对称”和“找最小周长”。把 ∠AOB 调到 30°，最小周长恰好等于 OP。</p>`,
          anim: 'c_shortest_angle'
        },
        {
          h: '造桥选址：先平移，再拉直',
          html: `<p>A、B 两村被一条河隔开，要建一座和河岸垂直的桥 MN，使 A → M → N → B 最短。桥长等于河宽，是固定的，只要 AM + NB 最短。</p>
<p>可是 AM、NB 被河隔开，连不成一条线。办法是<b>平移</b>：把 A 沿垂直河岸的方向平移一个河宽到 A′，AMNA′ 是平行四边形，AM = A′N。</p>
<p class="formula">最短路程 = A′B + 河宽（N 是 A′B 与河岸的交点）</p>
<p class="try">动手试试：拖动桥头 M 看总路程，再点“把 A 平移一个河宽”和“找最短路线”。改变河宽，方法不变。</p>`,
          anim: 'c_shortest_bridge'
        },
        {
          h: '一定两动：对称 + 垂线段最短',
          html: `<p>△ABC 中，AD 平分 ∠BAC，M 在 AD 上、N 在 AB 上，求 BM + MN 的最小值。B 是定点，M、N 两个都在动。</p>
<p>角平分线 AD 是对称轴：把 N 关于 AD 对称到 AC 上的 N′，MN = MN′，BM + MN = BM + MN′ ≥ BN′。N′ 还在 AC 上动，BN′ 最短是 B 到 AC 的<b>垂线段</b>。</p>
<p class="formula">BM + MN 的最小值 = 点 B 到直线 AC 的距离</p>
<p>正方形对角线、等腰三角形的对称轴、菱形对角线，都可以这样“借”对称点。</p>`
        },
        {
          h: '差的最大值，以及方法归纳',
          html: `<p>点 P 在直线 <i>l</i> 上，求 |PA − PB| 的最大值：由三角形两边之差小于第三边，|PA − PB| ≤ AB，P 在直线 AB 上时取等号。</p>
<table class="mini"><tr><th>求什么</th><th>A、B 的位置</th><th>做法</th></tr>
<tr><td>PA + PB 最小</td><td>要在 <i>l</i> 的<b>异侧</b></td><td>同侧就先对称一个，再连线</td></tr>
<tr><td>|PA − PB| 最大</td><td>要在 <i>l</i> 的<b>同侧</b></td><td>异侧就先对称一个，再连线并延长</td></tr></table>
<p>总的想法：<b>用对称、平移把几段折线变成一条线段</b>，再用“两点之间线段最短”或“垂线段最短”。</p>`
        }
      ],
      pitfalls: [
        '两次对称的最小周长是 P₁P₂，不是 OP，也不是 2OP。只有 ∠AOB = 30° 时 △P₁OP₂ 是等边三角形，P₁P₂ 才正好等于 OP。',
        '造桥选址的答案要<b>加上河宽</b>；平移的方向是垂直于河岸，距离是河宽，不能把 A 关于河岸作对称。',
        '求“和最小”要让两点在直线<b>异侧</b>再连线；求“差最大”要让两点在<b>同侧</b>再连线。两种情况弄反了就会出错。'
      ],
      examples: [
        {
          q: '∠AOB = 30°，点 P 在 ∠AOB 内部，OP = 10，点 M、N 分别是射线 OA、OB 上的动点。求 △PMN 周长的最小值。' + FIG.sh_30,
          steps: [
            '思路：周长 PM + MN + NP 是三段折线，M、N 都在动。把 P 分别关于 OA、OB 对称，让 PM、PN “翻”过去。',
            '作 P 关于 OA 的对称点 P₁、关于 OB 的对称点 P₂，则 PM = P₁M，PN = P₂N，周长 = P₁M + MN + NP₂ ≥ P₁P₂（两点之间线段最短）。连接 P₁P₂ 分别交 OA、OB 于 M、N 时取等号。',
            '由对称，OP₁ = OP₂ = OP = 10，∠P₁OP₂ = 2∠AOB = 60°，∴ △P₁OP₂ 是等边三角形，P₁P₂ = 10。'
          ],
          ans: '△PMN 周长的最小值是 10'
        },
        {
          q: '一条河的两岸是两条平行直线，河宽 3 千米。村庄 A 在北岸以北，到北岸的距离是 2 千米；村庄 B 在南岸以南，到南岸的距离是 3 千米；A、B 两地沿河岸方向相距 12 千米。要在河上建一座与河岸垂直的桥 MN（M 在北岸，N 在南岸）。从 A 经过桥到 B 的路程 AM + MN + NB 最短是多少千米？' + FIG.sh_river,
          steps: [
            '思路：MN 等于河宽 3，是固定的，只要 AM + NB 最短。AM、NB 被河隔开，先把 A 向南平移 3 千米到 A′，让 AM 平移成 A′N。',
            'AA′ 与 MN 平行且相等，四边形 AMNA′ 是平行四边形，∴ AM = A′N。AM + NB = A′N + NB ≥ A′B，连接 A′B 交南岸于 N 时最短。',
            'A′ 在南岸以北 2 千米处，与 B 在垂直河岸方向相距 2 + 3 = 5 千米，沿河岸方向相距 12 千米，A′B = √(5<sup>2</sup> + 12<sup>2</sup>) = 13 千米。',
            '最短路程 = A′B + MN = 13 + 3 = 16 千米。'
          ],
          ans: '最短路程是 16 千米'
        },
        {
          q: '△ABC 中，∠BAC = 30°，AB = 6，AC = 8，AD 平分 ∠BAC 交 BC 于点 D，点 M、N 分别是线段 AD、AB 上的动点。求 BM + MN 的最小值。' + FIG.sh_tri30,
          steps: [
            '思路：B 是定点，M、N 是两个动点（一定两动）。AD 是 ∠BAC 的对称轴，把 N 关于 AD 对称到 AC 上。',
            '作 N 关于 AD 的对称点 N′，N′ 在 AC 上，MN = MN′，∴ BM + MN = BM + MN′ ≥ BN′（两点之间线段最短）。',
            `N′ 在 AC 上动，BN′ 最短是 B 到 AC 的垂线段 BH（垂线段最短）。在 Rt△ABH 中，∠BAH = 30°，∴ BH = ${fr(1, 2)}AB = 3。`,
            '当 N′ 与 H 重合、M 是 BH 与 AD 的交点时（AH = 3√3 &lt; 8，H 在线段 AC 上），取到最小值 3。'
          ],
          ans: 'BM + MN 的最小值是 3'
        },
        {
          q: '平面直角坐标系中，A(1, 2)，B(4, −6)，点 P 在 <i>x</i> 轴上。求 |PA − PB| 的最大值。' + FIG.sh_c1,
          steps: [
            '思路：求“差的最大值”要让两点在直线<b>同侧</b>。A 在 <i>x</i> 轴上方，B 在下方，先把 B 对称过来。',
            '作 B 关于 <i>x</i> 轴的对称点 B′(4, 6)，则 PB = PB′，|PA − PB| = |PA − PB′| ≤ AB′（三角形两边之差小于第三边，P、A、B′ 共线时取等号）。',
            'AB′ = √((4 − 1)<sup>2</sup> + (6 − 2)<sup>2</sup>) = √(9 + 16) = 5。直线 AB′ 与 <i>x</i> 轴相交于 (−0.5, 0)，所以最大值能取到。'
          ],
          ans: '|PA − PB| 的最大值是 5'
        }
      ],
      quiz: [
        { type: 'fill', q: '平面直角坐标系中，A(1, 1)，B(4, 3)，点 P 在 <i>x</i> 轴上。PA + PB 的最小值是______。' + FIG.sh_c2, ans: ['5'], why: 'A、B 在 <i>x</i> 轴同侧，作 A 关于 <i>x</i> 轴的对称点 A′(1, −1)，PA + PB = PA′ + PB ≥ A′B = √(3² + 4²) = 5。' },
        { type: 'fill', q: '∠AOB = 30°，点 P 在 ∠AOB 内部，OP = 6，点 M、N 分别在射线 OA、OB 上。△PMN 周长的最小值是______。' + FIG.sh_30q, ans: ['6'], why: '作 P 关于 OA、OB 的对称点 P₁、P₂，周长最小值 = P₁P₂。OP₁ = OP₂ = 6，∠P₁OP₂ = 60°，△P₁OP₂ 是等边三角形，P₁P₂ = 6。' },
        { type: 'choice', q: '∠AOB = 45°，点 P 在 ∠AOB 内部，OP = 4，点 M、N 分别在射线 OA、OB 上。△PMN 周长的最小值是（　）。' + FIG.sh_45, opts: ['2√2', '8', '4√2', '4'], ans: 2, why: '∠P₁OP₂ = 2 × 45° = 90°，OP₁ = OP₂ = 4，△P₁OP₂ 是等腰直角三角形，P₁P₂ = √(16 + 16) = 4√2。' },
        { type: 'fill', q: '一条河宽 1 千米，两岸平行。村庄 A 在北岸以北 2 千米，村庄 B 在南岸以南 4 千米，A、B 沿河岸方向相距 8 千米。在河上建一座与河岸垂直的桥，从 A 过桥到 B 的最短路程是______千米。' + FIG.sh_river_q, ans: ['11'], why: '把 A 向南平移 1 千米（河宽）到 A′，A′ 与 B 在垂直河岸方向相距 2 + 4 = 6，沿河岸方向相距 8，A′B = 10。最短路程 = 10 + 1 = 11（千米）。' },
        { type: 'choice', q: '造桥选址时，把 A 沿垂直河岸的方向平移一个河宽得到 A′，这样做的依据是（　）。', opts: ['四边形 AMNA′ 是平行四边形，所以 AM = A′N', 'A′ 是 A 关于北岸的对称点，所以 AM = A′M', 'AM 与 NB 平行，所以 AM = NB', '桥越短路越近，所以要让 MN 最短'], ans: 0, why: 'AA′ 与 MN 都垂直河岸且长度都等于河宽，平行且相等，AMNA′ 是平行四边形，AM = A′N。这样 AM + NB 变成 A′N + NB，能连成一条线。桥长是固定的河宽，不能变短。' },
        { type: 'fill', q: '△ABC 中，AB = AC = 10，BC = 12，AD 是 BC 边上的中线，点 M、N 分别是线段 AD、AB 上的动点。BM + MN 的最小值是______。' + FIG.sh_iso, ans: ['9.6', '48/5'], why: 'AD 是等腰三角形的对称轴，把 N 对称到 AC 上的 N′，最小值 = B 到 AC 的距离。AD = √(100 − 36) = 8，S<sub>△ABC</sub> = ½ × 12 × 8 = 48，B 到 AC 的距离 = 2 × 48 ÷ 10 = 9.6。' },
        { type: 'fill', q: '正方形 ABCD 的边长是 8，点 M 在边 DC 上，DM = 2，N 是对角线 AC 上的动点。DN + MN 的最小值是______。' + FIG.sh_sq, ans: ['10'], why: 'B、D 关于 AC 对称，DN = BN，DN + MN = BN + MN ≥ BM。CM = 8 − 2 = 6，BM = √(8² + 6²) = 10。' },
        { type: 'choice', q: '等边三角形 ABC 的边长是 6，AD 是 BC 边上的高，E 是 AC 的中点，P 是 AD 上的动点。PE + PC 的最小值是（　）。' + FIG.sh_eq, opts: ['3', '6', '3√2', '3√3'], ans: 3, why: 'B、C 关于 AD 对称，PC = PB，PE + PC = PE + PB ≥ BE。BE 是等边三角形的中线也是高，BE = √(6² − 3²) = 3√3。' },
        { type: 'fill', q: '平面直角坐标系中，A(0, 3)，B(4, 6)，点 P 在 <i>x</i> 轴上。|PA − PB| 的最大值是______。' + FIG.sh_c3, ans: ['5'], why: 'A、B 在 <i>x</i> 轴同侧，|PA − PB| ≤ AB = √(4² + 3²) = 5，当 P 是直线 AB 与 <i>x</i> 轴的交点 (−4, 0) 时取等号。' },
        { type: 'choice', q: '点 A、B 在直线 <i>l</i> 的两侧，要在 <i>l</i> 上找一点 P，使 |PA − PB| 最大。正确的做法是（　）。', opts: ['连接 AB，AB 与 <i>l</i> 的交点就是 P', '作 B 关于 <i>l</i> 的对称点 B′，直线 AB′ 与 <i>l</i> 的交点就是 P', '作 AB 的垂直平分线，它与 <i>l</i> 的交点就是 P', '过 A 作 <i>l</i> 的垂线，垂足就是 P'], ans: 1, why: '求差的最大值要两点在同侧：B 对称到 B′ 后 PB = PB′，|PA − PB′| ≤ AB′。AB 与 <i>l</i> 的交点使 PA + PB 最小；垂直平分线上的点使 PA − PB = 0，是最小。' },
        { type: 'fill', q: '（挑战）∠AOB = 40°，点 P 在 ∠AOB 内部，M、N 分别是射线 OA、OB 上的动点。当 △PMN 的周长最小时，∠MPN = ______°。' + FIG.sh_40, ans: ['100'], why: '周长最小时 M、N 在 P₁P₂ 上。△P₁OP₂ 中 OP₁ = OP₂，∠P₁OP₂ = 80°，底角 50°。由对称 ∠OPM = ∠OP₁M = 50°，∠OPN = ∠OP₂N = 50°，所以 ∠MPN = 100°（一般地，∠MPN = 180° − 2∠AOB）。' }
      ]
    },

    // ───────────────────────── 勾股定理综合 ─────────────────────────
    c_pyth_adv: {
      goal: '会把长方体、圆柱表面上的最短路径转化为展开图上的线段，会在折叠和实际问题中设未知数、用勾股定理列方程求线段长。',
      fj: '常以选择、填空题出现：长方体或圆柱表面的最短路径（长方体要比较几种展开方式）、长方形或直角三角形纸片折叠求线段长；在解答题中常作为一步工具，用“两次勾股、列方程”求高或求边。',
      sections: [
        {
          h: '蚂蚁怎么爬最近？长方体的三种展开',
          html: `<p>一只蚂蚁从长方体的顶点 A 沿<b>表面</b>爬到相对的顶点 G。它一定要经过两个相邻的面。把这两个面展开摊平，路线就变成一个长方形的对角线——两点之间线段最短。</p>
<p>经过的两个面有三种选法，展开后长方形的两边分别是“长 + 宽 与 高”“长 与 宽 + 高”“长 + 高 与 宽”。三种都要算，取最小的。规律是：</p>
<p class="formula">最短路程 = √(最长棱<sup>2</sup> + (另两条棱之和)<sup>2</sup>)</p>
<p>原因：(<i>a</i> + <i>b</i>)<sup>2</sup> + <i>c</i><sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> + <i>c</i><sup>2</sup> + 2<i>ab</i>，三种方式只差在 2<i>ab</i>、2<i>bc</i>、2<i>ac</i> 上，把两条<b>较短</b>的棱加在一起，乘积最小。</p>
<p class="try">动手试试：选一种方式，点“展开”看绿色的面怎样绕棱转下来；改变长、宽、高，比较三种方式哪种最短。</p>`,
          anim: 'c_pyth_adv_box'
        },
        {
          h: '圆柱：沿母线剪开',
          html: `<p>圆柱的侧面沿一条母线剪开，展开是一个长方形：一边是底面周长，另一边是高。</p>
<p class="formula">从下底 A 爬到上底正对面的 B：最短 = √(高<sup>2</sup> + (${fr(1, 2)}底面周长)<sup>2</sup>)</p>
<p>如果是绕圆柱一整圈回到正上方，水平方向就是一整个周长。绕几圈，就把几个长方形接起来。</p>`
        },
        {
          h: '折叠：设未知数，用勾股列方程',
          html: `<p>长方形纸片 ABCD 中 AB = 8，BC = 4，折叠使 C 与 A 重合，折痕 EF。AE 多长？</p>
<p>折叠前后对应线段相等：CE = AE。设 AE = <i>x</i>，BE = 8 − <i>x</i>，在 Rt△EBC 里列方程：<i>x</i><sup>2</sup> = (8 − <i>x</i>)<sup>2</sup> + 4<sup>2</sup>，<i>x</i> = 5。</p>
<p class="formula">折叠问题三步：① 找出折叠前后相等的线段 ② 设未知数，表示出一个直角三角形的三边 ③ 用勾股定理列方程</p>
<p class="try">动手试试：拖动“折叠”滑块慢慢折过去；改变 AB、BC，看方程的解怎样变。</p>`,
          anim: 'c_pyth_adv_fold'
        },
        {
          h: '两次勾股：方程思想',
          html: `<p>已知三角形三边求高：高把三角形分成两个直角三角形，它们<b>共用这条高</b>。设一段为 <i>x</i>，用两次勾股定理分别表示高的平方，令它们相等。</p>
<p class="formula">AD<sup>2</sup> = AB<sup>2</sup> − BD<sup>2</sup> = AC<sup>2</sup> − CD<sup>2</sup></p>
<p>古代数学书里的“折竹”“芦苇”问题，也是设未知数后用勾股定理列方程。</p>`
        }
      ],
      pitfalls: [
        '长方体表面最短路径要把三种展开都比较（或者用“最长的棱单独作直角边”判断），只算一种容易错。',
        '蚂蚁在<b>表面</b>爬，不能穿过长方体内部，体对角线 √(<i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> + <i>c</i><sup>2</sup>) 不是答案。',
        '圆柱从一点爬到“正对面”只走<b>半个</b>底面周长；折叠问题先弄清哪些线段折叠前后相等，再选含未知数的直角三角形列方程。'
      ],
      examples: [
        {
          q: '长方体的长、宽、高分别是 4 cm、2 cm、1 cm。一只蚂蚁从顶点 A 沿长方体表面爬到顶点 G（A、G 是长方体一条体对角线的两个端点）。最短路程是多少？' + FIG.py_box,
          steps: [
            '思路：沿表面爬要经过两个相邻的面，把这两个面展开成一个长方形，路线是长方形的对角线。有三种展开方式，都要算。',
            '三种方式：√((4 + 2)<sup>2</sup> + 1<sup>2</sup>) = √37，√((4 + 1)<sup>2</sup> + 2<sup>2</sup>) = √29，√(4<sup>2</sup> + (2 + 1)<sup>2</sup>) = √25 = 5。',
            '最短的是 5 cm：最长的棱 4 单独作一条直角边，另两条棱的和 2 + 1 = 3 作另一条直角边。'
          ],
          ans: '最短路程是 5 cm'
        },
        {
          q: '圆柱的高是 12 cm，底面周长是 10 cm。点 A 在下底面的圆周上，点 B 在上底面的圆周上，且 B 在 A 的正对面（A、B 与圆柱的轴在同一个平面里，分别在轴的两侧）。蚂蚁从 A 沿侧面爬到 B，最短路程是多少？' + FIG.py_cyl,
          steps: [
            '沿过 A 的母线把侧面剪开，展开成长方形，一边是底面周长 10，另一边是高 12。',
            'B 在 A 的正对面，展开后 A、B 水平方向相距半个周长 5，竖直方向相距 12。',
            '最短路程 = √(5<sup>2</sup> + 12<sup>2</sup>) = √169 = 13 cm。'
          ],
          ans: '最短路程是 13 cm'
        },
        {
          q: '长方形纸片 ABCD 中，AB = 8，BC = 4。折叠纸片使点 C 与点 A 重合，折痕 EF 与 AB、CD 分别交于点 E、F。求 AE 的长。' + FIG.py_fold,
          steps: [
            '思路：C 与 A 重合，折痕 EF 是 AC 的垂直平分线，所以 CE = AE。在 Rt△EBC 中设未知数，列勾股方程。',
            '设 AE = <i>x</i>，则 CE = <i>x</i>，BE = 8 − <i>x</i>。',
            '在 Rt△EBC 中，CE<sup>2</sup> = BE<sup>2</sup> + BC<sup>2</sup>：<i>x</i><sup>2</sup> = (8 − <i>x</i>)<sup>2</sup> + 4<sup>2</sup>，即 <i>x</i><sup>2</sup> = 64 − 16<i>x</i> + <i>x</i><sup>2</sup> + 16，16<i>x</i> = 80，<i>x</i> = 5。'
          ],
          ans: 'AE = 5'
        },
        {
          q: '△ABC 中，AB = 13，AC = 15，BC = 14。求 BC 边上的高 AD 和 △ABC 的面积。' + FIG.py_alt,
          steps: [
            '思路：高 AD 把 △ABC 分成两个直角三角形，它们共用 AD。分别用勾股定理表示 AD<sup>2</sup>，列方程。',
            '∠B、∠C 都是锐角（最大边 15 的平方 225 &lt; 13<sup>2</sup> + 14<sup>2</sup>），D 在线段 BC 上。设 BD = <i>x</i>，则 CD = 14 − <i>x</i>，AD<sup>2</sup> = 13<sup>2</sup> − <i>x</i><sup>2</sup> = 15<sup>2</sup> − (14 − <i>x</i>)<sup>2</sup>。',
            '169 − <i>x</i><sup>2</sup> = 225 − 196 + 28<i>x</i> − <i>x</i><sup>2</sup>，28<i>x</i> = 140，<i>x</i> = 5。',
            `AD = √(169 − 25) = 12，面积 = ${fr(1, 2)} × 14 × 12 = 84。`
          ],
          ans: 'AD = 12，面积是 84'
        },
        {
          q: '（挑战）长方形纸片 ABCD 中，AB = 4，AD = 8。沿对角线 BD 折叠，点 C 落在 C′ 处，BC′ 与 AD 交于点 E。求重叠部分 △BED 的面积。' + FIG.py_foldbd,
          steps: [
            '思路：折叠得 ∠EBD = ∠CBD；AD∥BC 得 ∠EDB = ∠CBD。所以 ∠EBD = ∠EDB，EB = ED——等腰三角形是折叠问题里常藏的条件。',
            '设 ED = EB = <i>x</i>，则 AE = 8 − <i>x</i>。在 Rt△ABE 中：<i>x</i><sup>2</sup> = (8 − <i>x</i>)<sup>2</sup> + 4<sup>2</sup>，16<i>x</i> = 80，<i>x</i> = 5。',
            `S<sub>△BED</sub> = ${fr(1, 2)} × ED × AB = ${fr(1, 2)} × 5 × 4 = 10。`
          ],
          ans: '重叠部分的面积是 10'
        }
      ],
      quiz: [
        { type: 'fill', q: '圆柱的高是 8 cm，底面周长是 12 cm。蚂蚁从下底面圆周上的点 A 沿侧面爬到上底面圆周上与 A 正对的点 B（A、B 与轴在同一平面内，分在轴的两侧），最短路程是______cm。' + FIG.py_cyl, ans: ['10'], why: '展开后水平方向是半个周长 6，竖直方向是高 8，最短路程 = √(36 + 64) = 10（cm）。' },
        { type: 'fill', q: '圆柱的高是 5 cm，底面周长是 12 cm。蚂蚁从下底面圆周上的点 A 出发，沿侧面绕圆柱一周，爬到 A 正上方的上底面圆周上的点，最短路程是______cm。' + FIG.py_cyl_q2, ans: ['13'], why: '绕一整圈，展开后水平方向是整个周长 12，竖直方向是 5，最短路程 = √(144 + 25) = 13（cm）。' },
        { type: 'choice', q: '长方体的长、宽、高分别是 3、2、1，从一个顶点沿表面爬到与它成体对角的顶点，最短路程是（　）。' + FIG.py_box_q, opts: ['√26', '2√5', '3√2', '√14'], ans: 2, why: '三种展开：(3 + 2)² + 1² = 26，(3 + 1)² + 2² = 20，(2 + 1)² + 3² = 18。最小是 √18 = 3√2。√14 是体对角线，要穿过长方体内部，不行。' },
        { type: 'fill', q: '长方体的长、宽、高分别是 12、3、2，从一个顶点沿表面爬到与它成体对角的顶点，最短路程是______。' + FIG.py_box_q2, ans: ['13'], why: '最长棱 12 单独作直角边，另两棱之和 3 + 2 = 5：√(144 + 25) = 13。另两种 √((12 + 3)² + 4) = √229、√((12 + 2)² + 9) = √205 都更长。' },
        { type: 'choice', q: '长方体的三条棱长是 <i>a</i>、<i>b</i>、<i>c</i>，且 <i>a</i> &gt; <i>b</i> &gt; <i>c</i>。从一个顶点沿表面爬到与它成体对角的顶点，最短路程是（　）。', opts: ['√((<i>a</i> + <i>b</i>)² + <i>c</i>²)', '√((<i>a</i> + <i>c</i>)² + <i>b</i>²)', '√(<i>a</i>² + (<i>b</i> + <i>c</i>)²)', '√(<i>a</i>² + <i>b</i>² + <i>c</i>²)'], ans: 2, why: '三者平方后都含 <i>a</i>² + <i>b</i>² + <i>c</i>²，分别多出 2<i>ab</i>、2<i>ac</i>、2<i>bc</i>，其中 2<i>bc</i> 最小。所以最长棱单独、另两条较短的棱相加。最后一个是体对角线，穿过了内部。' },
        { type: 'fill', q: '长方形纸片 ABCD 中，AB = 8，BC = 6。折叠使点 C 与点 A 重合，折痕交 AB 于点 E，则 AE = ______。' + FIG.py_fold_q, ans: ['6.25', '25/4'], why: '设 AE = CE = <i>x</i>，BE = 8 − <i>x</i>。<i>x</i>² = (8 − <i>x</i>)² + 36，16<i>x</i> = 100，<i>x</i> = 6.25。' },
        { type: 'choice', q: '长方形纸片 ABCD 中，AB = 8，BC = 4，折叠使点 C 与点 A 重合，折痕 EF 与 AB、CD 分别交于 E、F。折痕 EF 的长是（　）。' + FIG.py_fold, opts: ['5', '2√5', '4', '√41'], ans: 1, why: '由例题 AE = 5，同理 CF = 5，DF = 3。以 A 为原点，E(5, 0)，F(3, 4)，EF = √(2² + 4²) = √20 = 2√5。' },
        { type: 'fill', q: 'Rt△ABC 中，∠C = 90°，AC = 6，BC = 8。折叠使点 B 与点 A 重合，折痕交 BC 于点 D，则 CD = ______。' + FIG.py_rtfold, ans: ['1.75', '7/4'], why: '折叠得 AD = BD。设 CD = <i>x</i>，则 AD = BD = 8 − <i>x</i>。在 Rt△ACD 中 (8 − <i>x</i>)² = <i>x</i>² + 36，64 − 16<i>x</i> = 36，<i>x</i> = 1.75。' },
        { type: 'fill', q: '△ABC 中，AB = 10，AC = 17，BC = 21，则 BC 边上的高是______。' + FIG.py_alt_q, ans: ['8'], why: '设 BD = <i>x</i>，CD = 21 − <i>x</i>：100 − <i>x</i>² = 289 − (21 − <i>x</i>)²，化简得 42<i>x</i> = 252，<i>x</i> = 6，高 = √(100 − 36) = 8。' },
        { type: 'fill', q: '（古题）一根竹子高 10 尺，从某处折断后，竹梢落在地上，离竹根 3 尺。折断处离地面______尺。' + FIG.py_bamboo, ans: ['4.55', '91/20'], why: '设折断处高 <i>x</i> 尺，折下的部分长 10 − <i>x</i>，是斜边：<i>x</i>² + 3² = (10 − <i>x</i>)²，9 = 100 − 20<i>x</i>，<i>x</i> = 4.55。' },
        { type: 'fill', q: '（古题）正方形水池边长 10 尺，一根芦苇长在水池正中央，高出水面 1 尺。把芦苇拉向岸边，它的顶端恰好碰到岸边的中点。水深______尺。' + FIG.py_reed, ans: ['12'], why: '设水深 <i>x</i> 尺，芦苇长 <i>x</i> + 1。芦苇到岸边中点的水平距离是 5：<i>x</i>² + 5² = (<i>x</i> + 1)²，25 = 2<i>x</i> + 1，<i>x</i> = 12。' },
        { type: 'fill', q: '（挑战）长方形纸片 ABCD 中，AB = 3，AD = 9。沿对角线 BD 折叠，点 C 落在 C′ 处，BC′ 与 AD 交于点 E。重叠部分 △BED 的面积是______。' + FIG.py_foldbd_q, ans: ['7.5', '15/2'], why: '∠EBD = ∠CBD = ∠EDB，EB = ED = <i>x</i>，AE = 9 − <i>x</i>。<i>x</i>² = (9 − <i>x</i>)² + 9，18<i>x</i> = 90，<i>x</i> = 5。面积 = ½ × 5 × 3 = 7.5。' }
      ]
    },

    // ───────────────────────── 四边形综合 ─────────────────────────
    c_quad_shape: {
      goal: '会判断中点四边形的形状；掌握正方形中的半角模型（EF = BE + DF）和“十字架”模型（互相垂直的线段相等），会通过旋转、平移构造全等三角形解决四边形综合题。',
      fj: '常以选择、填空压轴和解答题中的几何证明出现。半角模型常考 EF = BE + DF、△CEF 的周长等于正方形周长的一半、点 A 到 EF 的距离等于边长；十字架模型常考证明 AE = BF 或求线段长；中点四边形常考判断形状、求周长和面积。',
      sections: [
        {
          h: '中点四边形：形状看对角线',
          html: `<p>顺次连接四边形 ABCD 各边中点 E、F、G、H，得到中点四边形 EFGH。由三角形中位线，EF∥AC，EF = ${fr(1, 2)}AC，EH∥BD，EH = ${fr(1, 2)}BD，所以它一定是平行四边形，而且它的样子<b>只由原四边形的对角线决定</b>：</p>
<table class="mini"><tr><th>原四边形的对角线</th><th>中点四边形</th></tr>
<tr><td>一般</td><td>平行四边形</td></tr><tr><td>相等</td><td>菱形</td></tr>
<tr><td>互相垂直</td><td>矩形</td></tr><tr><td>相等且垂直</td><td>正方形</td></tr></table>
<p class="formula">中点四边形的周长 = AC + BD</p>`
        },
        {
          h: '半角模型：∠EAF = 45°',
          html: `<p>正方形 ABCD 中，E 在 BC 上，F 在 CD 上，∠EAF = 45°（正好是 ∠BAD 的一半）。BE、DF 分在两处，EF 斜着——它们有什么关系？</p>
<p>把 △ADF 绕 A 旋转 90°，AD 转到 AB，F 落在 CB 延长线上的 G。于是 BG = DF，再证 △AGE ≌ △AFE，得</p>
<p class="formula">EF = BE + DF　　△CEF 的周长 = 2 × 正方形边长</p>
<p class="try">动手试试：拖动 E，比较 EF 与 BE + DF；点“旋转”看 △ADF 怎样转过去，两个蓝色三角形全等。把 ∠EAF 调离 45° 再试试，结论就不成立了。</p>`,
          anim: 'c_quad_shape_half'
        },
        {
          h: '十字架模型：互相垂直就相等',
          html: `<p>正方形中，一条线段连接一组对边，另一条线段连接另一组对边。如果这两条线段<b>互相垂直</b>，它们一定<b>相等</b>。</p>
<p>为什么？把两条线段各自平移，一条的端点移到 A，另一条的端点移到 B，就变成 AE ⊥ BF。∠BAE 与 ∠CBF 都是 ∠AEB 的余角，再加上 AB = BC、两个直角，得 △ABE ≌ △BCF（ASA）。</p>
<p class="formula">正方形中：MN ⊥ PQ（端点分别在两组对边上）⟹ MN = PQ</p>
<p class="try">动手试试：拖动 M、N、P 改变两条线段，读数里两条线段总相等；点“平移到顶点”看看两个全等的绿色三角形。</p>`,
          anim: 'c_quad_shape_cross'
        },
        {
          h: '方法归纳',
          html: `<p>正方形的四条边相等、四个角都是 90°，这是<b>旋转 90° 的“接口”</b>：边 AD 转 90° 正好和 AB 重合。线段分散时，旋转一个三角形把它们拼到一起；方向不对时，平移线段到顶点处。</p>
<p>做题时先认模型：看到“正方形 + 45° 角”想半角模型，看到“正方形 + 互相垂直的线段”想十字架模型，看到“各边中点”想中位线。</p>`
        }
      ],
      pitfalls: [
        '中点四边形的形状只由原四边形的<b>对角线</b>决定：对角线相等得菱形，对角线垂直得矩形，不要说反。',
        '半角模型的 EF = BE + DF 要求 ∠EAF 恰好是 45°（∠BAD 的一半）。用“延长 CB 到 G 使 BG = DF”的写法时，G、B、E 本来就在一条直线上，比“旋转”写法更方便说理。',
        '十字架模型在<b>正方形</b>中得“相等”，在长方形中只能得到“相似”（两条线段之比等于邻边之比），不能照搬。'
      ],
      examples: [
        {
          q: '四边形 ABCD 的对角线 AC、BD 互相垂直且相等，E、F、G、H 分别是 AB、BC、CD、DA 的中点。求证：四边形 EFGH 是正方形。' + FIG.qs_mid,
          steps: [
            '思路：中点连线想到三角形中位线，它把对角线的位置关系（平行）和数量关系（一半）传给中点四边形。',
            `证明：∵ E、F 分别是 AB、BC 的中点，∴ EF∥AC，EF = ${fr(1, 2)}AC（三角形中位线定理）。同理 HG∥AC，HG = ${fr(1, 2)}AC；EH∥BD，EH = ${fr(1, 2)}BD。`,
            '∴ EF∥HG 且 EF = HG，四边形 EFGH 是平行四边形。∵ AC = BD，∴ EF = EH，▱EFGH 是菱形。',
            '∵ AC ⊥ BD，EF∥AC，EH∥BD，∴ EF ⊥ EH，∠FEH = 90°，∴ 菱形 EFGH 是正方形。'
          ],
          ans: '证明见上'
        },
        {
          q: '正方形 ABCD 中，点 E、F 分别在边 BC、CD 上，∠EAF = 45°。求证：EF = BE + DF。' + FIG.qs_half_g,
          steps: [
            '思路：BE、DF 分在两处。把 △ADF 绕 A 旋转 90°，让 DF 接到 BE 旁边（这也是“补短”）。',
            '证明：延长 CB 到 G，使 BG = DF，连接 AG。∵ AB = AD，∠ABG = ∠D = 90°，BG = DF，∴ △ABG ≌ △ADF（SAS），∴ AG = AF，∠BAG = ∠DAF。',
            '∴ ∠GAE = ∠BAG + ∠BAE = ∠DAF + ∠BAE = 90° − ∠EAF = 45° = ∠EAF。又 AG = AF，AE = AE，∴ △AGE ≌ △AFE（SAS）。',
            '∴ EF = GE = GB + BE = DF + BE。'
          ],
          ans: '证明见上'
        },
        {
          q: '正方形 ABCD 的边长是 6，点 E、F 分别在边 BC、CD 上，∠EAF = 45°，BE = 2。求 DF 和 EF 的长。' + FIG.qs_half,
          steps: [
            '由半角模型，EF = BE + DF。设 DF = <i>x</i>，则 EF = 2 + <i>x</i>，CE = 6 − 2 = 4，CF = 6 − <i>x</i>。',
            '在 Rt△CEF 中，EF<sup>2</sup> = CE<sup>2</sup> + CF<sup>2</sup>：(2 + <i>x</i>)<sup>2</sup> = 4<sup>2</sup> + (6 − <i>x</i>)<sup>2</sup>。',
            '4 + 4<i>x</i> + <i>x</i><sup>2</sup> = 16 + 36 − 12<i>x</i> + <i>x</i><sup>2</sup>，16<i>x</i> = 48，<i>x</i> = 3。',
            'DF = 3，EF = 2 + 3 = 5。验算：△CEF 的周长 = 4 + 3 + 5 = 12 = 2 × 6。'
          ],
          ans: 'DF = 3，EF = 5'
        },
        {
          q: '正方形 ABCD 中，点 E 在边 BC 上，点 F 在边 CD 上，AE ⊥ BF。求证：AE = BF。' + FIG.qs_cross,
          steps: [
            '思路：AE、BF 分别在 △ABE 和 △BCF 中，证这两个三角形全等。已有 AB = BC 和两个直角，还差一对角。',
            '证明：设 AE 与 BF 交于点 O。∵ AE ⊥ BF，∴ ∠BOE = 90°，∴ ∠CBF + ∠AEB = 90°。又 ∠ABE = 90°，∴ ∠BAE + ∠AEB = 90°。∴ ∠BAE = ∠CBF（同角的余角相等）。',
            '在 △ABE 和 △BCF 中，∠BAE = ∠CBF，AB = BC，∠ABE = ∠BCF = 90°，∴ △ABE ≌ △BCF（ASA），∴ AE = BF。'
          ],
          ans: '证明见上'
        },
        {
          q: '（挑战）正方形 ABCD 的边长是 6，点 E、F 分别在边 BC、CD 上，∠EAF = 45°，EF = 5。求 △AEF 的面积。' + FIG.qs_half,
          steps: [
            '思路：由半角模型的全等，△AEF ≌ △AEG，面积相等；而 △AEG 的底 GE 在直线 BC 上，高就是 AB。',
            '延长 CB 到 G 使 BG = DF，同例 2 得 △AGE ≌ △AFE，∴ S<sub>△AEF</sub> = S<sub>△AEG</sub>，GE = EF = 5。',
            `GE 边上的高是 AB = 6，S<sub>△AEG</sub> = ${fr(1, 2)} × 5 × 6 = 15。（这也说明点 A 到 EF 的距离等于边长 6。）`
          ],
          ans: '△AEF 的面积是 15'
        }
      ],
      quiz: [
        { type: 'choice', q: '对角线互相垂直（但不相等）的四边形，顺次连接各边中点得到的四边形一定是（　）。', opts: ['菱形', '矩形', '正方形', '一般的平行四边形'], ans: 1, why: '中点四边形的边分别平行于原四边形的对角线。对角线垂直，相邻两边就垂直，得到矩形；对角线不相等，邻边不相等，不是正方形。' },
        { type: 'fill', q: '四边形 ABCD 的对角线 AC = 10，BD = 8，顺次连接各边中点得到的四边形的周长是______。', ans: ['18'], why: '中点四边形两组对边分别等于 ½AC 和 ½BD，周长 = AC + BD = 18。' },
        { type: 'fill', q: '正方形 ABCD 的边长是 7，点 E、F 分别在边 BC、CD 上，∠EAF = 45°。△CEF 的周长是______。' + FIG.qs_half_g, ans: ['14'], why: 'EF = BE + DF，△CEF 周长 = CE + CF + BE + DF = BC + CD = 14。' },
        { type: 'choice', q: '正方形 ABCD 中，点 E、F 分别在边 BC、CD 上。要使 EF = BE + DF 一定成立，需要的条件是（　）。', opts: ['∠EAF = 45°', '∠EAF = 60°', 'BE = DF', 'E、F 分别是 BC、CD 的中点'], ans: 0, why: '半角模型要求 ∠EAF = ½∠BAD = 45°。例如边长 6 时 E、F 都是中点，BE + DF = 6，而 EF = 3√2 ≠ 6。' },
        { type: 'fill', q: '正方形 ABCD 的边长是 6，点 E、F 分别在边 BC、CD 上，∠EAF = 45°，BE = 3，则 DF = ______。' + FIG.qs_half_q, ans: ['2'], why: '设 DF = <i>x</i>，EF = 3 + <i>x</i>，CE = 3，CF = 6 − <i>x</i>：(3 + <i>x</i>)² = 9 + (6 − <i>x</i>)²，18<i>x</i> = 36，<i>x</i> = 2。' },
        { type: 'fill', q: '正方形 ABCD 的边长是 12，点 E、F 分别在边 BC、CD 上，∠EAF = 45°，BE = 4，则 EF = ______。' + FIG.qs_half_q2, ans: ['10'], why: '设 DF = <i>x</i>，EF = 4 + <i>x</i>，CE = 8，CF = 12 − <i>x</i>：(4 + <i>x</i>)² = 64 + (12 − <i>x</i>)²，32<i>x</i> = 192，<i>x</i> = 6，EF = 10。验算：6² + 8² = 10²。' },
        { type: 'choice', q: '正方形 ABCD 中，点 E、F 分别在边 BC、CD 上，∠EAF = 45°。点 A 到直线 EF 的距离（　）。' + FIG.qs_half_g, opts: ['等于 AE 的一半', '等于对角线的一半', '随 E 的位置而变化', '等于正方形的边长'], ans: 3, why: '延长 CB 到 G 使 BG = DF，△AGE ≌ △AFE，对应边 GE、FE 上的高相等。GE 在直线 BC 上，它上面的高是 AB，所以 A 到 EF 的距离等于边长。' },
        { type: 'fill', q: '正方形 ABCD 的边长是 8，点 E 在 BC 上，BE = 6，点 F 在 CD 上，AE ⊥ BF，则 CF = ______。' + FIG.qs_cross_q, ans: ['6'], why: '十字架模型：△ABE ≌ △BCF（ASA），CF = BE = 6。' },
        { type: 'fill', q: '正方形 ABCD 的边长是 8，点 E 在 BC 上，BE = 6，点 F 在 CD 上，AE ⊥ BF，则 BF = ______。' + FIG.qs_cross_q, ans: ['10'], why: 'BF = AE = √(8² + 6²) = 10。' },
        { type: 'fill', q: '正方形 ABCD 中，点 M、N 分别在 AD、BC 上，点 P、Q 分别在 AB、CD 上，MN ⊥ PQ，MN = 7.5，则 PQ = ______。' + FIG.qs_mnpq, ans: ['7.5', '15/2'], why: '两条线段的端点分别在两组对边上，又互相垂直，平移到顶点后得到全等三角形，所以 PQ = MN = 7.5。' },
        { type: 'fill', q: '（挑战）正方形 ABCD 的边长是 12，点 E、F 分别在边 BC、CD 上，∠EAF = 45°，EF = 10。△AEF 的面积是______。' + FIG.qs_half_q2, ans: ['60'], why: '△AEF ≌ △AEG（G 在 CB 延长线上，BG = DF），面积 = ½ × GE × AB = ½ × 10 × 12 = 60。' }
      ]
    },

    // ───────────────────────── 圆的综合 ─────────────────────────
    c_circle_adv: {
      goal: '会判定四点共圆（对角互补、两个直角共斜边、同侧张角相等），会在“定点定长”“定弦定角”的条件下找出隐藏的圆，并用圆的性质求角度、求线段的最值。',
      fj: '常以选择、填空压轴出现：由两个直角或两个相等的角发现四点共圆后导角；动点满足 ∠APB 为定值（尤其是 90°）或到定点距离为定值，求某条线段的最小值（定点到圆心的距离减半径）；解答题中作为证明角相等的工具。',
      sections: [
        {
          h: '四点共圆：对角互补（竞赛拓展）',
          html: `<p>课本里学过：圆内接四边形的对角互补。反过来也对——不过这条“四点共圆的判定”<b>课本里没有，属于竞赛拓展</b>，考试解答题里直接用要谨慎，可以像例 1 那样用“到一点距离相等”说明共圆。</p>
<p class="formula">凸四边形 ABCD 中，∠A + ∠C = 180° ⟹ A、B、C、D 四点共圆</p>
<p>道理：过 A、B、C 作圆。D 在圆内时 ∠A + ∠C 小于 180°，在圆外时大于 180°，只有 D 正好在圆上时才等于 180°。</p>
<p>还有两种常见的判定：① <b>两个直角共斜边</b>：∠ABC = ∠ADC = 90°，则 B、D 都在以 AC 为直径的圆上；② <b>同侧张角相等</b>：∠ABD = ∠ACD，且 B、C 在直线 AD 同侧。</p>
<p class="try">动手试试：拖动四个点，看 ∠A + ∠C 的变化；拖到 180° 时圆会变绿，读数里 ∠ABD 与 ∠ACD 也正好相等。</p>`,
          anim: 'c_circle_adv_concyclic'
        },
        {
          h: '定点定长：隐藏的圆（一）',
          html: `<p>到一个定点距离等于定长的点，都在以这个定点为圆心的圆上。题目里没画圆，但条件 AB = AC = AD 就说明 B、C、D 在以 A 为圆心的圆上，可以用圆周角定理求角。</p>
<p>动点在圆上运动时，求它到圆外一点 P 的距离：</p>
<p class="formula">最小值 = PO − <i>r</i>，最大值 = PO + <i>r</i>（O 为圆心）</p>
<p>折叠问题里，折痕经过定点 E，翻折后的点 B′ 满足 EB′ = EB，它就在以 E 为圆心的圆上。</p>`
        },
        {
          h: '定弦定角：隐藏的圆（二）（竞赛拓展）',
          html: `<p><b>竞赛拓展：</b>“定弦定角找圆”是竞赛和压轴题常用的思路，课本不单独讲。线段 AB 长度固定，动点 P 满足 ∠APB 始终等于同一个角 α，P 在哪里？由“同弧所对的圆周角相等”，P 在以 AB 为弦的一段圆弧上。</p>
<p class="formula">AB 定长、∠APB = α 定值 ⟹ P 在过 A、B 的圆弧上；α = 90° 时 AB 是直径</p>
<p>找到这个圆，求 CP 的最小值就是“C 到圆心的距离 − 半径”。</p>
<p class="try">动手试试：拖动 P 找几个让 ∠APB 等于 α 的位置，再点“画出所有 ∠APB = α 的点”；最后点“求 CP 的最小值”。</p>`,
          anim: 'c_circle_adv_hidden'
        },
        {
          h: '方法归纳',
          html: `<table class="mini"><tr><th>看到</th><th>想到</th></tr>
<tr><td>对角互补、两个直角共斜边、同侧张角相等</td><td>四点共圆，用圆周角导角</td></tr>
<tr><td>几条线段都从同一点出发且相等</td><td>以这点为圆心的圆</td></tr>
<tr><td>定线段 + 定角（尤其 90°）</td><td>以这条线段为弦（直径）的圆</td></tr>
<tr><td>圆上动点求最值</td><td>连接定点与圆心</td></tr></table>`
        }
      ],
      pitfalls: [
        '由 ∠ABD = ∠ACD 判定共圆时，B、C 必须在直线 AD 的<b>同侧</b>；在两侧时要用“对角互补”。',
        '求圆上动点到定点的最小距离，是“定点到<b>圆心</b>的距离 − 半径”，要连接定点和圆心，不是连到弦的端点。',
        '定弦定角的点只在 AB 一侧的圆弧上，要检查最值点是否真的在动点能到达的那段弧上（比如“P 在长方形内部”）。'
      ],
      examples: [
        {
          q: '锐角三角形 ABC 中，BD ⊥ AC 于点 D，CE ⊥ AB 于点 E。求证：(1) B、C、D、E 四点共圆；(2) ∠ADE = ∠ABC。' + FIG.ci_alt,
          steps: [
            '思路：∠BEC 和 ∠BDC 都是直角，并且都对着线段 BC——两个直角共斜边，想到以 BC 为直径的圆。',
            `(1) 证明：取 BC 的中点 O，连接 OD、OE。在 Rt△BEC 中，OE = ${fr(1, 2)}BC；在 Rt△BDC 中，OD = ${fr(1, 2)}BC（直角三角形斜边上的中线等于斜边的一半）。∴ OB = OC = OD = OE，B、C、D、E 四点在以 O 为圆心的圆上。`,
            '(2) 证明：∵ 四边形 BCDE 内接于圆，∴ ∠EDC + ∠EBC = 180°（圆内接四边形对角互补）。又 ∠ADE + ∠EDC = 180°，∴ ∠ADE = ∠EBC，即 ∠ADE = ∠ABC。'
          ],
          ans: '证明见上'
        },
        {
          q: '点 B、C、D 满足 AB = AC = AD，∠BAC = 40°，且点 D 与点 A 在直线 BC 的同侧。求 ∠BDC 的度数。' + FIG.ci_eq,
          steps: [
            '思路：AB = AC = AD，说明 B、C、D 到定点 A 的距离相等——它们在以 A 为圆心、AB 为半径的圆上（定点定长）。',
            '以 A 为圆心、AB 为半径作圆，B、C、D 都在圆上。∠BAC 是弧 BC 所对的圆心角，∠BDC 是同一段弧所对的圆周角（D 与圆心 A 在 BC 同侧，D 在优弧上）。',
            `∴ ∠BDC = ${fr(1, 2)}∠BAC = 20°。`
          ],
          ans: '∠BDC = 20°'
        },
        {
          q: '长方形 ABCD 中，AB = 6，BC = 4，点 P 在长方形内部，且 ∠APB = 90°。求 CP 的最小值。' + FIG.ci_rect,
          steps: [
            '思路：AB 是定长，∠APB 是定角 90°，P 在以 AB 为直径的圆上（定弦定角）。CP 的最小值就是 C 到这个圆的最近距离。',
            '取 AB 的中点 O，P 在以 O 为圆心、半径 3 的半圆上（长方形内的部分）。',
            'OC = √(OB<sup>2</sup> + BC<sup>2</sup>) = √(3<sup>2</sup> + 4<sup>2</sup>) = 5。CP ≥ OC − OP = 5 − 3 = 2，当 P 在线段 OC 上时取等号（这个点到 AB 的距离是 2.4 &lt; 4，在长方形内部）。'
          ],
          ans: 'CP 的最小值是 2'
        },
        {
          q: '（挑战）正方形 ABCD 的对角线交于点 O，点 P 在正方形外，∠APB = 90°，且 P 与 O 在直线 AB 的两侧。求证：PO 平分 ∠APB。' + FIG.ci_sqout,
          steps: [
            '思路：∠APB = ∠AOB = 90°，两个直角共斜边 AB，A、P、B、O 四点共圆，再用同弧所对的圆周角相等。',
            '证明：∵ 正方形的对角线互相垂直，∴ ∠AOB = 90° = ∠APB，∴ A、P、B、O 四点在以 AB 为直径的圆上。',
            '∵ ∠APO 与 ∠ABO 都是弧 AO 所对的圆周角，∴ ∠APO = ∠ABO = 45°；同理 ∠BPO = ∠BAO = 45°。',
            '∴ ∠APO = ∠BPO，PO 平分 ∠APB。'
          ],
          ans: '证明见上'
        }
      ],
      quiz: [
        { type: 'choice', q: '凸四边形 ABCD 满足下列哪个条件时，A、B、C、D 四点一定共圆？（　）', opts: ['∠A = ∠C', '∠A + ∠C = 180°', '∠A + ∠B = 180°', 'AC = BD'], ans: 1, why: '对角互补的四边形四点共圆。∠A + ∠B = 180° 只说明 AD∥BC（是梯形），不一定共圆；对角线相等也不一定。' },
        { type: 'fill', q: '凸四边形 ABCD 中，∠ABD = ∠ACD = 40°，∠BAC = 30°，则 ∠BDC = ______°。' + FIG.ci_4, ans: ['30'], why: 'B、C 在 AD 同侧且 ∠ABD = ∠ACD，所以 A、B、C、D 四点共圆。∠BDC 与 ∠BAC 是同弧 BC 所对的圆周角，∠BDC = 30°。' },
        { type: 'fill', q: '锐角 △ABC 中，BD ⊥ AC 于点 D，CE ⊥ AB 于点 E，∠ABC = 65°，∠ACB = 55°，则 ∠ADE = ______°。' + FIG.ci_alt_q, ans: ['65'], why: 'B、C、D、E 四点共圆（以 BC 为直径），∠ADE = ∠ABC = 65°（圆内接四边形的外角等于内对角）。' },
        { type: 'choice', q: '下列条件中，<b>不能</b>判定 A、B、C、D 四点共圆的是（　）。', opts: ['凸四边形 ABCD 中，∠A + ∠C = 180°', '∠ABD = ∠ACD，且 B、C 在直线 AD 的同侧', '∠ABD = ∠ACD，且 B、C 在直线 AD 的两侧', '∠ABC = ∠ADC = 90°'], ans: 2, why: '同侧张角相等才共圆。B、C 在 AD 两侧时，共圆需要 ∠ABD + ∠ACD = 180°。两个直角共斜边 AC 时，B、D 都在以 AC 为直径的圆上。' },
        { type: 'fill', q: 'AB = AC = AD，∠CBD = 25°，点 B 与点 A 在直线 CD 的同侧，则 ∠CAD = ______°。' + FIG.ci_eq_q, ans: ['50'], why: 'B、C、D 在以 A 为圆心的圆上，∠CBD 是弧 CD 所对的圆周角，∠CAD 是同弧所对的圆心角，∠CAD = 2 × 25° = 50°。' },
        { type: 'fill', q: '⊙O 的半径是 2，点 P 到圆心 O 的距离是 5，Q 是 ⊙O 上的动点。PQ 的最小值是______。', ans: ['3'], why: 'PQ ≥ PO − OQ = 5 − 2 = 3，Q 在线段 PO 上时取等号。' },
        { type: 'choice', q: '长方形 ABCD 中，AB = 4，BC = 6，E 是 AB 的中点，F 是 BC 上的动点。把 △EBF 沿 EF 翻折，点 B 落在 B′ 处。B′D 的最小值是（　）。' + FIG.ci_fold, opts: ['2√10 − 2', '2√10', '2√10 + 2', '4'], ans: 0, why: 'EB′ = EB = 2，B′ 在以 E 为圆心、半径 2 的圆上。ED = √(AE² + AD²) = √(4 + 36) = 2√10，B′D ≥ ED − 2 = 2√10 − 2。' },
        { type: 'fill', q: '线段 AB = 6，动点 P 满足 ∠APB = 90°。点 P 到直线 AB 的距离最大是______。', ans: ['3'], why: 'P 在以 AB 为直径的圆上，半径 3，P 到 AB 的距离最大等于半径 3。' },
        { type: 'choice', q: '正方形 ABCD 的边长是 4，点 P 在正方形内部，∠APB = 90°。CP 的最小值是（　）。' + FIG.ci_sq, opts: ['2', '2√5', '2√5 − 2', '4 − √2'], ans: 2, why: 'P 在以 AB 为直径的半圆上，圆心 O 是 AB 中点，半径 2。OC = √(2² + 4²) = 2√5，CP 最小 = 2√5 − 2。' },
        { type: 'choice', q: '线段 AB = 6，动点 P 在直线 AB 的同一侧，且 ∠APB = 60°。△APB 面积的最大值是（　）。', opts: ['9', '18', '6√3', '9√3'], ans: 3, why: 'P 在以 AB 为弦的圆弧上，离 AB 最远的点是弧的中点，此时 PA = PB，△APB 是等边三角形，面积 = (√3 ÷ 4) × 36 = 9√3。' },
        { type: 'choice', q: '（挑战）正方形 ABCD 的对角线交于点 O，点 P 在正方形外，∠APB = 90°，P 与 O 在 AB 两侧，PA = 3，PB = 5。PO 的长是（　）。' + FIG.ci_sqout_q, opts: ['4', '4√2', '8', '2√2'], ans: 1, why: 'A、P、B、O 共圆，∠OAP + ∠OBP = 180°。把 △OAP 绕 O 旋转 90° 使 A 与 B 重合，P 落到 P′，则 ∠OBP′ = ∠OAP，所以 P、B、P′ 共线，PP′ = PB + BP′ = 5 + 3 = 8。△OPP′ 是等腰直角三角形，PO = 8 ÷ √2 = 4√2。' }
      ]
    },

    // ───────────────────────── 相似模型 ─────────────────────────
    c_similar_model: {
      goal: '能在复杂图形中认出 A 字型、8 字型、一线三等角（K 字型）、母子型（共角共边）等相似模型，正确写出对应边成比例，求线段长或证明乘积式。',
      fj: '选择、填空常考求线段长和比值；解答题常把一线三等角放在矩形折叠、等边三角形或坐标系中（求点的坐标、讨论存在性），母子型常以“求证 AC² = AD · AB”这类乘积式出现，直角三角形中的射影定理也常用。',
      sections: [
        {
          h: '先认基本型：A 字型与 8 字型',
          html: `<p><b>A 字型</b>：△ABC 中 DE∥BC（D 在 AB 上，E 在 AC 上），则 △ADE ∽ △ABC，AD : AB = AE : AC = DE : BC。</p>
<p><b>8 字型</b>：线段 AB、CD 交于点 O，AC∥BD，则 △OAC ∽ △OBD，OA : OB = OC : OD = AC : BD。</p>
<p>它们靠“平行”得到等角。复杂一点的模型，等角要自己去找。</p>`
        },
        {
          h: '一线三等角（K 字型）',
          html: `<p>B、P、C 在一条直线上，∠B = ∠APD = ∠C，三个相等的角“站”在同一条线上，像字母 K。</p>
<p>为什么相似？∠APC 是 △ABP 的外角：∠B + ∠BAP = ∠APD + ∠DPC，而 ∠B = ∠APD，所以 ∠BAP = ∠CPD。再加上 ∠B = ∠C：</p>
<p class="formula">∠B = ∠APD = ∠C ⟹ △ABP ∽ △PCD，AB · CD = BP · PC</p>
<p>三个角可以都是 90°（矩形、坐标系中常见），也可以都是 60°（等边三角形中）或任意角。</p>
<p class="try">动手试试：拖动 P 或点“让 P 从 B 走到 C”，看 CD 怎样变；改变“等角”的大小，乘积式始终成立。</p>`,
          anim: 'c_similar_model_k'
        },
        {
          h: '母子型：共角又共边',
          html: `<p>△ABC 中，D 在 AB 上，∠ACD = ∠B。小三角形 △ACD 和大三角形 △ABC 有<b>公共角 ∠A</b>，还有一条<b>公共边 AC</b>，像母亲抱着孩子。</p>
<p class="formula">∠ACD = ∠B ⟹ △ACD ∽ △ABC ⟹ AC<sup>2</sup> = AD · AB</p>
<p>特例是直角三角形斜边上的高（<b>射影定理，竞赛拓展</b>，课本里没有这个名字，解答题中要先用相似证明再用）：∠ACB = 90°，CD ⊥ AB，则 CD<sup>2</sup> = AD · BD，AC<sup>2</sup> = AD · AB，BC<sup>2</sup> = BD · BA。</p>
<p class="try">动手试试：拖动 C，比较 AC<sup>2</sup> 与 AD · AB；点“翻过来、放大”看小三角形怎样盖住大三角形；再点“变成直角三角形”看射影定理。</p>`,
          anim: 'c_similar_model_mother'
        },
        {
          h: '找模型的步骤',
          html: `<p>① 先找一对等角：公共角、对顶角、平行得到的角、题目给的等角；② 再找第二对等角（K 字型靠外角，母子型靠条件）；③ 写相似时<b>对应顶点的顺序要对齐</b>，再写比例式。</p>
<p>要证 <i>a</i><sup>2</sup> = <i>b</i> · <i>c</i> 或 <i>a</i> · <i>b</i> = <i>c</i> · <i>d</i> 这样的乘积式，先把它改写成比例式，再找含这四条线段的两个三角形。</p>`
        }
      ],
      pitfalls: [
        '写比例时对应边要对齐：K 字型中 △ABP ∽ △PCD，对应的是 AB 与 PC、BP 与 CD，写成 AB : CD = BP : PC 就错了。',
        '母子型 AC<sup>2</sup> = AD · AB 中，AC 是公共边，AD、AB 是公共角另一边上的两段（从公共顶点量起），不要把 BD 代进去。',
        'K 字型里由“BP · PC = 定值”反求 BP 时，常常是一元二次方程，可能有两个解，都要检验是否在线段上。'
      ],
      examples: [
        {
          q: '点 P 在线段 BC 上，点 A、D 在直线 BC 的同侧，∠ABC = ∠APD = ∠DCB = 90°，AB = 3，BP = 2，PC = 6。求 CD 的长。' + FIG.sm_k,
          steps: [
            '思路：三个直角的顶点 B、P、C 在一条直线上——一线三等角。',
            '∵ ∠APD = 90°，∴ ∠APB + ∠DPC = 90°。又 ∠B = 90°，∴ ∠BAP + ∠APB = 90°。∴ ∠BAP = ∠CPD（同角的余角相等）。',
            '又 ∠B = ∠C = 90°，∴ △ABP ∽ △PCD，∴ AB : PC = BP : CD，即 3 : 6 = 2 : CD。',
            'CD = 6 × 2 ÷ 3 = 4。'
          ],
          ans: 'CD = 4'
        },
        {
          q: '等边三角形 ABC 的边长是 9，点 D 在 BC 上，BD = 3，点 E 在 AC 上，∠ADE = 60°。求 CE 的长。' + FIG.sm_eq,
          steps: [
            '思路：∠B = ∠ADE = ∠C = 60°，三个角的顶点 B、D、C 在一条直线上——一线三等角（60° 版）。',
            '∵ ∠ADC 是 △ABD 的外角，∴ ∠ADC = ∠B + ∠BAD。又 ∠ADC = ∠ADE + ∠EDC，∠B = ∠ADE = 60°，∴ ∠BAD = ∠CDE。',
            '又 ∠B = ∠C，∴ △ABD ∽ △DCE，∴ AB : DC = BD : CE。DC = 9 − 3 = 6，所以 9 : 6 = 3 : CE。',
            'CE = 6 × 3 ÷ 9 = 2。'
          ],
          ans: 'CE = 2'
        },
        {
          q: '△ABC 中，点 D 在边 AB 上，∠ACD = ∠B，AC = 6，AD = 4。求 AB 和 BD 的长。' + FIG.sm_mo,
          steps: [
            '思路：△ACD 和 △ABC 有公共角 ∠A，又有 ∠ACD = ∠B，是母子型，AC 是公共边。',
            '∵ ∠A = ∠A，∠ACD = ∠B，∴ △ACD ∽ △ABC，∴ AC : AB = AD : AC，即 AC<sup>2</sup> = AD · AB。',
            '36 = 4 · AB，AB = 9，BD = 9 − 4 = 5。'
          ],
          ans: 'AB = 9，BD = 5'
        },
        {
          q: 'Rt△ABC 中，∠ACB = 90°，CD ⊥ AB 于点 D，AD = 4，BD = 9。求 CD 和 AC 的长。' + FIG.sm_pr,
          steps: [
            '思路：斜边上的高把直角三角形分成两个小直角三角形，它们与原三角形两两相似——母子型的特例（射影定理）。',
            '∵ ∠ACD + ∠BCD = 90°，∠B + ∠BCD = 90°，∴ ∠ACD = ∠B。又 ∠ADC = ∠CDB = 90°，∴ △ACD ∽ △CBD，AD : CD = CD : BD，CD<sup>2</sup> = AD · BD = 36，CD = 6。',
            '又 ∠A 公共，∠ADC = ∠ACB = 90°，∴ △ACD ∽ △ABC，AC<sup>2</sup> = AD · AB = 4 × 13 = 52，AC = 2√13。'
          ],
          ans: 'CD = 6，AC = 2√13'
        },
        {
          q: '（挑战）点 P 在线段 BC 上运动，BC = 8，点 A、D 在直线 BC 的同侧，∠ABC = ∠APD = ∠DCB = 90°，AB = 4。当 BP 为多少时，CD 最长？最长是多少？',
          steps: [
            '由一线三等角，△ABP ∽ △PCD，AB · CD = BP · PC。',
            `设 BP = <i>x</i>，则 PC = 8 − <i>x</i>，CD = <i>x</i>(8 − <i>x</i>) ÷ 4 = −${fr(1, 4)}(<i>x</i> − 4)<sup>2</sup> + 4。`,
            '当 <i>x</i> = 4（P 是 BC 的中点）时，CD 最长，为 4。'
          ],
          ans: 'BP = 4 时，CD 最长，为 4'
        }
      ],
      quiz: [
        { type: 'fill', q: '△ABC 中，点 D、E 分别在 AB、AC 上，DE∥BC，AD = 2，DB = 3，BC = 10，则 DE = ______。' + FIG.sm_a, ans: ['4'], why: 'A 字型：△ADE ∽ △ABC，DE : BC = AD : AB = 2 : 5，DE = 4。注意是 AD : AB，不是 AD : DB。' },
        { type: 'fill', q: '线段 AB、CD 相交于点 O，AC∥BD，OA = 2，OB = 5，AC = 3，则 BD = ______。' + FIG.sm_8, ans: ['7.5', '15/2'], why: '8 字型：△OAC ∽ △OBD，AC : BD = OA : OB = 2 : 5，BD = 3 × 5 ÷ 2 = 7.5。' },
        { type: 'fill', q: '点 P 在线段 BC 上，点 A、D 在 BC 同侧，∠B = ∠APD = ∠C = 90°，AB = 4，BP = 3，PC = 8，则 CD = ______。' + FIG.sm_k_q, ans: ['6'], why: '一线三等角：△ABP ∽ △PCD，AB · CD = BP · PC，4 · CD = 24，CD = 6。' },
        { type: 'fill', q: '等边三角形 ABC 的边长是 6，点 D 在 BC 上，BD = 2，点 E 在 AC 上，∠ADE = 60°，则 CE = ______。' + FIG.sm_eq_q, ans: ['4/3'], why: '△ABD ∽ △DCE，AB : DC = BD : CE，DC = 4，6 : 4 = 2 : CE，CE = 8 ÷ 6 = 4/3。' },
        { type: 'choice', q: '点 P 在线段 BC 上，点 A、D 在 BC 同侧，∠B = ∠APD = ∠C。下列比例式正确的是（　）。' + FIG.sm_kg, opts: ['AB : CD = BP : PC', 'AB : PC = BP : CD', 'AB : BP = CD : PC', 'AP : PD = AB : CD'], ans: 1, why: '△ABP ∽ △PCD，对应顶点 A↔P、B↔C、P↔D，对应边 AB↔PC、BP↔CD、AP↔PD，所以 AB : PC = BP : CD。' },
        { type: 'choice', q: '点 P 在线段 BC 上，BC = 8，点 A、D 在 BC 同侧，∠B = ∠APD = ∠C = 90°，AB = 4，CD = 3，则 BP = （　）。', opts: ['2', '6', '2 或 6', '4'], ans: 2, why: 'AB · CD = BP · PC：设 BP = <i>x</i>，<i>x</i>(8 − <i>x</i>) = 12，<i>x</i>² − 8<i>x</i> + 12 = 0，<i>x</i> = 2 或 6，两个都在线段上。' },
        { type: 'fill', q: '△ABC 中，点 D 在 AB 上，∠ACD = ∠B，AD = 2，AB = 8，则 AC = ______。' + FIG.sm_mo_q, ans: ['4'], why: '母子型：AC² = AD · AB = 16，AC = 4。' },
        { type: 'fill', q: 'Rt△ABC 中，∠ACB = 90°，CD ⊥ AB 于点 D，AD = 2，BD = 8，则 CD = ______。' + FIG.sm_pr_q, ans: ['4'], why: '射影定理：CD² = AD · BD = 16，CD = 4。' },
        { type: 'choice', q: '△ABC 中，点 D 在 AB 上，∠ACD = ∠B（△ABC 不一定是直角三角形）。下列结论一定成立的是（　）。', opts: ['AC² = AD · AB', 'CD² = AD · BD', 'BC² = BD · AB', 'AC · BC = AB · CD'], ans: 0, why: '由公共角 ∠A 和 ∠ACD = ∠B 只能得 △ACD ∽ △ABC，所以 AC² = AD · AB。另外三个都要求 ∠ACB = 90°、CD ⊥ AB 才成立。' },
        { type: 'fill', q: 'Rt△ABC 中，∠ACB = 90°，CD ⊥ AB 于点 D，AC = 6，AB = 10，则 AD = ______。' + FIG.sm_pr_q2, ans: ['3.6', '18/5'], why: 'AC² = AD · AB，36 = 10 · AD，AD = 3.6。' },
        { type: 'fill', q: '（挑战）点 P 在线段 BC 上运动，BC = 10，点 A、D 在 BC 同侧，∠B = ∠APD = ∠C = 90°，AB = 5。CD 的最大值是______。', ans: ['5'], why: 'CD = BP · PC ÷ AB = <i>x</i>(10 − <i>x</i>) ÷ 5，<i>x</i> = 5 时 <i>x</i>(10 − <i>x</i>) 最大为 25，CD 最大 = 5。' }
      ]
    },

    // ───────────────────────── 旋转模型 ─────────────────────────
    c_rotate_model: {
      goal: '能认出手拉手（共顶点的两个等边三角形、正方形、等腰直角三角形）、旋转集中线段、半角等旋转模型，会用旋转构造全等三角形，把分散的线段和角集中起来，求线段长、角度或证明线段关系。',
      fj: '常以解答题的几何探究出现：先在特殊位置证明结论（如 BD = CE、夹角 60°），再让图形旋转到一般位置，问结论是否仍成立；选择、填空常考等边三角形或正方形内一点到顶点的距离已知求角度，等腰直角三角形中的 BD² + CE² = DE²。',
      sections: [
        {
          h: '手拉手：共顶点的两个正多边形',
          html: `<p>两个等边三角形 ABC、ADE 共用顶点 A，像两个人手拉手。连接 BD、CE：AB = AC，AD = AE，∠BAD = ∠CAE，所以</p>
<p class="formula">△ABD ≌ △ACE（SAS）⟹ BD = CE，直线 BD 与 CE 的夹角 = 60°</p>
<p>本质是 △ACE 由 △ABD 绕 A 旋转 60° 得到，旋转角就是两条连线的夹角。换成两个正方形 ABCD、AEFG，就是 △ABE ≌ △ADG，BE = DG，BE ⊥ DG（旋转 90°）。</p>
<p class="try">动手试试：拖动“旋转角”滑块或点“播放旋转”，两个橙色三角形始终全等；切换到“两个正方形”再试试。</p>`,
          anim: 'c_rotate_model_hand'
        },
        {
          h: '旋转集中线段：等边三角形内一点',
          html: `<p>等边三角形 ABC 内有一点 P，PA = 3，PB = 4，PC = 5，求 ∠APB。三条线段散在三处，各自都不好用。</p>
<p>等边三角形的边相等、角是 60°，是旋转 60° 的“接口”：把 △ABP 绕 B 旋转 60°，A 落到 C，P 落到 P′。△BPP′ 是等边三角形（PP′ = PB），P′C = PA，于是 PA、PB、PC 集中到了 △PP′C 里。</p>
<p class="formula">∠APB = ∠CP′B = 60° + ∠PP′C</p>
<p class="try">动手试试：点“设成 3、4、5”，再点“旋转”，看绿色三角形是不是直角三角形。拖动 P 换位置，方法一样。</p>`,
          anim: 'c_rotate_model_three'
        },
        {
          h: '半角模型（等腰直角三角形）',
          html: `<p>△ABC 中 ∠BAC = 90°，AB = AC，D、E 在 BC 上，∠DAE = 45°（∠BAC 的一半）。把 △ABD 绕 A 旋转 90° 到 △ACF：CF = BD，∠ECF = 45° + 45° = 90°，再证 △AEF ≌ △AED，得 EF = DE。</p>
<p class="formula">BD<sup>2</sup> + CE<sup>2</sup> = DE<sup>2</sup></p>
<p>它和正方形中的半角模型（EF = BE + DF）是同一个想法：<b>半角 → 旋转 → 全等</b>。</p>`
        },
        {
          h: '方法归纳',
          html: `<p>什么时候想到旋转？<b>图中有一对共端点的相等线段</b>（等边三角形、正方形、等腰三角形的腰），旋转中心就是这个公共端点，旋转角就是这两条线段的夹角。</p>
<p>旋转后要说清楚：哪两个三角形全等（SAS），哪些点共线，新出现的三角形是等边、等腰直角还是直角三角形。</p>`
        }
      ],
      pitfalls: [
        '手拉手的全等要选对：每个三角形取“大图形的一边 + 小图形的一边”，如 △ABD 与 △ACE；夹角相等要用“同一个角加上（或减去）相等的角”说明。',
        '两条连线的夹角等于旋转角（等边三角形是 60°，正方形是 90°），但题目问的可能是钝角（120°）或别的角，要看清楚。',
        '旋转集中线段后，要用数据说明 △PP′C 是直角三角形（勾股定理的逆定理），不能凭图形“看出来”。'
      ],
      examples: [
        {
          q: '点 B 在线段 AC 上，在 AC 的同侧作等边三角形 ABD 和等边三角形 BCE，连接 AE、CD。求证：AE = CD，并求直线 AE 与 CD 所夹锐角的度数。' + FIG.ro_line,
          steps: [
            '思路：两个等边三角形有公共顶点 B（手拉手），△DBC 可以看成 △ABE 绕 B 旋转 60° 得到。',
            '证明：∵ △ABD、△BCE 是等边三角形，∴ BA = BD，BE = BC，∠ABD = ∠CBE = 60°，∴ ∠ABE = ∠ABD + ∠DBE = ∠CBE + ∠DBE = ∠DBC。',
            '∴ △ABE ≌ △DBC（SAS），∴ AE = DC，∠BAE = ∠BDC。',
            '设 AE 与 BD 交于点 G，AE 与 CD 交于点 F。∵ ∠FDG = ∠BAG，∠DGF = ∠AGB（对顶角相等），∴ ∠DFG = ∠ABG = 60°（三角形内角和为 180°）。所以 AE 与 CD 所夹锐角是 60°。'
          ],
          ans: 'AE = CD，所夹锐角为 60°'
        },
        {
          q: '△ABC 和 △ADE 都是等腰直角三角形，∠BAC = ∠DAE = 90°，点 D 在边 BC 上（不与 B、C 重合），点 E 与点 C 在直线 AD 的同侧，连接 CE。求证：BD = CE，且 CE ⊥ BC。' + FIG.ro_iso,
          steps: [
            '思路：AB = AC，AD = AE，公共顶点 A——手拉手（等腰直角三角形版），△ACE 是 △ABD 绕 A 旋转 90° 得到的。',
            '证明：∵ ∠BAD + ∠DAC = ∠BAC = 90°，∠DAC + ∠CAE = ∠DAE = 90°，∴ ∠BAD = ∠CAE。又 AB = AC，AD = AE，∴ △ABD ≌ △ACE（SAS）。',
            '∴ BD = CE，∠ACE = ∠B = 45°。∴ ∠BCE = ∠ACB + ∠ACE = 45° + 45° = 90°，即 CE ⊥ BC。'
          ],
          ans: '证明见上'
        },
        {
          q: '等边三角形 ABC 内有一点 P，PA = 3，PB = 4，PC = 5。求 ∠APB 的度数。' + FIG.ro_eqp,
          steps: [
            '思路：PA、PB、PC 散在三处。把 △ABP 绕点 B 旋转 60°，使 BA 与 BC 重合，三条线段就能集中。',
            '设 △ABP 绕 B 旋转 60° 得到 △CBP′，则 BP′ = BP = 4，P′C = PA = 3，∠PBP′ = 60°，∠BP′C = ∠BPA。',
            '∵ BP = BP′，∠PBP′ = 60°，∴ △BPP′ 是等边三角形，PP′ = 4，∠BP′P = 60°。',
            '在 △PP′C 中，PP′<sup>2</sup> + P′C<sup>2</sup> = 16 + 9 = 25 = PC<sup>2</sup>，∴ ∠PP′C = 90°（勾股定理的逆定理）。∴ ∠APB = ∠BP′C = 60° + 90° = 150°。'
          ],
          ans: '∠APB = 150°'
        },
        {
          q: '△ABC 中，∠BAC = 90°，AB = AC，点 D、E 在边 BC 上（D 在 B、E 之间），∠DAE = 45°。求证：BD<sup>2</sup> + CE<sup>2</sup> = DE<sup>2</sup>。' + FIG.ro_half,
          steps: [
            '思路：BD、CE、DE 都在 BC 上，凑不成三角形。把 △ABD 绕 A 旋转 90° 使 AB 与 AC 重合，BD 就搬到 C 点旁边。',
            '证明：把 △ABD 绕点 A 旋转 90° 得到 △ACF，则 AF = AD，CF = BD，∠ACF = ∠B = 45°，∠CAF = ∠BAD。∴ ∠ECF = ∠ACB + ∠ACF = 90°。',
            '∠EAF = ∠EAC + ∠CAF = ∠EAC + ∠BAD = 90° − ∠DAE = 45° = ∠DAE。又 AF = AD，AE = AE，∴ △AEF ≌ △AED（SAS），∴ EF = DE。',
            '在 Rt△ECF 中，CE<sup>2</sup> + CF<sup>2</sup> = EF<sup>2</sup>，∴ CE<sup>2</sup> + BD<sup>2</sup> = DE<sup>2</sup>。'
          ],
          ans: '证明见上'
        },
        {
          q: '（挑战）正方形 ABCD 内有一点 P，PA = 1，PB = 2，PC = 3。求 ∠APB 的度数。' + FIG.ro_sqp,
          steps: [
            '思路：仿照等边三角形的做法，正方形的“旋转接口”是 90°：把 △ABP 绕点 B 旋转 90°，使 BA 与 BC 重合。',
            '设 △ABP 绕 B 旋转 90° 得到 △CBP′，则 BP′ = BP = 2，∠PBP′ = 90°，P′C = PA = 1，∠BP′C = ∠BPA。△PBP′ 是等腰直角三角形，PP′<sup>2</sup> = 2<sup>2</sup> + 2<sup>2</sup> = 8，∠BP′P = 45°。',
            '在 △PP′C 中，PP′<sup>2</sup> + P′C<sup>2</sup> = 8 + 1 = 9 = PC<sup>2</sup>，∴ ∠PP′C = 90°。',
            '∴ ∠APB = ∠BP′C = 45° + 90° = 135°。'
          ],
          ans: '∠APB = 135°'
        }
      ],
      quiz: [
        { type: 'choice', q: '△ABC 和 △ADE 都是等边三角形（顶点都按逆时针方向排列），有公共顶点 A，连接 BD、CE。下列三角形一定全等的是（　）。' + FIG.ro_hand, opts: ['△ABC 与 △ADE', '△ABE 与 △ACD', '△ABD 与 △ACE', '△BCD 与 △BED'], ans: 2, why: 'AB = AC，AD = AE，∠BAD = ∠CAE（∠BAC、∠DAE 都是 60°，各自加上或减去同一个 ∠CAD），所以 △ABD ≌ △ACE（SAS）。两个等边三角形大小不一定相同。' },
        { type: 'fill', q: '△ABC 和 △ADE 都是等边三角形（顶点都按逆时针方向排列），有公共顶点 A，连接 BD、CE，则直线 BD 与 CE 所夹的锐角是______°。' + FIG.ro_hand, ans: ['60'], why: '△ACE 是 △ABD 绕 A 旋转 60° 得到的，对应线段 BD、CE 的夹角等于旋转角 60°。' },
        { type: 'choice', q: '正方形 ABCD 与正方形 AEFG 有公共顶点 A（顶点都按逆时针方向排列），连接 BE、DG。BE 与 DG（　）。' + FIG.ro_handsq, opts: ['相等且互相垂直', '相等但不一定垂直', '垂直但不一定相等', '既不一定相等，也不一定垂直'], ans: 0, why: '△ADG 是 △ABE 绕 A 旋转 90° 得到的，△ABE ≌ △ADG，所以 BE = DG，且 BE 与 DG 的夹角等于旋转角 90°。' },
        { type: 'fill', q: '点 B 在线段 AC 上，AB = 3，BC = 5，在 AC 的同侧作等边三角形 ABD 和等边三角形 BCE，则 AE = ______。' + FIG.ro_line_n, ans: ['7'], why: '过 E 作 EH ⊥ AC 于 H，BH = 2.5，EH² = 25 − 6.25 = 18.75，AH = 3 + 2.5 = 5.5，AE² = 30.25 + 18.75 = 49，AE = 7。由手拉手，CD 也等于 7。' },
        { type: 'fill', q: '△ABC 和 △ADE 都是等腰直角三角形，∠BAC = ∠DAE = 90°，点 D 在边 BC 上，点 E 与点 C 在直线 AD 的同侧，BD = 3，CD = 4，则 DE = ______。' + FIG.ro_iso_q, ans: ['5'], why: '手拉手得 CE = BD = 3，且 CE ⊥ BC。在 Rt△DCE 中，DE = √(4² + 3²) = 5。' },
        { type: 'choice', q: '等边三角形 ABC 内有一点 P，把 △ABP 绕点 B 旋转 60° 得到 △CBP′。△BPP′ 一定是（　）。', opts: ['等腰直角三角形', '等边三角形', '直角三角形', '钝角三角形'], ans: 1, why: 'BP = BP′，∠PBP′ = 60°，有一个角是 60° 的等腰三角形是等边三角形。' },
        { type: 'fill', q: '等边三角形 ABC 内有一点 P，PA = 6，PB = 8，PC = 10，则 ∠APB = ______°。' + FIG.ro_eqp_q, ans: ['150'], why: '把 △ABP 绕 B 旋转 60° 得 △CBP′，PP′ = 8，P′C = 6，6² + 8² = 10²，∠PP′C = 90°，∠APB = ∠BP′C = 60° + 90° = 150°。' },
        { type: 'fill', q: '正方形 ABCD 内有一点 P，PA = 2，PB = 4，PC = 6，则 ∠APB = ______°。' + FIG.ro_sqp_q, ans: ['135'], why: '把 △ABP 绕 B 旋转 90° 得 △CBP′，PP′² = 16 + 16 = 32，P′C = 2，32 + 4 = 36 = PC²，∠PP′C = 90°，∠APB = ∠BP′C = 45° + 90° = 135°。' },
        { type: 'fill', q: '△ABC 中，∠BAC = 90°，AB = AC，点 D、E 在 BC 上（D 在 B、E 之间），∠DAE = 45°，BD = 6，DE = 10，则 CE = ______。' + FIG.ro_half, ans: ['8'], why: '半角模型：BD² + CE² = DE²，36 + CE² = 100，CE = 8。' },
        { type: 'choice', q: '△ABC 中，∠BAC = 90°，AB = AC，点 D、E 在 BC 上（D 在 B、E 之间），∠DAE = 45°。下列结论一定成立的是（　）。' + FIG.ro_half, opts: ['DE = BD + CE', 'BD² + CE² = DE²', 'BD = CE', 'DE² = 2BD · CE'], ans: 1, why: '旋转 △ABD 到 △ACF 后，∠ECF = 90°，EF = DE，所以 BD² + CE² = DE²。DE = BD + CE 是正方形半角模型的结论，不要混淆。' },
        { type: 'fill', q: '（挑战）△ABC 中，∠BAC = 90°，AB = AC，BC = 12，点 D、E 在 BC 上（D 在 B、E 之间），∠DAE = 45°，BD = 2，则 DE = ______。' + FIG.ro_half, ans: ['5.2', '26/5'], why: '设 DE = <i>x</i>，CE = 12 − 2 − <i>x</i> = 10 − <i>x</i>。由 BD² + CE² = DE²：4 + (10 − <i>x</i>)² = <i>x</i>²，104 − 20<i>x</i> = 0，<i>x</i> = 5.2。' }
      ]
    }
  });
})();
