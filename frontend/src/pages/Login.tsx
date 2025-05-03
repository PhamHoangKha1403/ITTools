import React, { useState, useEffect } from 'react';
import { loginUser } from '../service/api';
import { ToastContainer, toast } from 'react-toastify';
import { AxiosResponse, AxiosError } from 'axios';


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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      if (type === 'success') {
          toast.success(message);
      } else {
          toast.error(message);
      }
  };

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

     
      if (responseData && responseData.user) {
          localStorage.setItem("userName", responseData.user.username);
          localStorage.setItem("role", responseData.user.role.toString());

          
          showToast(responseData.message || "Login successful!", 'success');

        
          window.location.replace("/");
      } else {
        
          throw new Error("Login response did not contain user data.");
      }

    } catch (err) {
        let errorMessage = "Login failed. Please check credentials or try again.";

        if (err instanceof AxiosError && err.response?.data) {
           
            errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        } else if (err instanceof Error) {
            errorMessage = err.message; 
        }

        setError(errorMessage); 
        showToast(errorMessage, 'error'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const role = localStorage.getItem('role');

    if (userName && role) {
      window.location.replace('/'); 
    }
  }, []);

    return (
     
     <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-6">
       <div>
         <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored"/>
       </div>
       <div>
         <div className="sm:mx-auto sm:w-full sm:max-w-md">
           <img className="mx-auto h-10 w-auto" src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow" />
           <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">
             Login your account
           </h2>
           <p className="mt-2 text-center text-sm leading-5 text-sky-400 max-w"> 
             Or{' '}
             <a
               href="/register"
               className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none focus:underline transition ease-in-out duration-150"
             >
               create a new account
             </a>
           </p>
         </div>

         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    
           <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
             <form onSubmit={handleSubmit}>
               <div>
                 <label htmlFor="userName" className="block text-sm font-medium leading-5 text-gray-200">Username</label> {/* Màu label sáng hơn */}
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
                     autoComplete="current-password"
                     className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                   />
                 </div>
               </div>

               <div className="mt-6 flex items-center justify-between">
                 <div className="flex items-center">
                   <input
                     id="remember_me"
                     name="remember"
                     type="checkbox"
                    
                     className="form-checkbox h-4 w-4 text-sky-600 bg-gray-700 border-gray-500 rounded focus:ring-sky-500 transition duration-150 ease-in-out"
                   />
                   <label htmlFor="remember_me" className="ml-2 block text-sm leading-5 text-gray-300">Remember me</label>
                 </div>

                 <div className="text-sm leading-5">
                   <a
                     href="#" 
                     className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none focus:underline transition ease-in-out duration-150"
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
                 
                     className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 active:bg-sky-800 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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