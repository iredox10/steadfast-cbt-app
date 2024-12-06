import React from 'react'
import FormBtn from '../components/FormBtn'

const StudentSubmission = () => {
  return (
    <div class='grid place-content-center capitalize bg-white shadow-2xl my-32 mx-64 p-10'>
        <h1 className='font-bold text-4xl '>exam submission successful</h1>
        <FormBtn text={'Return Home'} href={'/'} style={'my-5 block text-center w-[50%] mx-auto'}/>
    </div>
  )
}

export default StudentSubmission