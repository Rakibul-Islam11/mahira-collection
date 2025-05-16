import { createContext,  useEffect, useState } from "react";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../firbase.config";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for user on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        await signOut(auth);
    };

    const serveDATA = {
        user, login, logout, loading
        
    };

    return (
        <AuthContext.Provider value={serveDATA}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;














// import {
//     createUserWithEmailAndPassword,
//     FacebookAuthProvider,
//     GoogleAuthProvider,
//     onAuthStateChanged,
//     signInWithEmailAndPassword,
//     signInWithPopup,
//     signOut,
//     updateProfile,
// } from "firebase/auth";
// import { createContext, useEffect, useState } from "react";
// import { auth, db } from "../firebase-config/firebase";
// import { doc, setDoc, getDoc } from "firebase/firestore";

// export const AuthProviderContext = createContext();

// const AuthProvider = ({ children }) => {
//     const [storeCurrentUser, setStoreCurrentUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedCity, setSelectedCity] = useState("");
//     const [userName, setUserName] = useState('');

//     const updateSelectedCity = (city) => {
//         setSelectedCity(city);
//     };

//     // 🔹 Create user with email & password
//     const createUser = async (email, password, name) => {
//         setLoading(true);
//         try {
//             const res = await createUserWithEmailAndPassword(auth, email, password);
//             const user = res.user;

//             await updateProfile(user, { displayName: name });

//             // ✅ Firestore-এ নাম এবং emailVerified স্ট্যাটাস সংরক্ষণ
//             await setDoc(doc(db, "users", user.uid), {
//                 name: name,
//                 email: user.email,
//                 provider: "email",
//                 creationTime: user.metadata.creationTime,
//                 photoURL: user.photoURL || "https://via.placeholder.com/100",
//                 emailVerified: user.emailVerified, // ✅ emailVerified স্ট্যাটাস সংরক্ষণ
//             });

//             setUserName(name); // ✅ লোকাল state-এও সেট করুন
//             return res;
//         } catch (error) {
//             console.error("❌ Registration Error:", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const facebookProvider = new FacebookAuthProvider();
//     const googleProvider = new GoogleAuthProvider();

//     // 🔹 Google Login
//     const createWithGoogle = async () => {
//         setLoading(true);
//         try {
//             const res = await signInWithPopup(auth, googleProvider);
//             return res;
//         } catch (error) {
//             console.error("❌ Google Login Error:", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🔹 Facebook Login
//     const signInWithFacebook = async () => {
//         setLoading(true);
//         try {
//             const res = await signInWithPopup(auth, facebookProvider);
//             return res;
//         } catch (error) {
//             console.error("❌ Facebook Login Error:", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🔹 Email & Password Login
//     const signInUser = async (email, password) => {
//         setLoading(true);
//         try {
//             const res = await signInWithEmailAndPassword(auth, email, password);
//             return res;
//         } catch (error) {
//             console.error("❌ Login Error:", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🔹 Sign Out
//     const signOUT = async () => {
//         setLoading(true);
//         try {
//             await signOut(auth);
//             setStoreCurrentUser(null);
//             setUserName(""); // ✅ userName ক্লিয়ার করুন
//         } catch (error) {
//             console.error("❌ Sign Out Error:", error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🔹 Firebase Auth Listener
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//             if (currentUser) {
//                 await currentUser.reload(); // ✅ নতুন ডাটা আনতে reload() ব্যবহার করুন
//                 const userRef = doc(db, "users", currentUser.uid);
//                 const userSnap = await getDoc(userRef);

//                 if (userSnap.exists()) {
//                     const userData = userSnap.data();
//                     setStoreCurrentUser({
//                         uid: currentUser.uid,
//                         name: userData.name || currentUser.displayName || "No Name",
//                         email: currentUser.email,
//                         provider: userData.provider || "email",
//                         creationTime: currentUser.metadata.creationTime || userData.creationTime,
//                         photoURL: userData.photoURL || currentUser.photoURL || "https://via.placeholder.com/100",
//                         emailVerified: currentUser.emailVerified, // ✅ emailVerified অন্তর্ভুক্ত
//                     });

//                     setUserName(userData.name || currentUser.displayName || "No Name");
//                 } else {
//                     setStoreCurrentUser({
//                         uid: currentUser.uid,
//                         name: currentUser.displayName || "No Name",
//                         email: currentUser.email,
//                         provider: "email",
//                         creationTime: currentUser.metadata.creationTime,
//                         photoURL: currentUser.photoURL || "https://via.placeholder.com/100",
//                         emailVerified: currentUser.emailVerified, // ✅ fallback হিসাবে emailVerified অন্তর্ভুক্ত
//                     });

//                     setUserName(currentUser.displayName || "No Name");
//                 }
//             } else {
//                 setStoreCurrentUser(null);
//                 setUserName("");
//             }
//             setLoading(false);
//         });

//         return () => unsubscribe();
//     }, []);


//     const serveDATA = {
//         createUser,
//         createWithGoogle,
//         signInWithFacebook,
//         signOUT,
//         storeCurrentUser,
//         loading,
//         signInUser,
//         selectedCity,
//         updateSelectedCity,
//         userName,
//         userInfo: storeCurrentUser,
//     };

//     return (
//         <AuthProviderContext.Provider value={serveDATA}>
//             {children}
//         </AuthProviderContext.Provider>
//     );
// };

// export default AuthProvider;