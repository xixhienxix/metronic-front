export const environment = {
  production: true,
  appVersion: 'v726demo1',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: false,
  //apiUrl: 'https://us-central1-movnext-api.cloudfunctions.net/app/api',
  //apiUrl:'https://us-central1-movnext-api.cloudfunctions.net/app/api',
  //apiUrl:'https://movnext-api.herokuapp.com/api'
  apiUrl:'http://localhost:4100/api',
  fireBaseStorageSecrets:{
    apiKey: "AIzaSyB3tYq0nD6m4hljK3lfkGmQtqHwm3ssCiU",
    authDomain: "movnext-api.firebaseapp.com",
    projectId: "movnext-api",
    storageBucket: "movnext-api.appspot.com",
    messagingSenderId: "82604568171",
    appId: "1:82604568171:web:21dafcd8a28f1767008b2e",
    databaseURL: "https://movnext-api-default-rtdb.firebaseio.com",

  }
};
