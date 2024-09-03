// Mock data for countries, states, and cities
const countries = [
  { label: "Malaysia", value: "malaysia" },
  { label: "Singapore", value: "singapore" },
];

const states = {
  malaysia: [
    { label: "Johor", value: "johor" },
    { label: "Kedah", value: "kedah" },
    { label: "Kelantan", value: "kelantan" },
    { label: "Kuala Lumpur", value: "kuala_lumpur" },
    { label: "Labuan", value: "labuan" },
    { label: "Malacca", value: "malacca" },
    { label: "Negeri Sembilan", value: "negeri_sembilan" },
    { label: "Pahang", value: "pahang" },
    { label: "Penang", value: "penang" },
    { label: "Perak", value: "perak" },
    { label: "Perlis", value: "perlis" },
    { label: "Putrajaya", value: "putrajaya" },
    { label: "Sabah", value: "sabah" },
    { label: "Sarawak", value: "sarawak" },
    { label: "Selangor", value: "selangor" },
    { label: "Terengganu", value: "terengganu" },
  ],
  singapore: [
    { label: "Central Region", value: "central" },
    { label: "East Region", value: "east" },
    { label: "North Region", value: "north" },
    { label: "North-East Region", value: "north_east" },
    { label: "West Region", value: "west" },
  ],
};

const cities = {
  johor: [
    { label: "Johor Bahru", value: "johor_bahru" },
    { label: "Iskandar Puteri", value: "iskandar_puteri" },
    { label: "Batu Pahat", value: "batu_pahat" },
    { label: "Muar", value: "muar" },
    { label: "Kluang", value: "kluang" },
  ],
  kedah: [
    { label: "Alor Setar", value: "alor_setar" },
    { label: "Sungai Petani", value: "sungai_petani" },
    { label: "Kulim", value: "kulim" },
    { label: "Langkawi", value: "langkawi" },
  ],
  kelantan: [
    { label: "Kota Bharu", value: "kota_bharu" },
    { label: "Pasir Mas", value: "pasir_mas" },
    { label: "Tanah Merah", value: "tanah_merah" },
  ],
  kuala_lumpur: [{ label: "Kuala Lumpur", value: "kuala_lumpur" }],
  labuan: [{ label: "Victoria", value: "victoria" }],
  malacca: [
    { label: "Malacca City", value: "malacca_city" },
    { label: "Alor Gajah", value: "alor_gajah" },
    { label: "Jasin", value: "jasin" },
  ],
  negeri_sembilan: [
    { label: "Seremban", value: "seremban" },
    { label: "Port Dickson", value: "port_dickson" },
    { label: "Nilai", value: "nilai" },
  ],
  pahang: [
    { label: "Kuantan", value: "kuantan" },
    { label: "Temerloh", value: "temerloh" },
    { label: "Bentong", value: "bentong" },
  ],
  penang: [
    { label: "George Town", value: "george_town" },
    { label: "Butterworth", value: "butterworth" },
    { label: "Bukit Mertajam", value: "bukit_mertajam" },
  ],
  perak: [
    { label: "Ipoh", value: "ipoh" },
    { label: "Taiping", value: "taiping" },
    { label: "Teluk Intan", value: "teluk_intan" },
  ],
  perlis: [{ label: "Kangar", value: "kangar" }],
  putrajaya: [{ label: "Putrajaya", value: "putrajaya" }],
  sabah: [
    { label: "Kota Kinabalu", value: "kota_kinabalu" },
    { label: "Sandakan", value: "sandakan" },
    { label: "Tawau", value: "tawau" },
  ],
  sarawak: [
    { label: "Kuching", value: "kuching" },
    { label: "Miri", value: "miri" },
    { label: "Sibu", value: "sibu" },
  ],
  selangor: [
    { label: "Shah Alam", value: "shah_alam" },
    { label: "Petaling Jaya", value: "petaling_jaya" },
    { label: "Subang Jaya", value: "subang_jaya" },
    { label: "Klang", value: "klang" },
  ],
  terengganu: [
    { label: "Kuala Terengganu", value: "kuala_terengganu" },
    { label: "Kemaman", value: "kemaman" },
  ],
  central: [
    { label: "Orchard", value: "orchard" },
    { label: "Downtown Core", value: "downtown_core" },
    { label: "Novena", value: "novena" },
  ],
  east: [
    { label: "Changi", value: "changi" },
    { label: "Bedok", value: "bedok" },
    { label: "Tampines", value: "tampines" },
  ],
  north: [
    { label: "Woodlands", value: "woodlands" },
    { label: "Yishun", value: "yishun" },
    { label: "Sembawang", value: "sembawang" },
  ],
  north_east: [
    { label: "Sengkang", value: "sengkang" },
    { label: "Punggol", value: "punggol" },
    { label: "Hougang", value: "hougang" },
  ],
  west: [
    { label: "Jurong East", value: "jurong_east" },
    { label: "Choa Chu Kang", value: "choa_chu_kang" },
    { label: "Bukit Batok", value: "bukit_batok" },
  ],
};

export { countries, states, cities };
