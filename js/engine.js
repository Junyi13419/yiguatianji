/* ===== 一卦天机 · 排盘引擎 =====
 * 基于 lunar-javascript（四柱、十神、藏干、纳音、大运、流年）
 * 附加：真太阳时校正、五行力量量化、旺衰格局简判、深度报告生成
 */
(function (global) {
  'use strict';

  /* ---------- 常量 ---------- */
  var WX_NAME = { 木: '木', 火: '火', 土: '土', 金: '金', 水: '水' };
  var WX_COLOR = { 木: 'wx-wood', 火: 'wx-fire', 土: 'wx-earth', 金: 'wx-metal', 水: 'wx-water' };
  var WX_FILL = { 木: 'wx-wood-fill', 火: 'wx-fire-fill', 土: 'wx-earth-fill', 金: 'wx-metal-fill', 水: 'wx-water-fill' };
  var GAN_WX = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  var ZHI_WX = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
  var ZHI_HIDE = {
    子: [['癸', 1.0]],
    丑: [['己', 0.6], ['癸', 0.2], ['辛', 0.2]],
    寅: [['甲', 0.6], ['丙', 0.3], ['戊', 0.1]],
    卯: [['乙', 1.0]],
    辰: [['戊', 0.6], ['乙', 0.2], ['癸', 0.2]],
    巳: [['丙', 0.6], ['庚', 0.2], ['戊', 0.2]],
    午: [['丁', 0.7], ['己', 0.3]],
    未: [['己', 0.6], ['丁', 0.2], ['乙', 0.2]],
    申: [['庚', 0.6], ['壬', 0.2], ['戊', 0.2]],
    酉: [['辛', 1.0]],
    戌: [['戊', 0.6], ['辛', 0.2], ['丁', 0.2]],
    亥: [['壬', 0.7], ['甲', 0.3]]
  };
  var SHEN_NAME = { 比肩: '比肩', 劫财: '劫财', 食神: '食神', 伤官: '伤官', 偏财: '偏财', 正财: '正财', 七杀: '七杀', 正官: '正官', 偏印: '偏印', 正印: '正印' };

  /* 全国城市经度（按省级行政区分组，覆盖全部地级行政区；
     自治州/盟/地区以州府驻地城市列示，城市值支持 [经度, 搜索别名] 形式 */
  var CITY_DATA = {
    '直辖市': {
      '北京': 116.40, '天津': 117.20, '上海': 121.47, '重庆': 106.55
    },
    '河北': {
      '石家庄': 114.50, '唐山': 118.18, '秦皇岛': 119.60, '邯郸': 114.53, '邢台': 114.47,
      '保定': 115.47, '张家口': 114.88, '承德': 117.96, '沧州': 116.84, '廊坊': 116.68, '衡水': 115.67
    },
    '山西': {
      '太原': 112.55, '大同': 113.29, '阳泉': 113.57, '长治': 113.12, '晋城': 112.85,
      '朔州': 112.43, '晋中': 112.75, '运城': 110.97, '忻州': 112.73, '临汾': 111.52, '吕梁': 111.13
    },
    '内蒙古': {
      '呼和浩特': 111.75, '包头': 109.84, '乌海': 106.74, '赤峰': 118.88, '通辽': 122.27,
      '鄂尔多斯': 109.99, '呼伦贝尔': 119.77, '巴彦淖尔': 107.39, '乌兰察布': 113.13,
      '乌兰浩特': [122.05, '兴安盟,兴安'], '锡林浩特': [116.09, '锡林郭勒盟,锡林郭勒'],
      '阿拉善左旗': [105.70, '阿拉善盟,阿拉善']
    },
    '辽宁': {
      '沈阳': 123.43, '大连': 121.62, '鞍山': 122.99, '抚顺': 123.96, '本溪': 123.77,
      '丹东': 124.36, '锦州': 121.12, '营口': 122.23, '阜新': 121.67, '辽阳': 123.18,
      '盘锦': 122.07, '铁岭': 123.84, '朝阳': 120.44, '葫芦岛': 120.87
    },
    '吉林': {
      '长春': 125.32, '吉林': 126.55, '四平': 124.37, '辽源': 125.14, '通化': 125.94,
      '白山': 126.42, '松原': 124.83, '白城': 122.84,
      '延吉': [129.51, '延边,延边州,延边朝鲜族自治州']
    },
    '黑龙江': {
      '哈尔滨': 126.63, '齐齐哈尔': 123.92, '鸡西': 130.97, '鹤岗': 130.30, '双鸭山': 131.17,
      '大庆': 125.03, '伊春': 128.88, '佳木斯': 130.32, '七台河': 130.99, '牡丹江': 129.63,
      '黑河': 127.53, '绥化': 126.68,
      '加格达奇': [124.71, '大兴安岭,大兴安岭地区']
    },
    '江苏': {
      '南京': 118.78, '无锡': 120.30, '徐州': 117.19, '常州': 119.97, '苏州': 120.62,
      '南通': 120.86, '连云港': 119.22, '淮安': 119.02, '盐城': 120.16, '扬州': 119.42,
      '镇江': 119.45, '泰州': 119.92, '宿迁': 118.28
    },
    '浙江': {
      '杭州': 120.15, '宁波': 121.55, '温州': 120.70, '嘉兴': 120.75, '湖州': 120.09,
      '绍兴': 120.58, '金华': 119.65, '衢州': 118.87, '舟山': 122.21, '台州': 121.43, '丽水': 119.92
    },
    '安徽': {
      '合肥': 117.22, '芜湖': 118.38, '蚌埠': 117.39, '淮南': 117.02, '马鞍山': 118.51,
      '淮北': 116.80, '铜陵': 117.82, '安庆': 117.06, '黄山': 118.31, '滁州': 118.32,
      '阜阳': 115.82, '宿州': 116.98, '六安': 116.51, '亳州': 115.78, '池州': 117.49, '宣城': 118.76
    },
    '福建': {
      '福州': 119.30, '厦门': 118.09, '莆田': 119.00, '三明': 117.64, '泉州': 118.58,
      '漳州': 117.65, '南平': 118.18, '龙岩': 117.02, '宁德': 119.55
    },
    '江西': {
      '南昌': 115.89, '景德镇': 117.28, '萍乡': 113.89, '九江': 116.00, '新余': 114.92,
      '鹰潭': 117.07, '赣州': 114.93, '吉安': 114.99, '宜春': 114.40, '抚州': 116.36, '上饶': 117.94
    },
    '山东': {
      '济南': 117.00, '青岛': 120.38, '淄博': 118.05, '枣庄': 117.27, '东营': 118.67,
      '烟台': 121.45, '潍坊': 119.10, '济宁': 116.59, '泰安': 117.09, '威海': 122.12,
      '日照': 119.52, '临沂': 118.35, '德州': 116.36, '聊城': 115.98, '滨州': 117.97, '菏泽': 115.47
    },
    '河南': {
      '郑州': 113.62, '开封': 114.31, '洛阳': 112.45, '平顶山': 113.22, '安阳': 114.39,
      '鹤壁': 114.30, '新乡': 113.93, '焦作': 113.24, '濮阳': 115.28, '许昌': 113.85,
      '漯河': 114.02, '三门峡': 111.19, '南阳': 112.53, '商丘': 115.66, '信阳': 114.09,
      '周口': 114.65, '驻马店': 114.02
    },
    '湖北': {
      '武汉': 114.31, '黄石': 115.04, '十堰': 110.80, '宜昌': 111.28, '襄阳': 112.14,
      '鄂州': 114.89, '荆门': 112.20, '孝感': 113.92, '荆州': 112.24, '黄冈': 114.87,
      '咸宁': 114.32, '随州': 113.38,
      '恩施': [109.49, '恩施州,恩施土家族苗族自治州']
    },
    '湖南': {
      '长沙': 112.94, '株洲': 113.13, '湘潭': 112.94, '衡阳': 112.57, '邵阳': 111.47,
      '岳阳': 113.13, '常德': 111.69, '张家界': 110.48, '益阳': 112.33, '郴州': 113.02,
      '永州': 111.60, '怀化': 109.98, '娄底': 112.00,
      '吉首': [109.74, '湘西,湘西州,湘西土家族苗族自治州']
    },
    '广东': {
      '广州': 113.26, '韶关': 113.60, '深圳': 114.06, '珠海': 113.58, '汕头': 116.68,
      '佛山': 113.12, '江门': 113.08, '湛江': 110.36, '茂名': 110.93, '肇庆': 112.47,
      '惠州': 114.41, '梅州': 116.12, '汕尾': 115.36, '河源': 114.70, '阳江': 111.98,
      '清远': 113.06, '东莞': 113.75, '中山': 113.39, '潮州': 116.63, '揭阳': 116.37, '云浮': 112.04,
      '英德': 113.69
    },
    '广西': {
      '南宁': 108.37, '柳州': 109.40, '桂林': 110.30, '梧州': 111.28, '北海': 109.12,
      '防城港': 108.35, '钦州': 108.62, '贵港': 109.60, '玉林': 110.15, '百色': 106.92,
      '贺州': 111.55, '河池': 108.06, '来宾': 109.23, '崇左': 107.36
    },
    '海南': {
      '海口': 110.35, '三亚': 109.51, '三沙': 112.33, '儋州': 109.58
    },
    '四川': {
      '成都': 104.07, '自贡': 104.78, '攀枝花': 101.72, '泸州': 105.44, '德阳': 104.39,
      '绵阳': 104.74, '广元': 105.84, '遂宁': 105.57, '内江': 105.06, '乐山': 103.77,
      '南充': 106.11, '眉山': 103.85, '宜宾': 104.63, '广安': 106.63, '达州': 107.50,
      '雅安': 103.00, '巴中': 107.87, '资阳': 104.63,
      '马尔康': [102.21, '阿坝,阿坝州,阿坝藏族羌族自治州'],
      '康定': [101.96, '甘孜,甘孜州,甘孜藏族自治州'],
      '西昌': [102.27, '凉山,凉山州,凉山彝族自治州']
    },
    '贵州': {
      '贵阳': 106.71, '六盘水': 104.83, '遵义': 106.93, '安顺': 105.95, '毕节': 105.28,
      '铜仁': 109.18,
      '兴义': [104.91, '黔西南,黔西南州,黔西南布依族苗族自治州'],
      '凯里': [107.98, '黔东南,黔东南州,黔东南苗族侗族自治州'],
      '都匀': [107.52, '黔南,黔南州,黔南布依族苗族自治州']
    },
    '云南': {
      '昆明': 102.72, '曲靖': 103.80, '玉溪': 102.55, '保山': 99.17, '昭通': 103.71,
      '丽江': 100.23, '普洱': 100.97, '临沧': 100.09,
      '楚雄': [101.55, '楚雄州,楚雄彝族自治州'],
      '蒙自': [103.38, '红河,红河州,红河哈尼族彝族自治州'],
      '文山': [104.25, '文山州,文山壮族苗族自治州'],
      '景洪': [100.80, '西双版纳,西双版纳州,西双版纳傣族自治州'],
      '大理': [100.26, '大理州,大理白族自治州'],
      '芒市': [98.58, '德宏,德宏州,德宏傣族景颇族自治州'],
      '泸水': [98.86, '怒江,怒江州,怒江傈僳族自治州'],
      '香格里拉': [99.71, '迪庆,迪庆州,迪庆藏族自治州']
    },
    '西藏': {
      '拉萨': 91.11, '日喀则': 88.88, '昌都': 97.18, '林芝': 94.36, '山南': 91.77,
      '那曲': 92.05,
      '噶尔': [80.10, '阿里,阿里地区']
    },
    '陕西': {
      '西安': 108.94, '铜川': 109.06, '宝鸡': 107.14, '咸阳': 108.71, '渭南': 109.50,
      '延安': 109.49, '汉中': 107.03, '榆林': 109.73, '安康': 109.03, '商洛': 109.94
    },
    '甘肃': {
      '兰州': 103.82, '嘉峪关': 98.29, '金昌': 102.19, '白银': 104.18, '天水': 105.72,
      '武威': 102.64, '张掖': 100.45, '平凉': 106.68, '酒泉': 98.51, '庆阳': 107.64,
      '定西': 104.63, '陇南': 104.92,
      '临夏': [103.21, '临夏州,临夏回族自治州'],
      '合作': [102.91, '甘南,甘南州,甘南藏族自治州']
    },
    '青海': {
      '西宁': 101.78, '海东': 102.10,
      '海晏': [100.90, '海北,海北州,海北藏族自治州'],
      '同仁': [102.00, '黄南,黄南州,黄南藏族自治州'],
      '共和': [100.62, '海南州,海南藏族自治州'],
      '玛沁': [100.24, '果洛,果洛州,果洛藏族自治州'],
      '玉树': [97.01, '玉树州,玉树藏族自治州'],
      '德令哈': [97.37, '海西,海西州,海西蒙古族藏族自治州']
    },
    '宁夏': {
      '银川': 106.27, '石嘴山': 106.38, '吴忠': 106.20, '固原': 106.28, '中卫': 105.19
    },
    '新疆': {
      '乌鲁木齐': 87.62, '克拉玛依': 84.87, '吐鲁番': 89.19, '哈密': 93.51,
      '昌吉': [87.31, '昌吉州,昌吉回族自治州'],
      '博乐': [82.05, '博州,博尔塔拉蒙古自治州'],
      '库尔勒': [86.15, '巴州,巴音郭楞蒙古自治州'],
      '阿克苏': [80.26, '阿克苏地区'],
      '阿图什': [76.17, '克州,克孜勒苏柯尔克孜自治州'],
      '喀什': [75.99, '喀什地区'],
      '和田': [79.92, '和田地区'],
      '伊宁': [81.33, '伊犁,伊犁州,伊犁哈萨克自治州'],
      '塔城': [82.99, '塔城地区'],
      '阿勒泰': [88.14, '阿勒泰地区']
    },
    '台湾': {
      '台北': 121.56, '新北': 121.48, '桃园': 121.30, '基隆': 121.75, '新竹': 120.96,
      '台中': 120.68, '嘉义': 120.28, '台南': 120.20, '高雄': 120.30, '屏东': 120.48,
      '花莲': 121.60, '台东': 121.14, '宜兰': 121.75,
      '马公': [119.57, '澎湖,澎湖县'],
      '金门': 118.32,
      '南竿': [119.95, '马祖,马祖列岛']
    },
    '香港': {
      '香港': 114.17
    },
    '澳门': {
      '澳门': 113.55
    }
  };

  /* 将分组数据派生为扁平映射与搜索索引 */
  function cityEntry(v) {
    if (Array.isArray(v)) return { lng: v[0], alias: v[1] || '' };
    return { lng: v, alias: '' };
  }
  var CITY_LONGITUDE = {};
  var CITY_SEARCH = [];
  Object.keys(CITY_DATA).forEach(function (province) {
    var map = CITY_DATA[province];
    Object.keys(map).forEach(function (city) {
      var e = cityEntry(map[city]);
      CITY_LONGITUDE[city] = e.lng;
      CITY_SEARCH.push({ city: city, province: province, lng: e.lng, alias: e.alias });
    });
  });

  /* ---------- 工具 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* 真太阳时校正：经度时差 + 均时差(EoT) */
  function trueSolarTime(year, month, day, hour, minute, longitude) {
    var dayOfYear = dayOfYearOf(year, month, day);
    var b = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
    var eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // 分钟
    var lonDiff = (longitude - 120) * 4; // 分钟
    var total = Math.round(lonDiff + eot);
    var totalMinutes = hour * 60 + minute + total;
    var days = Math.floor(totalMinutes / 1440);
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    // 日期回退/前进
    var d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    return {
      year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
      hour: h, minute: m,
      eot: eot, lonDiff: lonDiff, totalOffset: total
    };
  }

  function dayOfYearOf(year, month, day) {
    var d = new Date(year, month - 1, day);
    var start = new Date(year, 0, 1);
    return Math.floor((d - start) / 86400000) + 1;
  }

  /* ---------- 排盘 ---------- */
  function castChart(input) {
    // input: { year, month, day, hour, minute, gender, longitude }
    var tst = trueSolarTime(input.year, input.month, input.day, input.hour, input.minute, input.longitude);
    var date = new Date(tst.year, tst.month - 1, tst.day, tst.hour, tst.minute, 0);
    var lunar = Lunar.fromDate(date);
    var ec = lunar.getEightChar();

    var pillars = ['year', 'month', 'day', 'time'];
    var labels = { year: '年柱', month: '月柱', day: '日柱', time: '时柱' };
    var pillarData = {};
    var wxStrength = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

    pillars.forEach(function (key) {
      var gz = ec.getYear ? '' : '';
      var gan = ec[('get' + cap(key) + 'Gan')]();
      var zhi = ec[('get' + cap(key) + 'Zhi')]();
      var shiShenGan = ec[('get' + cap(key) + 'ShiShenGan')]();
      var shiShenZhi = ec[('get' + cap(key) + 'ShiShenZhi')]();
      var hideGan = ec[('get' + cap(key) + 'HideGan')]() || '';
      var naYin = ec[('get' + cap(key) + 'NaYin')]();
      var wuXing = ec[('get' + cap(key) + 'WuXing')]();
      var diShi = ec[('get' + cap(key) + 'DiShi')]();
      pillarData[key] = {
        label: labels[key], gan: gan, zhi: zhi, ganZhi: gan + zhi,
        shiShenGan: shiShenGan, shiShenZhi: shiShenZhi,
        hideGan: hideGan, naYin: naYin, wuXing: wuXing, diShi: diShi,
        ganWx: GAN_WX[gan], zhiWx: ZHI_WX[zhi]
      };
      // 五行力量：天干 1.0，地支本气 1.0 + 藏干加权
      wxStrength[GAN_WX[gan]] += 1.0;
      wxStrength[ZHI_WX[zhi]] += 1.0;
      var hide = ZHI_HIDE[zhi] || [];
      hide.forEach(function (h) {
        wxStrength[GAN_WX[h[0]]] += 0.35 * h[1];
      });
    });

    // 日主
    var dayGan = ec.getDayGan();
    var dayWx = GAN_WX[dayGan];
    var total = wxStrength.木 + wxStrength.火 + wxStrength.土 + wxStrength.金 + wxStrength.水;
    var wxPercent = {};
    Object.keys(wxStrength).forEach(function (k) { wxPercent[k] = wxPercent[k] || 0; wxPercent[k] = +(wxStrength[k] / total * 100).toFixed(1); });

    // 旺衰简判：日主 + 印（生我）为帮扶，其余为克泄耗
    var SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }; // 我生者（食伤）
    var KE = { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' }; // 克我者（官杀）
    var SHENG_ME = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }; // 生我者（印）
    var WU = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' }; // 我克者（财）
    var help = wxStrength[dayWx] + wxStrength[SHENG_ME[dayWx]];
    var drain = total - help;
    var ratio = +(help / total).toFixed(3);
    var strengthLabel, strengthDesc;
    if (ratio >= 0.62) { strengthLabel = '身强'; strengthDesc = '日主得令得地，帮扶之气充沛，宜泄宜克，取克泄耗为用。'; }
    else if (ratio <= 0.42) { strengthLabel = '身弱'; strengthDesc = '日主失令失地，克泄耗交加，宜扶宜帮，取印比为用。'; }
    else { strengthLabel = '中和'; strengthDesc = '日主帮扶与克泄耗大体均衡，用神随大运流年流转而动态取用。'; }

    // 格局简判（看月令）
    var monthZhi = pillarData.month.zhi;
    var monthWx = ZHI_WX[monthZhi];
    var relation = monthWx === dayWx ? '同我' :
      SHENG[dayWx] === monthWx ? '我生' :
      WU[dayWx] === monthWx ? '我克' :
      SHENG_ME[dayWx] === monthWx ? '生我' : '克我';
    var geMap = {
      '同我': { 建禄格: '月令与日主同气，得禄于月，根基深厚，自立之命。' },
      '我生': { 食神格: '月令食神吐秀，聪明有才华，宜以才华立身。', 伤官格: '月令伤官锋芒，创意与魄力兼具，宜专精一技。' },
      '我克': { 正财格: '月令正财当令，财源稳定，宜循正道经营积累。', 偏财格: '月令偏财当令，财路多元，宜把握机遇、灵活求财。' },
      '克我': { 正官格: '月令正官持重，自律有威，宜仕途或规范平台发展。', 七杀格: '月令七杀攻身，压力与动力并存，宜以印化、以刃驾。' },
      '生我': { 正印格: '月令正印护身，学识与贵人俱足，宜以专业与口碑立业。', 偏印格: '月令偏印独发，洞察独特，宜走专精冷门之路。' }
    };
    var geEntry = geMap[relation] || {};
    var geName = Object.keys(geEntry)[0] || '杂格';
    var geDesc2 = geEntry[geName] || '月令五行与日主关系驳杂，格局随大运取用而定。';

    // 用神提示
    var yongShen = [];
    var yongShenDesc = '';
    if (ratio >= 0.62) {
      // 身强：喜克泄耗
      yongShen.push(KE[dayWx] + '（官杀）');
      yongShen.push(SHENG[dayWx] + '（食伤）');
      // 财为耗
      yongShen.push(WU[dayWx] + '（财）');
      yongShenDesc = '身强宜泄：喜 ' + yongShen.join('、') + '，忌食印比再度生扶，以免过旺失衡。';
    } else if (ratio <= 0.42) {
      // 身弱：喜印比
      yongShen.push(SHENG_ME[dayWx] + '（印）');
      yongShen.push(dayWx + '（比劫）');
      yongShenDesc = '身弱宜扶：喜 ' + yongShen.join('、') + '，忌官杀克伐与食伤泄气，先固根本再求发展。';
    } else {
      yongShenDesc = '中和之局：用神随岁运流转，行帮身运则宜把握进取，行克泄运则宜守成蓄势，以动态取用为上。';
    }

    // 大运
    var yun = ec.getYun(input.gender === '女' ? 0 : 1);
    var startYear = yun.getStartYear();
    var startSolar = yun.getStartSolar();
    var daYunList = yun.getDaYun() || [];
    var daYun = daYunList.map(function (d, i) {
      return {
        index: i,
        ganZhi: d.getGanZhi(),
        startYear: d.getStartYear(),
        endYear: d.getEndYear(),
        startAge: d.getStartAge(),
        endAge: d.getEndAge(),
        ganWx: d.getGanZhi() ? GAN_WX[d.getGanZhi().charAt(0)] : '',
        zhiWx: d.getGanZhi() ? ZHI_WX[d.getGanZhi().charAt(1)] : ''
      };
    });

    return {
      input: input,
      tst: tst,
      solar: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: tst.hour, minute: tst.minute },
      lunarText: lunar.toString ? lunar.toString() : '',
      pillars: pillarData,
      dayGan: dayGan,
      dayWx: dayWx,
      wxStrength: wxStrength,
      wxPercent: wxPercent,
      help: +help.toFixed(2),
      drain: +drain.toFixed(2),
      ratio: ratio,
      strengthLabel: strengthLabel,
      strengthDesc: strengthDesc,
      pattern: geName,
      patternDesc: geDesc2,
      monthRelation: relation,
      yongShenDesc: yongShenDesc,
      yunStartYear: startYear,
      yunStartSolar: startSolar ? (startSolar.getYear() + '-' + pad(startSolar.getMonth()) + '-' + pad(startSolar.getDay())) : '',
      daYun: daYun,
      // 未来五年流年
      futureYears: []
    };
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* 流年干支（按公历年份干支纪年直接推算） */
  var GAN_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  function yearGanZhi(y) {
    return GAN_LIST[(y - 4) % 10] + ZHI_LIST[(y - 4) % 12];
  }

  /* 生成未来 N 年流年提示（当前年份起） */
  function buildFutureYears(chart, years) {
    var now = new Date().getFullYear();
    var arr = [];
    for (var i = 0; i < years; i++) {
      var y = now + i;
      var gz = yearGanZhi(y);
      // 简化：用流年干支的五行与日主关系
      var wx = gz.length === 2 ? (GAN_WX[gz.charAt(0)] || ZHI_WX[gz.charAt(1)]) : '';
      var rel = '';
      if (wx) {
        var SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
        var KE = { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' };
        var SHENG_ME = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' };
        if (wx === chart.dayWx) rel = '比劫帮身';
        else if (SHENG_ME[chart.dayWx] === wx) rel = '印星生身';
        else if (KE[chart.dayWx] === wx) rel = '官杀临身';
        else if (SHENG[chart.dayWx] === wx) rel = '食伤泄秀';
        else rel = '财星当值';
      }
      arr.push({ year: y, ganZhi: gz, wx: wx, relation: rel });
    }
    chart.futureYears = arr;
    return arr;
  }

  /* ---------- 免费报告（规则生成） ---------- */
  function buildFreeReport(chart) {
    var p = chart.pillars;
    var strongest = Object.keys(chart.wxStrength).sort(function (a, b) { return chart.wxStrength[b] - chart.wxStrength[a]; });
    var weakest = Object.keys(chart.wxStrength).sort(function (a, b) { return chart.wxStrength[a] - chart.wxStrength[b]; });

    var wxText = { 木: '仁义生长之气', 火: '光明礼赞之气', 土: '厚德载物之气', 金: '刚毅肃杀之气', 水: '智慧流转之气' };

    return {
      pillars: [
        { label: '年柱（祖上·根基）', text: p.year.ganZhi + ' · ' + p.year.naYin + '，十神见 ' + p.year.shiShenGan + '，观祖上根基与早年气象。' },
        { label: '月柱（父母·事业）', text: p.month.ganZhi + ' · ' + p.month.naYin + '，十神见 ' + p.month.shiShenGan + '，月令为命局之提纲，决定格局取向。' },
        { label: '日柱（日主·自身）', text: p.day.ganZhi + ' · ' + p.day.naYin + '，日干「' + chart.dayGan + '」为日主，乃命主自身之投影。' },
        { label: '时柱（子女·晚年）', text: p.time.ganZhi + ' · ' + p.time.naYin + '，十神见 ' + p.time.shiShenGan + '，观晚景与子女福泽。' }
      ],
      summary: [
        '日主「' + chart.dayGan + '」属' + chart.dayWx + '，命盘五行分布：' +
        strongest.map(function (k) { return k + ' ' + chart.wxPercent[k] + '%'; }).join('，') +
        '。' + wxText[strongest[0]] + '最旺，' + wxText[weakest[0]] + '最弱。',
        '旺衰判定：' + chart.strengthLabel + '（帮扶 ' + chart.help + ' / 克泄耗 ' + chart.drain + '，R 值 ' + chart.ratio + '）。' + chart.strengthDesc,
        '格局取向：' + chart.pattern + '。' + chart.patternDesc,
        '用神提示：' + chart.yongShenDesc
      ]
    };
  }

  /* ---------- 深度报告（四维 + 流年，规则生成） ---------- */
  function buildDeepReport(chart) {
    var p = chart.pillars;
    var SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
    var KE = { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' };
    var SHENG_ME = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' };
    var WU = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' }; // 我克=财
    var wx = chart.dayWx;
    var help = chart.ratio >= 0.62, weak = chart.ratio <= 0.42;

    var fortune, career, love, health;

    /* 财运：看财星（我克者）与食伤（生财者） */
    var caiWx = WU[wx], shiWx = SHENG[wx];
    fortune = '命局以「' + caiWx + '」为财星，「' + shiWx + '」为财源（食伤生财）。' +
      (chart.wxStrength[caiWx] >= chart.wxStrength[wx] * 0.8
        ? '财星力量充足，与日主力量相配，属「财有根、源有流」之象：正财可稳积，偏财可把握，宜以专业能力变现，不宜投机孤注。'
        : '财星力量偏弱或受克，需借大运流年引动财星方有进财之机：行财星旺地、食伤生财之岁运为求财窗口，日常宜稳中求进，忌盲目扩张。') +
      '财星所临十神位置决定财路形态：年柱财利祖业与异地之财，月柱财利职场与主业之财，时柱财利投资与晚景之财。';

    /* 事业：看官杀（克我者）与印星（生我者） */
    var guanWx = KE[wx], yinWx = SHENG_ME[wx];
    career = '命局以「' + guanWx + '」为官杀（事业与权柄），「' + yinWx + '」为印星（资历与护持）。' +
      (chart.wxStrength[guanWx] > 0 && chart.wxStrength[guanWx] >= 1.2
        ? '官杀有气，事业上具约束力与上进心，宜在规范平台、体制或大企业中循阶而上，或以专业资质立身，能扛责任、得权柄。'
        : '官杀不显或偏弱，事业宜走专长与自由之路：以印星为依托深耕一技，或以食伤才华立业，不必强求体制内之阶，行官杀旺运时为事业跃升期。') +
      (weak ? '身弱遇官杀攻身之运，事业宜守不宜攻，重在借印星化解、借比劫共担。' : '身强能任官杀，事业宜进取，敢担重任、善抓权柄。');

    /* 感情：看日支（夫妻宫）与配偶星（男看财、女看官） */
    var dayZhi = p.day.zhi;
    var spouseWx = '男命以「' + WU[wx] + '」为妻星，女命以「' + KE[wx] + '」为夫星';
    love = '夫妻宫坐「' + dayZhi + '」（' + ZHI_WX[dayZhi] + '），' + spouseWx + '。' +
      '日支与月支、时支之合冲刑害，决定婚姻之亲疏与聚散：合多主缘聚，冲多主聚少离多，刑害多主磨合波折。' +
      (chart.wxStrength[ZHI_WX[dayZhi]] > 1.2
        ? '夫妻宫五行偏旺，配偶气场强、有主见，婚姻需互相尊重、各守边界，方得长久。'
        : '夫妻宫五行偏弱，配偶需多顾念呵护，婚姻重在经营与沟通，忌冷战疏离。') +
      '大运冲合夫妻宫之岁运，为感情变化与婚姻应期之关键节点，宜提前洞察、顺势而为。';

    /* 健康：看五行偏枯与旺衰 */
    var over = Object.keys(chart.wxStrength).sort(function (a, b) { return chart.wxStrength[b] - chart.wxStrength[a]; })[0];
    var under = Object.keys(chart.wxStrength).sort(function (a, b) { return chart.wxStrength[a] - chart.wxStrength[b]; })[0];
    var wxOrgan = { 木: '肝胆、筋骨、眼目', 火: '心脑、血脉、小肠', 土: '脾胃、消化、肌肉', 金: '肺腑、呼吸、皮肤', 水: '肾膀胱、泌尿、耳齿' };
    health = '五行偏枯：' + over + '气最旺（' + chart.wxPercent[over] + '%），' + under + '气最弱（' + chart.wxPercent[under] + '%）。' +
      '对应脏腑需重点养护：' + wxOrgan[over] + '防过亢之耗，' + wxOrgan[under] + '防不足之亏。' +
      (help ? '身强之体，精力充沛但易过劳，忌熬夜透支，宜规律作息、以静养泄其旺气。' : '身弱之体，气血易亏，宜固本培元、避免过劳，行印比帮身运时体质转佳。');

    /* 未来五年流年 */
    var years = buildFutureYears(chart, 5);
    var yearTexts = years.map(function (f) {
      var tips = {
        '比劫帮身': '同行竞争与花费同增，宜守正合作、避免借贷担保，财宜聚不宜散。',
        '印星生身': '学习深造与贵人提携之运，宜考证进修、求助长辈，根基渐稳。',
        '官杀临身': '压力与责任并至，宜担责进取、谨言慎行，事业有进阶之机。',
        '食伤泄秀': '才华展现与创意迸发之运，宜输出成果、拓展人脉，财随名至。',
        '财星当值': '财机显现之运，宜把握正财、稳中求进，见好就收、忌贪多冒进。'
      };
      return { year: f.year, ganZhi: f.ganZhi, relation: f.relation, text: tips[f.relation] || '岁运流转，宜审时度势、顺势而为。' };
    });

    return { fortune: fortune, career: career, love: love, health: health, years: yearTexts };
  }

  /* ---------- AI 详批 prompt ---------- */
  function buildAiPrompt(chart, focus) {
    var p = chart.pillars;
    var pillarStr = ['年', '月', '日', '时'].map(function (k, i) {
      var c = p[['year', 'month', 'day', 'time'][i]];
      return c.label.replace('柱', '') + '柱 ' + c.ganZhi + '（十神：' + c.shiShenGan + '/' + c.shiShenZhi + '，纳音：' + c.naYin + '，藏干：' + c.hideGan + '）';
    }).join('；');
    var wxStr = Object.keys(chart.wxStrength).map(function (k) {
      return k + ' ' + chart.wxPercent[k] + '%';
    }).join('、');
    var focusMap = {
      fortune: '请重点推演【财运】：求财方向、财源形态、适合的求财路径与理财建议',
      career: '请重点推演【事业】：职业方向、发展路径、关键机遇与晋升节点',
      love: '请重点推演【感情婚姻】：婚姻走势、感情经营要点与关键应期',
      health: '请重点推演【健康】：体质特点、重点养护方向与养生建议',
      all: '请综合推演财运、事业、感情、健康四维的整体走势与建议'
    };
    var birthStr = chart.input.year + '年' + chart.input.month + '月' + chart.input.day + '日 ' + pad(chart.input.hour) + ':' + pad(chart.input.minute) +
      '（' + (chart.input.gender === '女' ? '女' : '男') + '命，出生地经度 ' + chart.input.longitude + '，已按真太阳时校正为 ' + pad(chart.solar.hour) + ':' + pad(chart.solar.minute) + '）';
    return '【命主信息】' + birthStr + '\n' +
      '【四柱命盘】' + pillarStr + '\n' +
      '【日主】' + chart.dayGan + '（' + chart.dayWx + '）\n' +
      '【五行力量】' + wxStr + '\n' +
      '【旺衰】' + chart.strengthLabel + '（帮扶 ' + chart.help + '，克泄耗 ' + chart.drain + '，R 值 ' + chart.ratio + '）\n' +
      '【格局】' + chart.pattern + '：' + chart.patternDesc + '\n' +
      '【用神】' + chart.yongShenDesc + '\n' +
      '【大运起运】' + chart.yunStartYear + '岁起运，' + chart.yunStartSolar + '前后\n' +
      '【任务】' + (focusMap[focus] || focusMap.all) +
      '。请以专业命理师的口吻，结合上述命盘信息输出 300-500 字的深度解析，先总论再分述，语言沉稳专业、言之有物，避免空话套话。';
  }

  /* ---------- 导出 ---------- */
  global.ChartEngine = {
    castChart: castChart,
    buildFreeReport: buildFreeReport,
    buildDeepReport: buildDeepReport,
    buildAiPrompt: buildAiPrompt,
    buildFutureYears: buildFutureYears,
    CITY_LONGITUDE: CITY_LONGITUDE,
    CITY_DATA: CITY_DATA,
    CITY_SEARCH: CITY_SEARCH,
    WX_COLOR: WX_COLOR,
    WX_FILL: WX_FILL,
    SHEN_NAME: SHEN_NAME
  };
})(window);
