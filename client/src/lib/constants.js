export const SPORTS = ['cricket', 'football', 'pickleball', 'badminton'];

export const SPORT_META = {
  cricket: {
    label: 'Cricket',
    img: '/img/cricket.jpg',
    tagline: 'Maidans, nets & box cricket',
    defaultPlayers: 22,
  },
  football: {
    label: 'Football',
    img: '/img/football.jpg',
    tagline: '5-a-side turfs to full pitch',
    defaultPlayers: 14,
  },
  pickleball: {
    label: 'Pickleball',
    img: '/img/pickleball.jpg',
    tagline: "Mumbai's fastest growing sport",
    defaultPlayers: 4,
  },
  badminton: {
    label: 'Badminton',
    img: '/img/badminton.jpg',
    tagline: 'Indoor courts, singles & doubles',
    defaultPlayers: 4,
  },
};

// Well-known grounds & courts around the city, used as quick suggestions.
export const POPULAR_VENUES = [
  { name: 'Oval Maidan', area: 'Churchgate', sport: 'cricket' },
  { name: 'Shivaji Park', area: 'Dadar', sport: 'cricket' },
  { name: 'Azad Maidan', area: 'Fort', sport: 'cricket' },
  { name: 'Cooperage Football Ground', area: 'Colaba', sport: 'football' },
  { name: "Neville D'Souza Turf", area: 'Bandra', sport: 'football' },
  { name: 'Andheri Sports Complex', area: 'Andheri', sport: 'badminton' },
  { name: 'Matunga Gymkhana', area: 'Matunga', sport: 'badminton' },
  { name: 'CCI Courts', area: 'Churchgate', sport: 'pickleball' },
];

// Centre of each Mumbai-region locality as GeoJSON [longitude, latitude].
// This is the single source of truth: the area dropdown (MUMBAI_AREAS) is
// derived from these keys, so every selectable area has a map location.
export const AREA_COORDS = {
  // South Mumbai
  Colaba: [72.8146, 18.9067], 'Cuffe Parade': [72.8186, 18.9090], 'Nariman Point': [72.8230, 18.9256],
  Churchgate: [72.8270, 18.9322], Fort: [72.8360, 18.9340], 'Marine Lines': [72.8230, 18.9430],
  Girgaon: [72.8170, 18.9560], 'Charni Road': [72.8190, 18.9510], 'Grant Road': [72.8155, 18.9620],
  'Malabar Hill': [72.7950, 18.9540], 'Breach Candy': [72.8050, 18.9680], Tardeo: [72.8120, 18.9690],
  'Mumbai Central': [72.8210, 18.9710], Mahalaxmi: [72.8230, 18.9820], Byculla: [72.8330, 18.9760],
  Mazgaon: [72.8420, 18.9660], Worli: [72.8170, 19.0176], 'Lower Parel': [72.8300, 18.9960],
  Prabhadevi: [72.8270, 19.0150], Parel: [72.8390, 18.9990], Sewri: [72.8560, 18.9930],
  Wadala: [72.8620, 19.0170],
  // Central & Dadar
  Dadar: [72.8424, 19.0176], Matunga: [72.8500, 19.0270], Mahim: [72.8400, 19.0410], Sion: [72.8650, 19.0430],
  // Western suburbs
  Bandra: [72.8296, 19.0606], Khar: [72.8370, 19.0700], Santacruz: [72.8410, 19.0810],
  'Vile Parle': [72.8470, 19.0990], Juhu: [72.8265, 19.1075], Versova: [72.8120, 19.1330],
  Andheri: [72.8470, 19.1136], Jogeshwari: [72.8490, 19.1370], Goregaon: [72.8490, 19.1640],
  Malad: [72.8480, 19.1860], Kandivali: [72.8510, 19.2095], Borivali: [72.8567, 19.2307],
  Dahisar: [72.8600, 19.2540],
  // Eastern suburbs
  Chembur: [72.8990, 19.0522], Govandi: [72.9180, 19.0530], Mankhurd: [72.9300, 19.0500],
  Kurla: [72.8790, 19.0726], Ghatkopar: [72.9081, 19.0860], Vidyavihar: [72.8970, 19.0790],
  Vikhroli: [72.9260, 19.1090], Powai: [72.9050, 19.1176], Kanjurmarg: [72.9320, 19.1290],
  Bhandup: [72.9370, 19.1440], Mulund: [72.9560, 19.1720],
  // Navi Mumbai
  Vashi: [72.9986, 19.0760], Sanpada: [73.0110, 19.0640], Nerul: [73.0180, 19.0330],
  Seawoods: [73.0190, 19.0190], 'CBD Belapur': [73.0358, 19.0235], Kharghar: [73.0700, 19.0470],
  Panvel: [73.1100, 18.9890], 'Kopar Khairane': [73.0070, 19.1040], Ghansoli: [73.0010, 19.1230],
  Airoli: [72.9990, 19.1590],
  // Thane & extended suburbs
  Thane: [72.9781, 19.2183], Kalwa: [72.9920, 19.1930], Mumbra: [73.0230, 19.1880],
  Dombivli: [73.0870, 19.2150], Kalyan: [73.1300, 19.2400], 'Mira Road': [72.8710, 19.2810],
  Bhayandar: [72.8510, 19.3010], Vasai: [72.8260, 19.3910], Virar: [72.8120, 19.4550],
};

// Dropdown list — every area here is guaranteed to have coordinates above.
export const MUMBAI_AREAS = Object.keys(AREA_COORDS).sort((a, b) => a.localeCompare(b));

export const MUMBAI_CENTER = [72.8777, 19.0760]; // [lng, lat]

// "18:30" -> "6:30 PM" (falls back to the raw string for legacy data)
export const formatTime = (time) => {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return time;
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

export const formatDate = (date, opts) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', ...opts,
  });

// 0 / falsy -> "Free", otherwise "₹150 / head"
export const formatContribution = (amount) =>
  !amount || amount <= 0 ? 'Free' : `₹${amount} / head`;
