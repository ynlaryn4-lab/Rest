import { useState } from 'react';
import { COUNTRIES, Country } from '../lib/countries';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  selectedCountryName?: string;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  selectedCountryName,
  error
}: PhoneInputProps) {
  // Try to find the dial code from user's selected country
  const currentCountry = COUNTRIES.find(c => c.nameAr === selectedCountryName) || COUNTRIES[0];
  const [selectedDialCode, setSelectedDialCode] = useState(currentCountry.dialCode);
  const [isDialDropdownOpen, setIsDialDropdownOpen] = useState(false);

  // Extract phone number without the dial code if value has it
  const cleanNumber = value.startsWith('+') 
    ? value.replace(/^\+\d+\s*/, '')
    : value;

  const handleDialCodeSelect = (country: Country) => {
    setSelectedDialCode(country.dialCode);
    setIsDialDropdownOpen(false);
    onChange(`${country.dialCode} ${cleanNumber}`.trim());
  };

  const handleNumberChange = (raw: string) => {
    // Keep numbers, spaces, and hyphens
    const filtered = raw.replace(/[^\d\s-]/g, '');
    onChange(`${selectedDialCode} ${filtered}`.trim());
  };

  return (
    <div className="w-full text-right">
      <label className="block text-sm font-medium text-[#d7ae55] mb-2">
        رقم الهاتف <span className="text-red-400">*</span>
      </label>

      <div className={`relative flex items-center rounded-xl bg-[#171716] border transition-all duration-200 ${
        error
          ? "border-red-500/70 ring-1 ring-red-500/30"
          : "border-white/10 focus-within:border-[#d7ae55] focus-within:ring-2 focus-within:ring-[#d7ae55]/20"
      }`}>
        {/* Country Dial Code Selector */}
        <div className="relative border-l border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setIsDialDropdownOpen(!isDialDropdownOpen)}
            className="flex items-center gap-2 px-3 py-3 text-sm text-[#f6f2ea] hover:bg-white/5 transition-colors rounded-r-xl"
          >
            <span className="font-latin text-xs text-[#d7ae55] font-semibold">{selectedDialCode}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9f9a90] transition-transform ${isDialDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDialDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 max-h-56 overflow-y-auto bg-[#181817] border border-[#d7ae55]/30 rounded-xl shadow-2xl z-50 divide-y divide-white/5">
              {COUNTRIES.map(c => (
                <button
                  key={c.code + c.dialCode}
                  type="button"
                  onClick={() => handleDialCodeSelect(c)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-right text-[#f6f2ea] hover:bg-white/5 transition-colors"
                >
                  <span className="truncate">{c.nameAr}</span>
                  <span className="font-latin text-[#d7ae55] font-mono mr-2">{c.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number Input */}
        <input
          type="tel"
          dir="ltr"
          value={cleanNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="5X XXX XXXX"
          className="w-full px-4 py-3 bg-transparent text-[#f6f2ea] placeholder-[#9f9a90] text-sm focus:outline-none font-latin tracking-wide text-left"
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-[#9f9a90]">
          مثال: +966 5X XXX XXXX (يرجى إدخال رقم هاتف فعال مع واتساب)
        </p>
      )}
    </div>
  );
}
