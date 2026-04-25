import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, Phone, MapPin, IndianRupee, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import { getFamilyDetails, getVarisankhyaStatus } from '../../api/publicService';

const FamilyView = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [familyData, setFamilyData] = useState(null);
    const [varisankhyaData, setVarisankhyaData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tenantParam = new URLSearchParams(window.location.search).get('tenant') || 'edakkulam-mahallu';
                
                // Fetch family details
                const familyResponse = await getFamilyDetails(id, tenantParam);
                if (familyResponse.success) {
                    setFamilyData(familyResponse.data);
                }

                // Fetch varisankhya status
                const varisankhyaResponse = await getVarisankhyaStatus(id, tenantParam);
                if (varisankhyaResponse.success) {
                    setVarisankhyaData(varisankhyaResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle size={14} />
                        {t('public.paid')}
                    </span>
                );
            case 'partial':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        <Clock size={14} />
                        Partial
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <XCircle size={14} />
                        {t('public.unpaid')}
                    </span>
                );
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <PublicHeader />
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
                </div>
            </div>
        );
    }

    if (!familyData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <PublicHeader />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                        <p className="text-gray-500">{t('public.noResults')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PublicHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Link
                    to="/public/search"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    {t('public.backToSearch')}
                </Link>

                {/* House Info Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                {familyData.house.house_name}
                            </h1>
                            <p className="text-gray-500">
                                {familyData.house.house_code}
                            </p>
                        </div>
                        {varisankhyaData && getStatusBadge(varisankhyaData.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Users size={18} className="text-gray-400" />
                            <span>{familyData.house.householder_name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone size={18} className="text-gray-400" />
                            <span>{familyData.house.primary_contact || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin size={18} className="text-gray-400" />
                            <span>{familyData.house.address || '-'}</span>
                        </div>
                        {familyData.house.family_name && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Users size={18} className="text-gray-400" />
                                <div>
                                    <span className="text-sm">{t('public.familyDetails')}:</span>
                                    <span className="font-medium ml-1">{familyData.house.family_name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Varisankhya Info Card */}
                {varisankhyaData && (
                    <div className="bg-gray-900 rounded-xl p-6 mb-6 text-white">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <IndianRupee size={20} />
                            {t('public.varisankhyaInfo')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-sm text-white/80 mb-1">{t('public.currentMonthDue')}</p>
                                <p className="text-2xl font-bold">₹{varisankhyaData.totalDue.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-sm text-white/80 mb-1">{t('public.paid')}</p>
                                <p className="text-2xl font-bold text-green-300">₹{varisankhyaData.totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-sm text-white/80 mb-1">{t('public.balance')}</p>
                                <p className="text-2xl font-bold text-orange-300">₹{varisankhyaData.balance.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Family Members Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-gray-600" />
                        {t('public.members')} ({familyData.members.length})
                    </h2>
                    <div className="space-y-3">
                        {familyData.members.map((member, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-gray-900">
                                            {member.full_name}
                                        </span>
                                        {member.is_family_head && (
                                            <span className="px-2 py-0.5 bg-gray-900 text-white rounded-full text-xs font-medium">
                                                {t('public.familyHead')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                        <span>{t('public.relation')}: {member.relation_to_head || '-'}</span>
                                        <span>{t('public.gender')}: {member.gender || '-'}</span>
                                        <span>{t('public.age')}: {calculateAge(member.dob)}</span>
                                    </div>
                                </div>
                                {member.contact_number && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={16} className="text-gray-400" />
                                        <span>{member.contact_number}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment History */}
                {varisankhyaData && varisankhyaData.paymentHistory.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-gray-600" />
                            {t('public.paymentHistory')}
                        </h2>
                        <div className="space-y-3">
                            {varisankhyaData.paymentHistory.map((payment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {payment.month}/{payment.year}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">
                                            ₹{payment.amount_paid.toLocaleString()}
                                        </p>
                                        {payment.receipt_no && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {payment.receipt_no}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FamilyView;
