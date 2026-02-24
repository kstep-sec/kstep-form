const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
    'entry.1710385081': '테스트소속2',
    'entry.1781201824': '홍길동2',
    'entry.2017114296': 'test2@example.com',
    'entry.1341068020': '표준 전문가 설문',
    'entry.361180820': '테스트표준2',
    'entry.85574161': '테스트이유2',
    'entry.1175071977': '테스트상세2',
    'entry.1725683864': '테스트필요성2',
    'entry.1624520949': 'KS 부합화(IDT)',
    'entry.1386415443': '1. 제조업 전반',
    'entry.1381958828': 'A. Digital Twin',
    'entry.1761286863': '아니요',
    'entry.681997926': '1. 국제표준(ISO, IEC, ...)',
    'entry.1333260810': '동의',
    'entry.983265279': '__other_option__',
    'entry.983265279.other_option_response': '커스텀 텍스트 기관',
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
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
        if (body.includes("로드맵 수요조사 참여에 감사드립니다") || body.includes("응답이 기록되었습니다")) {
            console.log("SUCCESS");
        } else {
            console.log("FAILED to find success message in response.");
        }
    });
});
req.write(postData);
req.end();
