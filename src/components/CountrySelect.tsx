import { useState, useRef, useEffect } from 'react';
import { COUNTRIES, Country } from '../lib/countries';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string, country?: Country) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "اكتب اسم الدولة للبحث...",
  label = "الدولة",
  error
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Selected country object
  const selectedCountry = COUNTRIES.find(c => c.nameAr === value || c.nameEn.toLowerCase() === value.toLowerCase());

  // Filter countries by Arabic or English name
  const filteredCountries = COUNTRIES.filter(country => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return country.nameAr.toLowerCase().includes(q) || country.nameEn.toLowerCase().includes(q);
  });

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country.nameAr, country);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full text-right" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-[#d7ae55] mb-2">
          {label} <span className="text-red-400">*</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#171716] border transition-all duration-200 text-right ${
          error
            ? "border-red-500/70 focus:ring-1 focus:ring-red-500"
            : isOpen
            ? "border-[#d7ae55] ring-2 ring-[#d7ae55]/20 shadow-lg"
            : "border-white/10 hover:border-[#d7ae55]/50"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedCountry ? (
            <>
              <span className="text-2xl leading-none">{selectedCountry.flag}</span>
              <span className="text-[#f6f2ea] font-medium truncate">{selectedCountry.nameAr}</span>
              <span className="text-xs text-[#9f9a90] font-latin">({selectedCountry.nameEn})</span>
            </>
          ) : (
            <span className="text-[#9f9a90] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#d7ae55]/70" />
              <span>{placeholder}</span>
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#9f9a90] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#d7ae55]" : ""
          }`}
        />
      </button>

      {/* Error Message */}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-[#141413] border border-[#d7ae55]/30 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-3 border-b border-white/10 bg-[#191918]">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اكتب اسم الدولة للبحث..."
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-[#0e0e0d] border border-white/10 text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55]"
              />
              <Search className="w-4 h-4 text-[#d7ae55] absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Results Count */}
            <div className="mt-2 flex items-center justify-between text-xs text-[#9f9a90] px-1">
              <span>عرض {filteredCountries.length} من أصل {COUNTRIES.length} دولة</span>
              <span className="text-[11px] text-[#d7ae55]/80">تشمل جميع دول العالم</span>
            </div>
          </div>

          {/* List Options */}
          <div className="max-h-64 overflow-y-auto divide-y divide-white/5 py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.nameAr === value;
                return (
                  <button
                    key={country.code + country.nameEn}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-right ${
                      isSelected
                        ? "bg-[#d7ae55]/15 text-[#f0cc77] font-semibold"
                        : "text-[#f6f2ea] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">{country.flag}</span>
                      <div>
                        <div className="font-medium text-[#f6f2ea]">{country.nameAr}</div>
                        <div className="text-[11px] text-[#9f9a90] font-latin">{country.nameEn}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-latin text-[#9f9a90] dir-ltr">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#d7ae55]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-[#9f9a90]">
                لم يتم العثور على أي دولة مطابقة للبحث
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
