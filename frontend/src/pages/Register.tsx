import React, { useState } from 'react';
import { registerUser } from '../service/api';
import { ToastContainer, toast } from 'react-toastify';
import { AxiosResponse, AxiosError } from 'axios';

interface RegisterApiResponseData {
  message?: string;
  error?: string;
}


const LoginLink = () => (
  <a
  href="/login"
  className="underline font-semibold text-lg text-white hover:text-gray-200 whitespace-nowrap"
>
  Login
</a>
);


function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (content: React.ReactNode | string, type: 'success' | 'error' = 'success') => {
      if (type === 'success') {
          toast.success(content);
      } else {
          toast.error(content);
      }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords do not match!";
    
      showToast(errorMsg, 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response: AxiosResponse<RegisterApiResponseData> = await registerUser(
        formData.userName,
        formData.password
      );

      const responseData = response.data;
      const successMessageBase = responseData?.message || "Registration successful!";

     
      showToast(
        <>
          {successMessageBase} You can now <LoginLink />.
        </>,
        'success'
      );

   
      setFormData({ userName: '', password: '', confirmPassword: '' });

    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";

      if (err instanceof AxiosError && err.response?.data) {
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

   
      showToast(errorMessage, 'error'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-6">
      <div>

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </div>
      <div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img className="mx-auto h-10 w-auto" src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow" />
          <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm leading-5 text-sky-400 max-w"> 
            Or{' '}
            <a
              href="/login"
              className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              sign in to your account
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
     
          <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10"> 
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="userName" className="block text-sm font-medium leading-5 text-gray-200">Username</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    type="text"
                    required
                    autoComplete="username"
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="password" className="block text-sm font-medium leading-5 text-gray-200">Password</label>
                <div className="mt-1 rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    required
                    autoComplete="new-password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-5 text-gray-200">Confirm Password</label>
                <div className="mt-1 rounded-md shadow-sm">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    required
                    autoComplete="new-password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6">
                <span className="block w-full rounded-md shadow-sm">
                  <button
                    type="submit"
                    disabled={isSubmitting}
              
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 active:bg-sky-800 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </span>
              </div>



            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;