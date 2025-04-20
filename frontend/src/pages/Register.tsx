import React, { useState } from 'react';
import { registerUser } from '../service/api'

function Register() {
  const [formData, setFormData] = useState<{ userName: string; password: string }>({ userName: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(formData.userName, formData.password);
      setSuccess(true);
      setFormData({ userName: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-6">
      <div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img className="mx-auto h-10 w-auto"  src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow"  />
          <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm leading-5 text-blue-500 max-w">
            Or{' '}
            <a
              href="/login"
              className="font-medium text-blue-500 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              sign in to your account
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
                    placeholder="user@example.com"
                    type="text"
                    required
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5 text-white bg-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6">
                <span className="block w-full rounded-md shadow-sm">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </span>
              </div>

              {error && (
                <div className="mt-4 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 text-green-500 text-sm text-center">
                  Registration successful! You can now <a href="/login" className="underline">login</a>.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
