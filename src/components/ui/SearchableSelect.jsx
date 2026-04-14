import React from 'react';
import Select from 'react-select';
import { useFormContext, Controller } from 'react-hook-form';

const SearchableSelect = ({ 
    name, 
    options, 
    label, 
    error, 
    placeholder = "തിരഞ്ഞെടുക്കുക (Select...)", 
    required = false,
    icon: Icon,
    ...props 
}) => {
    const { control } = useFormContext();

    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'transparent',
            borderColor: error ? '#ef4444' : (state.isFocused ? '#0B65F6' : 'transparent'),
            borderRadius: '0.75rem',
            paddingLeft: Icon ? '2.5rem' : '0.5rem',
            paddingTop: '0.125rem',
            paddingBottom: '0.125rem',
            fontSize: '0.75rem',
            boxShadow: state.isFocused ? '0 0 0 1px #0B65F6' : 'none',
            '&:hover': {
                borderColor: error ? '#ef4444' : '#0B65F6',
            },
            transition: 'all 0.2s ease',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
        }),
        option: (base, state) => ({
            ...base,
            fontSize: '0.75rem',
            backgroundColor: state.isSelected ? '#0B65F6' : (state.isFocused ? '#f3f4f6' : 'transparent'),
            color: state.isSelected ? '#ffffff' : '#374151',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#0B65F6',
                color: '#ffffff',
            },
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'inherit',
        }),
        input: (base) => ({
            ...base,
            color: 'inherit',
        }),
    };

    // Dark mode styles handled via container class or global css if possible, 
    // but react-select styles are JS-in-JS. We can use a trick to check for dark mode class.
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (isDarkMode) {
        customStyles.menu = (base) => ({
            ...base,
            backgroundColor: '#1e1f25',
            borderColor: '#1f2937',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        });
        customStyles.option = (base, state) => ({
            ...base,
            fontSize: '0.75rem',
            backgroundColor: state.isSelected ? '#0B65F6' : (state.isFocused ? '#374151' : 'transparent'),
            color: state.isSelected ? '#ffffff' : '#d1d5db',
            cursor: 'pointer',
        });
    }

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-gray-400">
                        <Icon size={18} />
                    </div>
                )}
                <div className={`bg-gray-50 dark:bg-[#16171d] border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} rounded-xl text-gray-900 dark:text-white`}>
                    <Controller
                        name={name}
                        control={control}
                        rules={required ? { required: `${label || name} is required` } : {}}
                        render={({ field }) => (
                            <Select
                                {...field}
                                {...props}
                                options={options}
                                placeholder={placeholder}
                                styles={customStyles}
                                classNamePrefix="react-select"
                                value={options.find(option => option.value === field.value)}
                                onChange={(option) => field.onChange(option ? option.value : '')}
                                isClearable
                            />
                        )}
                    />
                </div>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error.message}</p>}
        </div>
    );
};

export default SearchableSelect;
