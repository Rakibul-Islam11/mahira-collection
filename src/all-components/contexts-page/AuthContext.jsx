// src/contexts-page/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../../../firbase.config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Firebase Auth-এর সাথে ইউজার রোল সিঙ্ক্রোনাইজ করুন
    const syncUserRole = async (user) => {
        if (!user) {
            setUserRole(null);
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role || 'user');
            } else {
                // নতুন ইউজার তৈরি করুন
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    role: 'user', // ডিফল্ট রোল
                    createdAt: new Date().toISOString()
                });
                setUserRole('user');
            }
        } catch (error) {
            console.error('Error syncing user role:', error);
            setUserRole(null);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await syncUserRole(result.user);
            return result.user;
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserRole(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            await syncUserRole(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        loginWithGoogle,
        logout,
        isAdmin: userRole === 'admin' // সহজ চেকের জন্য
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}