export function calculateAge(dobString: string): { age: number; formattedDob: string; year: number; } | null {
  if (!dobString) return null;

  const trimmedDob = dobString.trim();
  let year, month, day;

  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(trimmedDob)) {
    [year, month, day] = trimmedDob.split(/[-/]/).map(Number);
  } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmedDob)) {
    [month, day, year] = trimmedDob.split(/[-/]/).map(Number);
  } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2}$/.test(trimmedDob)) {
    [month, day, year] = trimmedDob.split(/[-/]/).map(Number);
    const currentYearLastTwoDigits = new Date().getFullYear() % 100;
    year += year <= currentYearLastTwoDigits ? 2000 : 1900;
  } else {
    return null;
  }

  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const dob = new Date(year, month - 1, day);

  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    return null;
  }

  const today = new Date();
  if (dob > today) {
    return null; 
  }

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  const formattedDob = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;

  return { age, formattedDob, year };
}
