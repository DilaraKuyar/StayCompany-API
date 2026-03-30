import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Hocanın istediği 3 farklı yük senaryosu
  stages: [
    { duration: '30s', target: 20 },  // Normal yük
    { duration: '30s', target: 50 },  // Peak (Tepe) yük
    { duration: '30s', target: 100 }, // Stress yükü
  ],
  thresholds: {
    // Hocanın raporunda görmek istediği metrikler
    http_req_duration: ['p(95)<500'], // İsteklerin %95'i 500ms altında yanıt vermeli
  },
};

export default function () {
  const url = 'http://44.200.13.208:3000/api-docs/';

  const params = {
    headers: {
      'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url, params);

  // Dönen cevabın 200 (Başarılı) olduğunu kontrol et
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Her sanal kullanıcının bir sonraki isteği atmadan önce 1 saniye beklemesi
  sleep(1);
}