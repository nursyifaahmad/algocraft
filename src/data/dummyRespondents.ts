export interface RawRespondent {
  absentNo: number;
  name: string;
  ipo?: number;
  algo?: number;
  branch?: number;
  flowchart?: number;
  pseudo?: number;
  debug?: number;
}

export const DUMMY_RESPONDENTS: RawRespondent[] = [
  { absentNo: 1, name: "ADINDA PRABANDARI KINASIH", ipo: 3, algo: 3, branch: 3, flowchart: 3, pseudo: 3, debug: 3 },
  { absentNo: 2, name: "ALIFA MEYLANI SAFITRI", ipo: 4, algo: 3, branch: 4, flowchart: 1, pseudo: 4, debug: 4 },
  { absentNo: 3, name: "AMALIA NURFADILAH", ipo: 4, algo: 3, branch: 3, flowchart: 3, pseudo: 2, debug: 0 },
  { absentNo: 4, name: "ARIA KUSUMAH", ipo: 3, algo: 3, branch: 3, flowchart: 3, pseudo: 3, debug: 3 },
  { absentNo: 5, name: "AULIA KINASIH", ipo: 4, algo: 4, branch: 4, flowchart: 4, pseudo: 4, debug: 4 },
  { absentNo: 6, name: "BALQIS FANIDA SORAYA", ipo: 4, algo: 3, branch: 3, flowchart: 1, pseudo: 3, debug: 4 },
  { absentNo: 7, name: "CAHYA ISMAIL", ipo: 3, algo: 3, branch: 3, flowchart: 3, pseudo: 3, debug: 3 },
  { absentNo: 8, name: "CHIARA HASNA ZHAFIRA", ipo: 4, algo: 4, branch: 1, flowchart: 1, pseudo: 0, debug: 4 },
  { absentNo: 9, name: "DEVILIA AULIA PUTRI", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 4 },
  { absentNo: 10, name: "EGA YUDA NUGRAHA", ipo: 4, algo: 4, branch: 3, flowchart: 3, pseudo: 0, debug: 0 },
  { absentNo: 11, name: "ELMIRA ZAHIYA RUSDI", ipo: 4, algo: 2, branch: 4, flowchart: 4, pseudo: 0, debug: 0 },
  { absentNo: 12, name: "FAHRAN FATUROHMAN", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 0 },
  { absentNo: 13, name: "FAKHIRA SALWA NABILA", ipo: 4, algo: 3, branch: 4, flowchart: 4, pseudo: 4, debug: 0 },
  { absentNo: 14, name: "FATHIYYA AMEERA QUEENNARRA EDWARD", ipo: 3, algo: 3, branch: 4, flowchart: 3, pseudo: 0, debug: 0 },
  { absentNo: 15, name: "FAUZAN SYAWAL PRATAMA", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 4 },
  { absentNo: 16, name: "GHEA RAHMAYANI", ipo: 3, algo: 2, branch: 4, flowchart: 1, pseudo: 3, debug: 4 },
  { absentNo: 17, name: "INTANIA RAMADANIA", ipo: 4, algo: 4, branch: 4, flowchart: 2, pseudo: 1, debug: 1 },
  { absentNo: 18, name: "JAUZA HANA NABILA", ipo: 4, algo: 4, branch: 4, flowchart: 2, pseudo: 4, debug: 0 },
  { absentNo: 19, name: "KEYSHA NUR RAHAYU", ipo: 3, algo: 3, branch: 3, flowchart: 3, pseudo: 3, debug: 3 },
  { absentNo: 20, name: "MAHESYA LILY", ipo: 1, algo: 1, branch: 2, flowchart: 1, pseudo: 2, debug: 2 },
  { absentNo: 21, name: "MALVIN AKSATRYA DANISWARA KUSMANA", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 4 },
  { absentNo: 22, name: "MARWA NURHAA NAFIAH", ipo: 4, algo: 4, branch: 4, flowchart: 1, pseudo: 4, debug: 4 },
  { absentNo: 23, name: "MIKAIL AL KAUTSAR SIMA PAWITRA", ipo: 4, algo: 4, branch: 4, flowchart: 4, pseudo: 4, debug: 4 },
  { absentNo: 24, name: "MUHAMAD AGUNG RIVA RISQULOH", ipo: 4, algo: 3, branch: 3, flowchart: 1, pseudo: 4, debug: 3 },
  { absentNo: 25, name: "MUHAMAD FAJAR DWI PUTRA", ipo: 3, algo: 4, branch: 4, flowchart: 3, pseudo: 3, debug: 2 },
  { absentNo: 26, name: "MUHAMAD PAHMI PUTRA SANGGARA", ipo: 4, algo: 4, branch: 4, flowchart: 1, pseudo: 4, debug: 4 },
  { absentNo: 27, name: "MUHAMMAD AZRIL ILHAM", ipo: 4, algo: 4, branch: 4, flowchart: 1, pseudo: 4, debug: 4 },
  { absentNo: 28, name: "MUHAMMAD KAFI AL-FATIH", ipo: 4, algo: 4, branch: 4, flowchart: 4, pseudo: 4, debug: 4 },
  { absentNo: 29, name: "MUHAMMAD KARIZA AL FAKHRI" },
  { absentNo: 30, name: "MUHAMMAD MAHIN" },
  { absentNo: 31, name: "MUHAMMAD WILDAN FIRDAUS", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 0 },
  { absentNo: 32, name: "NAILA DZIKRIA AZMI", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 3, debug: 4 },
  { absentNo: 33, name: "NAJLA DWI MUSTIKA", ipo: 4, algo: 4, branch: 4, flowchart: 1, pseudo: 4, debug: 4 },
  { absentNo: 34, name: "NANDA FAUZIAH SULISTIO", ipo: 3, algo: 3, branch: 4, flowchart: 2, pseudo: 2, debug: 0 },
  { absentNo: 35, name: "NIZAM ALHABSI", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 4 },
  { absentNo: 36, name: "PASCALIA PUTRI ISMAYA", ipo: 4, algo: 4, branch: 4, flowchart: 4, pseudo: 3, debug: 4 },
  { absentNo: 37, name: "PUTRI AULIA", ipo: 4, algo: 3, branch: 4, flowchart: 1, pseudo: 3, debug: 4 },
  { absentNo: 38, name: "REDI RAHMANA", ipo: 4, algo: 4, branch: 4, flowchart: 2, pseudo: 0, debug: 0 },
  { absentNo: 39, name: "REYSHA PERMATA KASIH", ipo: 4, algo: 4, branch: 4, flowchart: 4, pseudo: 4, debug: 4 },
  { absentNo: 40, name: "SAKHA FAWWAZUL FIKRI", ipo: 4, algo: 4, branch: 4, flowchart: 3, pseudo: 2, debug: 2 },
  { absentNo: 41, name: "SYABIL FAUZAN ALTAAF", ipo: 4, algo: 4, branch: 4, flowchart: 2, pseudo: 2, debug: 2 },
  { absentNo: 42, name: "TIARA SILVIA", ipo: 3, algo: 4, branch: 4, flowchart: 3, pseudo: 4, debug: 4 },
  { absentNo: 43, name: "TRINANSYAH WIDYANA", ipo: 2, algo: 2, branch: 1, flowchart: 2, pseudo: 2, debug: 1 },
  { absentNo: 44, name: "WENDRIK ISMAIL", ipo: 3, algo: 3, branch: 3, flowchart: 3, pseudo: 3, debug: 3 },
  { absentNo: 45, name: "YUSUF NAUFAL HABIBI", ipo: 4, algo: 4, branch: 4, flowchart: 4, pseudo: 4, debug: 2 },
  { absentNo: 46, name: "ZAHIRA NAFISSA", ipo: 3, algo: 3, branch: 4, flowchart: 4, pseudo: 4, debug: 4 },
];
