import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';

interface ComboboxWithAddProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const ComboboxWithAdd: React.FC<ComboboxWithAddProps> = ({
  label,
  options: initialOptions,
  value,
  onChange,
  placeholder = 'Select or type...',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal input value with external value if it changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // On close, if they typed something but didn't click add, just set it as the value anyway
        if (inputValue && inputValue !== value) {
            onChange(inputValue);
            if (!options.includes(inputValue)) {
                setOptions(prev => [...prev, inputValue]);
            }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, value, onChange, options]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const isExactMatch = options.some(opt => opt.toLowerCase() === inputValue.toLowerCase());

  const handleSelectOption = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
  };

  const handleAddOption = () => {
    if (inputValue.trim() && !isExactMatch) {
      setOptions([...options, inputValue.trim()]);
      onChange(inputValue.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-on-surface-variant block mb-1 font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          required={required}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            onChange(e.target.value); // Optimistically update parent
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-2 pr-8 border border-outline-variant rounded-xl font-bold bg-surface-container-low focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-outline"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-container border border-surface-container-high border border-surface-container-highest rounded-xl border border-outline-variant max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((opt, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between hover:bg-surface-container-lowest ${
                    value === opt ? 'bg-primary-container text-on-primary-container text-blue-700 font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  {opt}
                  {value === opt && <Check className="w-4 h-4" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-outline-variant italic">No matches found.</div>
          )}

          {/* Add Option Button */}
          {inputValue.trim() && !isExactMatch && (
            <div className="border-t border-slate-100 p-1">
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full px-2 py-2 text-sm font-bold text-primary bg-primary-container text-on-primary-container hover:bg-blue-100 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add "{inputValue}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
