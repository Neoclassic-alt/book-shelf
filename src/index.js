import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './font-family.css'
import App from './App';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookForm from './routes/book-form'

const firebaseConfig = {
  apiKey: "AIzaSyBQkuBdRfcyrd-HhHHbdxgG38np2Zdzcas",
  authDomain: "book-shelf-31f83.firebaseapp.com",
  databaseURL: "https://book-shelf-31f83-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "book-shelf-31f83",
  storageBucket: "book-shelf-31f83.appspot.com",
  messagingSenderId: "31572236290",
  appId: "1:31572236290:web:2d46b0420a33feb9852f1b"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app)

export const Context = createContext(null)

ReactDOM.render(
  <React.StrictMode>
    <Context.Provider value={{
      db
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="add" element={<BookForm target="add" />} />
          <Route path="edit/:bookID" element={<BookForm target="edit" />} />
        </Routes>
      </BrowserRouter>
    </Context.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);