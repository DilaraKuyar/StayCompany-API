import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
  ],
};

export default function () {
  // 1. ADIM: Swagger'daki /login'den aldığın o uzun Token'ı buraya yapıştır
  const myToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; 

  const params = {
    headers: {
      'Authorization': `Bearer ${myToken}`, // Kapıyı bu anahtar açacak
    },
  };

  // 2. ADIM: İlanları aradığımız endpoint'e bu anahtarla git
  const res = http.get('http://44.200.13.208:3000/api/v1/listings', params);
  
  // 3. ADIM: Şimdi kontrol et, hepsi yeşil olacak!
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
  
  sleep(1);
}