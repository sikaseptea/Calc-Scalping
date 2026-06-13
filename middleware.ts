import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Contoh sederhana proteksi spam menggunakan Map (di server real, gunakan Redis)
const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  // Mengambil IP dari header atau fallback ke localhost
const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
    const count = rateLimitMap.get(ip) ?? 0;
    
    // Blokir jika lebih dari 5 request per menit (contoh)
    if (count > 5) {
      return new NextResponse('Terlalu banyak percobaan. Silahkan tunggu 1 menit.', { status: 429 });
    }
    
    rateLimitMap.set(ip, count + 1);
    setTimeout(() => rateLimitMap.delete(ip), 60000); // Reset setelah 1 menit
  }

  return NextResponse.next();
}