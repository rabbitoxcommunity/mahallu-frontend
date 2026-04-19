import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, CheckCircle } from 'lucide-react';

const IncomeReceipt = ({ isOpen, onClose, income, type = 'due' }) => {
  const receiptRef = useRef(null);

  if (!isOpen || !income) return null;

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>Receipt - ${income.receipt_no || income.income_code}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleDownload = () => {
    const receiptText = `
================================
INCOME RECEIPT
================================

Receipt No: ${income.receipt_no || 'N/A'}
Income Code: ${income.income_code}
Date: ${new Date(income.date || income.created_at).toLocaleDateString()}

--------------------------------
${type === 'due' ? `Category: ${income.category?.replace('_', ' ').toUpperCase()}` : `Category: ${income.category?.toUpperCase()}`}
Source: ${income.source_name}
${type === 'due' ? `
Month/Year: ${income.month}/${income.year}
Amount Due: ₹${income.amount_due?.toLocaleString()}
Amount Paid: ₹${income.amount_paid?.toLocaleString()}
Balance: ₹${income.balance?.toLocaleString()}
Status: ${income.status?.toUpperCase()}
` : `
Amount: ₹${income.amount?.toLocaleString()}
Payment Method: ${income.payment_method?.toUpperCase()}
`}
Payment Method: ${income.payment_method?.toUpperCase() || 'CASH'}
${income.reference_no ? `Reference: ${income.reference_no}` : ''}

--------------------------------
Thank you for your payment!
================================
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${income.receipt_no || income.income_code}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Income Receipt</h2>
                    <p className="text-sm text-gray-500">{income.income_code}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Receipt Content */}
              <div ref={receiptRef} className="flex-1 overflow-y-auto p-6">
                <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  {/* Receipt Info */}
                  <div className="flex justify-between mb-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Receipt No</p>
                      <p className="font-bold text-gray-900 dark:text-white">{income.receipt_no || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Date</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {new Date(income.date || income.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-gray-700 uppercase border-b border-gray-200 pb-1 mb-2">Income Details</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{income.category?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Source:</span>
                        <span className="font-medium">{income.source_name}</span>
                      </div>
                      {type === 'due' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Month/Year:</span>
                            <span className="font-medium">{months[income.month - 1]} {income.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount Due:</span>
                            <span className="font-medium">₹{income.amount_due?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="font-medium text-green-600">₹{income.amount_paid?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Balance:</span>
                            <span className="font-medium text-orange-600">₹{income.balance?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium capitalize ${
                              income.status === 'paid' ? 'text-green-600' :
                              income.status === 'partial' ? 'text-yellow-600' :
                              income.status === 'overdue' ? 'text-orange-600' : 'text-red-600'
                            }`}>{income.status}</span>
                          </div>
                        </>
                      )}
                      {type === 'direct' && (
                        <>
                          <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-300 mt-2">
                            <span className="text-gray-900 font-bold">Amount:</span>
                            <span className="text-lg font-bold text-green-600">₹{income.amount?.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">{income.payment_method}</span>
                      </div>
                      {income.reference_no && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span className="font-medium">{income.reference_no}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {income.notes && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-gray-700 uppercase border-b border-gray-200 pb-1 mb-2">Notes</h3>
                      <p className="text-xs text-gray-600">{income.notes}</p>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Thank you for your payment!</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#252731]">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] hover:bg-[#0959c9] text-white rounded-lg transition-colors text-sm"
                >
                  <Printer size={18} />
                  Print
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IncomeReceipt;
