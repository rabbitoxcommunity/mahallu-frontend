import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, CheckCircle, Printer, CreditCard, Banknote, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { markPayment } from '../../api/varisankhyaService';
import Receipt from './Receipt';

const PaymentModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [quickAmount, setQuickAmount] = useState('full'); // 'full', 'half', or 'custom'

  // Calculate remaining amount for partial payments
  const remainingAmount = record ? record.amount_due - record.amount_paid : 0;

  // Reset form when modal opens with new record
  useEffect(() => {
    if (record && isOpen) {
      // If already partially paid, show remaining amount, otherwise show full amount
      const initialAmount = record.amount_paid > 0 ? remainingAmount.toString() : record.amount_due?.toString() || '';
      setAmountPaid(initialAmount);
      setPaymentMethod('cash');
      setNotes('');
      setShowReceipt(false);
      setPaymentResult(null);
      setQuickAmount(record.amount_paid > 0 ? 'custom' : 'full');
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (printReceipt = false) => {
    if (!amountPaid || Number(amountPaid) < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await markPayment(record._id, {
        amount_paid: Number(amountPaid),
        payment_method: paymentMethod,
        notes
      });

      setPaymentResult(result.varisankhya);
      
      // Show detailed success message
      const details = result.payment_details;
      if (details.status === 'paid') {
        toast.success(`Payment completed! Total paid: ₹${details.total_paid.toLocaleString()}`);
      } else {
        toast.success(`Payment recorded! This payment: ₹${details.this_payment.toLocaleString()}, Total paid: ₹${details.total_paid.toLocaleString()}, Remaining: ₹${details.remaining_amount.toLocaleString()}`);
      }

      if (printReceipt) {
        setShowReceipt(true);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Error marking payment:', error);
      
      // Handle overpayment validation error
      if (error.response?.data?.message === "Payment exceeds due amount") {
        const details = error.response.data.details;
        toast.error(`Payment exceeds due amount by ₹${details.excess_amount.toLocaleString()}. Maximum payment: ₹${details.remaining_amount.toLocaleString()}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to record payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    onSuccess();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={showReceipt ? undefined : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
              {showReceipt ? (
                <Receipt
                  isOpen={true}
                  onClose={handleCloseReceipt}
                  record={paymentResult}
                  printMode={true}
                />
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <IndianRupee size={24} className="text-[#0B65F6]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Payment</h2>
                        <p className=" text-gray-500">
                          {record.house_id?.house_code} - {record.house_id?.householder_name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Amount Info */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                      <div>
                        <p className=" text-gray-500 uppercase">Amount Due</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">₹{record.amount_due}</p>
                      </div>
                      <div>
                        <p className=" text-gray-500 uppercase">Already Paid</p>
                        <p className="text-base font-bold text-green-600">₹{record.amount_paid}</p>
                      </div>
                      <div>
                        <p className=" text-gray-500 uppercase">Remaining</p>
                        <p className="text-base font-bold text-orange-600">₹{remainingAmount}</p>
                      </div>
                    </div>

                    {/* Amount Paid Input */}
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount Paid *
                      </label>
                      <div className="relative">
                        <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          min="0"
                          max={record.amount_due}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6] text-lg font-semibold"
                          placeholder="Enter amount..."
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setAmountPaid(remainingAmount.toString());
                            setQuickAmount('full');
                          }}
                          className={`px-3 py-1.5  rounded-lg transition-colors ${
                            quickAmount === 'full'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200'
                          }`}
                        >
                          Full Amount (₹{remainingAmount})
                        </button>
                        <button
                          onClick={() => {
                            const halfAmount = Math.ceil(remainingAmount / 2);
                            setAmountPaid(halfAmount.toString());
                            setQuickAmount('half');
                          }}
                          className={`px-3 py-1.5  rounded-lg transition-colors ${
                            quickAmount === 'half'
                              ? 'bg-orange-600 text-white'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200'
                          }`}
                        >
                          Half (₹{Math.ceil(remainingAmount / 2)})
                        </button>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Method *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === 'cash'
                              ? 'border-[#0B65F6] bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Banknote size={20} className={paymentMethod === 'cash' ? 'text-[#0B65F6]' : 'text-gray-500'} />
                          <span className={`font-medium ${paymentMethod === 'cash' ? 'text-[#0B65F6]' : 'text-gray-700 dark:text-gray-300'}`}>
                            Cash
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === 'upi'
                              ? 'border-[#0B65F6] bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <CreditCard size={20} className={paymentMethod === 'upi' ? 'text-[#0B65F6]' : 'text-gray-500'} />
                          <span className={`font-medium ${paymentMethod === 'upi' ? 'text-[#0B65F6]' : 'text-gray-700 dark:text-gray-300'}`}>
                            UPI
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6] resize-none"
                        placeholder="Add any notes about this payment..."
                      />
                    </div>

                    {/* Quick Summary */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={16} className="text-blue-600" />
                        <span className=" font-medium text-blue-900 dark:text-blue-100">Payment Summary</span>
                      </div>
                      <div className="space-y-1 ">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">House:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{record.house_id?.house_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Month:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][record.month - 1]} {record.year}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-blue-200 dark:border-blue-800 mt-1">
                          <span className="text-gray-600 dark:text-gray-400">Amount to Pay Now:</span>
                          <span className="text-lg font-bold text-blue-600">₹{Number(amountPaid || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={onClose}
                      className="px-3 py-2  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={loading || !amountPaid}
                      className="flex items-center gap-1.5 px-3 py-2  bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Save payment and close"
                    >
                      <CheckCircle size={16} />
                      {loading ? 'Saving...' : 'Save Only'}
                    </button>
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={loading || !amountPaid}
                      className="flex items-center gap-1.5 px-3 py-2  bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                      title="Save payment and show receipt for printing"
                    >
                      <Printer size={16} />
                      {loading ? 'Saving...' : 'Save & Print Receipt'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
