interface BirthDatePickerProps {
  day: string;
  month: string;
  year: string;
  onChange: (field: 'birthDay' | 'birthMonth' | 'birthYear', value: string) => void;
  error?: string;
}

export function BirthDatePicker({
  day,
  month,
  year,
  onChange,
  error
}: BirthDatePickerProps) {
  const currentYear = new Date().getFullYear();

  // Days list 1 to 31
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  
  // Months list
  const months = [
    { value: "01", name: "01 - يناير" },
    { value: "02", name: "02 - فبراير" },
    { value: "03", name: "03 - مارس" },
    { value: "04", name: "04 - أبريل" },
    { value: "05", name: "05 - مايو" },
    { value: "06", name: "06 - يونيو" },
    { value: "07", name: "07 - يوليو" },
    { value: "08", name: "08 - أغسطس" },
    { value: "09", name: "09 - سبتمبر" },
    { value: "10", name: "10 - أكتوبر" },
    { value: "11", name: "11 - نوفمبر" },
    { value: "12", name: "12 - ديسمبر" },
  ];

  // Years list from currentYear down to 1920
  const years = Array.from(
    { length: currentYear - 1920 + 1 },
    (_, i) => String(currentYear - i)
  );

  return (
    <div className="w-full text-right">
      <div className="grid grid-cols-3 gap-3">
        {/* Day */}
        <div>
          <label className="block text-xs font-medium text-[#d7ae55] mb-1.5">
            اليوم <span className="text-red-400">*</span>
          </label>
          <select
            value={day}
            onChange={(e) => onChange('birthDay', e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-[#171716] border border-white/10 text-sm text-[#f6f2ea] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55] font-latin"
          >
            <option value="">اليوم</option>
            {days.map((d) => (
              <option key={d} value={d} className="bg-[#171716] text-[#f6f2ea]">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-xs font-medium text-[#d7ae55] mb-1.5">
            الشهر <span className="text-red-400">*</span>
          </label>
          <select
            value={month}
            onChange={(e) => onChange('birthMonth', e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-[#171716] border border-white/10 text-sm text-[#f6f2ea] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55]"
          >
            <option value="">الشهر</option>
            {months.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#171716] text-[#f6f2ea]">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-medium text-[#d7ae55] mb-1.5">
            السنة <span className="text-red-400">*</span>
          </label>
          <select
            value={year}
            onChange={(e) => onChange('birthYear', e.target.value)}
            className="w-full px-3 py-3 rounded-xl bg-[#171716] border border-white/10 text-sm text-[#f6f2ea] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55] font-latin"
          >
            <option value="">السنة</option>
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#171716] text-[#f6f2ea]">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-[#9f9a90]">
          يجب أن يكون التاريخ صحيحاً ومطابقاً للوثائق الرسمية
        </p>
      )}
    </div>
  );
}
