const fetch = require('node-fetch');
async function test() {
  const res = await fetch('https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001002.mp3');
  console.log(res.status, res.headers.get('content-type'));
}
test();
