/**
 * Módulo de Autenticação e Salvamento - Ucronia Brasilis
 * Integração com Firebase (Auth + Firestore) e fallback para LocalStorage (Modo Offline).
 */

export const authState = {
    user: null,
    isOffline: true,
};

// Configuração padrão do Firebase - pode ser configurada no index.html ou aqui
// Se os valores forem os padrões vazios, o jogo entrará em Modo Offline automaticamente.
const defaultFirebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

let db = null;
let fbAuth = null;

export function initAuth(onAuthStateChangedCallback) {
    const config = window.firebaseConfig || defaultFirebaseConfig;
    const isFirebaseAvailable = typeof window.firebase !== 'undefined';

    // Verifica se a configuração é válida (não vazia)
    const hasValidConfig = config && config.apiKey && config.apiKey.trim() !== "";

    if (isFirebaseAvailable && hasValidConfig) {
        try {
            // Inicializa o Firebase se ainda não foi inicializado
            if (window.firebase.apps.length === 0) {
                window.firebase.initializeApp(config);
            }
            db = window.firebase.firestore();
            fbAuth = window.firebase.auth();
            authState.isOffline = false;
            console.log("🔥 Firebase inicializado com sucesso. Modo Online ativo.");

            // Listener de estado de autenticação do Firebase
            fbAuth.onAuthStateChanged(async (user) => {
                if (user) {
                    authState.user = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email.split('@')[0],
                    };
                } else {
                    authState.user = null;
                }
                if (onAuthStateChangedCallback) onAuthStateChangedCallback(authState.user);
            });
            return;
        } catch (error) {
            console.error("Erro ao inicializar Firebase. Entrando em Modo Offline:", error);
        }
    }

    // Fallback: Modo Offline
    authState.isOffline = true;
    console.log("🔌 Firebase não configurado ou offline. Modo Offline ativo (LocalStorage).");
    
    // Recupera usuário offline salvo na sessão se houver
    const savedUser = sessionStorage.getItem('ucronia_user_offline');
    if (savedUser) {
        authState.user = JSON.parse(savedUser);
    } else {
        authState.user = null;
    }
    
    if (onAuthStateChangedCallback) {
        // Dispara assincronamente para dar tempo dos listeners da UI carregarem
        setTimeout(() => onAuthStateChangedCallback(authState.user), 100);
    }
}

/**
 * Cadastrar novo usuário
 */
export async function registerUser(username, email, password) {
    if (authState.isOffline) {
        // Registro Offline usando LocalStorage
        const users = JSON.parse(localStorage.getItem('ucronia_offline_users') || '{}');
        if (users[email]) {
            throw new Error("Este e-mail já está registrado localmente.");
        }
        
        users[email] = { username, password };
        localStorage.setItem('ucronia_offline_users', JSON.stringify(users));
        
        const offlineUser = { uid: 'offline_' + email, displayName: username, email: email };
        authState.user = offlineUser;
        sessionStorage.setItem('ucronia_user_offline', JSON.stringify(offlineUser));
        return offlineUser;
    } else {
        // Registro Online com Firebase
        const userCredential = await fbAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await user.updateProfile({ displayName: username });
        
        // Criar documento do usuário no Firestore
        await db.collection('users').doc(user.uid).set({
            username: username,
            email: email,
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });

        authState.user = {
            uid: user.uid,
            email: user.email,
            displayName: username
        };
        return authState.user;
    }
}

/**
 * Entrar com usuário existente
 */
export async function loginUser(email, password) {
    if (authState.isOffline) {
        // Login Offline
        const users = JSON.parse(localStorage.getItem('ucronia_offline_users') || '{}');
        const user = users[email];
        
        if (!user || user.password !== password) {
            throw new Error("E-mail ou senha inválidos no modo offline.");
        }
        
        const offlineUser = { uid: 'offline_' + email, displayName: user.username, email: email };
        authState.user = offlineUser;
        sessionStorage.setItem('ucronia_user_offline', JSON.stringify(offlineUser));
        return offlineUser;
    } else {
        // Login Online
        const userCredential = await fbAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        authState.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0]
        };
        return authState.user;
    }
}

/**
 * Login como convidado (Modo offline sem registro)
 */
