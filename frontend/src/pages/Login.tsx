import React, { useState, useEffect } from 'react';
import { loginUser } from '../service/api';
import { ToastContainer, toast } from 'react-toastify';
import { AxiosResponse, AxiosError } from 'axios';

interface User {
  userName: string;
  role: string;
}


interface LoginApiResponseData {
  user: {
    username: string;
    role: string | number;
  };
  message?: string; 
  error?: string;  
}

function Login () {
  const [formData, setFormData] = useState<{ userName: string; password: string }>({ userName: '', password: '' });
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = (message: string) => toast(message);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response: AxiosResponse<LoginApiResponseData> = await loginUser(formData.userName, formData.password);
      const responseData = response.data;

      localStorage.setItem("userName", responseData.user.username);
      localStorage.setItem("role", responseData.user.role.toString());

    
      if (responseData.message) {
        notify(responseData.message);
      } else {
         notify(responseData.message||"Login successful!"); 
      }

      window.location.href = "/";

    } catch (err) {
        let errorMessage = "Login failed. Please check credentials or try again."; // Default English message

        if (err instanceof AxiosError && err.response?.data) {
            // Prioritize message from response body on error
            errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        setError(errorMessage);
        notify(errorMessage); // Show error message from server or fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const role = localStorage.getItem('role');
    if (userName && role) {
      window.location.href = '/';
    }
  }, []);

   return (
     <div className="min-h-screen bg-emerald-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-6">
       <div>
         <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
       </div>
       <div>
         <div className="sm:mx-auto sm:w-full sm:max-w-md">
           <img className="mx-auto h-10 w-auto" src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow" />
           <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">
             Login your account
           </h2>
           <p className="mt-2 text-center text-sm leading-5 text-blue-500 max-w">
             Or{' '}
             <a
               href="/register"
               className="font-medium text-blue-500 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
             >
               create a new account
             </a>
           </p>
         </div>

         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
           <div className="bg-gray-700 py-8 px-4 shadow sm:rounded-lg sm:px-10">
             <form onSubmit={handleSubmit}>
               <div>
                 <label htmlFor="userName" className="block text-sm font-medium leading-5 text-white">Username</label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                   <input
                     id="userName"
                     name="userName"
                     value={formData.userName}
                     onChange={handleChange}
                     placeholder="user@example.com or username"
                     type="text"
                     required
                     autoComplete="username"
                     className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                   />
                 </div>
               </div>

               <div className="mt-6">
                 <label htmlFor="password" className="block text-sm font-medium leading-5 text-white">Password</label>
                 <div className="mt-1 rounded-md shadow-sm">
                   <input
                     id="password"
                     name="password"
                     value={formData.password}
                     onChange={handleChange}
                     type="password"
                     required
                     autoComplete="current-password"
                     className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                   />
                 </div>
               </div>

               <div className="mt-6 flex items-center justify-between">
                 <div className="flex items-center">
                   <input
                     id="remember_me"
                     name="remember"
                     type="checkbox"
                     className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                   />
                   <label htmlFor="remember_me" className="ml-2 block text-sm leading-5 text-white">Remember me</label>
                 </div>

                 <div className="text-sm leading-5">
                   <a
                     href="#"
                     className="font-medium text-blue-500 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                   >
                     Forgot your password?
                   </a>
                 </div>
               </div>

               <div className="mt-6">
                 <span className="block w-full rounded-md shadow-sm">
                   <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSubmitting ? 'Signing in...' : 'Sign in'}
                   </button>
                 </span>
               </div>

               {error && (
                 <div className="mt-4 text-red-400 text-sm text-center">
                   {error}
                 </div>
               )}
             </form>
           </div>
         </div>
       </div>
     </div>
   );
}

export default Login;