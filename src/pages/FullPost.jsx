import React, {useEffect, useState} from "react";

import {Post} from "../components/Post/Post";
import {AddComponent} from "../components/AddComment/AddComponent";
import {CommentsBlock} from "../components/CommentsBlock";
import {useParams} from "react-router-dom";
import {postsAPI} from "../api/postsAPI";
import ReactMarkdown from "react-markdown";

export const FullPost = () => {
    const [data, setData] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const {id} = useParams()

    useEffect(() => {
        postsAPI.getPostsId(id)
            .then(res => {
                setData(res.data)
                setIsLoading(false)
            })
            .catch((error) => {
                console.warn(error)
                alert('Ошибка при получении статьи')
            })
    }, [])

    if (isLoading) {
        return <Post isLoading={isLoading}/>
    }


    console.log(data.imageUrl)

    return (
        <>
            <Post
                id={data._id}
                title={data.title}
                imageUrl={
                    data.imageUrl
                        ? `${process.env.REACT_APP_API_URL}${data.imageUrl}`
                        : data.imageUrl ? `http://localhost:4444/${data.imageUrl}`
                            : ""
                }
                user={data.user}
                createdAt={data.createdAt}
                viewsCount={data.viewsCount}
                commentsCount={3}
                tags={data.tags}
                isFullPost
            >
                <ReactMarkdown children={data.text}/>
            </Post>
            <CommentsBlock
                items={[
                    {
                        user: {
                            fullName: "Вася Пупкин",
                            avatarUrl: "https://mui.com/static/images/avatar/1.jpg",
                        },
                        text: "Это тестовый комментарий 555555",
                    },
                    {
                        user: {
                            fullName: "Иван Иванов",
                            avatarUrl: "https://mui.com/static/images/avatar/2.jpg",
                        },
                        text: "When displaying three lines or more, the avatar is not aligned at the top. You should set the prop to align the avatar at the top",
                    },
                ]}
                isLoading={false}
            >
                <AddComponent/>
            </CommentsBlock>
        </>
    );
};
