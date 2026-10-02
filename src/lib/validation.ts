export function validateDateOfBirth(day: string, month: string, year: string): string | null {
  if (!day || !month || !year) {
    return "يرجى تحديد اليوم والشهر والسنة بالكامل";
  }

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    return "تاريخ الميلاد غير صالح";
  }

  if (d < 1 || d > 31) {
    return "اليوم يجب أن يكون بين 1 و 31";
  }

  if (m < 1 || m > 12) {
    return "الشهر يجب أن يكون بين 1 و 12";
  }

  if (y < 1900) {
    return "السنة يجب أن تكون بعد عام 1900";
  }

  if (y > currentYear) {
    return "لا يمكن إدخال سنة في المستقبل";
  }

  // Check days per month
  const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const maxDaysPerMonth: { [key: number]: number } = {
    1: 31,
    2: isLeapYear ? 29 : 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
  };

  if (d > maxDaysPerMonth[m]) {
    return `الشهر المحدد يحتوي على ${maxDaysPerMonth[m]} يوماً كحد أقصى`;
  }

  // Check minimum age (e.g. at least 10 years old)
  const birthDate = new Date(y, m - 1, d);
  const today = new Date();
  if (birthDate > today) {
    return "تاريخ الميلاد لا يمكن أن يكون في المستقبل";
  }

  return null;
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "البريد الإلكتروني مطلوب";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "يرجى إدخال عنوان بريد إلكتروني صالح (مثال: name@example.com)";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) {
    return "رقم الهاتف مطلوب";
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) {
    return "يرجى إدخال رقم هاتف صحيح يشمل رمز الدولة";
  }
  return null;
}
