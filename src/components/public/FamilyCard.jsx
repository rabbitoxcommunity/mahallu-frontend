import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FamilyCard = ({ house }) => {
    const { t } = useTranslation();

    return (
        <Link
            to={`/public/family/${house._id}`}
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Home size={20} className="text-gray-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {house.house_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {house.house_code}
                        </p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{house.primary_contact || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{house.address || '-'}</span>
                </div>
                {house.family_name && (
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {t('public.familyDetails')}: <span className="font-medium text-gray-900">{house.family_name}</span>
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default FamilyCard;
