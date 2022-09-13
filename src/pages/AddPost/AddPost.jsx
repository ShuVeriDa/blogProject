import React, {useEffect, useRef, useState} from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import {useSelector} from "react-redux";
import {selectIsAuth} from "../../redux/slices/auth";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import {postsAPI} from "../../api/postsAPI";

export const AddPost = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const isAuth = useSelector(selectIsAuth)
    //из 18-21 строк можно сделать один fields
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const inputFileRef = useRef(null)

    const isEditing = id

    const handleChangeFile = async (event) => {
        try {
            const formData = new FormData()
            formData.append('image', event.currentTarget.files[0])
            const res = await postsAPI.formDataPost(formData)
            setImageUrl(res.data.url)
        } catch (error) {
            console.warn(error)
            alert('Ошибка при загрузке файла')
        }
    };

    const onClickRemoveImage = () => {
        setImageUrl('')
    };

    const onChange = React.useCallback((value) => {
        setText(value);
    }, []);

    const onSubmit = async () => {
        try {
            setIsLoading(true)
            const fields = {
                title,
                imageUrl,
                text,
                tags
            }
            const res = isEditing
                ? await postsAPI.updatePost(id, fields)
                : await postsAPI.createPost(fields)

            const _id = isEditing ? id : res.data._id

            navigate(`../posts/${_id}`)
        } catch (error) {
            console.warn(error)
            alert('Ошибка при создании статьи')
        }
    }

    useEffect(() => {
        if (id) {
            postsAPI.getPostsId(id)
                .then(res => {
                    setTitle(res.data.title)
                    setText(res.data.text)
                    setImageUrl(res.data.imageUrl)
                    setTags(res.data.tags.join(','))
                }).catch(err => {
                console.warn(err)
                alert('ошибка получения статьи')
            })
        }
    }, [])

    const options = React.useMemo(
        () => ({
            spellChecker: false,
            maxHeight: '400px',
            autofocus: true,
            placeholder: 'Введите текст...',
            status: false,
            autosave: {
                enabled: true,
                delay: 1000,
            },
        }),
        [],
    );

    if (!window.localStorage.getItem('token') && !isAuth) {
        return <Navigate to="/"/>
    }
    console.log(title, tags, text)

    return (
        <Paper style={{padding: 30}}>
            <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
                Загрузить превью
            </Button>
            <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden/>
            {imageUrl && (
                <>
                    <Button variant="contained" color="error" onClick={onClickRemoveImage}>
                        Удалить
                    </Button>
                    <img className={styles.image}
                         src={`${process.env.REACT_APP_API_URL}${imageUrl}` || `http://localhost:4444/${imageUrl}`}
                         alt="Uploaded"
                    />
                </>
            )}
            <br/>
            <br/>
            <TextField classes={{root: styles.title}}
                       variant="standard"
                       placeholder="Заголовок статьи..."
                       value={title}
                       onChange={e => setTitle(e.currentTarget.value)}
                       fullWidth
            />
            <TextField classes={{root: styles.tags}}
                       variant="standard"
                       placeholder="Тэги"
                       value={tags}
                       onChange={e => setTags(e.currentTarget.value)}
                       fullWidth
            />
            <SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options}/>
            <div className={styles.buttons}>
                <Button onClick={onSubmit} size="large" variant="contained">
                    {isEditing ? 'Сохранить' : 'Опубликовать'}
                </Button>
                <a href="/">
                    <Button size="large">Отмена</Button>
                </a>
            </div>
        </Paper>
    );
};
