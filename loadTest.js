import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 100, // 1. Senaryo: Normal Load (20 Kullanıcı)
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/listings?country=Turkey&city=Izmir&no_of_people=2');
  
  // Hocanın istediği "Hata Oranını (Error Rate)" ölçmek için:
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
  
  sleep(1);
}