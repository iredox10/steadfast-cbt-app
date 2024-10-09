import React from 'react'
import { useParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'

const EditQuestion = () => {
    const {userId, questionId}= useParams()
    // const {data,loading,err} = useFetch(`/`)
  return (

    <div>EditQuestion</div>
  )
}

export default EditQuestion