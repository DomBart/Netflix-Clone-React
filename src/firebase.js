import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyCcqoypYPo7lg09LUSuiQH6Y3kpe5SvmZI",
    authDomain: "netflix-clone-9268b.firebaseapp.com",
    projectId: "netflix-clone-9268b",
    storageBucket: "netflix-clone-9268b.appspot.com",
    messagingSenderId: "923084529471",
    appId: "1:923084529471:web:24cf0af9e4b046a90cbd8a"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const db = firebaseApp.firestore();
  const auth = firebase.auth();

  export { auth };
  export default db;