export const groups = {
  basic: { label: 'Âm cơ bản', short: 'Cơ bản', rows: [
    ['あ:a','い:i','う:u','え:e','お:o'], ['か:ka','き:ki','く:ku','け:ke','こ:ko'],
    ['さ:sa','し:shi,si','す:su','せ:se','そ:so'], ['た:ta','ち:chi,ti','つ:tsu,tu','て:te','と:to'],
    ['な:na','に:ni','ぬ:nu','ね:ne','の:no'], ['は:ha','ひ:hi','ふ:fu,hu','へ:he','ほ:ho'],
    ['ま:ma','み:mi','む:mu','め:me','も:mo'], ['や:ya',null,'ゆ:yu',null,'よ:yo'],
    ['ら:ra','り:ri','る:ru','れ:re','ろ:ro'], ['わ:wa',null,null,null,'を:wo'], ['ん:nn',null,null,null,null]
  ]},
  voiced: { label: 'Đắc âm & bán đắc âm', short: 'Biến âm', rows: [
    ['が:ga','ぎ:gi','ぐ:gu','げ:ge','ご:go'], ['ざ:za','じ:ji,zi','ず:zu','ぜ:ze','ぞ:zo'],
    ['だ:da','ぢ:di','づ:du','で:de','ど:do'], ['ば:ba','び:bi','ぶ:bu','べ:be','ぼ:bo'],
    ['ぱ:pa','ぴ:pi','ぷ:pu','ぺ:pe','ぽ:po']
  ]},
  combo: { label: 'Ảo âm · âm ghép', short: 'Âm ghép', rows: [
    ['きゃ:kya','きゅ:kyu','きょ:kyo'], ['しゃ:sha,sya','しゅ:shu,syu','しょ:sho,syo'],
    ['ちゃ:cha,tya,cya','ちゅ:chu,tyu,cyu','ちょ:cho,tyo,cyo'], ['にゃ:nya','にゅ:nyu','にょ:nyo'],
    ['ひゃ:hya','ひゅ:hyu','ひょ:hyo'], ['みゃ:mya','みゅ:myu','みょ:myo'], ['りゃ:rya','りゅ:ryu','りょ:ryo'],
    ['ぎゃ:gya','ぎゅ:gyu','ぎょ:gyo'], ['じゃ:ja,jya,zya','じゅ:ju,jyu,zyu','じょ:jo,jyo,zyo'],
    ['びゃ:bya','びゅ:byu','びょ:byo'], ['ぴゃ:pya','ぴゅ:pyu','ぴょ:pyo']
  ]},
  extra: { label: 'Âm đặc biệt & cách gõ', short: 'Đặc biệt', rows: [
    ['っ:xtsu,ltsu,xtu,ltu','ぢゃ:dya','ぢゅ:dyu','ぢょ:dyo'], ['ぁ:xa,la','ぃ:xi,li','ぅ:xu,lu','ぇ:xe,le','ぉ:xo,lo'], ['ゃ:xya,lya','ゅ:xyu,lyu','ょ:xyo,lyo']
  ]}
};
export const kana = Object.entries(groups).flatMap(([group, value]) => value.rows.flat().filter(Boolean).map(spec => {
  const [key, reading] = spec.split(':'); return { key, options: reading.split(','), group };
}));
export const kanaMap = Object.fromEntries(kana.map(item => [item.key, item]));
export const categories = [
  ['all','Tất cả quy tắc'], ['basic','Âm cơ bản'], ['voiced','Đắc âm / bán đắc âm'], ['combo','Ảo âm (âm ghép)'],
  ['sokuon','Âm ngắt · っ'], ['long','Trường âm'], ['particles','Trợ từ は・を・へ'], ['special','ん・ぢ・づ']
];
const raw = [
  ['さくら','Hoa anh đào','basic'], ['ねこ','Con mèo','basic'], ['いぬ','Con chó','basic'], ['すし','Sushi','basic'],
  ['あさ','Buổi sáng','basic'], ['いえ','Ngôi nhà','basic'], ['くるま','Xe ô tô','basic'], ['やま','Núi','basic'],
  ['そら','Bầu trời','basic'], ['ひと','Người','basic'], ['ふね','Thuyền','basic'], ['みせ','Cửa hàng','basic'],
  ['ほし','Ngôi sao','basic'], ['なつ','Mùa hè','basic'], ['はな','Hoa','basic'], ['とり','Chim','basic'],
  ['かぎ','Chìa khóa','voiced'], ['みず','Nước','voiced'], ['かぜ','Gió','voiced'], ['まど','Cửa sổ','voiced'],
  ['ぶた','Con lợn','voiced'], ['かべ','Bức tường','voiced'], ['ごご','Buổi chiều','voiced'], ['ちず','Bản đồ','voiced'],
  ['でぐち','Lối ra','voiced'], ['ばら','Hoa hồng','voiced'], ['えび','Tôm','voiced'], ['じかん','Thời gian','voiced'],
  ['おちゃ','Trà','combo'], ['しゃしん','Ảnh chụp','combo'], ['きゃく','Khách','combo'], ['ひゃく','Một trăm','combo'],
  ['じしょ','Từ điển','combo'], ['きょねん','Năm ngoái','combo'], ['りょこう','Du lịch','combo'], ['ぎゅうにゅう','Sữa bò','combo'],
  ['びょういん','Bệnh viện','combo'], ['べんきょう','Học tập','combo'], ['きゅう','Chín','combo'], ['じゅう','Mười','combo'],
  ['きっぷ','Vé','sokuon'], ['がっこう','Trường học','sokuon'], ['きって','Tem thư','sokuon'], ['ざっし','Tạp chí','sokuon'],
  ['こっぷ','Cốc (thường viết コップ)','sokuon'], ['ちょっと','Một chút','sokuon'], ['いっしょ','Cùng nhau','sokuon'], ['りっぱ','Tuyệt vời','sokuon'],
  ['とうさん','Bố (cách gọi thân mật)','long'], ['おおきい','To, lớn','long'], ['おかあさん','Mẹ','long'], ['おにいさん','Anh trai','long'],
  ['おねえさん','Chị gái','long'], ['せんせい','Giáo viên','long'], ['とけい','Đồng hồ','long'], ['くうこう','Sân bay','long'],
  ['こんにちは','Xin chào','particles',{4:['ha','wa']}], ['こんばんは','Chào buổi tối','particles',{4:['ha','wa']}],
  ['わたしは','Tôi thì… (は là trợ từ)','particles',{3:['ha','wa']}], ['ほんを','Sách + trợ từ を','particles',{2:['wo','o']}],
  ['がっこうへ','Đến trường (へ là trợ từ)','particles',{4:['he','e']}], ['みずを','Nước + trợ từ を','particles',{2:['wo','o']}],
  ['にほんへ','Đến Nhật Bản (へ là trợ từ)','particles',{3:['he','e']}],
  ['ほん','Sách','special'], ['にほん','Nhật Bản','special'], ['みんな','Mọi người','special'], ['おんな','Phụ nữ','special'],
  ['しんぶん','Báo','special'], ['でんわ','Điện thoại','special'], ['つづく','Tiếp tục','special'], ['ちぢむ','Co lại (luyện ぢ)','special'], ['はなぢ','Chảy máu mũi (luyện ぢ)','special']
];
export function tokenize(text, overrides = {}) {
  const tokens = [];
  for (let i = 0; i < text.length;) {
    let key = kanaMap[text.slice(i, i + 2)] ? text.slice(i, i + 2) : text[i];
    const start = i; i += key.length;
    if (key === 'っ') {
      const nextKey = kanaMap[text.slice(i, i + 2)] ? text.slice(i, i + 2) : text[i];
      const next = kanaMap[nextKey]?.options || [];
      const doubled = [...new Set(next.map(s => s[0]))];
      if (next.some(s => s.startsWith('ch'))) doubled.push('t');
      tokens.push({ key, options: [...doubled, ...kanaMap[key].options] });
    } else {
      let options = [...(overrides[start] || kanaMap[key].options)];
      if (key === 'ん') {
        options.push("n'");
        const next = text.slice(i); const nextKey = kanaMap[next.slice(0,2)] ? next.slice(0,2) : next[0];
        if (!nextKey || !kanaMap[nextKey]?.options.some(s => /^[aiueoy]/.test(s))) options.push('n');
      }
      tokens.push({ key, options });
    }
  }
  return tokens;
}
export const questions = raw.map(([text, meaning, category, overrides], i) => ({ id: `word-${i}`, text, meaning, category, tokens: tokenize(text, overrides) }));
// Individual sound cards ensure even rare combinations can be practised without teaching advanced words as N5 vocabulary.
for (const item of kana) {
  questions.push({ id: `kana-${item.key}`, text: item.key, meaning: `Luyện ký tự · ${groups[item.group].label}`, category: item.group === 'extra' ? 'special' : item.group, tokens: [{key:item.key, options:item.options}] });
}
export const ruleTips = {
  basic: 'Đọc từ trái sang phải. Ví dụ: さくら → sakura. し nhận shi hoặc si; ち nhận chi hoặc ti.',
  voiced: 'Dấu ゛ tạo đắc âm (か → が); dấu ゜ tạo bán đắc âm (は → ぱ). Chú ý phân biệt ba và pa.',
  combo: 'Chữ ゃ・ゅ・ょ nhỏ ghép với âm đứng trước: きゃ → kya, しゅ → shu, ちょ → cho.',
  sokuon: 'っ nhỏ nhân đôi phụ âm kế tiếp: きっぷ → kippu, がっこう → gakkou. Cũng nhận xtsu / ltsu để gõ っ riêng.',
  long: 'Giữ đủ nguyên âm theo chữ viết: とうさん → tousan, おおきい → ookii; せんせい → sensei, không phải sensē.',
  particles: 'Ở vị trí trợ từ, は đọc wa, へ đọc e, を đọc o. Bài luyện nhận cả cách gõ ha/he/wo và cách đọc wa/e/o.',
  special: 'Gõ nn cho ん là cách nhất quán, nhất là trước nguyên âm, y hoặc n. Gõ di cho ぢ và du cho づ để phân biệt chữ; đây không phải cách đọc Hepburn.'
};
