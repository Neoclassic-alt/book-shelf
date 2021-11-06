import React, { useContext, useEffect, useState } from "react"
import { Context } from "./../index.js";
import logo from './../assets/images/bookshelf.png'
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ref, child, push, get, set } from "firebase/database";
import { useParams, useNavigate } from "react-router-dom";

function BookForm({target}){
  const [isCorrectISBN, setCorrectISBN] = useState('') // null - если нельзя проверить, 
  // false/true - верен ли код
  const { register, handleSubmit, watch, setValue } = useForm();
  const {db} = useContext(Context)
  let onSubmit;

  const params = useParams()
  const navigate = useNavigate()

  function checkISBN(value){
    value = value.replace("-", "")
    if (value.length >= 13){
      let checknum = 0
      for (let i = 0; i < 13; i++){
        checknum += +value[i]*(1 + (i % 2)*2)
      }
        setCorrectISBN(checknum % 10 === 0)
        console.log(checknum)
        console.log(value)
    } else {
      setCorrectISBN(null)
    }
  }

  function prepare_data(data){
    const new_data = {}
    new_data.author = data.author
    new_data.title = data.title
    if (!data.without_rating){
      new_data.rating = +data.rating
    }
    if (data.year){
      new_data.year = +data.year
    }
    if (data.ISBN){
      new_data.ISBN = data.ISBN
    }
    return new_data
  }

  if (target == "add"){
    onSubmit = data => {
      push(ref(db, 'books'), prepare_data(data));
      navigate('/')
    }
  }

  if (target == "edit"){
    onSubmit = data => {
      set(ref(db, `books/${params.bookID}`), prepare_data(data));
      navigate('/')
    }
  }

  useEffect(() => {
    if (target == "edit"){
      get(child(ref(db), `books/${params.bookID}`)).then((snapshot) => {
        if (snapshot.exists()) {
          snapshot = snapshot.val()
          setValue("title", snapshot.title)
          setValue("author", snapshot.author)
          if (!snapshot.rating){
            setValue("without-rating", true)
          } else {
            setValue("rating", snapshot.rating)
          }
          setValue("year", snapshot.year || "")
          setValue("ISBN", snapshot.ISBN || "")
        } else {
          console.log("Данные недоступны");
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [])

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
		  </header>
      <section className="form">
        <form onSubmit={handleSubmit(onSubmit)}>
          <p>Название книги<span style={{color: '#FF2133'}}>*</span></p>
          <input type="text" {...register("title", { required: true })} style={{width: 400, height: 26}} autoFocus />
          <p>Автор произведения<span style={{color: '#FF2133'}}>*</span></p>
          <input type="text" {...register("author", { required: true })} style={{width: 400, height: 26}}/>
          <p>Год издания</p>
          <input type="number" {...register("year")} defaultValue="2021" min="0" max="2140" style={{height: 26}}/>
          <p>Рейтинг</p>
          <div style={{display: 'flex'}}>
            <input type="range" min="1" max="10" defaultValue={5} {...register("rating")} disabled={watch("without_rating")} />
            <p id="rating" style={{marginLeft: 10}}>{watch("rating") || 5}</p>
          </div>
          <input type="checkbox" id="without-rating" {...register("without_rating")} /><label for="without-rating">Без рейтинга</label>
          <p>ISBN</p>
          <div style={{display: 'flex', marginBottom: 15, alignItems: 'center'}}>
            <input 
              id="ISBN-input" 
              type="text"
              {...register("ISBN")}
              onInput={(event) => checkISBN(event.target.value)}
              style={{marginRight: 10, height: 26}} 
            />
            <p id="ISBN-correct">
            {isCorrectISBN === '' && ''}
            {isCorrectISBN === true && (
              <span style={{color: '#7EE542'}}>ISBN корректен</span>
            )}
            {isCorrectISBN === false && (
              <span style={{color: '#FF2133'}}>ISBN некорректен</span>
            )}
            {isCorrectISBN === null && (
              <span style={{color: '#FF2133'}}>Недостаточно символов</span>
            )}</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button className="header__button" type="submit" style={{marginRight: 15}}>
              {target == "edit" && <span>Редактировать книгу</span>}
              {target == "add" && <span>Добавить книгу</span>}
            </button>
            <Link to="/">Назад к главной странице</Link>
          </div>
        </form>
      </section>
    </div>
		)
}

export default BookForm