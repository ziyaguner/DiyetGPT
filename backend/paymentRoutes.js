import express from 'express';
import iyzipay from './iyzico.js';
import crypto from 'crypto';
import { connectToDatabase } from './db.js';

const router = express.Router();

const generateId = () => crypto.randomBytes(16).toString('hex');

// Checkout Form Initialization
router.post('/checkout-form', async (req, res) => {
    try {
        if (!req.session || !req.session.ID) {
            return res.status(401).json({ message: 'Lütfen giriş yapın.' });
        }
        
        const { packageId, price, packageName } = req.body;
        if (!packageId || !price || !packageName) {
            return res.status(400).json({ message: 'Paket bilgileri eksik.' });
        }

        const pool = await connectToDatabase();
        const userResult = await pool.request()
            .input('id', req.session.ID)
            .query('SELECT * FROM Users WHERE ID = @id');
            
        const user = userResult.recordset[0];

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        const request = {
            locale: iyzipay.LOCALE.TR,
            conversationId: generateId(),
            price: price.toString(),
            paidPrice: price.toString(),
            currency: iyzipay.CURRENCY.TRY,
            basketId: `B-${packageId}-${user.ID}`,
            paymentGroup: iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
            callbackUrl: 'http://localhost:5000/api/payment/callback',
            enabledInstallments: [2, 3, 6, 9],
            buyer: {
                id: user.ID.toString(),
                name: user.Name.split(' ')[0] || 'Diyet',
                surname: user.Name.split(' ')[1] || 'Kullanıcısı',
                gsmNumber: '+905324000000', // Mock data, as we don't have phone number in db
                email: user.Email,
                identityNumber: '74300864791', // Mock data
                lastLoginDate: '2023-10-05 12:43:35',
                registrationDate: '2023-04-21 15:12:09',
                registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                ip: '85.34.78.112',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34732'
            },
            shippingAddress: {
                contactName: user.Name,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                zipCode: '34732'
            },
            billingAddress: {
                contactName: user.Name,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                zipCode: '34732'
            },
            basketItems: [
                {
                    id: packageId.toString(),
                    name: packageName,
                    category1: 'Subscription',
                    category2: 'Health',
                    itemType: iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                    price: price.toString()
                }
            ]
        };

        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                console.error('Iyzico Initialize Error:', err);
                return res.status(500).json({ message: 'Ödeme sistemiyle iletişim kurulamadı.' });
            }
            if (result.status === 'success') {
                // Store the conversation ID and Package ID in the session to verify later
                req.session.paymentConversationId = request.conversationId;
                req.session.pendingPackageId = packageId;
                
                res.json({
                    token: result.token,
                    checkoutFormContent: result.checkoutFormContent,
                    tokenExpireTime: result.tokenExpireTime,
                    paymentPageUrl: result.paymentPageUrl
                });
            } else {
                console.error('Iyzico Initialize Failed:', result.errorMessage);
                res.status(400).json({ message: result.errorMessage });
            }
        });

    } catch (error) {
        console.error('Checkout form error:', error);
        res.status(500).json({ message: 'Ödeme formu oluşturulamadı.' });
    }
});

// Iyzico Callback
router.post('/callback', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).send('Token eksik.');
    }

    const request = {
        locale: iyzipay.LOCALE.TR,
        conversationId: generateId(),
        token: token
    };

    iyzipay.checkoutForm.retrieve(request, async (err, result) => {
        if (err) {
            console.error('Iyzico Retrieve Error:', err);
            return res.redirect('http://localhost:5173/payment-fail');
        }

        if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
            try {
                // Extract UserID and PackageID from basketId (e.g., "B-3-15")
                const basketIdParts = result.basketId.split('-');
                const packageId = parseInt(basketIdParts[1], 10);
                const userId = parseInt(basketIdParts[2], 10);

                const pool = await connectToDatabase();
                
                // Get the package name
                const packageResult = await pool.request()
                    .input('packageId', packageId)
                    .query('SELECT Name FROM Packages WHERE PackageID = @packageId');
                
                const packageName = packageResult.recordset[0]?.Name || 'Premium';

                // Update user subscription
                await pool.request()
                    .input('userId', userId)
                    .input('packageId', packageId)
                    .input('status', packageName)
                    .query(`
                        UPDATE Users 
                        SET PackageID = @packageId, 
                            SubscriptionStatus = @status,
                            SubscriptionEndDate = DATEADD(month, 1, GETDATE())
                        WHERE ID = @userId
                    `);
                
                return res.redirect('http://localhost:5173/payment-success');
            } catch (dbError) {
                console.error('Callback DB Error:', dbError);
                return res.redirect('http://localhost:5173/payment-fail');
            }
        } else {
            console.error('Payment not successful:', result.errorMessage);
            return res.redirect('http://localhost:5173/payment-fail');
        }
    });
});

export default router;
