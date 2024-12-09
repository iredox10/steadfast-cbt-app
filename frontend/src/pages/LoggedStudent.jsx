import React from 'react'
import FormBtn from '../components/FormBtn'

const LoggedStudent = () => {
  return (
<div class='grid place-content-center capitalize bg-white shadow-2xl my-32 mx-64 p-10 text-center'>
        <h1 className='font-bold text-4xl '>Already Logged in </h1>
        <p className=''>you have already log on another computer. <span className='block'> Please contact your admin if you don't</span></p>
        <FormBtn text={'Return Home'} href={'/'} style={'my-5 block text-center w-[50%] mx-auto'}/>
    </div>
  )
}

export default LoggedStudent