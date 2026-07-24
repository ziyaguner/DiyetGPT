import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Ödeme Başarılı!</h2>
        <p className="mb-6 text-gray-600">
          Aboneliğiniz başarıyla güncellendi. Yeni özelliklerinizi kullanmaya başlayabilirsiniz.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Dashboard'a Dön
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