export function loginAsGuest() {
    const guestUser = { uid: 'guest', displayName: 'Imperador Convidado', email: 'guest@ucronia.local' };
    authState.user = guestUser;
    authState.isOffline = true;
    sessionStorage.setItem('ucronia_user_offline', JSON.stringify(guestUser));
    return guestUser;
}

/**
 * Sair da conta
 */
export async function logoutUser() {
    if (!authState.isOffline && fbAuth) {
        await fbAuth.signOut();
    }
    authState.user = null;
    sessionStorage.removeItem('ucronia_user_offline');
}

/**
 * Salvar estado do jogo
 */
export async function saveGameState(state) {
    if (!authState.user) throw new Error("Usuário não está autenticado.");

    const saveData = {
        state: state,
        updatedAt: new Date().toISOString()
    };

    if (authState.isOffline || authState.user.uid.startsWith('offline_') || authState.user.uid === 'guest') {
        // Salvar Local
        const key = `ucronia_save_${authState.user.uid}`;
        localStorage.setItem(key, JSON.stringify(saveData));
        console.log("💾 Jogo salvo localmente no LocalStorage.");
        return true;
    } else {
        // Salvar na Nuvem (Firestore)
        await db.collection('saves').doc(authState.user.uid).set(saveData);
        console.log("☁️ Jogo salvo na nuvem (Firestore).");
        return true;
    }
}

/**
 * Carregar estado do jogo
 */
export async function loadGameState() {
    if (!authState.user) throw new Error("Usuário não está autenticado.");

    if (authState.isOffline || authState.user.uid.startsWith('offline_') || authState.user.uid === 'guest') {
        // Carregar Local
        const key = `ucronia_save_${authState.user.uid}`;
        const data = localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data).state;
    } else {
        // Carregar da Nuvem (Firestore)
        const doc = await db.collection('saves').doc(authState.user.uid).get();
        if (!doc.exists) return null;
        return doc.data().state;
    }
}

/**
 * Salvar recorde no ranking
 */
export async function saveScoreToRanking(score, era, timelineName) {
    const record = {
        username: authState.user ? authState.user.displayName : "Anônimo",
        score: score,
        era: era,
        timelineName: timelineName,
        date: new Date().toLocaleDateString('pt-BR')
    };

    // Sempre salvar localmente primeiro para backup
    const localRankings = JSON.parse(localStorage.getItem('ucronia_rankings') || '[]');
    localRankings.push(record);
    localRankings.sort((a, b) => b.score - a.score);
    localStorage.setItem('ucronia_rankings', JSON.stringify(localRankings.slice(0, 50)));

    if (!authState.isOffline && db && authState.user && !authState.user.uid.startsWith('offline_') && authState.user.uid !== 'guest') {
        try {
            // Salvar no Firestore
            await db.collection('rankings').add({
                userId: authState.user.uid,
                username: authState.user.displayName,
                score: score,
                era: era,
                timelineName: timelineName,
                createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("🏆 Recorde salvo no ranking online do Firestore.");
        } catch (e) {
            console.error("Erro ao salvar ranking online:", e);
        }
    }
}

/**
 * Obter rankings de eras
 */
export async function getRankings() {
    if (!authState.isOffline && db) {
        try {
            // Tenta buscar os 10 melhores da nuvem
            const snapshot = await db.collection('rankings')
                .orderBy('score', 'desc')
                .limit(10)
                .get();
            
            const onlineRankings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                onlineRankings.push({
                    username: data.username,
                    score: data.score,
                    era: data.era,
                    timelineName: data.timelineName,
                    date: data.createdAt ? data.createdAt.toDate().toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
                });
            });
            
            if (onlineRankings.length > 0) {
                return onlineRankings;
            }
        } catch (e) {
            console.warn("Falha ao carregar ranking online, exibindo locais:", e);
        }
    }

    // Fallback: Rankings locais
    const localRankings = JSON.parse(localStorage.getItem('ucronia_rankings') || '[]');
    return localRankings.slice(0, 10);
}

/**
 * Limpar todos os rankings locais
 */
export function clearLocalRankings() {
    localStorage.removeItem('ucronia_rankings');
}
