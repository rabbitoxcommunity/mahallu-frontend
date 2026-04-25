import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import SearchForm from '../../components/public/SearchForm';
import FamilyCard from '../../components/public/FamilyCard';
import { searchHouses } from '../../api/publicService';

const Search = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);

        try {
            const tenantParam = new URLSearchParams(window.location.search).get('tenant') || 'edakkulam-mahallu';
            const response = await searchHouses(query, tenantParam);
            
            if (response.success) {
                setResults(response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PublicHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Link
                    to="/public"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    {t('public.backToSearch')}
                </Link>

                {/* Search Section */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                            {t('public.verify')}
                        </h1>
                        <p className="text-gray-600">
                            {t('public.searchPlaceholder')}
                        </p>
                    </div>
                    <SearchForm onSearch={handleSearch} loading={loading} />
                </div>

                {/* Results Section */}
                {searched && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {t('public.searchResults')} ({results.length})
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SearchIcon size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500">
                                    {t('public.noResults')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((house) => (
                                    <FamilyCard key={house._id} house={house} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Search;
