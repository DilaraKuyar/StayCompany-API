import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  
  stages: [
    { duration: '30s', target: 20 },  // Normal yük
    { duration: '30s', target: 50 },  // Peak (Tepe) yük
    { duration: '30s', target: 100 }, // Stress yükü
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
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
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}