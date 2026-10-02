import fs from 'fs';
import path from 'path';
import { Registration } from '../src/types/registration';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getAllSessions(): string[] {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(content) as string[];
  } catch (err) {
    console.error('Error reading sessions file:', err);
    return [];
  }
}

export function saveSession(token: string): void {
  try {
    const sessions = getAllSessions();
    if (!sessions.includes(token)) {
      sessions.push(token);
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error saving session:', err);
  }
}

export function isValidSession(token: string): boolean {
  if (!token) return false;
  const sessions = getAllSessions();
  return sessions.includes(token);
}

export function removeSession(token: string): void {
  try {
    const sessions = getAllSessions().filter(s => s !== token);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error removing session:', err);
  }
}

// Initial sample data if file doesn't exist to have a starting demonstration if needed, or initialize empty array
function getInitialData(): Registration[] {
  return [
    {
      id: 1001,
      country: "المملكة العربية السعودية",
      firstName: "محمد",
      fatherName: "عبدالله",
      lastName: "الغامدي",
      birthDay: "14",
      birthMonth: "05",
      birthYear: "1992",
      gender: "ذكر",
      nationality: "المملكة العربية السعودية",
      identityNumber: "1098765432",
      phone: "+966 55 123 4567",
      email: "m.alghamdi@example.com",
      city: "الرياض",
      address: "حي النرجس، شارع عثمان بن عفان",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "جديد"
    },
    {
      id: 1002,
      country: "الإمارات العربية المتحدة",
      firstName: "سارة",
      fatherName: "أحمد",
      lastName: "المنصوري",
      birthDay: "22",
      birthMonth: "09",
      birthYear: "1996",
      gender: "أنثى",
      nationality: "الإمارات العربية المتحدة",
      identityNumber: "784-1996-1234567-1",
      phone: "+971 50 987 6543",
      email: "sara.almansoori@example.com",
      city: "دبي",
      address: "البرشاء 2، شارع الشيخ زايد",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "جديد"
    }
  ];
}

export function getAllRegistrations(): Registration[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as Registration[];
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

export function saveRegistration(data: Omit<Registration, 'id' | 'createdAt' | 'status'>): Registration {
  const current = getAllRegistrations();
  const nextId = current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1001;
  const newRegistration: Registration = {
    ...data,
    id: nextId,
    createdAt: new Date().toISOString(),
    status: 'جديد'
  };

  current.unshift(newRegistration);
  fs.writeFileSync(DATA_FILE, JSON.stringify(current, null, 2), 'utf-8');
  return newRegistration;
}

export function deleteRegistration(id: number): boolean {
  const current = getAllRegistrations();
  const filtered = current.filter(r => r.id !== id);
  if (filtered.length === current.length) {
    return false;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
