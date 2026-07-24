import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFail = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Ödeme Başarısız!</h2>
        <p className="mb-6 text-gray-600">
          İşleminiz sırasında bir hata oluştu veya ödemeniz onaylanmadı. Lütfen tekrar deneyin.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
