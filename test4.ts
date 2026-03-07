async function test() {
  const variants = [
    'Ahmed_ibn_Ali_al-Ajamy_64kbps',
    'Ahmed_ibn_Ali_al-Ajamy_128kbps',
    'ahmed_ibn_ali_al_ajamy_128kbps',
    'Ahmed_ibn_Ali_al-Ajami_64kbps',
    'Ahmed_ibn_Ali_al-Ajami_128kbps'
  ];
  for (const v of variants) {
    const url = `https://everyayah.com/data/${v}/001002.mp3`;
    const res = await fetch(url, { method: 'HEAD' });
    console.log(v, res.status);
  }
}
test();
