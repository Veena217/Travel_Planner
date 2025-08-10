import React, { use, useEffect, useState } from 'react'
import PasswordInput from '../../components/PasswordInput'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { validateEmail } from '../../utils/helper'
import { useDispatch, useSelector } from 'react-redux'
import { signInFailure, signInStart, signInSuccess } from '../../redux/slice/userSlice'

function Login() {
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState("")
  
  const {loading,currentUser} =useSelector((state)=>state.user)

  const handleSubmit=async(e)=>{
    e.preventDefault()
    if(!validateEmail(email)){
      setError("Please enter a vaild email address.")
      return
    }

    if(!password){
      setError("Please enter your password")
      return 
    }

    setError(null)

    //Login API call
    try{
      dispatch(signInStart())

        const response=await axiosInstance.post("/auth/signin",{
          email,
          password,
        })
        if(response.data){
        dispatch(signInSuccess(response.data))
        navigate("/")
      }
      else{
        dispatch(signInFailure("An unexpected error occured!"))
      }
    }catch(error){
      dispatch(signInFailure("An unexpected error occured!"))
      if(error.response &&error.response.data&& error.response.data.message){
        setError(error.response.data.message)
      }
      else{
        setError("Something went wrong.Please try again.") 
      }
    }
  }

  useEffect(()=>{
    if(!loading&& currentUser){
      navigate("/")
    }
  },[currentUser])

  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-1/3 h-[70vh] flex items-end bg-cover bg-center rounded-lg 
        bg-[url('https://images.pexels.com/photos/26632389/pexels-photo-26632389.jpeg')] p-10 z-50">
          <div>
            <h4 className='text-4xl text-white font-semibold leading-[50px]'>Create Your <br/>Stories</h4>
            <p className="text-[15px] text-black leading-4 pr-7 mt-4">Record your travel experiences and memories in your travel journey</p>
          </div>
          
        </div>
        <div className="w-1/3 h-[70vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20">
            <form onSubmit={handleSubmit}>
              <h4 className='text-2xl font-semibold mb-7'>Login</h4>
              <input type="email" placeholder='Email' className='input-box' value={email} onChange={(e)=>setEmail(e.target.value)}/>
              <PasswordInput value={password} onChange={(e)=>{setPassword(e.target.value)}}/>

                {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
              
             {loading ?(<p className='animate-pulse w-full text-center btn-primary'>LOADING...</p>): (<button type='submit' className='btn-primary'>LOGIN</button>)}

              <p className='text-xs text-slate-500 text-center my-4'>Or</p>

              <button type='submit' className='btn-primary btn-light' onClick={()=>navigate("/sign-up")}>CREATE ACCOUNT</button>
            </form>
          </div>

      </div>
    </div>
  )
}

export default Login