const fetch = require('node-fetch');
async function test() {
  const url = `http://localhost:3000/api/proxy?url=${encodeURIComponent('https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001002.mp3')}`;
  console.log('Fetching', url);
  const res = await fetch(url);
  console.log(res.status, res.headers.get('content-type'));
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
