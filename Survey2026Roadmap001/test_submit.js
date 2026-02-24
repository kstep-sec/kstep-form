const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
    'entry.1710385081': '테스트소속',
    'entry.1781201824': '홍길동',
    'entry.2017114296': 'test@example.com',
    'entry.1341068020': '표준 전문가 설문',
    'entry.361180820': '테스트표준',
    'entry.85574161': '테스트이유',
    'entry.1175071977': '테스트상세',
    'entry.1725683864': '테스트필요성',
    'entry.1624520949': 'KS 부합화(IDT)',
    'entry.1386415443': '1. 제조업 전반',
    'entry.1381958828': 'A. Digital Twin',
    'entry.1761286863': '아니요',
    'entry.681997926': '1. 국제표준(ISO, IEC, ...)',
    'entry.1333260810': '동의',
    'fvv': '1',
    'partialResponse': '[null,null,"1772425975303595355"]',
    'pageHistory': '0,1,2,3,4,5',
    'fbzx': '1772425975303595355',
    'submissionTimestamp': '-1'
});

const options = {
    hostname: 'docs.google.com',
    port: 443,
    path: '/forms/d/e/1FAIpQLSdkos2CPXY71VgVi54Gw45qmeneXGv46URgMGb2riWBFKvb-w/formResponse',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    }
};

const req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(postData);
req.end();
