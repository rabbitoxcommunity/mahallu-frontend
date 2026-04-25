import React from 'react';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchForm = ({ onSearch, loading }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        onSearch(data.query);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    {...register('query', { required: t('public.searchPlaceholder') })}
                    placeholder={t('public.searchPlaceholder')}
                    className="w-full pl-12 pr-32 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? t('common.loading') : t('public.search')}
                </button>
            </div>
            {errors.query && (
                <p className="mt-2 text-sm text-red-500">{errors.query.message}</p>
            )}
        </form>
    );
};

export default SearchForm;
