import { useNavigate, useRouteError } from "react-router-dom"
import { motion } from "framer-motion"

const ErrorPage: React.FC = () => {
  const navigate = useNavigate()
  const error: any = useRouteError()

  const goHome = () => navigate("/")
  const goBack = () => navigate(-1)

  const status = error?.status || 404
  const message =
    error?.statusText ||
    error?.message ||
    "Something went wrong. The page couldn’t be found."

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-white dark:bg-gray-900 p-10 text-center shadow-2xl max-w-lg w-full"
      >
        {/* 🎨 Illustration */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="h-40 w-40 text-red-500"
          >
            <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
            <path
              d="M70 120h60M85 140h30"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="75" cy="85" r="8" fill="currentColor" />
            <circle cx="125" cy="85" r="8" fill="currentColor" />
          </svg>
        </motion.div>

        {/* Title */}
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
          {status}
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">{message}</p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={goBack}
            className="rounded-lg bg-gray-700 px-6 py-3 font-medium text-white shadow-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={goHome}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-lg hover:bg-primary transition-colors"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ErrorPage
