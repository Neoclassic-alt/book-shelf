import React, {useState} from 'react'
import pencil_icon from '.././assets/images/pencil.png'
import delete_icon from '.././assets/images/delete.png'

function Book({id, title, author, year, rating, ISBN, grouping, deleteFunction}){
    const [isPrompt, setPrompt] = useState(false)
    return (
        <div className="book">
            <p><b>{title}</b></p>
            <p>{author}</p>
            {year && grouping != "by_year" && <p>Год издания: {year}</p>}
            {rating && grouping != "by_rating" && <p>Рейтинг: {rating}</p>}
            {ISBN && <p>ISBN: {ISBN}</p>}
            <div className="book__actions">
                <a href={`/edit/${id}`}><img src={pencil_icon} width="24" height="24" style={{marginRight: 5}} /></a>
                <a href="#" onClick={() => setPrompt(true)}><img src={delete_icon} width="24" height="24" /></a>
            </div>
            <div className="delete__prompt" style={
                {
                    height: isPrompt ? 105 : 0, 
                    border: isPrompt ? '1px solid rgb(160, 30, 30)' : 'none',
                    paddingBottom: isPrompt ? 10 : 0
                }
            }>
                <p>Вы действительно хотите удалить книгу?</p>
                <div className='flex-end'>
                    <button 
                        className="delete__button"
                        style={{marginRight: 10}}
                        onClick={deleteFunction}
                    ><span style={{color: '#A01E1E'}}>Да</span></button>
                    <button className="delete__button" onClick={() => setPrompt(false)}><span style={{color: '#A01E1E'}}>Нет</span></button>
                </div>
            </div>
        </div>
    )
}

export default Book