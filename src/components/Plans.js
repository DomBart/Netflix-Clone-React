import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import db from '../firebase';
import { loadStripe } from '@stripe/stripe-js';
import './Plans.scss';

function Plans() {
    const [products, setProducts] = useState([]);
    const user = useSelector(selectUser);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        db.collection('customers')
        .doc(user.uid)
        .collection('subscriptions')
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(async subscription => {
                setSubscription({
                    role: subscription.data().role,
                    current_period_end: subscription.data().current_period_end.seconds,
                    current_period_start: subscription.data().current_period_start.seconds,
                });
            });
        });
    }, [])

    useEffect(() => {
        db.collection('products')
        .where('active','==',true)
        .get().then((querySnapshot) => {
            const products = {};
            querySnapshot.forEach(async productDoc => {
                products[productDoc.id] = productDoc.data();
                const priceSnap = await productDoc.ref.collection('prices').get();
                priceSnap.docs.forEach(price => {
                    products[productDoc.id].prices = {
                        priceId: price.id,
                        priceData: price.data()
                    };
                });
            });
            setProducts(products);
        });
    },[]);

    console.log(products);
    console.log(subscription);
    
    const loadCheckout = async (priceId) => {
        const docRef = await db.collection('customers')
        .doc(user.uid).collection('checkout_sessions')
        .add({
            price: priceId,
            success_url: window.location.origin,
            cancel_url: window.location.origin,
        });

        docRef.onSnapshot(async(snap) => {
            const { error, sessionId } = snap.data();

            if (error) {
                alert(`An error occured: ${error.message}`);
            }

            if (sessionId) {
                const stripe = await loadStripe(
                    'pk_test_51IL4NIHospeaBIqd2O5ZB9sdGOeVPjDjO3VPDR6yNNKmD9mMpy4IhZGNzTrlDyRseXXdT9fz17fRMmt36EYewePo00SKzUYlZ9'
                    );
                    stripe.redirectToCheckout({ sessionId });
            }
        })
    };

    return (
        <div className="plans">
            <br />
            {subscription &&
            <p>Renewal date: {new Date(subscription?.
                current_period_end * 1000).toLocaleDateString()}
                </p>}
            {Object.entries(products).map(([productId, productData]) => {
                // user's subscription active check
                const isCurrentPackage = productData.name?.toLowerCase().includes(subscription?.role);

                return (
                    <div 
                    key={productId}
                    className={`${isCurrentPackage && "plans__plan--disabled"
                        } plans__plan`}>
                        <div className="plans__info">
                            {productData.name}
                            {' '}
                            {productData.description}
                        </div>
                        <button
                        onClick={() => 
                            !isCurrentPackage && loadCheckout(productData.prices.priceId)
                        } 
                        >
                            {isCurrentPackage ? 'Current Package' : 'Subscribe'}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default Plans;
