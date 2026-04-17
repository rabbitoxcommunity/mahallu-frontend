import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer, CheckCircle } from 'lucide-react';

const Receipt = ({ isOpen, onClose, record, printMode = false }) => {
  const receiptRef = useRef(null);

  if (!isOpen || !record) return null;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>Receipt - ${record.receipt_no}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; }
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
    // Create a text version for download
    const receiptText = `
================================
    VARISANKHYA RECEIPT
================================

Receipt No: ${record.receipt_no}
Date: ${record.paid_date ? new Date(record.paid_date).toLocaleDateString() : new Date().toLocaleDateString()}

HOUSE DETAILS
----------------------------
House Code: ${record.house_id?.house_code || 'N/A'}
House Name: ${record.house_id?.householder_name || 'N/A'}
Family Name: ${record.house_id?.family_name || 'N/A'}
Contact: ${record.house_id?.primary_contact || 'N/A'}

PAYMENT DETAILS
----------------------------
Month/Year: ${months[record.month - 1]} ${record.year}
Amount Paid: ₹${record.amount_paid?.toLocaleString() || '0'}
Payment Method: ${(record.payment_method || 'Cash').toUpperCase()}
Collected By: ${record.received_by?.name || 'Admin'}

Notes: ${record.notes || 'N/A'}

================================
Thank you for your payment!
================================
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${record.receipt_no}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If in print mode inside PaymentModal, just render the receipt content
  if (printMode && isOpen) {
    return (
      <div className="p-6">
        <div ref={receiptRef} className="bg-white p-8 rounded-xl border-2 border-gray-200 max-w-md mx-auto">
          {/* Receipt Header */}
          <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">VARISANKHYA RECEIPT</h1>
            <p className="text-sm text-gray-600 mt-1">Mahallu Management System</p>
          </div>

          {/* Receipt Info */}
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">Receipt No</p>
              <p className="font-bold text-gray-900">{record.receipt_no}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">Date</p>
              <p className="font-bold text-gray-900">
                {record.paid_date ? new Date(record.paid_date).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* House Details */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase border-b border-gray-200 pb-1 mb-3">House Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">House Code:</span>
                <span className="font-medium">{record.house_id?.house_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">House Name:</span>
                <span className="font-medium">{record.house_id?.householder_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Family:</span>
                <span className="font-medium">{record.house_id?.family_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase border-b border-gray-200 pb-1 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Month/Year:</span>
                <span className="font-medium">{months[record.month - 1]} {record.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Due:</span>
                <span className="font-medium">₹{record.amount_due?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-300">
                <span className="text-gray-900 font-bold">Amount Paid:</span>
                <span className="text-xl font-bold text-green-600">₹{record.amount_paid?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{record.payment_method || 'Cash'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collected By:</span>
                <span className="font-medium">{record.received_by?.name || 'Admin'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
              <p className="text-sm text-gray-700">{record.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-200 pt-4">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <CheckCircle size={20} />
              <span className="font-bold">Payment Received</span>
            </div>
            <p className="text-sm text-gray-500">Thank you for your payment!</p>
            <p className="text-xs text-gray-400 mt-2">This is a computer generated receipt.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Printer size={20} />
            Print Receipt
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Download
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Standalone modal view
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Receipt</h2>
                <p className="text-sm text-gray-500">Receipt No: {record.receipt_no}</p>
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
          <div className="p-6">
            <div ref={receiptRef} className="bg-white dark:bg-white p-6 rounded-xl border-2 border-gray-200">
              {/* Receipt Header */}
              <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
                <h1 className="text-xl font-bold text-gray-900">VARISANKHYA RECEIPT</h1>
                <p className="text-xs text-gray-600 mt-1">Mahallu Management System</p>
              </div>

              {/* Receipt Info */}
              <div className="flex justify-between mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Receipt No</p>
                  <p className="font-bold text-gray-900">{record.receipt_no}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Date</p>
                  <p className="font-bold text-gray-900">
                    {record.paid_date ? new Date(record.paid_date).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* House Details */}
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase border-b border-gray-200 pb-1 mb-2">House Details</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Code:</span>
                    <span className="font-medium">{record.house_id?.house_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Name:</span>
                    <span className="font-medium">{record.house_id?.householder_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Family:</span>
                    <span className="font-medium">{record.house_id?.family_name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase border-b border-gray-200 pb-1 mb-2">Payment Details</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Month/Year:</span>
                    <span className="font-medium">{months[record.month - 1]} {record.year}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-300 mt-2">
                    <span className="text-gray-900 font-bold">Amount Paid:</span>
                    <span className="text-lg font-bold text-green-600">₹{record.amount_paid?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{record.payment_method || 'Cash'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collected By:</span>
                    <span className="font-medium">{record.received_by?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t-2 border-gray-200 pt-3">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <CheckCircle size={16} />
                  <span className="text-sm font-bold">Payment Received</span>
                </div>
                <p className="text-xs text-gray-500">Thank you for your payment!</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Receipt;
