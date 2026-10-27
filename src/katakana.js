import { groups as hiraganaGroups } from './data.js';
export const toKatakana = text => text.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
export const groups = Object.fromEntries(Object.entries(hiraganaGroups).map(([id,g])=>[id,{...g,rows:g.rows.map(row=>row.map(cell=>cell?toKatakana(cell):null))}]));
groups.extra.rows.push(['ー:-','ヴ:vu']);
groups.foreign = { label:'Âm mượn mở rộng', short:'Âm mượn', rows:[
 ['ファ:fa','フィ:fi','フェ:fe','フォ:fo','フュ:fyu'],
 ['ティ:thi','ディ:dhi','トゥ:twu','ドゥ:dwu','テュ:thu'],
 ['ウィ:wi','ウェ:we','ウォ:wo','シェ:she,sye','ジェ:je,jye,zye'],
 ['チェ:che,tye,cye','ツァ:tsa','ツィ:tsi','ツェ:tse','ツォ:tso'],
 ['ヴァ:va','ヴィ:vi','ヴェ:ve','ヴォ:vo','ヴュ:vyu']
]};
export const kana = Object.entries(groups).flatMap(([group,g])=>g.rows.flat().filter(Boolean).map(spec=>{const [key,reading]=spec.split(':');return {key,options:reading.split(','),group};}));
export const kanaMap=Object.fromEntries(kana.map(k=>[k.key,k]));
export const categories=[['all','Tất cả quy tắc'],['basic','Âm cơ bản'],['voiced','Đắc âm / bán đắc âm'],['combo','Ảo âm (âm ghép)'],['sokuon','Âm ngắt · ッ'],['long','Trường âm · ー'],['foreign','Âm mượn mở rộng'],['special','ン・ヂ・ヅ & chữ nhỏ']];
// Reading alternatives in words include phonetic transliterations as well as common IME keystrokes.
const phonetic={ティ:['ti'],ディ:['di'],トゥ:['tu'],ドゥ:['du'],テュ:['tyu']};
export function tokenize(text){
 const tokens=[];
 for(let i=0;i<text.length;){
  const key=kanaMap[text.slice(i,i+2)]?text.slice(i,i+2):text[i];i+=key.length;
  if(!kanaMap[key])throw Error(`Unknown Katakana: ${key}`);
  let options=[...kanaMap[key].options];
  if(key==='ッ'){
   const next=kanaMap[text.slice(i,i+2)]||kanaMap[text[i]];
   const doubled=(next?.options||[]).map(s=>s[0]);
   if(next?.options.some(s=>s.startsWith('ch')))doubled.push('t');
   options=[...new Set([...doubled,...options])];
  }else if(key==='ー'){
   const previous=tokens.at(-1);
   const vowel=previous?.options.flatMap(s=>s.match(/[aeiou](?!.*[aeiou])/g)||[])[0];
   options=vowel?[vowel,'-']:['-'];
  }else if(key==='ン'){
   options.push("n'");
   const next=kanaMap[text.slice(i,i+2)]||kanaMap[text[i]];
   if(!next||!next.options.some(s=>/^[aiueoy]/.test(s)))options.push('n');
  }else if(phonetic[key])options=[...phonetic[key],...options];
  tokens.push({key,options});
 }
 return tokens;
}
const words=[
 ['カメラ','Máy ảnh','basic'],['テレビ','Tivi','basic'],['ホテル','Khách sạn','basic'],['トイレ','Nhà vệ sinh','basic'],['タクシー','Taxi','long'],
 ['アメリカ','Nước Mỹ','basic'],['アイス','Kem / đá','basic'],['テニス','Quần vợt','basic'],['レモン','Quả chanh','basic'],['メモ','Ghi chú','basic'],
 ['バス','Xe buýt','voiced'],['ドア','Cửa','voiced'],['ピザ','Pizza','voiced'],['パン','Bánh mì','voiced'],['ズボン','Quần dài','voiced'],['ベッド','Giường','sokuon'],
 ['コップ','Cốc','sokuon'],['バッグ','Túi xách','sokuon'],['チケット','Vé','sokuon'],['サッカー','Bóng đá','sokuon'],['キッチン','Nhà bếp','sokuon'],['ロボット','Robot','sokuon'],
 ['シャツ','Áo sơ mi','combo'],['チョコ','Sô cô la','combo'],['キャベツ','Bắp cải','combo'],['ジャム','Mứt','combo'],['ニュース','Tin tức','combo'],['ジュース','Nước ép','combo'],['メニュー','Thực đơn','combo'],
 ['コーヒー','Cà phê','long'],['ケーキ','Bánh ngọt','long'],['スーパー','Siêu thị','long'],['ノート','Vở','long'],['スキー','Trượt tuyết','long'],
 ['スープ','Súp','long'],['チーズ','Phô mai','long'],['セーター','Áo len','long'],['コンピューター','Máy tính','long'],['エレベーター','Thang máy','long'],
 ['ソファ','Ghế sofa','foreign'],['フィルム','Phim chụp ảnh','foreign'],['カフェ','Quán cà phê','foreign'],['フォーク','Nĩa','foreign'],
 ['パーティー','Bữa tiệc','foreign'],['ディスク','Đĩa (luyện âm mượn)','foreign'],['ウィンナー','Xúc xích (luyện âm mượn)','foreign'],['シェフ','Đầu bếp (luyện âm mượn)','foreign'],['ヴァイオリン','Đàn violin (luyện âm mượn)','foreign'],
 ['ペン','Bút','special'],['リンゴ','Táo','special'],['インク','Mực','special'],['ハンカチ','Khăn tay','special'],['ボタン','Nút áo','special']
];
export const questions=words.map(([text,meaning,category])=>({id:`katakana-word-${text}`,text,meaning,category,tokens:tokenize(text)}));
for(const item of kana)questions.push({id:`kana-${item.key}`,text:item.key,meaning:`Luyện ký tự · ${groups[item.group].label}`,category:item.group==='extra'?'special':item.group,tokens:[{key:item.key,options:phonetic[item.key]?[...phonetic[item.key],...item.options]:item.options}]});
export const ruleTips={
 basic:'Katakana thường viết từ mượn, tên nước ngoài và từ tượng thanh. Ví dụ: カメラ → kamera, ホテル → hoteru. Chú ý シ/ツ và ソ/ン.',
 voiced:'Dấu ゛: カ → ガ, サ → ザ. Dấu ゜: ハ → パ. バ (ba) và パ (pa) khác nhau ở dấu nhỏ.',
 combo:'ャ・ュ・ョ nhỏ ghép với âm trước: キャ → kya, シュ → shu, チョ → cho. キヤ lớn đọc kiya, khác キャ.',
 sokuon:'ッ nhỏ nhân đôi phụ âm sau: コップ → koppu, ベッド → beddo. Cũng nhận xtsu / ltsu khi gõ riêng ッ.',
 long:'ー kéo dài nguyên âm trước đó: コーヒー → koohii, ケーキ → keeki. Cũng nhận dấu gạch nối theo bàn phím: ko-hi-, ke-ki. Không bỏ âm dài.',
 foreign:'Âm mượn dùng chữ nhỏ: ファ → fa, フィ → fi, シェ → she, チェ → che. ティ nhận ti / thi; ディ nhận di / dhi; トゥ nhận tu / twu. Các dạng mở rộng phục vụ từ mượn, không phải toàn bộ đều là từ vựng N5.',
 special:'ン nhận nn (hoặc n khi không gây nhầm trong từ). ヂ gõ di, ヅ gõ du để phân biệt ký tự. Với ー đứng riêng, gõ dấu -. Chữ nhỏ có thể gõ tiền tố x hoặc l.'
};
export const confusionPairs=[
 ['シ','ツ','shi / tsu','シ có hai nét nhỏ xếp theo chiều dọc; nét dài đi lên từ dưới trái. ツ có hai nét nhỏ xếp ngang; nét dài đi xuống từ phía trên.'],
 ['ソ','ン','so / nn','ソ có nét dài đi xuống; ン có nét dài hất lên từ dưới trái. So sánh cả hướng nét và vị trí điểm bắt đầu.'],
 ['ク','ケ','ku / ke','ク có hai nét chính; ケ có thêm nét ngang nối về bên phải.'],
 ['ヌ','ス','nu / su','ヌ có nét chéo cắt qua nét cong; ス có nét cuối kéo ra bên phải từ điểm giao.'],
 ['ワ','ウ','wa / u','ウ có thêm một nét ngắn trên đỉnh; ワ không có nét này.']
];
