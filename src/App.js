import { Context } from "./index.js";
import React, { useState, useContext, useEffect } from "react";
import {ref, remove} from "firebase/database"
import {useList} from 'react-firebase-hooks/database'
import { groupBy, random } from "lodash";
import { Link } from "react-router-dom";
import classNames from "classnames";

import Book from "./components/book"

import logo from './assets/images/bookshelf.png'
import rightArrow from './assets/images/right-arrow.png'
import leftArrow from './assets/images/left-arrow.png'
import loadingImage from './assets/images/loading.gif'

function scrollBookShelf(direction){
  const bookShelf = document.querySelector('.book-shelf')
  const animationShifts = [5, 10, 15, 20, 25, 30, 30, 30, 30, 30, 25, 20, 15, 10, 5]
  const leftArrow = document.querySelector('.left-arrow')
  const rightArrow = document.querySelector('.right-arrow')

  if (direction == "right" && bookShelf.scrollLeft < bookShelf.children.length*300){
    let i = 0
    const animation = setInterval(() => {
      bookShelf.scrollLeft += animationShifts[i];
      i++
      if (i == 15){
        clearInterval(animation)
      }
    }, 30)
  }
  if (direction == "left" && bookShelf.scrollLeft > 0){
    let i = 0
    const animation = setInterval(() => {
      bookShelf.scrollLeft -= animationShifts[i];
      i++
      if (i == 15){
        clearInterval(animation)
      }
    }, 30)
  }
  if (direction == "left" && bookShelf.scrollLeft <= 300){
    leftArrow.classList.add('hidden')
  } else {
    leftArrow.classList.remove('hidden')
  }
  if (direction == "right" && bookShelf.scrollLeft > (bookShelf.children.length - 6)*300){
    rightArrow.classList.add('hidden')
  } else {
    rightArrow.classList.remove('hidden')
  }
}

function App() {
  const {db} = useContext(Context)
  let [books, loading, error] = useList(ref(db, 'books'))
  const [groupingCriteria, setGroupingCriteria] = useState("by_year")
  const [groupedBooks, setGroupedBooks] = useState(null)
  const [recommendedBook, setRecommendedBook] = useState(null)

  useEffect(() => {
    if(!loading && books){
      let groupingBooks = []
  
      books.map(v => {
        groupingBooks.push({...v.val(), "key": v.key})
      })
  
      const year = new Date().getFullYear()
  
      let recommendedBooks = groupingBooks.filter(book => (year - book.year <= 3)).sort((a, b) => b.rating - a.rating)
      recommendedBooks = recommendedBooks.filter(book => book.rating == recommendedBooks[0].rating)
      setRecommendedBook(recommendedBooks[random(0, recommendedBooks.length - 1, false)])
      
      if (groupingCriteria == "by_year"){
        groupingBooks = Object.entries(groupBy(groupingBooks, 'year'))
      }

      if (groupingCriteria == "by_rating"){
        groupingBooks = Object.entries(groupBy(groupingBooks, 'rating'))
      }
  
      // сортируем массив
      groupingBooks.sort((a, b) => b[0] - a[0])

      setGroupedBooks(groupingBooks)
    }
  }, [books, groupingCriteria])

  // будет использоваться для вынесения вопроса об удалении
  function deleteBook(id){
    remove(ref(db, `books/${id}`)).then(() => {
      window.location.reload()
    })
  }

  return (
    <div className="container">
      <header className="header">
        <Link to="/">
          <div className="header__logo">
              <div className="logo">
                <img src={logo} alt="logo" width="60" height="60" />
              </div>
              <p className="logo__text">Book Shelf</p>
          </div>
        </Link>
        <Link to="add"><button className="header__button">Добавить книгу</button></Link>
      </header>
      <div className="grouping-criteria">
        <p className="grouping-criteria__title">Критерий группировки:</p>
        <select className="grouping-criteria__option" onChange={({target}) => setGroupingCriteria(target.value)}>
          <option value="by_year">По году издания</option>
          <option value="by_rating">По рейтингу</option>
        </select>
      </div>
      <section className="book-all">
        {!loading && groupedBooks && (
            <div className="left-arrow hidden" onClick={() => scrollBookShelf("left")}><img src={leftArrow} /></div>
        )}
        {error && <strong>Error: {error}</strong>}
        {loading && <div style={{margin: '0 auto'}}><img src={loadingImage} /></div>}
        <div className="book-shelf">
          {recommendedBook && (
            <div className="books-column">
            <p className="books-column__year"><b><span style={{color: '#FFD400'}}>★</span> Рекомендуем</b></p>
            <Book
              id={recommendedBook.key}
              title={recommendedBook.title}
              author={recommendedBook.author}
              year={recommendedBook.year}
              rating={recommendedBook.rating}
              ISBN={recommendedBook.ISBN}
              deleteFunction={() => deleteBook(recommendedBook.key)}
            />
          </div>
          )}
          {!loading && groupedBooks && (
            groupedBooks.map((v) => (
              <div className="books-column">
                <p className="books-column__year"><b>
                  {groupingCriteria == "by_year" && (v[0] != "undefined" ? v[0] + " год": "Книги без года издания" )}
                  {groupingCriteria == "by_rating" && (v[0] != "undefined" ? v[0] : "Книги без рейтинга" )}
                </b></p>
                {v[1].map((v) => (
                  <Book
                    key={v.key}
                    id={v.key}
                    title={v.title}
                    author={v.author}
                    year={v.year}
                    rating={v.rating}
                    ISBN={v.ISBN}
                    grouping={groupingCriteria}
                    deleteFunction={() => deleteBook(v.key)}
                  />
                ))}
              </div>
              )
            )
          )}
        </div>
        {!loading && groupedBooks && (
          <div className={classNames('right-arrow', {'hidden': groupedBooks.length + !!recommendedBook <= 4})} 
          onClick={() => scrollBookShelf("right")}><img src={rightArrow} /></div>
        )}
      </section>
    </div>
  );
}

export default App;
