// utils/firebase.js
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from './firebaseConfig'; // আপনার Firebase কনফিগারেশন ফাইল

const db = getFirestore(app);

// ক্যাটাগরি অনুযায়ী প্রোডাক্ট ফেচ করা
export const fetchProductsByCategory = async (gender, category = null) => {
    let q;

    if (category) {
        q = query(
            collection(db, 'products'),
            where('gender', '==', gender),
            where('subcategory', '==', category)
        );
    } else {
        q = query(
            collection(db, 'products'),
            where('gender', '==', gender)
        );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// সব প্রোডাক্ট ফেচ করা
export const fetchAllProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};